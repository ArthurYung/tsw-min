import * as http from "http";
import { fetchProxyEnv, postReport } from './jg-fetch'
class JswReportPlugin {
  public getUid: (res: http.RequestOptions) => void;
  public appKey: string;
  public envList: any[]; 

  constructor(config) {
    this.getUid = config.getUid || (() => {});
    this.appKey = config.appKey;
    this.envList = []
  }

  public async init(events) {
    events.on("REQUEST_START", ({ req, context }) => {
      const uid = this.getUid(req);
      context.isReport = this.checkDyeingUid(uid)
      context.env = uid;
    })

    events.on("RESPONSE_FINISH", ({ context }) => {
      if (context.isReport) {
        context.appKey = this.appKey;
        postReport(context)
      }
    });

    // events.on("")

    await this.updateProxyEnv()

    setInterval(async() => {
      await this.updateProxyEnv() 
    }, 60000)
  }

  public async updateProxyEnv() {
    this.envList = await fetchProxyEnv(this.appKey);
  }

  public checkDyeingUid(uid) {
    return this.envList.includes(uid);
  }
}

export default JswReportPlugin;
