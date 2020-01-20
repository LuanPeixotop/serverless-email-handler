'use strict';

//const { saveEmail } = require('./dynamodb')
const { sendEmailService } = require('./ses')

module.exports.sendEmail = async event => {
  if (event.headers['Authorization'] === undefined || event.headers['Authorization'] != process.env.AUTHORIZATION) {
    return {
      statusCode: 401,
      body: 'Alemão não é bem vindo na favela.',
    }
  }

  console.log(`Oh o que o maluco mandou: ${event.body}`)    
  try {
    var mailBody = event.body

    if (mailBody === null || mailBody === undefined) {
      console.log('O maluco esqueceu de mandar os parâmetros')
      return {
        statusCode: 400,
        body: 'Esqueceu de mandar os parâmetros, sangue bom! Manda os parâmetros mailto, subject e message, na humildade.'    
      }
    }

    mailBody = JSON.parse(mailBody)

    if (mailBody.mailto === undefined || mailBody.subject === undefined || mailBody.message === undefined) {
      console.log('O maluco deu papo errado')
      return {
        statusCode: 400,
        body: 'Chefia, dá um confere nesses parâmetros ae. Cê tem que enviar os parâmetros mailto, subject e message'    
      }
    }
    
    if (!mailBody.mailto.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
      console.log('Email da 25 de março: ', mailBody.mailto);
      return {
        statusCode: 400,
        body: 'Comprou esse e-mail na Uruguaiana? KKKKKK. Revisa isso ae meu chapa: ' + mailBody.mailto
      }
    }

    // Manda e-mail e salva no banco em pararelo
    await Promise.all([sendEmailService(mailBody)])
    //await Promise.all([sendEmail(mailBody), saveEmail(mailBody)])
    
    return {
        statusCode: 200,
        body: 'Enviado, meu patrão!',
    }
  } catch(err) {
    console.error('Deu ruim: ', err)  
    return {
        statusCode: 500,
        body: 'Deu ruim: ' + err   
    }
  }
};
