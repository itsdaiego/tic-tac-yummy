document.addEventListener('DOMContentLoaded', function () {
  const url = new URL(window.location.href)
  const parts = url.pathname.split('/')

  const roomID = parts[2]
  const socket = new WebSocket("ws://" + window.location.host + "/ws?id=" + roomID)

  socket.onopen = function () {
    console.log('WebSocket connection established')

    const button = document.getElementById("list-players")
    button.click()
  }

  socket.onmessage = function (event) {
    console.log('event data', event.data, typeof event.data)

    const jsonData = JSON.parse(event.data) ?? {}

    if (typeof jsonData === 'object') {
      if (jsonData.winner) {
        alert(`Player ${jsonData.winner} wins!`)
        return
      }

      const playerID = jsonData.player_id
      const currentTurn = jsonData.current_turn

      window.history.pushState({}, '', `?player_id=${playerID}&current_turn=${currentTurn}`)

      // draw move into cell element
      const row = jsonData.row
      const col = jsonData.col
      const symbol = jsonData.symbol

      const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`)

      if (!cell) {
        return
      }

      if (symbol === 'X') {
        cell.innerHTML = `<div class="text-red-500 text-7xl">X</div>`
      } else {
        cell.innerHTML = `<div class="w-24 h-24 rounded-full border-8 border-blue-500"></div>`
      
      }
    } else {
      const playersDiv = document.getElementById("player-list-container")

      const newPlayer = document.createElement("div")
      newPlayer.innerText = `Player ${event.data}`

      playersDiv.appendChild(newPlayer)
    }
  }

  socket.onclose = function () {
    console.log('WebSocket connection closed')
  }

  socket.onerror = function (error) {
    console.error('WebSocket error:', error)
  }


  const cells = document.querySelectorAll(".cell")

  cells.forEach(cell => {
    cell.addEventListener("click", () => {
      const row = cell.getAttribute("data-row")
      const col = cell.getAttribute("data-col")

      var url = '/move'

      const querystring = new URLSearchParams(window.location.search)
      const playerID = querystring.get("player_id") ?? ''
      const currentTurn = querystring.get('current_turn')

      if (currentTurn === 'false') {
        alert("Not your turn buddy!")
        return
      }

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          room_id: roomID,
          player_id: playerID,
          row: row,
          col: col,
          symbol: playerID % 2 === 0 ? 'X' : '0'
        })
      })
        .then((res) => res.text())
        .catch(error => {
          console.error("Error when playing a move:", error)
        })
    })
  })
})
