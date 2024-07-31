"use client"

import React, { useState } from 'react'
import classNames from 'classnames'

export type PlayerProps = {
  id: string
  name: string
  socketId?: string
  symbol?: '0' | 'X'
}

type Props = {
  roomId: string | string[] | undefined
  players: PlayerProps[]
}

const Player = ({ roomId, players }: Props): JSX.Element => {
  if (!roomId) {
    return <div className='text-black'>Room not found</div>
  }

  return (
    <div className="grid grid-rows-2 gap-2 mt-40">
      <div className="text-2xl font-semibold text-black">Room: {roomId}</div>
      {players && players.map((user, index) => (
        <div
          className={classNames(
            'flex flex-col justify-center items-center p-4 text-black',
          )}
          key={index}
        >
          <div  className="text-lg font-semibold">{user.name}</div>
        </div>
      ))}
    </div>
  )
}

export default Player
