package helper

import (
	"log"
	"os"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt"
	"golang.org/x/crypto/bcrypt"
)

type FormatSuccess struct {
	Message string      `json:"message"`
	Status  int         `json:"status"`
	Data    interface{} `json:"data"`
}

type FormatError struct {
	Message string      `json:"message"`
	Status  int         `json:"status"`
	Data    interface{} `json:"data,omitempty"`
}

func Succes(message string, status int, data interface{}) FormatSuccess {
	res := FormatSuccess{
		Status:  status,
		Message: message,
		Data:    data,
	}

	return res
}

func Error(message string, status int, data ...interface{}) FormatError {
	res := FormatError{
		Status:  status,
		Message: message,
	}

	if len(data) > 0 {
		res.Data = data[0]
	}

	return res
}

func HashedPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	return string(hashedPassword), nil

}

// Add this function to your handler package
func GetValidationErrorMessage(err validator.FieldError) string {
	// Customize messages based on the validation tag
	switch err.Tag() {
	case "required":
		return "This field is required"
	case "email":
		return "Invalid email format"
	case "min":
		return "Should be at least " + err.Param() + " characters long"
	case "max":
		return "Should be at most " + err.Param() + " characters long"
	default:
		return "Failed validation on tag: " + err.Tag()
	}
}

func JoinStrings(items []string, separator string) string {
	return strings.Join(items, separator)
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

var SecretKey = os.Getenv("JWT_SECRET_KEY")

// GenerateJWT menghasilkan JWT token
func GenerateJWT(userID int, email string) (string, error) {
	// Membuat klaim (claims) untuk JWT
	claims := jwt.MapClaims{
		"sub":   userID,
		"email": email,
		"exp":   time.Now().Add(time.Hour * 24).Unix(), // Token berlaku selama 24 jam
	}

	// Membuat token JWT dengan klaim dan secret key
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Menandatangani token dengan secret key
	signedToken, err := token.SignedString([]byte(SecretKey))
	if err != nil {
		log.Printf("Error signing token: %v", err)
		return "", err
	}

	return signedToken, nil
}
