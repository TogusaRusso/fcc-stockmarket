'use strict'
/* global $ */
/* global Chart */
/* global io */

$(() => {
  let myChart
  const ctx = document.getElementById('canvas').getContext('2d')
  const socket = io.connect('https://fcc-stockmarket-togusarusso.c9users.io/')
  const loadStocks = () => $.getJSON('/api/stocks', stocks => {
    const chips = stocks.map(stock => (
      `<div class='chip' id='${stock.company}'>
        ${stock.company}
        <i class='close material-icons'>close</i>
      </div>`
    )).join(' ')
    $('#chips').html(chips)
    $('.close').click(event => socket.emit('remove', $(event.target).parent().attr('id')))
    $('#addCompany').submit(event => {
      socket.emit('add', $('#company').val().trim())
      $('#company').val('')
      event.preventDefault()
    })
    if (myChart) {
      myChart.destroy()
      myChart = null
    }
    if (stocks.length) {
      myChart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: stocks.map(stock => ({
            label: stock.company,
            data: stock.prices,
            fill: false,
            borderColor: stock.color
          })
          ),
          labels: stocks[0].dates
        },
        options: {
          // Boolean - whether or not the chart should be responsive and resize when the browser does.
          responsive: true,
          // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
          maintainAspectRatio: false
        }
      })
    }
  })
  socket.on('update', () => loadStocks())
  loadStocks()
})
