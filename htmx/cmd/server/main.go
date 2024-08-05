package main

import (
    "fmt"
    "log"
    "net/http"

    "tic-tac-yummy/internal/handlers"
)

func main() {
    http.HandleFunc("/", handlers.HomeHandler)
    http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

    fmt.Println("Server is running at http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}

