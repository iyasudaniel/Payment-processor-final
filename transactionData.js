
/** @author Iyasu Geleta
 * @email iyasu.geleta@du.edu
 *@desc
 * Class for creating dynamodb table and inserting data into tables
 */
var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000"
});

var dynamodb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();

var params1 = {
    TableName: "Transaction",
    KeySchema: [
        { AttributeName: "id", KeyType: "HASH" },  //Partition key
        { AttributeName: "amount", KeyType: "RANGE" }  //Sort key
    ],
    AttributeDefinitions: [
        { AttributeName: "id", AttributeType: "S" },
        { AttributeName: "amount", AttributeType: "N" }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
};
var params2 = {
    TableName: "SettledTransaction",
    KeySchema: [
        { AttributeName: "settlementID", KeyType: "HASH" },  //Partition key  
        { AttributeName: "id", KeyType: "Range" }  //Sort key

    ],
    AttributeDefinitions: [
        { AttributeName: "settlementID", AttributeType: "S" },
        { AttributeName: "id", AttributeType: "S" }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
};
var params3 = {
    TableName: "UnsettledTransaction",
    KeySchema: [
        { AttributeName: "id", KeyType: "HASH" },  //Partition key
        { AttributeName: "amount", KeyType: "RANGE" }  //Sort key
    ],
    AttributeDefinitions: [
        { AttributeName: "id", AttributeType: "S" },
        { AttributeName: "amount", AttributeType: "N" }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
};

dynamodb.listTables({ Limit: 10 }, function (err, data) {
    if (err) {
        console.log("Error", err.code);
    } else {
        if (!data.TableNames.includes("Transaction")) {
            createTable(params1);
        }
        if (!data.TableNames.includes("SettledTransaction")) {
           createTable(params2);
        }
        if (!data.TableNames.includes("UnsettledTransaction")) {
            createTable(params3)
        }
    }
});

function createTable(params) {
    dynamodb.createTable(params, function (err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}


function createTransactions(creditCardTransaction) {
    var table = "Transaction";

    var params = {
        TableName: table,
        Item: {
            "id": creditCardTransaction.data.id,
            "amount": creditCardTransaction.data.amount,
            "approved": creditCardTransaction.data.approved,
            "merchant_data": creditCardTransaction.data.merchant_data
        }
    };
    docClient.put(params, function (err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        }
        else {
            console.log("Added item:", JSON.stringify(data, null, 2));
        }
    });
}

function createdSettledTransactions(ccSettelment) {
    ccSettelment.transactions.forEach(element => {
        var table = "SettledTransaction";
        console.log(element.data.settlement_id);
        var params = {
            TableName: table,
            Item: {
                "settlementID": element.data.settlement_id,
                "id": element.data.id,
                "amount": element.data.amount

            }
        };
        docClient.put(params, function (err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Added item:", JSON.stringify(data, null, 2));
            }
        });


    });
}

function createUnsettledTransactions(ccSettelment) {
    ccSettelment.unsettled.forEach(element => {
        var table = "UnsettledTransaction";
        console.log(element.data.settlement_id);
        var params = {
            TableName: table,
            Item: {
                "id": element.data.id,
                "amount": element.data.amount

            }
        };
        docClient.put(params, function (err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Added item:", JSON.stringify(data, null, 2));
            }
        });


    });
}

module.exports = {
    createTransactions: createTransactions,
    createdSettledTransactions: createdSettledTransactions,
    createUnsettledTransactions: createUnsettledTransactions,
};

