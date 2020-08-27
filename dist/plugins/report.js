"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jg_fetch_1 = require("./jg-fetch");
class JswReportPlugin {
    constructor(config) {
        this.getUid = config.getUid || (() => { });
        this.appKey = config.appKey;
        this.envList = [];
    }
    async init(events) {
        events.on("REQUEST_START", ({ req, context }) => {
            if (!context)
                return;
            try {
                const uid = this.getUid(req);
                context.isReport = this.checkDyeingUid(uid);
                context.env = uid;
            }
            catch (e) {
                console.warn('get uid err: ' + e.message);
            }
        });
        events.on("RESPONSE_FINISH", ({ context }) => {
            console.log(context);
            if (!context)
                return;
            if (context.isReport) {
                context.appKey = this.appKey;
                jg_fetch_1.postReport(context);
            }
        });
        await this.updateProxyEnv();
        setInterval(async () => {
            await this.updateProxyEnv();
        }, 60000);
    }
    async updateProxyEnv() {
        const envConfig = await jg_fetch_1.fetchProxyEnv(this.appKey);
        if (envConfig) {
            this.envList = envConfig.envList;
            console.log(envConfig.envList);
            if (global.jswConfig) {
                global.jswConfig.isEnabled = envConfig.enabled;
            }
        }
    }
    checkDyeingUid(uid) {
        return this.envList.includes(uid);
    }
}
exports.default = JswReportPlugin;
//# sourceMappingURL=report.js.map