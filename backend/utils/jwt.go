package utils

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret []byte

// InitJWT initializes the JWT secret - harus dipanggil di main.go
func InitJWT(secret string) {
	if secret == "" {
		panic("JWT secret cannot be empty")
	}
	jwtSecret = []byte(secret)
	fmt.Printf("JWT Secret initialized successfully\n")
}

// UserClaims represents the claims for user tokens
type UserClaims struct {
	ID    string `json:"user_id"`
	Email string `json:"email"`
	Role  string `json:"role"`
	jwt.RegisteredClaims
}

// AdminClaims represents the claims for admin tokens
type AdminClaims struct {
	ID    string `json:"admin_id"`
	Email string `json:"email"`
	Role  string `json:"role"`
	jwt.RegisteredClaims
}

// GenerateUserToken creates a JWT token for users
func GenerateUserToken(userID, email string, duration time.Duration) (string, error) {
	if len(jwtSecret) == 0 {
		return "", fmt.Errorf("JWT secret not initialized")
	}

	claims := UserClaims{
		ID:    userID,
		Email: email,
		Role:  "user",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(duration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "evoconnect",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", fmt.Errorf("failed to sign user token: %v", err)
	}

	return signedToken, nil
}

// GenerateAdminToken creates a JWT token for admins
func GenerateAdminToken(adminID, email string, duration time.Duration) (string, error) {
	if len(jwtSecret) == 0 {
		return "", fmt.Errorf("JWT secret not initialized")
	}

	claims := AdminClaims{
		ID:    adminID,
		Email: email,
		Role:  "admin",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(duration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "evoconnect",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", fmt.Errorf("failed to sign admin token: %v", err)
	}

	return signedToken, nil
}

// ValidateUserToken validates a user JWT token
func ValidateUserToken(tokenString string) (*UserClaims, error) {
	if len(jwtSecret) == 0 {
		return nil, fmt.Errorf("JWT secret not initialized")
	}

	token, err := jwt.ParseWithClaims(tokenString, &UserClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Validate the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse user token: %v", err)
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid user token")
	}

	claims, ok := token.Claims.(*UserClaims)
	if !ok {
		return nil, fmt.Errorf("invalid user token claims")
	}

	return claims, nil
}

// ValidateAdminToken validates an admin JWT token
func ValidateAdminToken(tokenString string) (*AdminClaims, error) {
	if len(jwtSecret) == 0 {
		return nil, fmt.Errorf("JWT secret not initialized")
	}

	token, err := jwt.ParseWithClaims(tokenString, &AdminClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Validate the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse admin token: %v", err)
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid admin token")
	}

	claims, ok := token.Claims.(*AdminClaims)
	if !ok {
		return nil, fmt.Errorf("invalid admin token claims")
	}

	return claims, nil
}

// Legacy functions for backward compatibility
func GenerateToken(userID, email, role string, duration time.Duration) (string, error) {
	if role == "admin" {
		return GenerateAdminToken(userID, email, duration)
	}
	return GenerateUserToken(userID, email, duration)
}

func ValidateToken(tokenString string) (*jwt.MapClaims, error) {
	if len(jwtSecret) == 0 {
		return nil, fmt.Errorf("JWT secret not initialized")
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %v", err)
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, fmt.Errorf("invalid token claims")
	}

	return &claims, nil
}

func HashPassword(password string) (string, error) {
	if len(jwtSecret) == 0 {
		return "", fmt.Errorf("JWT secret not initialized")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %v", err)
	}

	return string(hashedPassword), nil
}
