// require('dotenv').config()
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const bodyParser = require("body-parser");
const cors = require("cors");
const APP = require("./app");
const port = 3500;
// const express = require("express");
// const cors = require("cors");
// const logger = require("morgan");
// const helmet = require("helmet");
// const mongoose = require("mongoose");

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(bodyParser.json({
  limit: '50mb'
}));

app.use(bodyParser.urlencoded({
  limit: '50mb',
  parameterLimit: 100000,
  extended: true
}));

app.use(cors());
app.use(express.json());
app.use(APP)

server.listen(port, () => {
  console.log(`running on port ${port}`)
})