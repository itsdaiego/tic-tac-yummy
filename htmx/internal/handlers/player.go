package handlers

import (
	"fmt"
	"net/http"
)


func ListPlayerHandler(w http.ResponseWriter, r *http.Request) {
  roomID := r.URL.Query().Get("room_id")

  if roomID == "" {
    http.Error(w, "Not room id provided", http.StatusBadRequest)
    return
  }

  roomLock.Lock()
  room, exists := rooms[roomID]
  roomLock.Unlock()

  if !exists {
    http.Error(w, "room not found", http.StatusNotFound)
    fmt.Println("Room not found")
    return
  }

  fmt.Println("Listing players for room", len(room.Players))

  w.Header().Set("Content-Type", "text/html")

  for _, data := range room.Players {
    fmt.Fprintf(w, "<div>Player %d</div>", data.PlayerID)
  }
}
