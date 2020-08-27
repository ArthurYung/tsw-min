"use strict";
/* !
 * Tencent is pleased to support the open source community by making Tencent Server Web available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureOutgoing = void 0;
// Max request body size
const maxBodySize = 512 * 1024;
exports.captureOutgoing = (outgoing) => {
    let bodyLength = 0;
    const body = [];
    outgoing._send = ((fn) => (data, encodingOrCallback, callbackOrUndefined) => {
        let encoding = null;
        let callback;
        if (typeof encodingOrCallback === "function") {
            callback = encodingOrCallback;
        }
        else if (typeof callbackOrUndefined === "function") {
            encoding = encodingOrCallback;
            callback = callbackOrUndefined;
        }
        const buffer = (() => {
            if (Buffer.isBuffer(data)) {
                return data;
            }
            return Buffer.from(data, encoding);
        })();
        bodyLength += buffer.length;
        body.push(buffer);
        return fn.apply(outgoing, [data, encoding, callback]);
    })(outgoing._send);
    outgoing._finish = ((fn) => (...args) => {
        outgoing._body = Buffer.concat(body);
        outgoing._bodyTooLarge = bodyLength > maxBodySize;
        outgoing._bodyLength = bodyLength;
        return fn.apply(outgoing, args);
    })(outgoing._finish);
};
//# sourceMappingURL=outgoing.js.map