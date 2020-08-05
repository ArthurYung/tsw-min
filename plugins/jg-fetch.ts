import got from "got";

const proxyConfig = {
  host: "127.0.0.1",
  domain: "http://dev.jsw.jpushoa.com",
  prot: 7001,
};

type ProxyConfig = typeof proxyConfig;

type FetchConfig = {
  appKey: string;
};

export function setProxyConfig(config: ProxyConfig) {
  Object.assign(proxyConfig, config);
}

export async function fetchProxyEnv(appKey: string) {
  try {
    const { body } = await got.get<string[]>(
      `${proxyConfig.domain}:${proxyConfig.prot}/api/v1/env?appKey=${appKey}`,
      {
        host: proxyConfig.host,
        responseType: "json",
      }
    );
    console.log(body);
    return Array.isArray(body) ? body : [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

type PostContext = {
  appKey: string;
  logs: string[];
  requests: any[];
  env: string;
};

export function postReport(context: PostContext) {
  got.post(`${proxyConfig.domain}:${proxyConfig.prot}/api/v1/logs`, {
    host: proxyConfig.host,
    responseType: "json",
    json: context,
  });
}
