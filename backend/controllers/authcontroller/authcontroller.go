package authcontroller

import (
	"encoding/json"
	"github.com/MuhamadAfghan/evoconnect/models"
	"golang.org/x/crypto/bcrypt"
	"net/http"
)

func Login(w http.ResponseWriter, r *http.Request) {
	// Handle login logic here
	w.Write([]byte("Login successful"))
}

func Register(w http.ResponseWriter, r *http.Request) {

	var UserInput models.Users

	// Decode the request body into the UserInput struct
	err := json.NewDecoder(r.Body).Decode(&UserInput)
	if err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	hasPassword, err := bcrypt.GenerateFromPassword([]byte(UserInput.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}

	UserInput.Password = string(hasPassword)

	// Save the user to the database
	err = models.DB.Create(&UserInput).Error
	if err != nil {
		http.Error(w, "Error saving user", http.StatusInternalServerError)
		return
	}

	response, err := json.Marshal(map[string]string{
		"message": "User registered successfully",
		"email":   UserInput.Email,
	})
	if err != nil {
		http.Error(w, "Error creating response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write(response)
}

func Logout(w http.ResponseWriter, r *http.Request) {
	// Handle logout logic here
	w.Write([]byte("Logout successful"))
}
