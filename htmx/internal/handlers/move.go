package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gorilla/websocket"
)

type Move struct {
  Row string `json:"row"`
  Col string `json:"col"`
  PlayerID string `json:"player_id"`
  CurrentTurn bool `json:"current_turn"`
  RoomID string `json:"room_id"`
  Symbol string `json:"symbol"`
}

func gameHasEnded(board [][]string, playerID string) bool {
  for i := 0; i < 3; i++ {
    if board[i][0] == playerID && board[i][1] == playerID && board[i][2] == playerID {
      return true
    }
  }

  for i := 0; i < 3; i++ {
    if board[0][i] == playerID && board[1][i] == playerID && board[2][i] == playerID {
      return true
    }
  }

  if board[0][0] == playerID && board[1][1] == playerID && board[2][2] == playerID {
    return true
  }

  if board[0][2] == playerID && board[1][1] == playerID && board[2][0] == playerID {
    return true
  }

  return false 
}

func MoveHandler(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

  var move Move

  err := json.NewDecoder(r.Body).Decode(&move)
  if err != nil {
    http.Error(w, "Error decoding JSON body for /move", http.StatusBadRequest)
    return
  }

	row, err := strconv.Atoi(move.Row)
	if err != nil {
		http.Error(w, "Invalid row value", http.StatusBadRequest)
		return
	}

	col, err := strconv.Atoi(move.Col)
	if err != nil {
		http.Error(w, "Invalid col value", http.StatusBadRequest)
		return
	}

	fmt.Printf("new move: row=%d, col=%d\n", row, col)

  board[row][col] = move.PlayerID

  fmt.Println(board)

  hasWinner := gameHasEnded(board, move.PlayerID)

  roomConns, exists := rooms[move.RoomID]

  if hasWinner {
    for conn, _ := range roomConns.Players {
      message := map[string]interface{}{
        "winner": move.PlayerID,
      }

      messageJson, _ := json.Marshal(message)

      conn.WriteMessage(websocket.TextMessage, []byte(messageJson))
    }

    w.WriteHeader(http.StatusOK)
    return
  }

  if !exists {
    http.Error(w, "Room not found", http.StatusBadRequest)
    return
  }

  movePlayed := map[string]interface{}{
    "row": row,
    "col": col,
  }

  for conn, data := range roomConns.Players {
    var wsData []byte

    if data.CurrentTurn {
      data.CurrentTurn = false
      movePlayed["current_turn"] = false
      movePlayed["symbol"] = move.Symbol
      movePlayed["player_id"] = data.PlayerID

      jsonMove, _ := json.Marshal(movePlayed)
      wsData = jsonMove
    } else {
      data.CurrentTurn = true
      movePlayed["current_turn"] = true
      movePlayed["symbol"] = move.Symbol
      movePlayed["player_id"] = data.PlayerID

      jsonMove, _ := json.Marshal(movePlayed)
      wsData = jsonMove
    }

    roomConns.Players[conn] = data

    conn.WriteMessage(websocket.TextMessage, wsData)
  }

  w.WriteHeader(http.StatusOK)
}
