package main

import (
	"fmt"
	"log"
	"net/http"

	"tic-tac-yummy/internal/handlers"
	"github.com/gorilla/mux"
)

func main() {
	r := mux.NewRouter()

	r.HandleFunc("/room/{roomId}", handlers.HomeHandler).Methods("GET")
	r.HandleFunc("/ws", handlers.WSHandler)
	r.HandleFunc("/move", handlers.MoveHandler)
  r.HandleFunc("/list-players", handlers.ListPlayerHandler).Methods("GET")

	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	fmt.Println("Server is running at port: 8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
