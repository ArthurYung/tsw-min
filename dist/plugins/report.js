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
            const uid = this.getUid(req);
            context.isReport = this.checkDyeingUid(uid);
            context.env = uid;
        });
        events.on("RESPONSE_FINISH", ({ context }) => {
            if (context.isReport) {
                context.appKey = this.appKey;
                jg_fetch_1.postReport(context);
            }
        });
        // events.on("")
        await this.updateProxyEnv();
        setInterval(async () => {
            await this.updateProxyEnv();
        }, 60000);
    }
    async updateProxyEnv() {
        this.envList = await jg_fetch_1.fetchProxyEnv(this.appKey);
    }
    checkDyeingUid(uid) {
        return this.envList.includes(uid);
    }
}
exports.default = JswReportPlugin;
