/**
 * @author Iyasu Geleta
 * @email iyasu.geleta@du.edu
 * @desc This module consists of validation code for customers credit card information
 *       It is based  cc_settlement.py by  Michael Schwartz
 *
 *
 */

cc_dictionary = {
  visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
  mastercard: /^5[1-5][0-9]{14}$|^2(?:2(?:2[1-9]|[3-9][0-9])|[3-6][0-9][0-9]|7(?:[01][0-9]|20))[0-9]{12}/,
  amex: /^3[47][0-9]{13}$/,
  discover: /^65[4-9][0-9]{13}|64[4-9][0-9]{13}|6011[0-9]{12}|(622(?:12[6-9]|1[3-9][0-9]|[2-8][0-9][0-9]|9[01][0-9]|92[0-5])[0-9]{10})$/,
};
function checkCardType(creditCardNumber) {
  if (cc_dictionary["visa"].test(creditCardNumber)) {
    return "visa";
  } else if (cc_dictionary["mastercard"].test(creditCardNumber)) {
    return req.ccType === "mastercard";
  } else if (cc_dictionary["amex"].test(creditCardNumber)) {
    return "amex";
  } else if (cc_dictionary["discover"].test(creditCardNumber)) {
    return "discover";
  } else {
    return "";
  }
}

function verifyLuhn(creditCardNumber) {
  var sum = 0,
    alt = false,
    i = creditCardNumber.length - 1,
    num;

  if (creditCardNumber.length < 13 || creditCardNumber.length > 19) {
    return false;
  }

  while (i >= 0) {
    //get the next digit
    num = parseInt(creditCardNumber.charAt(i), 10);

    //if it's not a valid number, abort
    if (isNaN(num)) {
      return false;
    }

    //if it's an alternate number...
    if (alt) {
      num *= 2;
      if (num > 9) {
        num = (num % 10) + 1;
      }
    }

    //flip the alternate bit
    alt = !alt;

    //add to the rest of the sum
    sum += num;

    //go to next digit
    i--;
  }

  //determine if it's valid
  return sum % 10 == 0;
}
function validateCVV(cardNumber, cvv) {
  //Return true if the length of the CVV is correct for the card. False otherwise
  card_type = checkCardType(cardNumber);
  if (card_type === "amex") {
    return cvv.length === 4;
  } else if (
    card_type === "visa" ||
    card_type === "mastercard" ||
    card_type === "discover"
  )
    return cvv.length === 3;
  else return false;
}
function validateDate(expMonth, expYear, maxFutureYear = 5) {
  let today = new Date();
  //let expMonth = req.expmonth;
  //let expYear = req.expyear;
  let someday = new Date();
  someday.setFullYear(expYear, expMonth, 1);
  return someday < today;
}
function validateCard(cardNumber, cvv, result_list = false) {
  card_type = checkCardType(cardNumber);
  valid = verifyLuhn(cardNumber);
  cvv = validateCVV(cardNumber, cvv);
  console.log("Type: ", card_type, " Luhn: ", valid, " cvv", cvv);

  return card_type && valid && cvv;
}
module.exports = {
  validateCard: validateCard,
  validateDate: validateDate,
};
