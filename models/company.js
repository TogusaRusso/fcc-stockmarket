'use strict'
const mongoose = require('mongoose')

const Company = mongoose.Schema({
  ticker: String,
  color: String
})

module.exports = mongoose.model('Company', Company)
