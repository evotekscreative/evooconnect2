package helper

import (
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
)

// GetUserIdFromToken extracts the user ID from a JWT token
func GetUserIdFromToken(request *http.Request) (uuid.UUID, error) {
	// Extract the token from the request header
	tokenString := request.Header.Get("Authorization")
	if tokenString == "" {
		return uuid.Nil, errors.New("authorization header is missing")
	}

	// Split the token string to get the actual token
	tokenParts := strings.Split(tokenString, "Bearer ")
	if len(tokenParts) != 2 {
		return uuid.Nil, errors.New("invalid authorization format")
	}
	tokenString = tokenParts[1]

	// Parse the token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(GetEnv("JWT_SECRET_KEY", "your-secret-key")), nil
	})
	if err != nil {
		return uuid.Nil, err
	}

	// Extract claims and get user ID
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userId, ok := claims["user_id"].(string)
		if !ok {
			return uuid.Nil, errors.New("user_id not found in token claims")
		}
		parsedUUID, err := uuid.Parse(userId)
		if err != nil {
			return uuid.Nil, fmt.Errorf("invalid user_id format: %v", err)
		}
		return parsedUUID, nil
	}

	return uuid.Nil, errors.New("invalid token")
}

func GetAdminIdFromToken(request *http.Request) (uuid.UUID, error) {
	// Extract the token from the request header
	tokenString := request.Header.Get("Authorization")
	if tokenString == "" {
		return uuid.Nil, errors.New("authorization header is missing")
	}

	// Split the token string to get the actual token
	tokenParts := strings.Split(tokenString, "Bearer ")
	if len(tokenParts) != 2 {
		return uuid.Nil, errors.New("invalid authorization format")
	}
	tokenString = tokenParts[1]

	// Parse the token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(GetEnv("JWT_SECRET_KEY", "your-secret-key")), nil
	})
	if err != nil {
		return uuid.Nil, err
	}

	// Extract claims and get admin ID
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		adminId, ok := claims["admin_id"].(string)
		if !ok {
			return uuid.Nil, errors.New("admin_id not found in token claims")
		}
		parsedUUID, err := uuid.Parse(adminId)
		if err != nil {
			return uuid.Nil, fmt.Errorf("invalid admin_id format: %v", err)
		}
		return parsedUUID, nil
	}

	return uuid.Nil, errors.New("invalid token")
}
