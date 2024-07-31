// src/app/board.tsx

import React, { useEffect, useState } from 'react'

export type Symbol = '0' | 'X' | ''

type Props = {
  onClick: (row: number, col: number) => void
  checkWinner: (grid: string[][]) => void
  cell: { symbol: Symbol; row: number; col: number }
  restart: boolean
  winnerDeclared: boolean
}

const Board = ({ onClick, checkWinner, cell, restart, winnerDeclared }: Props) => {
  const [grid, setGrid] = useState<string[][]>([
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ])

  useEffect(() => {
    if (restart) {
      setGrid([
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ])
    }
  }, [restart])

  useEffect(() => {
    const { row, col, symbol } = cell

    if (grid[row][col] === '' && !winnerDeclared) {
      setGrid((prevGrid) => {
        const newGrid = [...prevGrid]

        newGrid[row][col] = cell.symbol ?? ''

        checkWinner(newGrid)

        return newGrid
      })
    }
  }, [cell, checkWinner])

  return (
    <div className="grid grid-cols-3 gap-0">
      {grid.map((row, rowIndex) =>
        row.map((col, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className="w-44 h-44 flex justify-center items-center border-2 border-gray-300 bg-white"
            onClick={() => onClick(rowIndex, colIndex)}
          >
            {col === '0' ? (
              <div className="w-24 h-24 rounded-full border-8 border-blue-500"></div>
            ) : col === 'X' ? (
              <div className="w-32 h-32 flex justify-center items-center">
                <div className="text-red-500 text-7xl">X</div>
              </div>
            ) : null}
          </div>
        ))
      )}
    </div>
  )
}

export default Board
