"use strict";
/* !
 * Tencent is pleased to support the open source community by making Tencent Server Web available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dnsRestore = exports.dnsHack = void 0;
const dns = require("dns");
const net = require("net");
const logger_1 = require("../logger");
let dnsHacked = false;
let originDnsLookUp = null;
exports.dnsHack = () => {
    // Ensure hack can only be run once.
    if (!dnsHacked) {
        dnsHacked = true;
        originDnsLookUp = dns.lookup;
        // eslint-disable-next-line
        // @ts-ignore
        // By default, ts not allow us to rewrite original methods.
        dns.lookup = ((lookup) => (hostname, optionsOrCallback, callbackOrUndefined) => {
            const start = Date.now();
            const options = typeof optionsOrCallback === "function" ? undefined : optionsOrCallback;
            const callback = typeof optionsOrCallback === "function" ? optionsOrCallback : callbackOrUndefined;
            logger_1.default.debug(`dns lookup for ${hostname}`);
            // For http.request, if host is a ip
            // It will not entry dns.lookup by default
            // https://github.com/nodejs/node/blob/master/lib/net.js#L1002
            // But still need this, in case use call dns.lookup directly
            if (net.isIP(hostname)) {
                logger_1.default.debug(`dns lookup: ${hostname} is a ip`);
                if (options) {
                    return lookup.apply(this, [hostname, options, callback]);
                }
                return lookup.apply(this, [hostname, callback]);
            }
            let isCalled = false;
            let timeoutError;
            let timer;
            const callbackWrap = (err, address, family) => {
                if (isCalled) {
                    return;
                }
                isCalled = true;
                const dnsTime = Date.now() - start;
                if (!err) {
                    logger_1.default.debug(`dns lookup [${dnsTime}ms]: ${hostname} > ${address}`);
                }
                else {
                    logger_1.default.error(`dns lookup [${dnsTime}ms] error: ${err.stack}`);
                }
                if (timer)
                    clearTimeout(timer);
                if (callback)
                    callback(err, address, family);
            };
            timer = setTimeout(() => {
                timeoutError = new Error("Dns Lookup Timeout");
                callbackWrap(timeoutError, "", 0);
            }, 3000);
            if (options) {
                return lookup.apply(this, [hostname, options, callbackWrap]);
            }
            return lookup.apply(this, [hostname, callbackWrap]);
        })(dns.lookup);
    }
};
exports.dnsRestore = () => {
    if (dnsHacked) {
        // eslint-disable-next-line
        // @ts-ignore
        // By default, ts not allow us to rewrite original methods.
        dns.lookup = originDnsLookUp;
        dnsHacked = false;
    }
};
