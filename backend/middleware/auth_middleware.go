package middleware

import (
	"context"
	"encoding/json"
	"evoconnect/backend/model/web"
	"fmt"
	"net/http"
	"strings"

	"github.com/dgrijalva/jwt-go"
	// "github.com/google/uuid"
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

// middleware/auth_middleware.go

func (middleware *AuthMiddleware) ServeHTTP(writer http.ResponseWriter, request *http.Request) {
	// Skip authentication for these public endpoints only
	if strings.Contains(request.URL.Path, "/auth/login") ||
		strings.Contains(request.URL.Path, "/auth/google") ||
		strings.Contains(request.URL.Path, "/auth/register") ||
		strings.Contains(request.URL.Path, "/auth/verify/send") ||
		strings.Contains(request.URL.Path, "/auth/forgot-password") ||
		strings.Contains(request.URL.Path, "/auth/reset-password") ||
		request.URL.Path == "/api/health" {
		middleware.Handler.ServeHTTP(writer, request)
		return
	}

	// Semua endpoint lain termasuk /api/auth/verify memerlukan autentikasi
	authHeader := request.Header.Get("Authorization")

	// Debug untuk melihat header yang diterima
	// fmt.Printf("Auth header received: %s\n", authHeader)

	if !strings.Contains(authHeader, "Bearer ") {
		// Return proper JSON response untuk error
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusUnauthorized)

		response := web.WebResponse{
			Code:   http.StatusUnauthorized,
			Status: "UNAUTHORIZED",
			Data:   "Unauthorized access",
		}

		_ = json.NewEncoder(writer).Encode(response)
		return
	}

	// Extract the token
	tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

	// Parse and validate token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if method, ok := token.Method.(*jwt.SigningMethodHMAC); !ok || method.Alg() != "HS256" {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(middleware.JWTSecret), nil
	})

	if err != nil {
		fmt.Printf("JWT Parse error: %v\n", err)
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusUnauthorized)

		response := web.WebResponse{
			Code:   http.StatusUnauthorized,
			Status: "UNAUTHORIZED",
			Data:   "Invalid token: " + err.Error(),
		}

		_ = json.NewEncoder(writer).Encode(response)
		return
	}

	if !token.Valid {
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusUnauthorized)

		response := web.WebResponse{
			Code:   http.StatusUnauthorized,
			Status: "UNAUTHORIZED",
			Data:   "Invalid token",
		}

		_ = json.NewEncoder(writer).Encode(response)
		return
	}

	// Extract user info from token
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusUnauthorized)

		response := web.WebResponse{
			Code:   http.StatusUnauthorized,
			Status: "UNAUTHORIZED",
			Data:   "Invalid token claims",
		}

		_ = json.NewEncoder(writer).Encode(response)
		return
	}

	// Get user_id and email from claims
	userIdStr, _ := claims["user_id"].(string)
	email, _ := claims["email"].(string)

	// Debug claims
	// fmt.Printf("JWT Claims - user_id: %s, email: %s\n", userIdStr, email)

	// Add to context
	ctx := context.WithValue(request.Context(), "user_id", userIdStr)
	ctx = context.WithValue(ctx, "email", email)

	// Create new request with updated context
	newRequest := request.WithContext(ctx)

	// Pass to next handler
	middleware.Handler.ServeHTTP(writer, newRequest)
}
