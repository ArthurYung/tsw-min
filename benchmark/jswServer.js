/* eslint-disable @typescript-eslint/no-var-requires */

const http = require("http");
const ReportPlugin = require("../dist/plugins/report").default;
const { jsw } = require("../dist/lib/index");
jsw({
  lineLevel: 30,
  // plugins: [new ReportPlugin({
  //   getUid() {
  //     return 'null'
  //   },
  //   appKey: "254a86f7ba286dbce5e308ad11bebe0984fc2035",
  // })],
})

// openLogStash()
const server = http.createServer((req, res) => {
  // console.log('success')
  res.end("hello world");
});

server.listen(3000);
console.log("jsw node server is listening on 3000");
