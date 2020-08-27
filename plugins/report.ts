import * as http from "http";
import { fetchProxyEnv, postReport } from './jg-fetch'
class JswReportPlugin {
  public getUid: (res: http.RequestOptions) => void;
  public appKey: string;
  public envList: any[]; 

  constructor(config) {
    this.getUid = config.getUid || (() => {});
    this.appKey = config.appKey;
    this.envList = [];
  }

  public async init(events) {
    events.on("REQUEST_START", ({ req, context }) => {
      if (!context) return
      try {
        const uid = this.getUid(req);
        context.isReport = this.checkDyeingUid(uid)
        context.env = uid;
      } catch(e) {
        console.warn('get uid err: ' + e.message)
      }
    })

    events.on("RESPONSE_FINISH", ({ context }) => {
      console.log(context)
      if (!context) return
      if (context.isReport) {
        context.appKey = this.appKey;
        postReport(context)
      }
    });

    await this.updateProxyEnv()

    setInterval(async() => {
      await this.updateProxyEnv() 
    }, 60000)
  }

  public async updateProxyEnv() {
    const envConfig = await fetchProxyEnv(this.appKey)
    if (envConfig) {
      this.envList = envConfig.envList;
      console.log(envConfig.envList)
      if(global.jswConfig) {
        global.jswConfig.isEnabled = envConfig.enabled
      }
    }
  }

  public checkDyeingUid(uid) {
    return this.envList.includes(uid);
  }
}

export default JswReportPlugin;
