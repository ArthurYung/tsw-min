"use strict";
/* !
 * Tencent is pleased to support the open source community by making Tencent Server Web available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestRestore = exports.requestHack = exports.hack = void 0;
const http = require("http");
const https = require("https");
const url_1 = require("url");
const net_1 = require("net");
const lodash_1 = require("lodash");
const outgoing_1 = require("../utils/outgoing");
const incoming_1 = require("../utils/incoming");
const context_1 = require("../context");
const logger_1 = require("../logger");
/**
 * Convert a URL instance to a http.request options
 * https://github.com/nodejs/node/blob/afa9a7206c26a29a2af226696c145c924a6d3754/lib/internal/url.js#L1270
 * @param url a URL instance
 */
const urlToOptions = (url) => {
    const options = {
        protocol: url.protocol,
        hostname: typeof url.hostname === "string" && url.hostname.startsWith("[")
            ? url.hostname.slice(1, -1)
            : url.hostname,
        path: `${url.pathname || ""}${url.search || ""}`,
    };
    if (url.port !== "") {
        options.port = Number(url.port);
    }
    if (url.username || url.password) {
        options.auth = `${url.username}:${url.password}`;
    }
    return options;
};
exports.hack = (originRequest, protocol) => (...args) => {
    let options;
    if (typeof args[1] === "undefined" || typeof args[1] === "function") {
        // function request(options: RequestOptions | string | URL, callback?: (res: IncomingMessage) => void): ClientRequest;
        if (typeof args[0] === "string") {
            options = urlToOptions(new url_1.URL(args[0]));
        }
        else if (args[0] instanceof url_1.URL) {
            options = urlToOptions(args[0]);
        }
        else {
            options = args[0];
        }
    }
    else {
        // function request(url: string | URL, options: RequestOptions, callback?: (res: IncomingMessage) => void): ClientRequest;
        if (typeof args[0] === "string") {
            options = urlToOptions(new url_1.URL(args[0]));
        }
        else {
            options = urlToOptions(args[0]);
        }
        options = Object.assign(options, args[1]);
    }
    // Execute request
    const request = originRequest.apply(this, args);
    // Execute capture
    outgoing_1.captureOutgoing(request);
    const context = context_1.default() || new context_1.Context();
    const { method, hostname, path, port } = options;
    logger_1.default.debug(`Request begin. ${method} ${hostname}${port ? `:${port}` : ""} ~ ${path}`);
    const requestLog = {
        SN: context.captureSN,
        protocol: protocol === "http:" ? "HTTP" : "HTTPS",
        host: hostname,
        path,
        process: `TSW: ${process.pid}`,
        timestamps: {},
    };
    const { timestamps } = requestLog;
    timestamps.requestStart = new Date();
    const finishRequest = () => {
        // if (request._header)
        requestLog.SN = context.captureSN;
        context.captureRequests.push(requestLog);
        context.captureSN += 1;
        logger_1.default.debug(`Record request info. Response body length: ${requestLog.responseLength}`);
    };
    request.once("socket", (socket) => {
        timestamps.onSocket = new Date();
        if (!net_1.isIP(hostname)) {
            socket.once("lookup", (err, address, family, host) => {
                timestamps.onLookUp = new Date();
                timestamps.dnsTime = timestamps.onLookUp.getTime() - timestamps.onSocket.getTime();
                logger_1.default.debug(`Dns lookup ${host} -> ${address || "null"}. Cost ${timestamps.dnsTime}ms`);
                if (err) {
                    logger_1.default.error(`Lookup error ${err.stack}`);
                }
            });
        }
        socket.once("connect", () => {
            timestamps.socketConnect = new Date();
            logger_1.default.debug(`Socket connected. Remote: ${socket.remoteAddress}:${socket.remotePort}. Cost ${timestamps.socketConnect.getTime() - timestamps.onSocket.getTime()} ms`);
        });
        if (socket.remoteAddress) {
            timestamps.dnsTime = 0;
            logger_1.default.debug(`Socket reused. Remote: ${socket.remoteAddress}:${socket.remotePort}`);
        }
    });
    request.once("error", (error) => {
        logger_1.default.error(`Request error. Stack: ${error.stack}`);
        finishRequest();
    });
    request.once("finish", () => {
        timestamps.requestFinish = new Date();
        let requestBody;
        const length = request._bodyLength;
        const tooLarge = request._bodyTooLarge;
        if (tooLarge) {
            requestBody = Buffer.from(`body was too large too show, length: ${length}`).toString("base64");
        }
        else {
            requestBody = request._body.toString("base64");
        }
        requestLog.requestHeader = request._header;
        requestLog.requestBody = requestBody;
        logger_1.default.debug(`Request send finish. Body size ${length}. Cost: ${timestamps.requestFinish.getTime() - timestamps.onSocket.getTime()} ms`);
    });
    request.once("response", (response) => {
        timestamps.onResponse = new Date();
        const { socket } = response;
        requestLog.serverIp = socket.remoteAddress;
        requestLog.serverPort = socket.remotePort;
        // This could be undefined
        // https://stackoverflow.com/questions/16745745/nodejs-tcp-socket-does-not-show-client-hostname-information
        requestLog.clientIp = socket.localAddress;
        requestLog.clientPort = socket.localPort;
        logger_1.default.debug(`Request on response. Socket chain: ${socket.localAddress}:${socket.localPort} > ${socket.remoteAddress}:${socket.remotePort}. Response status code: ${response.statusCode}. Cost: ${timestamps.onResponse.getTime() - timestamps.onSocket.getTime()} ms`);
        // responseInfo can't retrieve data until response "end" event
        const responseInfo = incoming_1.captureIncoming(response);
        response.once("end", () => {
            timestamps.responseClose = new Date();
            requestLog.statusCode = response.statusCode;
            requestLog.responseLength = responseInfo.bodyLength;
            requestLog.responseType = response.headers["content-type"];
            requestLog.responseHeader = (() => {
                const result = [];
                result.push(`HTTP/${response.httpVersion} ${response.statusCode} ${response.statusMessage}`);
                const cloneHeaders = lodash_1.cloneDeep(response.headers);
                // Transfer a chunked response to a full response.
                if (!cloneHeaders["content-length"] && responseInfo.bodyLength >= 0) {
                    delete cloneHeaders["transfer-encoding"];
                    cloneHeaders["content-length"] = String(responseInfo.bodyLength);
                }
                Object.keys(cloneHeaders).forEach((key) => {
                    result.push(`${key}: ${cloneHeaders[key]}`);
                });
                result.push("");
                result.push("");
                return result.join("\r\n");
            })();
            requestLog.responseBody = responseInfo.body.toString("base64");
            logger_1.default.debug(`Response on end. Body size：${requestLog.responseLength}. Cost: ${timestamps.responseClose.getTime() - timestamps.onSocket.getTime()} ms`);
            finishRequest();
        });
    });
    return request;
};
let hacked = false;
let originHttpRequest = null;
let originHttpsRequest = null;
exports.requestHack = () => {
    if (!hacked) {
        originHttpRequest = http.request;
        originHttpsRequest = https.request;
        // eslint-disable-next-line
        // @ts-ignore
        // By default, ts not allow us to rewrite original methods.
        http.request = exports.hack(http.request, "http:");
        // eslint-disable-next-line
        // @ts-ignore
        // By default, ts not allow us to rewrite original methods.
        https.request = exports.hack(https.request, "https:");
        hacked = true;
    }
};
exports.requestRestore = () => {
    if (hacked) {
        // eslint-disable-next-line
        // @ts-ignore
        // By default, ts not allow us to rewrite original methods.
        http.request = originHttpRequest;
        // eslint-disable-next-line
        // @ts-ignore
        // By default, ts not allow us to rewrite original methods.
        https.request = originHttpsRequest;
        hacked = false;
    }
};
//# sourceMappingURL=request.js.map