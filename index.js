const bodyParser = require('body-parser')
const app = require('express')()
const mobileApp = require('express')()
const moment = require('moment')
const { companies } = require('./Data')
const fs = require('fs')

const wait = (time) => new Promise(resolve => setTimeout(() => resolve(), time))

app.listen(18085)
app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

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
mobileApp.use(bodyParser.json({limit: '50mb', extended: true}));
mobileApp.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

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
  res.send(companies)
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
        description: 'Kvartalskalas',
        amount: 500,
        entries: Array.from({ length: 10 }).map((_, i) => createExpense(i))
      },
      {
        description: 'Kickoff',
        amount: 250,
        entries: Array.from({ length: 6 }).map((_, i) => createExpense(i))
      },
    ],
    articles: [
      {
        activityType: 'Sick',
        activityName: 'Sjuk',
        activityDescription: 'sick-activity-description',
        period: {
          start: moment().format(),
          end: moment().format()
        },
        price: 1500,
        quantity: 8.2,
        unit: 't'
      },
      {
        activityType: 'VacationPaid',
        activityName: 'Semester',
        activityDescription: 'vacation-paid-activity-description',
        period: {
          start: moment().format(),
          end: moment().format()
        },
        price: 15000,
        quantity: 5.1,
        unit: 't'
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
    sortedExpenseEntries: 2,
    openCardTransactions: 0,
    unprocessedExpenseFiles: 3
  })
})

let buff = fs.readFileSync('kvitto.jpg');
let base64data = buff.toString('base64');

const createFiles = (length = 5, thumbnail = base64data) => Array.from({ length }).map((_, i) => ({
  id: i, registrationDate: moment().subtract(i, 'days').toISOString(), amount: 333, b64Thumbnail: thumbnail
})).reverse()

let unprocessedExpenseFiles = []

mobileApp.get('/mobile-api/ws/expense/unprocessedFiles', async (req, res) => {
  console.log('unprocessedfiles')
  const limit = req.query.limit ? Number(req.query.limit) : 10
  const offset = req.query.offset ? Number(req.query.offset) : 0

  const files = unprocessedExpenseFiles.slice(offset, offset + limit);

  res.send({
    offset,
    limit,
    count: unprocessedExpenseFiles.length,
    data: [
      ...createFiles(1, base64data),
      ...files,
    ]
  });
})

mobileApp.post('/mobile-api/ws/expense/createFile', async (req, res) => {
  
  const newFiles = createFiles(1, req.body.data.toString('base64'))
  unprocessedExpenseFiles = [
    ...unprocessedExpenseFiles,
    ...newFiles
  ]
  res.status(200)
  res.send(newFiles[0])
})

let bankIdProgressCompleted
mobileApp.post('/mobile-api/ws/user/bankid/authenticate', (req, res) => {
  res.send({
    orderRef: 'some-order-ref',
    autoStartToken: 'some-auto-start-token'
  })
  bankIdProgressCompleted = false
  setTimeout(() => {
    bankIdProgressCompleted = true
  }, 3000)
})

mobileApp.post('/mobile-api/ws/user/bankid/progress', (req, res) => {
  res.send({
    status: bankIdProgressCompleted ? 'complete': 'inprogress',
    companies
  })
})
