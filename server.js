'use strict'
const app = require('express')()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

app.set('view engine', 'pug')

app.get('/', function(req, res){
  res.render('index')
})
app.get('/app.js', function(req, res){
  res.sendFile(__dirname + '/client/app.js');
})

io.on('connection', function () { /* … */ })
server.listen(process.env.PORT || 8080)
