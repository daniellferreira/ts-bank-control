# ts-bank-control

[![node-version](https://img.shields.io/badge/node-%3E%3D%2014.17.3-green)](https://nodejs.org/docs/latest-v14.x/api/index.html) [![cov](https://img.shields.io/badge/coverage-94.2%25-green)]() [![hosted-heroku](https://img.shields.io/badge/hosted%20on-Heroku-purple)](https://ts-bank-control-api.herokuapp.com/ping)

Uma API que realiza operações básicas de uma conta bancária. \
:electric_plug: &nbsp; Back-end: https://ts-bank-control-api.herokuapp.com/ping \
:computer: &nbsp; Front-end: https://front-bank-control.herokuapp.com/

## :white_check_mark: Funcionalidades

- Extrato/Histórico da conta (entradas e saídas)
- Realizar depósito
- Realizar saque
- Fazer pagamento de boleto

## :pushpin: Todo

- Pipeline CI/CD (GitHub Actions)
- Autenticação e Autorização [JWT](https://jwt.io/) para poder ser usado como SaaS (base já está preparada para não depender de um único id de conta)
- Definição e aplicação de rendimento no saldo em conta (cron job)
- Validações pré commit (Husky)

## :gear: Tecnologia e Arquitetura

**API**: NodeJS, TypeScript, Express, [OvernightJS](https://github.com/seanpmaxwell/overnight) \
**Testes**: Jest, [Supertest](https://github.com/visionmedia/supertest) \
**Banco de Dados**: MongoDB (com Docker localmente e hospedado no [Atlas](https://www.mongodb.com/cloud/atlas) em produção) \
**Deploy**: [Heroku](https://www.heroku.com/home) integrado ao repositório (ao realizar push na branch develop o deploy é realizado)
**Injeção de Dependência**: as dependências padrões das classes podem ser alteradas através do construtor, facilitando mocks de serviços ou alterações condicional de comportamento.

###### Diagrama da arquitetura

![arch-diagram](https://github.com/daniellferreira/ts-bank-control/blob/develop/public/assets/arch.png?raw=true)

## Executar localmente

#### Requisitos

- Instalar as dependências:

```
$ npm install
```

- É necessário possuir um arquivo **.env** (para exeucução dos **testes** é necessário possuir um arquivo **.env.test**) na raiz do projeto que será responsávrel por armazenar as variáveis de ambiente (Há um arquivo **.env.sample** com um exemplo das variáveis necessárias para executar o servidor).
- É necessário utilizar um banco de dados **MongoDB** (versão >= 4.2) com replicaSet ativo (Há um arquivo **docker-compose.yaml** na raiz do projeto para ajudar nessa etapa, basta subir um container localmente).

#### Comandos

Para executar o servidor em ambiente de desenvolvimento:

```
$ npm run start:dev
```

Para executar os testes unitários e funcionais e verificar a cobertura de testes:

```
$ npm test
```

O relatório de **cobertura de testes** pode ser visualizado no browser accesando:

```http
file:///<workspace_folder>/coverage/lcov-report/index.html
```

## Referência da API

#### Verificar saúde da aplicação

```http
  GET /ping
```

Se tudo estiver bem retornará:

```
  pong
```

### Contas

#### Get da conta criada (ou, se não existir, cria uma conta e a retorna)

```http
  GET /account
```

Exemplo de retorno:

```json
{
  "amount": 4916.91,
  "updatedAt": "2021-07-18T20:29:51.698Z",
  "id": "60ee681642a133590d5bd1fc"
}
```

### Histórico (Extrato)

#### Get do histórico de operações realizadas na conta

```http
  GET /finance/:account_id
```

Exemplo de retorno:

```json
[
  {
    "type": "payment_ticket",
    "amount": 23.45,
    "ticketCode": "23213123123312389217321983712937219837192837219",
    "createdAt": "2021-07-18T20:29:51.703Z"
  },
  {
    "type": "out",
    "amount": 30,
    "createdAt": "2021-07-18T20:29:11.466Z"
  },
  {
    "type": "in",
    "amount": 100.98,
    "createdAt": "2021-07-18T20:28:58.152Z"
  },
  {
    "type": "out",
    "amount": 123132,
    "createdAt": "2021-07-18T20:07:23.967Z"
  },
  {
    "type": "in",
    "amount": 123312,
    "createdAt": "2021-07-18T20:07:17.393Z"
  }
]
```

### Operações

#### Realizar um depósito

```http
  POST /finance/deposit
```

Body:

| Parâmetro    | Tipo             | Descrição                                                     |
| :----------- | :--------------- | :------------------------------------------------------------ |
| `account_id` | `string`         | **Obrigatório**. Id da conta em que será realizado o depósito |
| `amount`     | `number (float)` | **Obrigatório**. Valor a ser depositado                       |

Exemplo body:

```json
{
  "account_id": "60ee681642a133590d5bd1fc",
  "amount": 500.8
}
```

#### Realizar um saque

```http
  POST /finance/draft
```

Body:

| Parâmetro    | Tipo             | Descrição                                                  |
| :----------- | :--------------- | :--------------------------------------------------------- |
| `account_id` | `string`         | **Obrigatório**. Id da conta em que será realizado o saque |
| `amount`     | `number (float)` | **Obrigatório**. Valor a ser sacado                        |

Exemplo body:

```json
{
  "account_id": "60ee681642a133590d5bd1fc",
  "amount": 75
}
```

#### Realizar um pagamento (boleto)

```http
  POST /finance/payment/ticket
```

Body:

| Parâmetro     | Tipo             | Descrição                                                                          |
| :------------ | :--------------- | :--------------------------------------------------------------------------------- |
| `account_id`  | `string`         | **Obrigatório**. Id da conta em que será realizado o pagamento                     |
| `amount`      | `number (float)` | **Obrigatório**. Valor a ser pago                                                  |
| `ticket_code` | `string`         | **Obrigatório**. Linha digitável do boleto a ser pago, deve possuir 47 caracteres. |

Exemplo body:

```json
{
  "account_id": "60ee681642a133590d5bd1fc",
  "amount": 80,
  "ticket_code": "74891121316679260101611851471075385910000011990"
}
```
