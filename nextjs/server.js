import express from 'express'
import next from 'next'
import { Server as SocketIOServer } from 'socket.io'
import { createServer } from 'http'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()
  const http = createServer(server)
  const io = new SocketIOServer(http, {
    path: '/socket.io',
  })

  let playerNumber = 0
  const roomMap = new Map()

  io.on('connection', (socket) => {
    const player = {
      id: playerNumber,
      name: `User ${playerNumber}`,
      socketId: socket.id,
      symbol: playerNumber % 2 === 0 ? '0' : 'X',
    }

    socket.on('joinRoom', async (roomId) => {
      await socket.join(roomId)

      if (!roomMap.has(roomId)) {
        roomMap.set(roomId, [player])
      } else {
        if (roomMap.get(roomId).length >= 2) {
          socket.emit('roomFull')
          return
        }

        roomMap.get(roomId).push(player)
      }

      socket.to(roomId).emit('roomPlayers', roomMap.get(roomId))
      socket.emit('roomPlayers', roomMap.get(roomId))

      playerNumber++


      socket.emit('currentTurn', true)
      socket.emit('currentPlayer', player)
    })

    socket.on('move', ({ roomId, player, row, col }) => {
      socket.to(roomId).emit('move', { player, row, col })
      socket.emit('move', { player, row, col })

      socket.to(roomId).emit('currentTurn', true)
      socket.emit('currentTurn', false)
    })

    socket.on('checkWinner', ({ roomId, grid }) => {
      // meh, lazy implementation
      const symbols = ['0', 'X']
      let winningSymbol

      for (const symbol of symbols) {
        // rows
        for (let i = 0; i < 3; i++) {
          if (
            grid[i][0] === symbol && 
            grid[i][1] === symbol && 
            grid[i][2] === symbol
          ) {
            winningSymbol = symbol
          }
        }

        for (let i = 0; i < 3; i++) {
          if (
            grid[0][i] === symbol &&
            grid[1][i] === symbol &&
            grid[2][i] === symbol
          ) {
            winningSymbol = symbol
          }
        }

        const firstDiagonal = grid[0][0] === symbol && grid[1][1] === symbol && grid[2][2] === symbol
        const secondDiagonal = grid[0][2] === symbol && grid[1][1] === symbol && grid[2][0] === symbol

        if (firstDiagonal || secondDiagonal) {
          winningSymbol = symbol
        }
      }

      const winner = roomMap.get(roomId)?.find(player => player.symbol === winningSymbol)


      if (winner) {
        socket.to(roomId).emit('winner', winner)
        socket.emit('winner', winner)
      }
    })

    socket.on('disconnect', () => {
      // meh
      for (const [roomId, players] of roomMap.entries()) {
        const playerIndex = players.findIndex(player => player.socketId === socket.id)

        if (playerIndex !== -1) {
          players.splice(playerIndex, 1)

          io.in(roomId).emit('roomPlayers', players)

          if (players.length === 0) {
            roomMap.delete(roomId)
          }

          break
        }
      }
    })
  })

  server.all('*', (req, res) => {
    return handle(req, res)
  })

  const PORT = process.env.PORT || 3000

  http.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`)
  })
})
