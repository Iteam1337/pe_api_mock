const bodyParser = require('body-parser')
const app = require('express')()
const mobileApp = require('express')()
const moment = require('moment')

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
      token: 'another-token2',
      main: false,
      active: true,
    },
    {
      id: 3,
      name: "Sebastians Sajter",
      token: 'another-token3',
      main: false,
      active: true,
    },
    {
      id: 4,
      name: "Andreas Ananasjuice",
      token: 'another-token4',
      main: false,
      active: true,
    },
    {
      id: 5,
      name: "Jonnas Jiu-jitsuklubb",
      token: 'another-token5',
      main: false,
      active: true,
    },
    {
      id: 6,
      name: "Viktors VVS",
      token: 'another-token6',
      main: false,
      active: true,
    },
    {
      id: 7,
      name: "Toms Tombolas",
      token: 'another-token7',
      main: false,
      active: true,
    },
    {
      id: 8,
      name: "Emils Emaljögon",
      token: 'another-token8',
      main: false,
      active: true,
    },
    {
      id: 9,
      name: "Albins Arbetarfik",
      token: 'another-token9',
      main: false,
      active: true,
    },
    {
      id: 10,
      name: "Jennys Jeansfärgade Jackor",
      token: 'another-token10',
      main: false,
      active: true,
    }
  ])
})

const createExpense = (i) => ({
  entryType: 'Fika',
  desciption: `Fika ${i}`,
  totalAmount: 500 + 250 * i
})

const createPayslip = (i) => {
  const grossAmount = Math.round(120000000 + Math.floor(Math.random() * 1000000))
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
        period: {
          start: moment().format(),
          end: moment().format()
        },
        price: 1500,
        quantity: 8.2
      },
      {
        activityType: 'VacationPaid',
        activityName: 'Semester',
        period: {
          start: moment().format(),
          end: moment().format()
        },
        price: 15000,
        quantity: 5.1
      }
    ]
  }
}

const allPayouts = Array.from({ length: 100 }).map((_, i) => createPayslip(i)).reverse()

mobileApp.get('/mobile-api/ws/payroll/payout', async (req, res) => {
  await wait(2500)
  console.log('get.payslips')
  const limit = req.query.limit ? Number(req.query.limit) : 10
  const offset = req.query.offset ? Number(req.query.offset) : 0

  const payouts = allPayouts.slice(offset, offset + limit);

  console.log({
    offset,
    limit,
    count: allPayouts.length,
    data: payouts.length
  })
  res.send({
    offset,
    limit,
    count: allPayouts.length,
    data: payouts
  })
})

mobileApp.get('/mobile-api/ws/expense/entryCounts', async (req, res) => {
  res.send({
    sortedExpenseEntries: 5,
    openCardTransactions: 12,
    unprocessedExpenseFiles: 8
  })
})
