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

	// Handle routes
	r.HandleFunc("/room/{roomId}", handlers.HomeHandler).Methods("GET")
	r.HandleFunc("/ws", handlers.WSHandler)
	r.HandleFunc("/move", handlers.MoveHandler)

	// Serve static files
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	// Start the server
	fmt.Println("Server is running at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
