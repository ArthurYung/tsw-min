"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const url = require("url");
const http = require("http");
const sessionCaches = new Map();
let server;
// 获取本级debugger ws地址
function getDebuggerUrl(prot) {
    return new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${prot}/json`, (res) => {
            let rawInfo = "";
            res.on("data", (chunk) => (rawInfo += chunk));
            res
                .on("end", () => {
                const debugInfos = JSON.parse(rawInfo);
                const connectCount = debugInfos.length;
                if (connectCount > 1) {
                    reject(`${connectCount} debugger connects on this port`);
                    return;
                }
                const url = debugInfos[0].webSocketDebuggerUrl;
                if (url) {
                    resolve(url);
                }
                else {
                    reject(`a devTools has connected to ws://127.0.0.1/${prot}`);
                }
            })
                .on("error", (error) => {
                reject(error.message);
            });
        });
    });
}
// 关闭转发代理
function closeSession(prot) {
    var _a, _b;
    const session = sessionCaches.get(prot);
    if (session) {
        (_a = session.frontend) === null || _a === void 0 ? void 0 : _a.close();
        (_b = session.backend) === null || _b === void 0 ? void 0 : _b.close();
        sessionCaches.delete(prot);
    }
}
// 创建一个转发连接
function createBackendProxy(url, prot) {
    return new Promise((resolve, reject) => {
        const backend = new WebSocket(url);
        backend.on("open", () => {
            console.debug("debugger proxy is created");
            backend["_socket"].pause();
            resolve(backend);
        });
        backend.on("error", (err) => {
            reject(err.message);
        });
    });
}
// 代理数据转发
function proxyMessage(frontend, backend, prot) {
    frontend.on("message", (data) => {
        backend === null || backend === void 0 ? void 0 : backend.send(data);
    });
    backend.on("message", (data) => {
        frontend === null || frontend === void 0 ? void 0 : frontend.send(data);
    });
    frontend.on("close", () => {
        closeSession(prot);
    });
    backend.on("close", () => {
        closeSession(prot);
    });
    frontend["_socket"].resume();
    backend["_socket"].resume();
    sessionCaches.set(prot, { frontend, backend });
}
// 开始代理
async function proxyStart(socket, prot) {
    // 先清理一下旧的连接
    closeSession(prot);
    try {
        const url = await getDebuggerUrl(prot);
        const backend = await createBackendProxy(url, prot);
        proxyMessage(socket, backend, prot);
    }
    catch (e) {
        console.error(e);
    }
}
server = new WebSocket.Server({ noServer: true });
server.on("connection", (socket, incomingMessage) => {
    // pause current socket wait proxy
    socket["_socket"].pause();
    // get proxy prot
    const prot = url.parse(incomingMessage.url, true).pathname.slice(1);
    proxyStart(socket, prot);
});
server.on("error", (e) => {
    console.error(e.message);
});
process.on('message', (message, handle) => {
    if (typeof message === 'object' && message.type === 'connect') {
        server.handleUpgrade(message, handle, Buffer.from(''), function (conn) {
            server.emit('connection', conn, message);
        });
    }
});
//# sourceMappingURL=debug.js.map