'use strict'

const AWS = require('aws-sdk')
AWS.config.update({ region: process.env.APP_AWS_REGION || 'us-east-1' })
const documentClient = new AWS.DynamoDB.DocumentClient()
const uuidv1 = require('uuid/v1');
const TABLE_NAME = process.env.EMAILTABLE

module.exports.saveEmail = async mailBody => {
  return new Promise((resolve, reject) => {
    const emailUuid = uuidv1()
    const params = {
      TableName: TABLE_NAME,
      Item: {
        emailId: emailUuid,
        mailTo: mailBody.mailto,
        subject: mailBody.subject,
        message: mailBody.message,
        mailStatus: mailBody.mailstatus,
        ReqBody: JSON.stringify(mailBody),
        created_at_string: Date().toLocaleString(),
        created_at: Date.now()
      }
    }
    console.log(params)
    documentClient.put(params, function(err, data) {
      if (err) {
          console.error(err)
          reject(err)
      }
      else resolve(emailUuid)
    })
  })
}

module.exports.getEmail = emailId => {
  const params = {
    Key: {
      emailId: emailId
    },
    TableName: TABLE_NAME
  };

  return documentClient.get(params).promise().then(result => {
    return result.Item;
  });
};

module.exports.getAllEmails = () => {
  return scanTable(TABLE_NAME)
};

const scanTable = async (tablename) => {
  const params = {
      TableName: tablename,
  };

  let scanResults = [];
  let items;
  do {
      items = await documentClient.scan(params).promise();
      items.Items.forEach((item) => scanResults.push(item));
      params.ExclusiveStartKey  = items.LastEvaluatedKey;
  } while(typeof items.LastEvaluatedKey != "undefined");

  return scanResults;
};