/**
 * @author Iyasu Geleta
 * @email iyasu.geleta@du.edu
 * @create date 2020-11-10
 *
 * @desc
 *
 *  provide a make payment route that accepts a customer payment request from the
 *  user and call the processing server.
 *
 */

const bodyParser = require("body-parser");
const express = require("express");
var qs = require("qs");
const appUiServer = express();
const fs = require("fs");
const https = require("https");
var request = require("request");
const path = require("path");
var axios = require("axios");
let paymentProcessorHost = "http://localhost:3001";

const portUiserver = 3000;

appUiServer.use(bodyParser.json());
appUiServer.use(bodyParser.urlencoded({ extended: false }));

appUiServer.set("view engine", "ejs");
appUiServer.use("/assets", express.static(__dirname + "/public"));

appUiServer.use("/", function (req, res, next) {
  console.log("Request URL:" + req.url);
  next();
});
appUiServer.get("/", function (req, res) {
  res.render("index");
});

appUiServer.post("/makepayment", async function (req, res) {
  let reqBody = req.body;
  var reqData = {
    name: reqBody.name,
    creditCardNumber: reqBody.creditCardNumber,
    cvv: reqBody.cvv,
    expMonth: reqBody.expmonth,
    expYear: reqBody.expyear,
    totalAmount: reqBody.totalAmount,
  };

  result = await callAuthorizeRequest(reqData);
  res.status(200);
  res.json(result);
  res.end();
});

let callAuthorizeRequest = async function (reqData) {
  var config = {
    method: "post",
    url: `${paymentProcessorHost}/authorizePayment`,
    headers: {
      "Content-Type": "application/json",
    },
    data: reqData,
    json: true,
  };

  const response = await axios(config);
  return response.data;
};

const sslServer = https.createServer(
  {
    key: fs.readFileSync(path.join(__dirname, "cert", "private.pem")),
    cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
  },
  appUiServer
);

sslServer.listen(portUiserver);
