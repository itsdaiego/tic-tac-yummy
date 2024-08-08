package handlers

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Room struct {
	Players map[*websocket.Conn]int
	ID  int
	Lock    sync.Mutex
}

var (
	rooms    = make(map[string]*Room)
	roomLock = sync.Mutex{}
	wsUpgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
)

func (r *Room) AddClient(conn *websocket.Conn) int {
	r.Lock.Lock()
	defer r.Lock.Unlock()

	r.ID++
	r.Players[conn] = r.ID

	return r.ID
}

func (r *Room) RemoveClient(conn *websocket.Conn) {
	r.Lock.Lock()

	defer r.Lock.Unlock()
	delete(r.Players, conn)
}

func WSHandler(w http.ResponseWriter, r *http.Request) {
	roomID := r.URL.Query().Get("id")

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
			Players: make(map[*websocket.Conn]int),
		}

		rooms[roomID] = room
	}
	roomLock.Unlock()

	userID := room.AddClient(conn)

	defer func() {
		room.RemoveClient(conn)
		conn.Close()
	}()

	log.Printf("user %d joined room %s\n", userID, roomID)

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("Read error:", err)
			break
		}

		log.Printf("received message from user %d in room %s: %s\n", userID, roomID, message)
	}
}
