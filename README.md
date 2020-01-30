# Serverless Email Handler

Esse projeto é uma API Simples para enviar e-mails através do AWS SES a partir de uma requisição HTTP POST e guardar o e-mail enviado no DynamoDB. 
Ela utiliza o serverless framework com lambda, API Gateway e DynamoDB

## Funções Atuais

Atualmente o sistema tem 3 APIs:

/sendEmail       (envia e-mail e salva e-mail no DynamoDB)

/getEmail/{id}   (pega registro do e-mail enviado por ID)

/getAllEmails    (pega todos os e-mails do banco)

### Pré-requisitos

Primeiramente, clone esse repositório e abra um terminal na pasta clonada

Você precisa instalar as seguintes dependencias:

- É necessário instalar o NodeJS
https://nodejs.org/en/download/

- Também é necessário instalar o serverless framework
```
npm install -g serverless
npm install serverless-offline
npm install -g yo generator-serverless-policy
```
OBS: serverless-offline é utilizado pra conseguir rodar local através do comando *serverless offline*

OBS2: generator-serverless-policy é utilizado para gerar polices do AWS IAM para facilitar a criação de um usuário com a policy minima pra rodar a API

- É necessário que o e-mail que será utilizado para fazer o envio esteja verificado no AWS SES, ou que o domínio do e-mail esteja verificado.
  Caso o e-mail ainda esteja na sandbox, ele só poderá mandar para e-mails também verificados.

Tutorial de como verificar um e-mail no SES: https://docs.aws.amazon.com/pt_br/ses/latest/DeveloperGuide/verify-email-addresses-procedure.html

## Criação do usuário com as permissões necessárias
  Crie uma policy no IAM utilizando o JSON gerado pelo generator-serverless-policy, 
  você pode utilizar o de exemplo da aplicação (serverless-mail-handler-_star_-us-east-1-policy.json) ou gerar um com o comando *yo serverless-policy*.
  No generator, é necessário dizer sim para as permissões do dynamoDB e s3 buckets.
  
  Depois de criada a policy, crie um usuário com acesso programático e atache essa policy.

  Com a chave e a chave secreta em mãos, configure o serverless para utilizar sua AWS com o usuário criado:
  
  serverless config credentials --provider aws --key CHAVE --secret CHAVE_SECRETA -o
  
## Configurando arquivos de secrets

  A aplicação espera que haja um arquivo de secrets da environment na raiz da aplicação. Para isso, é só criar um arquivo no seguinte padrão:
  *secrets.ENV.json*
  
  Exemplo:
  ```
  secrets.dev.json

  Conteúdo:
  
  {
  "EMAILFROM": "email@email.com",
  "AUTHORIZATION": "2b018323101031001ns919j910301",
  "EMAILTABLE": "EmailDataTableDev",
  "APP_AWS_REGION": "us-east-1"
  }
  ```
  
  Explicação:
    emailfrom: E-mail que será utilizado para envio (deve ser um e-mail verificado ou um de um domínio verificado)
    authorization: valor que será utilizado para autenticação do header Authorization enviado na requisição
    emailtable: Nome da tabela do dynamoDB que será criada
    app_aws_region: nome da região que será utilizada

## Deploy

Para fazer o deploy, basta você dar o comando *serverless deploy*

## Testar

Ao fazer deploy, ele irá gerar os links para as 3 APIs disponíves.
Para mandar um e-mail, basta fazer uma requisição com os seguintes requisitos:

```
Procotolo: HTTP POST
URL: HOST/sendEmail
Header: Authorization com o value igual ao configurado no secrets da enviroment que foi feita o deploy
Body (JSON):

{
	"mailto": "email@email.com",
	"message": "teste",
	"subject": "teste mail handler",
	"mailstatus": "success"
}

retorno: o retorno é o ID da mensagem no banco
```

mailto: e-mail de destino
message: corpo do e-mail
subject: titulo do e-mail
mailstatus: campo livre do tipo string para qualquer tipo de status


### Exemplo de envio de e-mail:

![envio de e-mail postman](https://i.ibb.co/fYkKSFK/postman-1.png)

![envio de e-mail postman 2](https://i.ibb.co/2j4GhbQ/postman-2.png)

### Exemplo de consultar e-mail:

![consulta de e-mail postman](https://i.ibb.co/QjZsqsD/postman-getemail.png)

### Consultar todos os e-mails:

![consultar todos os e-mails postman](https://i.ibb.co/dWt8tsS/postman-get-All-Emails.png)


## Autores
* **Luan Peixoto** - [LuanPeixotop](https://github.com/LuanPeixotop/)

Lista de quem contribuiu neste projeto: [contributors](https://github.com/LuanPeixotop/serverless-email-handler/contributors)







