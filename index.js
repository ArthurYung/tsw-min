const fs = require('fs')
const { executionAsyncId, triggerAsyncId, createHook } = require('async_hooks')

const { jsw } = require("./dist/lib/index");


const ReportPlugin = require("./dist/plugins/report").default;
const http = require("http");
const cookie = require("cookie");
const axios = require('axios')

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
      appKey: "8e0102b37c08f6da87661c5346703d004fd062c2",
    }),
  ],
  lineLevel: 30,
});


const server = http.createServer((request, response) => {

  
   if(request.url === '/post/json') {
    const dataEncoded = {
      appkey: 'test-appkey',
      password: 'testPassowrd',
      fn: 4,
      test: {
        autofix: 1,
        np: [1,2,3]
      }
    }

      axios.post('http://yapi.gltest.jpushoa.com/mock/15/ssr/api/push/data?a=1', {
        data: dataEncoded
      }).then(res => {
        console.log(triggerAsyncId(), executionAsyncId())
        console.log(res.data)
        response.end()
      })

  } else {
    console.log('test')
    response.writeHead(200);
    response.end()
  }
});


server.listen(8820, () => {
  console.log('start with: http://localhost:8820/')
}); // Activates this server, listening on port 8080.

