'use strict'

var aws = require('aws-sdk');
var ses = new aws.SES({region: 'us-east-1'});

module.exports.sendEmail = async mailBody => {

  return new Promise(async (resolve, reject) => {
    var params = {
      Destination: {
          ToAddresses: [mailBody.mailto]
      },
      Message: {
          Body: {
              Html: { 
                Charset: 'UTF-8', 
                Data: mailBody.message 
              }
          },
          Subject: { Data: mailBody.subject
          }
      },
      Source: process.env.EMAILFROM
    };

    // Manda o e-mail
    try {
      const result = await ses.sendEmail(params).promise()
      console.log('Resultado do envio: ', result)
      resolve()
    } catch (err) {
      console.error('Deu ruim no envio: ', err)
      reject(err)
    }
  })
}