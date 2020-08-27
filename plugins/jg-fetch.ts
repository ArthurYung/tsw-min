import got from "got";

const proxyConfig = {
  host: "127.0.0.1",
  domain: "http://dev.jsw.jpushoa.com",
  prot: 7001,
};

type ProxyConfig = typeof proxyConfig;

type PostContext = {
  appKey: string;
  logs: string[];
  requests: any[];
  env: string;
};

type ProxyResData = {
  code: number;
  data?: {
    envList: number[]
    enabled: boolean
  };
  message?: string
}

export function setProxyConfig(config: ProxyConfig) {
  Object.assign(proxyConfig, config);
}

export async function fetchProxyEnv(appKey: string) {
  try {
    const { body } = await got.get<ProxyResData>(
      `${proxyConfig.domain}:${proxyConfig.prot}/api/v1/env?appKey=${appKey}`,
      {
        host: proxyConfig.host,
        responseType: "json",
      }
    );

    if (body.code !== 0) {
      console.warn(body.message)
      return null
    }

    return body.data
  } catch (e) {
    console.error(e);
    return null;
  }
}

export function postReport(context: PostContext) {
  got.post(`${proxyConfig.domain}:${proxyConfig.prot}/api/v1/logs`, {
    host: proxyConfig.host,
    responseType: "json",
    json: context,
  });
}
