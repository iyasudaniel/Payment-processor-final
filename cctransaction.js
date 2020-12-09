/**
 * @author Iyasu Geleta
 * @email iyasu.geleta@du.edu
 * @desc This module mimics a credit card network.It validates the reqquest from
 *       the procesing sever.
 *       It is based  cc_transaction.py by  Michael Schwartz
 *
 *
 */

const nanoid = require("nanoid");
const requestvalidation = require("./validationUtility");

function CCTransaction(
  name = "",
  credit_card_string = "",
  cvv_string = "",
  exp_month = 0,
  exp_year = 2000,
  currency = "usd"
) {
  //A simplified Credit Card transaction

  //Initialize a transaction object
  this.data = {};
  this.data["card"] = {
    id: credit_card_string,
    name: name,
    card_code: cvv_string,
    currency: currency,
    exp_month: exp_month,
    exp_year: exp_year,
  };

  this.data["id"] = "auth_" + nanoid.nanoid(10);
  this.data["currency"] = currency;
  this.data["amount"] = 0;

  this.set_amount = function (amount, currency = "usd") {
    //sets the amount of the transaction in cents
    this.data["amount"] = parseInt(amount);
    this.data["currency"] = currency;
  };

  this.set_amount_dc = function (dollars, cents = 0, currency = "usd") {
    //sets the amount of the transaction in dollars and cents
    this.data["amount"] = dollars * 100 + cents;
    this.data["currency"] = currency;
  };

  this.getAmount = function () {
    //returns the amount from the transaction object
    return this.data["amount"];
  };

  this.getName = function () {
    //returns the cardholder's name fro the transaction object"""
    return this.data["card"]["name"];
  };
  this.setMerchantData = function (merchant_name, merchant_id) {
    //sets the merchant data properly into the transaction object"""
    this.data["merchant_data"] = {
      name: merchant_name,
      network_id: merchant_id,
    };
  };
  this.isReadyForRequest = function () {
    //Checks for basic data, not its validity"""
    let has_cardholder_info = !!this.data && !!this.data.id && !!this.data.card;
    let has_card_info = false;
    if (has_cardholder_info) {
      card_info = this.data["card"];
      console.log(card_info);
      has_card_info =
        !!card_info.id &&
        !!card_info.name &&
        !!card_info.currency &&
        !!card_info.exp_month &&
        !!card_info.exp_year &&
        !!card_info.card_code;
    }

    has_merchant_info =
      !!this.data.merchant_data &&
      !!this.data["merchant_data"].name &&
      !!this.data["merchant_data"].network_id;

    return (
      has_cardholder_info &&
      has_card_info &&
      has_merchant_info &&
      this.data["amount"] > 0
    );
  };

  this.to_json = function () {
    return JSON.stringify(this.data);
  };

  this.list_to_json = function (list_of_transactions) {
    //Converts a list of transactions into a JSON string"""
    intermediate = [];
    list_of_transactions.forEach(function (element) {
      intermediate.push(transaction.data);
    });
    return JSON.stringify(intermediate);
  };

  this.validateCard = function () {
    //Validate a card's number is sensible and store its vendor"""
    card_data = this.data["card"];
    result = requestvalidation.validateCard(
      card_data["id"],
      card_data["card_code"]
    );
    return result;
  };
  this.validateDate = function () {
    //Validate the expiration date"""
    if (!!this.data["card"].exp_month && this.data["card"].exp_year) {
      return requestvalidation.validateDate(
        this.data["card"]["exp_month"],
        this.data["card"]["exp_year"]
      );
    }
    return true;
  };

  this.validateTransaction = function () {
    /*
        Validate and approve a transaction
        A true credit card processor would verify the card has been issued,
        the information matches the card
        It would also verify the merchant is legitimate and the information matches the merchant.
        Other checks might also occur to prevent fraud.
        */
    status = true;
    if (!this.validateCard()) {
      this.data["approved"] = false;
      this.data["failure_code"] = 401;
      this.data["failure_message"] = "Card is not valid";
    } else if (!this.isReadyForRequest()) {
      this.data["approved"] = false;
      this.data["failure_code"] = 402;
      this.data["failure_message"] =
        "Missing information for transaction approval";
    } else if (
      parseInt(this.data["amount"]) < 0 ||
      parseInt(this.data["amount"]) > 500000
    ) {
      this.data["approved"] = false;
      this.data["failure_code"] = 405;
      this.data["failure_message"] = "Transaction amount threshold exceeded";
    } else if (!this.validateDate()) {
      this.data["approved"] = false;
      this.data["failure_code"] = 408;
      this.data["failure_message"] = "Invalid expiration date";
    } else {
      this.data["approved"] = true;
      this.data["failure_code"] = "";
      this.data["failure_message"] = "";
      this.data["approval_code"] = "appr_" + nanoid.nanoid(10);
    }
    return status;
  };
}

module.exports = {
  CCTransaction: CCTransaction,
};
