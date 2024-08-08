package handlers

import (
	"html/template"
	"net/http"

	"github.com/gorilla/mux"
)

type BoardData struct {
  Board [][]string
  RoomID string
}

var board [][]string

func HomeHandler(w http.ResponseWriter, r *http.Request) {
  board = [][]string{
    {"", "", ""},
    {"", "", ""},
    {"", "", ""},
  }

  vars := mux.Vars(r)
  roomID := vars["roomId"]

  data := BoardData{ Board: board, RoomID: roomID}

  tmpl := template.Must(template.ParseFiles(
    "internal/templates/index.html",
    "internal/templates/board.html",
    "internal/templates/player.html",
  ))

  tmpl.ExecuteTemplate(w, "index", data)
}
