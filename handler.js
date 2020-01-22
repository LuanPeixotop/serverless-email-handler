'use strict';

const dynamodb = require('./dynamodb')
const ses = require('./ses')

function createResponse(statusCode, message) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(
      {
        message: message
      },
      null,
      2
    ),
  };
}

module.exports.sendEmail = async event => {
  if (event === undefined || event.headers === undefined || event.headers['Authorization'] === undefined || event.headers['Authorization'] != process.env.AUTHORIZATION) {
    return createResponse(401, 'Falha na autenticação. Favor, passar o header Authorization')
  }

  console.log(`Body enviado: ${event.body}`)    
  try {
    var mailBody = event.body

    if (mailBody === null || mailBody === undefined) {
      console.log('Parâmetros não enviados')
      return createResponse(400, 'Parâmetros não enviados. Favor enviar os parâmetros mailto, subject, message e mailstatus') 
    }

    mailBody = JSON.parse(mailBody)

    if (mailBody.mailto === undefined || mailBody.subject === undefined || mailBody.message === undefined || mailBody.mailstatus === undefined) {
      console.log('Parâmetros não enviados corretamente')
      return createResponse(400, 'Parâmetros não enviados corretamente. Favor enviar os parâmetros mailto, subject, message e mailstatus')
    }
    
    if (!mailBody.mailto.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
      console.log('E-mail inválido: ', mailBody.mailto);
      return createResponse(400, 'E-mail inválido: ' + mailBody.mailto)
    }

    var emailId = null
    // Manda e-mail e salva no banco em pararelo
    await Promise.all([ses.sendEmail(mailBody), dynamodb.saveEmail(mailBody)]).then(values=> { 
      emailId = values[1]
    });
    
    return createResponse(200, emailId)

  } catch(err) {
    console.error('Ocorreu um internon na API: ', err)  
    return createResponse(500, 'Ocorreu um interno na API : ' + err) 
  }
};

module.exports.getEmail = async event => {
  if (event === undefined || event.headers === undefined || event.headers['Authorization'] === undefined || event.headers['Authorization'] != process.env.AUTHORIZATION) {
    return createResponse(401, 'Falha na autenticação. Favor, passar o header Authorization')
  }

  const emailId = event.pathParameters.emailId;
  var email = null

  await Promise.all([dynamodb.getEmail(emailId)]).then(values=> { 
    email = values[0]
  });

  if (email === null) {
    return createResponse(400, 'E-mail não encontrado') 
  } else {
    return createResponse(200, email)
  }
};


module.exports.getAllEmails = async event => {
  if (event === undefined || event.headers === undefined || event.headers['Authorization'] === undefined || event.headers['Authorization'] != process.env.AUTHORIZATION) {
    return createResponse(401, 'Falha na autenticação. Favor, passar o header Authorization')
  }

  var allEmails = null

  await Promise.all([dynamodb.getAllEmails()]).then(values=> { 
    allEmails = values[0]
  });

  if (allEmails === null) {
    return createResponse(400, 'A base de e-mails está vazia') 
  } else {
    return createResponse(200, allEmails)
  }
};