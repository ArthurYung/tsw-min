/* !
 * Tencent is pleased to support the open source community by making Tencent Server Web available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import * as http from "http";
import initContext, { RequestTimestamp } from "../context";
import { eventBus } from "../events";
import { address } from "ip";
import { AddressInfo } from "net";
import { captureIncoming } from "../utils/incoming";
import { captureOutgoing } from "../utils/outgoing";
import { createDomain, currentDomain, clearDomain } from '../domain'

let httpCreateServerHacked = false;
let originHttpCreateServer = null;


export const httpCreateServerHack = (): void => {
  if (!httpCreateServerHacked) {
    httpCreateServerHacked = true;
    originHttpCreateServer = http.createServer;

    // eslint-disable-next-line
    // @ts-ignore
    // By default, ts not allow us to rewrite original methods.
    http.createServer = ((createServer) => (
      optionsOrRequestListener: http.ServerOptions,
      requestListenerOrUndefined?: http.RequestListener
    ): void => {
      let requestListener: http.RequestListener;
      let options: http.ServerOptions;
      if (typeof optionsOrRequestListener === "function") {
        requestListener = optionsOrRequestListener;
      } else {
        requestListener = requestListenerOrUndefined;
        options = optionsOrRequestListener;
      }

      const requestListenerWrap: http.RequestListener = (req, res) => {
        const start = new Date();
        const timestamps = {
          requestStart: start,
          onSocket: start,
          onLookUp: start,
          requestFinish: start,
          socketConnect: start,
          dnsTime: 0,
        } as RequestTimestamp;
        
        const d = createDomain()

        res.writeHead = ((fn): typeof res.writeHead => (
          ...args: unknown[]
        ): ReturnType<typeof res.writeHead> => {
          // start response, transfer res body
          timestamps.onResponse = new Date();

          captureOutgoing(res);

          return fn.apply(res, args);
        })(res.writeHead);

        res.once("finish", () => {
          const context = currentDomain()?.currentContext;

          if (context && context.isReport) {
            timestamps.requestFinish = new Date();
            const requestInfo = captureIncoming(req);
            const captureContext = {
              SN: context.captureSN,
  
              protocol: "HTTP",
              host: req.headers.host,
              path: req.url,
  
              process: process.env.HOSTNAME || "-",
  
              clientIp: req.socket.remoteAddress,
              clientPort: req.socket.remotePort,
              serverIp: address(),
              serverPort: (req.socket.address() as AddressInfo).port,
              requestHeader: ((): string => {
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
              responseHeader: ((): string => {
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
              responseBody: (res as any)._body.toString("base64"),
              responseLength: (res as any)._bodyLength,
              responseType: res.getHeader("content-type"),
              statusCode: res.statusCode,
              timestamps,
            };
  
            context.captureRequests.push(captureContext);
          }
          
          clearDomain(d);

          eventBus.emit("RESPONSE_FINISH", {
            req,
            res,
            context,
          });
        });

        
        res.once("close", () => {
          timestamps.responseClose = new Date();
          clearDomain(d);
        });


        // 初始化context
        const context = initContext()

        eventBus.emit("REQUEST_START", {
          req,
          context,
        });
        
        requestListener(req, res)
      };

      const creatorArgs = options 
        ? [options, requestListenerWrap] 
        : [requestListenerWrap]

      const httpServer = createServer.apply(this, creatorArgs)

      return httpServer
    })(http.createServer);
  }
};

export const httpCreateServerRestore = (): void => {
  if (httpCreateServerHacked) {
    httpCreateServerHacked = false;
    // eslint-disable-next-line
    // @ts-ignore
    // By default, ts not allow us to rewrite original methods.
    http.createServer = originHttpCreateServer;
  }
};
