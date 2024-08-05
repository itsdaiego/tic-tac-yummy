package handlers

import (
    "html/template"
    "net/http"
)

func HomeHandler(w http.ResponseWriter, r *http.Request) {
    tmpl := template.Must(template.ParseFiles("internal/templates/index.html"))
    tmpl.Execute(w, nil)
}