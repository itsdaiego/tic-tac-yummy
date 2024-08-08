package handlers

import (
	"log"
  "fmt"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type ConnData struct {
  PlayerID int `json:"player_id"`
  CurrentTurn bool `json:"current_turn"`
}

type Room struct {
	Players map[*websocket.Conn]ConnData
	ID  int
	Lock    sync.Mutex
}

var (
  playerIDCount = 0
  roomID string
	rooms    = make(map[string]*Room)
	roomLock = sync.Mutex{}
	wsUpgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
)

func (r *Room) AddClient(conn *websocket.Conn) (int, bool) {
	r.Lock.Lock()
	defer r.Lock.Unlock()

  playerIDCount++

  if len(r.Players) == 0 {
    r.Players[conn] = ConnData{PlayerID: 1, CurrentTurn: true}
  } else {
    r.Players[conn] = ConnData{PlayerID: playerIDCount, CurrentTurn: false}
  }

  for clientConn := range r.Players {
    if clientConn != conn {
      clientConn.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("%d", r.Players[conn].PlayerID)))
    }
  }

	return r.Players[conn].PlayerID, r.Players[conn].CurrentTurn
}

func (r *Room) RemoveClient(conn *websocket.Conn) {
	r.Lock.Lock()
	defer r.Lock.Unlock()

	delete(r.Players, conn)
}

func WSHandler(w http.ResponseWriter, r *http.Request) {
	roomID = r.URL.Query().Get("id")

  log.Printf("room ID: %s", roomID)

	if roomID == "" {
		http.Error(w, "room ID is required", http.StatusBadRequest)
		return
	}

	conn, err := wsUpgrader.Upgrade(w, r, nil)

	if err != nil {
		log.Println("error upgrading connection:", err)
		return
	}

	roomLock.Lock()
	room, exists := rooms[roomID]

	if !exists {
		room = &Room{
			Players: make(map[*websocket.Conn]ConnData),
		}

		rooms[roomID] = room
	}
	roomLock.Unlock()

	playerID, currentTurn := room.AddClient(conn)
  conn.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("{\"player_id\": %d, \"current_turn\": %t }", playerID, currentTurn)))

	defer func() {
		room.RemoveClient(conn)
		conn.Close()
	}()

	log.Printf("player %d joined room %s\n", playerID, roomID)

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("Read error:", err)
			break
		}

		log.Printf("received message from player %d in room %s: %s\n", playerID, roomID, message)
	}
}
