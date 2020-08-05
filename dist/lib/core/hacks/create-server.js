"use strict";
/* !
 * Tencent is pleased to support the open source community by making Tencent Server Web available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpCreateServerRestore = exports.httpCreateServerHack = void 0;
const http = require("http");
const domain = require("domain");
const context_1 = require("../context");
const events_1 = require("../events");
const ip_1 = require("ip");
const incoming_1 = require("../utils/incoming");
const outgoing_1 = require("../utils/outgoing");
const server_inspect_proxy_1 = require("server-inspect-proxy");
let httpCreateServerHacked = false;
let originHttpCreateServer = null;
exports.httpCreateServerHack = () => {
    if (!httpCreateServerHacked) {
        httpCreateServerHacked = true;
        originHttpCreateServer = http.createServer;
        // eslint-disable-next-line
        // @ts-ignore
        // By default, ts not allow us to rewrite original methods.
        http.createServer = ((createServer) => (optionsOrRequestListener, requestListenerOrUndefined) => {
            let requestListener;
            let options;
            if (typeof optionsOrRequestListener === "function") {
                requestListener = optionsOrRequestListener;
            }
            else {
                requestListener = requestListenerOrUndefined;
                options = optionsOrRequestListener;
            }
            const requestListenerWrap = (req, res) => {
                const start = new Date();
                const timestamps = {
                    requestStart: start,
                    onSocket: start,
                    onLookUp: start,
                    requestFinish: start,
                    socketConnect: start,
                    dnsTime: 0,
                };
                // Creating a domain and wrapping the execution.
                const d = domain.create();
                d.add(req);
                d.add(res);
                const clearDomain = () => {
                    d.remove(req);
                    d.remove(res);
                    const parser = req.socket.parser;
                    if (parser && parser.domain) {
                        parser.domain.exit();
                        parser.domain = null;
                    }
                    while (process.domain) {
                        process.domain.exit();
                    }
                };
                res.writeHead = ((fn) => (...args) => {
                    // start response, transfer res body
                    timestamps.onResponse = new Date();
                    outgoing_1.captureOutgoing(res);
                    return fn.apply(res, args);
                })(res.writeHead);
                res.once("finish", () => {
                    const context = process.domain.currentContext;
                    if (context.isReport) {
                        timestamps.requestFinish = new Date();
                        const requestInfo = incoming_1.captureIncoming(req);
                        const captureContext = {
                            SN: context.captureSN,
                            protocol: "HTTP",
                            host: req.headers.host,
                            path: req.url,
                            process: process.env.HOSTNAME || "-",
                            clientIp: req.socket.remoteAddress,
                            clientPort: req.socket.remotePort,
                            serverIp: ip_1.address(),
                            serverPort: req.socket.address().port,
                            requestHeader: (() => {
                                const result = [];
                                result.push(`${req.method} ${req.url} HTTP/${req.httpVersion}`);
                                Object.keys(req.headers).forEach((key) => {
                                    result.push(`${key}: ${req.headers[key]}`);
                                });
                                result.push("");
                                result.push("");
                                return result.join("\r\n");
                            })(),
                            requestBody: requestInfo.body.toString("base64"),
                            responseHeader: (() => {
                                const result = [];
                                result.push(`HTTP/${req.httpVersion} ${res.statusCode} ${res.statusMessage}`);
                                const resHeaders = res.getHeaders();
                                Object.keys(resHeaders).forEach((key) => {
                                    result.push(`${key}: ${resHeaders[key]}`);
                                });
                                result.push("");
                                result.push("");
                                return result.join("\r\n");
                            })(),
                            responseBody: res._body.toString("base64"),
                            responseLength: res._bodyLength,
                            responseType: res.getHeader("content-type"),
                            statusCode: res.statusCode,
                            timestamps,
                        };
                        context.captureRequests.push(captureContext);
                    }
                    clearDomain();
                    events_1.eventBus.emit("RESPONSE_FINISH", {
                        req,
                        res,
                        context,
                    });
                });
                res.once("close", () => {
                    timestamps.responseClose = new Date();
                    clearDomain();
                });
                d.run(() => {
                    // 初始化一下 Context
                    context_1.default();
                    const context = process.domain.currentContext;
                    events_1.eventBus.emit("REQUEST_START", {
                        req,
                        context,
                    });
                    requestListener(req, res);
                });
            };
            const creatorApplyArgs = options ? [options, requestListenerWrap] : [requestListenerWrap];
            const creatorServer = createServer.apply(this, creatorApplyArgs);
            console.log(process.env.NODE_OPTIONS);
            if (process.env.NODE_OPTIONS === '--inspect') {
                server_inspect_proxy_1.debug(creatorServer);
                // return createServer.apply(this, [options, requestListenerWrap]);
            }
            return creatorServer;
            // return createServer.apply(this, [requestListenerWrap]);
        })(http.createServer);
    }
};
exports.httpCreateServerRestore = () => {
    if (httpCreateServerHacked) {
        httpCreateServerHacked = false;
        // eslint-disable-next-line
        // @ts-ignore
        // By default, ts not allow us to rewrite original methods.
        http.createServer = originHttpCreateServer;
    }
};
//# sourceMappingURL=create-server.js.map