package handlers

import (
	"fmt"
	"net/http"
	"strconv"
)

func MoveHandler(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	rowStr := r.FormValue("row")
	colStr := r.FormValue("col")

	row, err := strconv.Atoi(rowStr)
	if err != nil {
		http.Error(w, "Invalid row value", http.StatusBadRequest)
		return
	}

	col, err := strconv.Atoi(colStr)
	if err != nil {
		http.Error(w, "Invalid col value", http.StatusBadRequest)
		return
	}

	fmt.Printf("new move: row=%d, col=%d\n", row, col)

	w.Header().Set("Content-Type", "text/html")
	fmt.Fprintf(w, `<div class="cell w-44 h-44 flex justify-center items-center border-2 border-gray-300 bg-white cursor-pointer"
					 data-row="%d"
					 data-col="%d"
					 onclick="sendMove(event)">
						<div class="w-32 h-32 flex justify-center items-center">
							<div class="text-red-500 text-7xl">X</div>
						</div>
					</div>`, row, col)
}
