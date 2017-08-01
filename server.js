'use strict'
const app = require('express')()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const path = require('path')
const stock = require('./controllers/stock')
const mongoose = require('mongoose')
const dbUri = process.env.MONGOLAB_URI || process.env.MONGODB_URI || `mongodb://localhost:27017/stocks`

mongoose.connect(dbUri, { useMongoClient: true })

app.set('view engine', 'pug')

app.get('/', (req, res) =>
  res.render('index')
)
app.get('/app.js', (req, res) =>
  res.sendFile(path.join(__dirname, '/client/app.js'))
)
app.get('/api/stocks', (req, res) => stock.getCompanies()
  .then(result => res.json(result))
  .catch(err => console.log(err))
)

io.on('connection', client => {
  client.on('remove', ticker => stock.removeCompany(ticker)
    .then(() => io.emit('update', ticker))
    .catch(err => console.error(err))
  )
  client.on('add', ticker => stock.addCompany(ticker)
    .then(() => io.emit('update', ticker))
    .catch(err => console.error(err))
  )
})
server.listen(process.env.PORT || 8080)
