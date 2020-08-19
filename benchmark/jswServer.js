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
  //   appKey: "d531aeb3dc40c14164482428b78f33d811e4eab2",
  // })]
})

// openLogStash()
const server = http.createServer((req, res) => {
  // console.log('success')
  res.end("hello world");
});

server.listen(3000);
console.log("jsw node server is listening on 3000");
