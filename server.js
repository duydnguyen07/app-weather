const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const app = express(),
      bodyParser = require("body-parser");
      port = 3080;

const BASE_PATH = "/weather-app"

app.use(bodyParser.json());
app.use(BASE_PATH, express.static(process.cwd()+"/dist/demo/"));

const pathRewriteKey = `^${BASE_PATH}/api`
const rewriteConfigObj = {} 
rewriteConfigObj[pathRewriteKey] = ""

app.use(BASE_PATH + '/api', createProxyMiddleware({ 
    target: 'http://api.openweathermap.org/data/2.5', 
    changeOrigin: true,
    pathRewrite: rewriteConfigObj
}));

app.get(BASE_PATH + '/', (req,res) => {
  res.sendFile(process.cwd()+"/dist/demo/index.html")
});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});