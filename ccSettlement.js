/**
 * @author Iyasu Geleta
 * @email iyasu.geleta@du.edu
 * @desc This module accepts a list of transactions and split into two unsettled and
 * transaction array lists
 *       It is based  cc_settlement.py by  Michael Schwartz
 *
 *
 */

const nanoid = require("nanoid");

const cc_transaction = require("./cctransaction");

//# MAX_SETTLEMENTS = 100

function CCSettlement() {
  //  """
  //A settlement object is a batch of transactions together with a settlement id
  //A settlement may not contain zero transactions

  //"""

  this.settlementId = "pending";
  this.transactions = [];
  this.unsettled = [];

  this.check_transaction = function (transaction, gList, cList, mList) {
    // """Check the transaction for proper fields and completeness"""
    let result = true;
    let message = [];
    // Check card attributes
    cList.forEach((element) => {
      if (!element in transaction.data["card"]) {
        message.push(attr + " not found in card data");
        result = false;
      }
    });

    // Check merchant attributes
    mList.forEach((element) => {
      if (!element in transaction.data["merchant_data"]) {
        message.push(element + " not found in merchant data");
        result = false;
      }
    });

    // Check for validity and authorization
    gList.forEach((element) => {
      if (!element in transaction.data) {
        message.push(element + " not found in transaction data");
        result = false;
      }
    });
    if (message.length > 0) {
      console.log(
        "Transaction " +
          transaction.data.to_json() +
          " not accepted: " +
          ", ".join(message)
      );
    }

    return result;
  };

  this.settle = function (transactions) {
    // """
    //     Checks a single transaction and adds a settlement id if OK
    //     This should use the persistent store to verify settlements,
    //     log the completed ones, and remove the transactions from the
    //     pending list.
    // """
    var result = new CCSettlement();
    transactions.forEach((transaction) => {
      console.log(transaction);

      if (
        this.check_transaction(
          transaction,
          ["approved", "approval_code"],
          ["type", "valid"],
          ["name", "network_id"]
        )
      ) {
        //Check if the card IS valid and IS authorized
        if (
          !!transaction.data &&
          !!transaction.data.approved &&
          transaction.data["approved"] &&
          !!transaction.data.approval_code &&
          !!transaction.data["approval_code"]
        ) {
          if (this.settlementId === "pending") result.setSettlementId();

          transaction.data["settlement_id"] = result.settlementId;
          result.setTrxs(transaction);
        } else {
          result.setUnsettledTrxs(transaction);
        }
      } else {
        result.setUnsettledTrxs(transaction);
      }
    });
    let responseData = {
      settlementId: result.settlementId,
      transactions: result.transactions,
      unsettled: result.unsettled,
    };
    return responseData;
  };
}

CCSettlement.prototype.setTrxs = function (transaction) {
  let index = this.transactions.length;
  this.transactions[index++] = transaction;
};

CCSettlement.prototype.setUnsettledTrxs = function (transaction) {
  let index = this.unsettled.length;
  this.unsettled[index++] = transaction;
  console.log(JSON.stringify(this.unsettled[0]));
};

CCSettlement.prototype.setSettlementId = function () {
  this.settlementId = "settle_" + nanoid.nanoid(10);
};
module.exports = {
  CCSettlement: CCSettlement,
};
