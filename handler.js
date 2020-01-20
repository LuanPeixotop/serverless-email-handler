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
    return createResponse(401, 'Alemão não é bem vindo na favela.')
  }

  console.log(`Oh o que o maluco mandou: ${event.body}`)    
  try {
    var mailBody = event.body

    if (mailBody === null || mailBody === undefined) {
      console.log('O maluco esqueceu de mandar os parâmetros')
      return createResponse(400, 'Esqueceu de mandar os parâmetros, sangue bom! Manda os parâmetros mailto, subject, message e mailstatus, na humildade.') 
    }

    mailBody = JSON.parse(mailBody)

    if (mailBody.mailto === undefined || mailBody.subject === undefined || mailBody.message === undefined || mailBody.mailstatus === undefined) {
      console.log('O maluco deu papo errado')
      return createResponse(400, 'Chefia, dá um confere nesses parâmetros ae. Cê tem que enviar os parâmetros mailto, subject, message e mailstatus')
    }
    
    if (!mailBody.mailto.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
      console.log('Email da 25 de março: ', mailBody.mailto);
      return createResponse(400, 'Comprou esse e-mail na Uruguaiana? KKKKKK. Revisa isso ae meu chapa: ' + mailBody.mailto)
    }

    var emailId = null
    // Manda e-mail e salva no banco em pararelo
    await Promise.all([ses.sendEmail(mailBody), dynamodb.saveEmail(mailBody)]).then(values=> { 
      emailId = values[1]
    });
    
    return createResponse(200, 'Enviado, meu patrão! Segue o id do e-mail: ' + emailId)

  } catch(err) {
    console.error('Deu ruim: ', err)  
    return createResponse(500, 'Deu ruim: ' + err) 
  }
};

module.exports.getEmail = async event => {
  if (event === undefined || event.headers === undefined || event.headers['Authorization'] === undefined || event.headers['Authorization'] != process.env.AUTHORIZATION) {
    return createResponse(401, 'Alemão não é bem vindo na favela.')
  }

  const emailId = event.pathParameters.emailId;
  var email = null

  await Promise.all([dynamodb.getEmail(emailId)]).then(values=> { 
    email = values[0]
  });

  if (email === null) {
    return createResponse(400, 'Achei não, parsa.') 
  } else {
    return createResponse(200, email)
  }
};


module.exports.getAllEmails = async event => {
  if (event === undefined || event.headers === undefined || event.headers['Authorization'] === undefined || event.headers['Authorization'] != process.env.AUTHORIZATION) {
    return createResponse(401, 'Alemão não é bem vindo na favela.')
  }

  var allEmails = null

  await Promise.all([dynamodb.getAllEmails()]).then(values=> { 
    allEmails = values[0]
  });

  if (allEmails === null) {
    return createResponse(400, 'Tem não mermão') 
  } else {
    return createResponse(200, allEmails)
  }
};