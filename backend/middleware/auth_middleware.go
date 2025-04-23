package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
)

type AuthMiddleware struct {
	Handler   http.Handler
	JWTSecret string
}

func NewAuthMiddleware(handler http.Handler, jwtSecret string) *AuthMiddleware {
	return &AuthMiddleware{
		Handler:   handler,
		JWTSecret: jwtSecret,
	}
}

func (middleware *AuthMiddleware) ServeHTTP(writer http.ResponseWriter, request *http.Request) {
	// Skip authentication for login, register, and other public endpoints
	if strings.Contains(request.URL.Path, "/auth/") ||
		request.URL.Path == "/api/health" {
		middleware.Handler.ServeHTTP(writer, request)
		return
	}

	authHeader := request.Header.Get("Authorization")
	if !strings.Contains(authHeader, "Bearer ") {
		http.Error(writer, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Extract the token
	tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

	// Parse and validate token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if method, ok := token.Method.(*jwt.SigningMethodHMAC); !ok || method.Alg() != "HS256" {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(middleware.JWTSecret), nil
	})

	if err != nil {
		http.Error(writer, "Unauthorized: "+err.Error(), http.StatusUnauthorized)
		return
	}

	// Verify token claims
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		http.Error(writer, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Extract user_id from claims
	userIdStr, ok := claims["user_id"].(string)
	if !ok {
		http.Error(writer, "Invalid token claims", http.StatusUnauthorized)
		return
	}

	// Parse UUID
	_, err = uuid.Parse(userIdStr)
	if err != nil {
		http.Error(writer, "Invalid user ID format: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Add user_id to context
	ctx := context.WithValue(request.Context(), "user_id", userIdStr)
	request = request.WithContext(ctx)

	middleware.Handler.ServeHTTP(writer, request)
}
