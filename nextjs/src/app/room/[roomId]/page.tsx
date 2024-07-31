'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import Board, { Symbol } from '@/components/board'
import Player, { PlayerProps } from '@/components/player'

const Room = () => {
  const [players, setPlayers] = useState<PlayerProps[]>([{ id: '', name: '' }])
  const [currentPlayer, setCurrentPlayer] = useState<PlayerProps>({ id: '', name: '' })
  const [socket, setSocket] = useState<Socket | null>(null)
  const [cell, setCell] = useState<{ symbol: Symbol; row: number; col: number }>({ symbol: '', row: 0, col: 0 })
  const [currentTurn, setCurrentTurn] = useState(false)
  const [restart, setRestart] = useState(false)
  const [winnerDeclared, setWinnerDeclared] = useState(false)

  const { roomId } = useParams()

  // chunky
  useEffect(() => {
    const socketIo = io({ path: '/socket.io' })
    setSocket(socketIo)

    socketIo.on('connect', () => {
      console.log(`Connected to room: ${roomId}`)
    })

    socketIo.on('roomPlayers', (players) => {
      setPlayers(players)
    })

    socketIo.on('roomFull', () => {
      alert('Room is full')
    })

    socketIo.on('currentPlayer', (player) => {
      setCurrentPlayer(player)
    })

    socketIo.on('move', ({ player, row, col }) => {
      setCell({ symbol: player.symbol, row, col })
    })

    socketIo.on('currentTurn', (turn: boolean) => {
      setCurrentTurn(turn)
    })

    socketIo.on('winner', (player) => {
      if (!winnerDeclared) {
        alert(`Winner is ${player.name ?? ''}`)
        setWinnerDeclared(true)
        setRestart(true)
      }
    })

    socketIo.on('disconnect', () => {
      console.log(`Disconnected from room: ${roomId}`)
    })

    return () => {
      socketIo.disconnect()
    }
  }, [roomId, winnerDeclared])

  useEffect(() => {
    if (socket && roomId) {
      socket.emit('joinRoom', roomId)
    }
  }, [socket, roomId])

  const handleClick = (row: number, col: number) => {
    if (socket && currentTurn) {
      socket.emit('move', { roomId, player: currentPlayer, row, col })
    } else {
      alert('Not your turn buddy!')
    }
  }

  const checkWinner = (grid: string[][]) => {
    if (socket) {
      socket.emit('checkWinner', { roomId, grid })
    }
  }

  return (
    <div className="bg-gray-100">
      <div className="flex justify-center items-center h-screen max-h-24">
        <Player roomId={roomId} players={players} />
      </div>
      <div className="flex justify-center items-center h-screen">
        <Board 
          onClick={handleClick} 
          checkWinner={checkWinner} 
          cell={cell} 
          restart={restart} 
          winnerDeclared={winnerDeclared}
        />
      </div>
    </div>
  )
}

export default Room
