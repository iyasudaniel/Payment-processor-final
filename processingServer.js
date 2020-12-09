/**
 * @author Iyasu Geleta
 * @email iyasu.geleta@du.edu
 * @desc This server  requests the cctrasaction module to validate
 *         a creditcard information.Moreover it provid an end point
 *         to settle a transaction
 *
 *
 */
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3001;
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));
const ccTransact = require("./cctransaction");
const ccSettlement = require("./ccSettlement");
const transactionData = require("./transactionData")
app.post("/authorizePayment", function (req, res) {
  let reqBody = req.body;

  const creditCardTransaction = new ccTransact.CCTransaction(
    reqBody["name"],
    reqBody["creditCardNumber"],
    reqBody["cvv"],
    reqBody["expMonth"],
    reqBody["expYear"],
    "usd"
  );
  creditCardTransaction.set_amount_dc(reqBody["totalAmount"]);
  creditCardTransaction.setMerchantData("Target", "merch_1e_2f_3g");
  console.log(creditCardTransaction.validateTransaction());
  transactionData.createTransactions(creditCardTransaction);

  return res.json(creditCardTransaction);
});
app.post("/settle", function (req, res) {
  let reqbody = req.body;
  if (!!reqbody && reqbody["transactionList"] == undefined) {
    res.status("400");
    res.send("missing required transaction list");
  }

  let transactionList = reqbody["transactionList"];
  let settlementObject = new ccSettlement.CCSettlement();
  result = settlementObject.settle(transactionList);
  transactionData.createdSettledTransactions(result);
  transactionData.createUnsettledTransactions(result);
  console.log(result.transactions);
  console.log(result.unsettled);

  res.json(result);
});

app.listen(port);


