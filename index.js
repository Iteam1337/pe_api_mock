const bodyParser = require('body-parser')
const app = require('express')()
const mobileApp = require('express')()
const moment = require('moment')
const fs = require('fs')

const wait = (time) => new Promise(resolve => setTimeout(() => resolve(), time))

app.listen(18085)
app.use(bodyParser.json())

app.get('/', (req, res) => res.json({ hey: 'ho' }))
app.post('/accounting-test/ws/company/create', (req, res) => {
  res.send({
    CompanyId: 25,
    Name: 'Iteam'
  })
})
app.post('/accounting-test/ws/user/create', (req, res) => {
  res.send({
    UserId: 1,
    Email: "test@email.com",
    Password: 'somepassword',
  })
})
app.delete('/accounting-test/ws/reset', (req, res) => {
  res.sendStatus(200)
})

let respond = false
setTimeout(() => {
  respond = true
}, 10000)
app.get('/accounting-test/ws/ping', (req, res) => {
  if (respond) res.send('pong')
})

mobileApp.listen(18084)
mobileApp.use(bodyParser.json())

mobileApp.get('/', (req, res) => res.send({ hello: 'world' }))
mobileApp.post('/mobile-api/ws/user/login', (req, res) => {
  if (req.body.username !== 'test@email.com') {
    res.status(500)
    return res.send({
      messages: [
        'LoginDetailsAccessDeniedException: Otillåten access'
      ]
    })
  }
  console.log('login', req.body)
  res.send([
    {
      id: 1,
      name: "Iteam",
      token: 'a-token',
      main: true,
      active: true,
    },
    {
      id: 2,
      name: "PE Accounting",
      token: 'a-token',
      main: true,
      active: true,
    },
    {
      id: 3,
      name: "Mattias gräv AB",
      token: 'another-token',
      main: true,
      active: true,
    }
  ])
})

const createExpense = (i) => ({
  entryType: 'Fika',
  desciption: `Fika ${i}`,
  totalAmount: 500 + 250 * i
})

const createPayslip = (i, generous = false) => {
  const grossAmount = generous ? Math.round(6500000 + i * 1000) : Math.round(20000 + i * 1000)
  const taxAmount = Math.round(grossAmount * 0.25)
  const payoutAmount = grossAmount - taxAmount
  return {
    id: i,
    payoutAmount,
    grossAmount,
    benefitsAmount: 500,
    taxAmount,
    socialFeesAmount: 150,
    period: {
      start: moment().subtract(i, 'months').format(),
      end: moment().subtract(i - 1, 'months').format()
    },
    paymentDate: moment().subtract(i - 1, 'months').format(),
    expenses: [
      {
        description: 'Expense 1',
        amount: 500,
        entries: Array.from({ length: 10 }).map((_, i) => createExpense(i))
      },
      {
        description: 'Expense 2',
        amount: 250,
        entries: Array.from({ length: 6 }).map((_, i) => createExpense(i))
      },
    ],
    articles: [
      {
        activityType: 'Sick',
        activityName: 'Sjuk',
        period: {
          start: moment().format(),
          end: moment().format()
        },
        price: 1500,
        quantity: 8.1
      }
    ]
  }
}

const generousPayouts = Array.from({ length: 20 }).map((_, i) => createPayslip(i, true)).reverse()
const cheapPayouts = Array.from({ length: 20 }).map((_, i) => createPayslip(i)).reverse()

mobileApp.get('/mobile-api/ws/payroll/payout', async (req, res) => {
  await wait(2000);
  console.log(req.query.token);
  const generous = req.query.token === 'a-token'

  const limit = req.query.limit ? Number(req.query.limit) : 10
  const offset = req.query.offset ? Number(req.query.offset) : 0

  const payouts = (generous ? generousPayouts : cheapPayouts).slice(offset, offset + limit);

  res.send({
    offset,
    limit,
    count: generousPayouts.length,
    data: payouts
  })
})

mobileApp.get('/mobile-api/ws/expense/entryCounts', async (req, res) => {
  await wait(2000);
  res.send({
    sortedExpenseEntries: 0,
    openCardTransactions: 0,
    unprocessedExpenseFiles: 0
  })
})

let buff = fs.readFileSync('kvitto.jpg');
let base64data = buff.toString('base64');

const unprocessedExpenseFiles = Array.from({ length: 30 }).map((_, i) => ({
  id: i, registrationDate: new Date().toISOString(), amount: 333, b64Thumbnail: base64data
})).reverse()

mobileApp.get('/mobile-api/ws/expense/unprocessedFiles', async (req, res) => {
  console.log('unprocessedfiles');
  await wait(2000);
  const limit = req.query.limit ? Number(req.query.limit) : 10
  const offset = req.query.offset ? Number(req.query.offset) : 0

  const files = unprocessedExpenseFiles.slice(offset, offset + limit);

  res.send({
    offset,
    limit,
    count: unprocessedExpenseFiles.length,
    data: files
  });
})
