/* eslint-disable @typescript-eslint/no-var-requires */

const http = require("http");
// const jsw = require("../dist/lib/index-old").default;
// jsw({
//   lineLevel: 30,
// })
const fs = require('fs')
const { createHook, triggerAsyncId } = require('async_hooks')
createHook({
  init(async, type, trigger) {
    fs.writeSync(1, 'init: ' + async + ' type: ' + type + ' trigger: ' + trigger + '\n')
  },
  before(async) {
    fs.writeSync(1, 'before: ' + async + ' trigger: '+ triggerAsyncId() + '\n')
  }
}).enable()
const server = http.createServer((req, res) => {
  // console.log('success')
  res.end("hello world");
});

server.listen(3000);
console.log("jsw node server is listening on 3000");
