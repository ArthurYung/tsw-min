const { jsw } = require("./dist/lib/index");
const ReportPlugin = require("./dist/plugins/report").default;
const http = require("http");
const cookie = require("cookie");
const { executionAsyncId, triggerAsyncId } = require('async_hooks')

jsw({
  plugins: [
    new ReportPlugin({
      getUid(req) {
        if (!req) return 'null'
        const cookies = cookie.parse(req.headers.cookie);
        return cookies.report || "";
      },
      appKey: "cc9795781a140de490c7249314f8f4394c9d24b1",
    }),
  ],
  lineLevel: 30,
});

const server = http.createServer((request, response) => {
   if(request.url === '/post/json') {
    const dataEncoded = JSON.stringify({
      appkey: 'test-appkey',
      password: 'testPassowrd',
      fn: 4,
      test: {
        autofix: 1,
        np: [1,2,3]
      }
    })

    const options = {
      hostname: 'yapi.gltest.jpushoa.com',
      path: '/mock/15/ssr/api/push/data?a=1',
      method: 'POST',
      headers: {
        'Content-Length': Buffer.byteLength(dataEncoded),
        'Content-Type': 'application/json',
      },
    };
    console.log('is create end', executionAsyncId(), triggerAsyncId())
    setTimeout(() => {
      console.log('fs setTime', executionAsyncId(), triggerAsyncId())
      const req = http.request(options, (res) => {
        console.log('create app', executionAsyncId(), triggerAsyncId())
        res.on('close', () => {
          setTimeout(() => {
            console.log('is end', executionAsyncId(), triggerAsyncId())
            response.writeHead(200);
            response.write("id Ok");
            response.end();
          }, 3000)
  
        })
    
        res.on('data', () => {
          console.warn('data')
        })
      });
      req.write(dataEncoded)
      req.end()
    }, 3000)
  } else {
    console.log('test')
    response.writeHead(200);
    response.end()
  }
});


server.listen(8820, () => {
  console.log('start with: http://localhost:8820/')
}); // Activates this server, listening on port 8080.

