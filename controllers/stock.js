'use strict'
const Quandl = require('quandl')
const st = require('strftime')
const Company = require('../models/company')

module.exports = {
  getCompanies () {
    return companies()
    .then(companies => Promise.all(companies.map(this.getCompany)))
  },
  getCompany (company) {
    const quandl = new Quandl({
      auth_token: process.env.TOKEN,
      api_version: 3
    })
    return new Promise((resolve, reject) => {
      const dateStart = new Date(new Date().setDate(new Date().getDate() - 90))
      quandl.dataset({
        source: 'WIKI',
        table: company.ticker
      }, {
        order: 'asc',
        exclude_column_names: true,
        start_date: st('%Y-%m-%d', dateStart),
        end_date: st('%Y-%m-%d'),
        column_index: 4
      }, function (err, response) {
        if (err) return reject(err)
        response = JSON.parse(response)
        if (!response.dataset) {
          resolve({company})
        } else {
          resolve({
            company: company.ticker,
            color: company.color,
            name: response.dataset.name,
            dates: response.dataset.data.map(el => el[0]),
            prices: response.dataset.data.map(el => el[1])
          })
        }
      })
    })
  },
  addCompany (ticker) {
    return new Promise((resolve, reject) => {
      this.getCompany({ticker})
      .then(result => {
        if (!result.name) return reject(new Error('No data!'))
        let newCompany = new Company()
        newCompany.ticker = ticker
        newCompany.color = randomColor()
        newCompany.save(err => {
          if (err) return reject(err)
          resolve('Added!')
        })
      })
    })
  },
  removeCompany (ticker) {
    return new Promise((resolve, reject) =>
      Company.deleteOne({ticker},
        err => {
          if (err) return reject(err)
          resolve('Removed!')
        }
      )
    )
  }
}
function companies () {
  return new Promise((resolve, reject) => Company.find({}, (err, result) => {
    if (err) return reject(err)
    if (!result) return resolve([])
    resolve(result)
  }))
}
function randomColor () {
  const rc = () => Math.floor(Math.random() * 200)
  return `rgb(${rc()},${rc()},${rc()})`
}
