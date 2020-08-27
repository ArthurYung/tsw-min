/* eslint-disable @typescript-eslint/no-var-requires */

const http = require("http");
// const jsw = require("../dist/lib/index-old").default;
// jsw({
//   lineLevel: 30,
// })
const server = http.createServer((req, res) => {
  // console.log('success')
  res.end("hello world");
});

server.listen(3000);
console.log("jsw node server is listening on 3000");
