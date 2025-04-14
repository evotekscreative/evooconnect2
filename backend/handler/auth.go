package handler

import (
	"be-evoconnect/db"
	"be-evoconnect/helper"
	"be-evoconnect/model"
	"be-evoconnect/repo"
	"log"
	"net/http"
	"regexp"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

// Register handler untuk proses pendaftaran user baru
func Register(c echo.Context) error {
	var user model.User

	// Binding request body ke struct user
	if err := c.Bind(&user); err != nil {
		log.Printf("Error binding request body: %v", err)
		return c.JSON(http.StatusBadRequest, helper.Error("Invalid request body", http.StatusBadRequest))
	}

	validate := validator.New()

	// Validasi input menggunakan validator
	if err := validate.Struct(user); err != nil {
		log.Printf("Validation error: %v", err)

		// Format validation errors into a readable map
		validationErrors := make(map[string]string)
		for _, err := range err.(validator.ValidationErrors) {
			// err.Field()
			fieldName := strings.ToLower(err.StructField())
			validationErrors[fieldName] = helper.GetValidationErrorMessage(err)
		}

		return c.JSON(http.StatusBadRequest, helper.Error("Validation failed", http.StatusBadRequest, validationErrors))
	}

	// Optional: Add email format validation
	emailRegex := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
	if match, _ := regexp.MatchString(emailRegex, user.Email); !match {
		return c.JSON(http.StatusBadRequest, helper.Error("Invalid email format", http.StatusBadRequest))
	}

	// Continue with password hashing and user registration as before
	hashedPassword, err := helper.HashedPassword(user.Password)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, helper.Error("Failed to hash password", http.StatusInternalServerError))
	}

	user.Password = hashedPassword

	userRepo := repo.NewUserRepo(db.DB)
	err = userRepo.Register(user)
	if err != nil {
		log.Printf("Error registering user: %v", err)

		if err.Error() == "email already registered" {
			return c.JSON(http.StatusConflict, helper.Error("Email already registered", http.StatusConflict))
		}

		return c.JSON(http.StatusInternalServerError, helper.Error("Failed to register user", http.StatusInternalServerError))
	}

	return c.JSON(http.StatusOK, helper.Succes("User registered successfully", http.StatusOK, user))
}

// Login handler untuk proses login
func Login(c echo.Context) error {

	var loginRequest struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	// Binding request body ke loginRequest struct
	if err := c.Bind(&loginRequest); err != nil {
		log.Printf("Error binding request body: %v", err)
		return c.JSON(http.StatusBadRequest, helper.Error("Invalid request body", http.StatusBadRequest))
	}

	// Create validation errors map
	validationErrors := make(map[string]string)

	if loginRequest.Email == "" {
		validationErrors["email"] = "email required"
	}

	if loginRequest.Password == "" {
		validationErrors["password"] = "password required"
	}

	// If validation errors exist, return them
	if len(validationErrors) > 0 {
		return c.JSON(http.StatusBadRequest, helper.Error("Required fields missing", http.StatusBadRequest, validationErrors))
	}

	// Menggunakan repo untuk mendapatkan user berdasarkan email
	userRepo := repo.NewUserRepo(db.DB) // Pastikan db.DB sudah terhubung
	user, err := userRepo.GetUserByEmail(loginRequest.Email)
	if err != nil {
		log.Printf("Error getting user: %v", err)
		return c.JSON(http.StatusInternalServerError, helper.Error("Failed to get user", http.StatusInternalServerError))
	}

	// Verifikasi password dengan hash
	if !helper.CheckPasswordHash(loginRequest.Password, user.Password) {
		return c.JSON(http.StatusUnauthorized, helper.Error("Invalid email or password", http.StatusUnauthorized))
	}

	// Generate JWT token
	token, err := helper.GenerateJWT(user.Id, user.Email)
	if err != nil {
		log.Printf("Error generating JWT: %v", err)
		return c.JSON(http.StatusInternalServerError, helper.Error("Failed to generate JWT", http.StatusInternalServerError))
	}

	// Response dengan token dan data user
	response := map[string]interface{}{
		"token":   token,
		"status":  http.StatusOK,
		"message": "Login successful",
		"user": map[string]interface{}{
			"name":  user.Name,
			"email": user.Email,
		},
	}

	return c.JSON(http.StatusOK, response)
}
