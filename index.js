const { jsw } = require("./dist/lib/index");
const ReportPlugin = require("./dist/plugins/report").default;
const http = require("http");
const cookie = require("cookie");
const { executionAsyncId, triggerAsyncId } = require('async_hooks')

jsw({
  plugins: [
    new ReportPlugin({
      getUid(req) {
        if (req.headers && typeof req.headers.cookie === 'string') {
          const cookies = cookie.parse(req.headers.cookie);
          return cookies.report || "";
        }
        return null
      },
      appKey: "37fa3dfffb4c6fc1db744d43b30326dbf7a95e02",
    }),
  ],
  lineLevel: 30,
});

const server = http.createServer((request, response) => {
    console.log('test')
    response.writeHead(200);
    response.end()
});


server.listen(8820, () => {
  console.log('start with: http://localhost:8820/')
}); // Activates this server, listening on port 8080.

