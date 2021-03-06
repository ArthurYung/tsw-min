"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postReport = exports.fetchProxyEnv = exports.setProxyConfig = void 0;
const got_1 = require("got");
const proxyConfig = {
    host: "127.0.0.1",
    domain: "http://dev.jsw.jpushoa.com",
    prot: 7001,
};
function setProxyConfig(config) {
    Object.assign(proxyConfig, config);
}
exports.setProxyConfig = setProxyConfig;
async function fetchProxyEnv(appKey) {
    try {
        const { body } = await got_1.default.get(`${proxyConfig.domain}:${proxyConfig.prot}/api/v1/env?appKey=${appKey}`, {
            host: proxyConfig.host,
            responseType: "json",
        });
        if (body.code !== 0) {
            console.warn(body.message);
            return null;
        }
        return body.data;
    }
    catch (e) {
        console.error(e);
        return null;
    }
}
exports.fetchProxyEnv = fetchProxyEnv;
function postReport(context) {
    got_1.default.post(`${proxyConfig.domain}:${proxyConfig.prot}/api/v1/logs`, {
        host: proxyConfig.host,
        responseType: "json",
        json: context,
    });
}
exports.postReport = postReport;
//# sourceMappingURL=jg-fetch.js.map