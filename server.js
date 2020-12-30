const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const app = express(),
      bodyParser = require("body-parser");
      port = 3080;

const users = [];

app.use(bodyParser.json());
app.use(express.static(process.cwd()+"/dist/demo/"));

app.use('/api', createProxyMiddleware({ 
    target: 'http://api.openweathermap.org/data/2.5', 
    changeOrigin: true,
    pathRewrite: {"^/api" : ""}
}));

app.get('/', (req,res) => {
  res.sendFile(process.cwd()+"/dist/demo/index.html")
});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});