const jsw = require("./dist/lib/index").default;
const ReportPlugin = require("./dist/plugins/report").default;
const http = require("http");
const cookie = require("cookie");

jsw({
  plugins: [
    new ReportPlugin({
      getUid(req) {
        const cookies = cookie.parse(req.headers.cookie);
        return cookies.report || "";
        // return 'null'
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

    const req = http.request(options, (res) => {
      console.log('create app')
      res.on('close', () => {
        response.writeHead(200);
        response.write("id Ok");
        response.end();
      })
  
      res.on('data', () => {
        console.warn('data')
      })
    });
    req.write(dataEncoded)
    req.end()
  } else {
    console.log('test')
    response.writeHead(404);
    response.end()
  }
});


server.listen(8820); // Activates this server, listening on port 8080.

