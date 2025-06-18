package utils

import (
	"context"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

type JWTClaim struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Role  string `json:"role"`
	jwt.RegisteredClaims
}

var jwtKey = []byte("cfeba9c7b48aa3a16814aaf49732b64eaf35b32412925c84e67e7da477e980ed") // Gunakan environment variable untuk production

func GenerateToken(id string, email string, role string, duration time.Duration) (string, error) {
	expirationTime := time.Now().Add(duration)
	claims := &JWTClaim{
		ID:    id,
		Email: email,
		Role:  role, // "user" atau "admin"
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	return tokenString, err
}

func ValidateToken(signedToken string) (*JWTClaim, error) {
	token, err := jwt.ParseWithClaims(
		signedToken,
		&JWTClaim{},
		func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		},
	)

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*JWTClaim)
	if !ok {
		return nil, errors.New("couldn't parse claims")
	}

	if claims.ExpiresAt.Time.Before(time.Now()) {
		return nil, errors.New("token expired")
	}

	return claims, nil
}

// Add context helpers
func SetUserRole(ctx context.Context, role string) context.Context {
	return context.WithValue(ctx, "user_role", role)
}

func GetUserRole(ctx context.Context) string {
	role, ok := ctx.Value("user_role").(string)
	if !ok {
		return ""
	}
	return role
}

func IsAdmin(ctx context.Context) bool {
	return GetUserRole(ctx) == "admin"
}

// HashPassword creates a bcrypt hash of the password
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// CheckPasswordHash compares a password with a hash to check if they match
func VerifyPassword(hash, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
}
