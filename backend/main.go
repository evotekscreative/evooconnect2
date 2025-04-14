package main

import (
	"log"
	"net/http"

	"github.com/MuhamadAfghan/evoconnect/tree/main/backend/controllers/authcontroller"
	"github.com/gorilla/mux"
)

func main() {
	r := mux.NewRouter()

	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Welcome to the Go Auth API!"))
	}).Methods("GET")
	r.HandleFunc("/login", authcontroller.Login).Methods("POST")
	r.HandleFunc("/register", authcontroller.Register).Methods("POST")
	r.HandleFunc("/logout", authcontroller.Logout).Methods("POST")

	log.Fatal(http.ListenAndServe(":8080", r))
}
