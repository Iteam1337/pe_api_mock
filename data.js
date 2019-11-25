const companies = [
  {
    id: 1,
    name: "Iteam",
    token: 'a-token',
    status: 'Production',
    main: true,
    active: true,
  },
  {
    id: 2,
    name: "PE Accounting",
    token: 'another-token2',
    status: 'Production',
    main: false,
    active: true,
  },
  {
    id: 3,
    name: "Sebastians Sajter",
    token: 'another-token3',
    status: 'Production',
    main: false,
    active: true,
  },
  {
    id: 4,
    name: "Andreas Ananasjuice",
    token: 'another-token4',
    status: 'Production',
    main: false,
    active: true,
  },
  {
    id: 5,
    name: "Jonnas Jiu-jitsuklubb",
    token: 'another-token5',
    status: 'Production',
    main: false,
    active: true,
  },
  {
    id: 6,
    name: "Viktors VVS",
    token: 'another-token6',
    status: 'Production',
    main: false,
    active: true,
  },
  {
    id: 7,
    name: "Toms Tombolas",
    token: 'another-token7',
    status: 'Production',
    main: false,
    active: true,
  },
  {
    id: 8,
    name: "Emils Emaljögon",
    token: 'another-token8',
    status: 'Production',
    main: false,
    active: true,
  },
  {
    id: 9,
    name: "Albins Arbetarfik",
    token: 'another-token9',
    status: 'Production',
    main: false,
    active: true,
  },
  {
    id: 10,
    name: "Jennys Jeansfärgade Jackor",
    token: 'another-token10',
    status: 'Production',
    main: false,
    active: true,
  }
]



module.exports = {
  companies: companies.map(c => ({
    ...c,
    accesses: {
      types: [
        "PAYROLL_OWN",
        "EXPENSES_OWN",
        "CLIENT_INVOICE_CERTIFY_OWN",
        "CLIENT_INVOICE_OWN",
        "TIMEREPORT_OWN"
      ]
    }
  })),
}