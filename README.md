# JSW
TSW魔改优化后的NODE抓包上报组件

# 使用方法
在入口文件最顶层引入 `import { jsw } from 'jsw'`

```js
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
```
