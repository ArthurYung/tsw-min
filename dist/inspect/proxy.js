"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debug = void 0;
const child_process_1 = require("child_process");
const url = require("url");
exports.debug = (app, port = 9229) => {
    const nodeOptions = process.env.NODE_OPTIONS;
    if (nodeOptions !== '--inspect' && nodeOptions !== '--inspect-res') {
        return;
    }
    console.debug(`

    Debugger Proxy listening your app.

    To start debugging, open the following URL in Chrome:

    chrome://devtools/bundled/js_app.html?ws=YOUR_APP_HOST/__debug__

  `);
    process.env.NODE_OPTIONS = '';
    const worker = child_process_1.fork('./dist/inspect/debug.js');
    process.env.NODE_OPTIONS = nodeOptions;
    app.on('upgrade', function upgrade(request, socket) {
        const pathname = url.parse(request.url).pathname;
        if (pathname === '/__debug__') {
            worker.send({
                headers: request.headers,
                method: request.method,
                type: 'connect',
                url: '/' + port,
            }, socket);
        }
    });
};
//# sourceMappingURL=proxy.js.map