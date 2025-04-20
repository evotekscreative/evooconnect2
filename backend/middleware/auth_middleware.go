package middleware

import (
	"context"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"fmt"
	"net/http"
	"strings"

	"github.com/dgrijalva/jwt-go"
)

type SelectiveAuthMiddleware struct {
	Handler     http.Handler
	JwtSecret   string
	PublicPaths []string
}

func NewSelectiveAuthMiddleware(handler http.Handler, jwtSecret string) *SelectiveAuthMiddleware {
	return &SelectiveAuthMiddleware{
		Handler:   handler,
		JwtSecret: jwtSecret,
		PublicPaths: []string{
			"/api/auth/login",
			"/api/auth/register",
			"/api/auth/verify/send",
			"/api/auth/forgot-password",
			"/api/auth/reset-password",
			// Note: /api/auth/verify is protected and requires auth
		},
	}
}

// Helper method to check if a path requires authentication
func (middleware *SelectiveAuthMiddleware) CheckAuthFunc(path string) bool {
	for _, publicPath := range middleware.PublicPaths {
		if strings.HasPrefix(path, publicPath) {
			return false // No auth required for public paths
		}
	}
	return true // Auth required for all other paths
}

func (middleware *SelectiveAuthMiddleware) ServeHTTP(writer http.ResponseWriter, request *http.Request) {
	path := request.URL.Path

	// Check if authentication is required for this path
	if !middleware.CheckAuthFunc(path) {
		middleware.Handler.ServeHTTP(writer, request)
		return
	}

	// This path requires authentication, check for token
	authHeader := request.Header.Get("Authorization")
	if authHeader == "" {
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusUnauthorized)

		webResponse := web.WebResponse{
			Code:   http.StatusUnauthorized,
			Status: "UNAUTHORIZED",
			Data:   "Missing Authorization header",
		}

		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	if !strings.HasPrefix(authHeader, "Bearer ") {
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusUnauthorized)

		webResponse := web.WebResponse{
			Code:   http.StatusUnauthorized,
			Status: "UNAUTHORIZED",
			Data:   "Invalid token format - missing Bearer prefix",
		}

		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

	// Parse and validate the token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(middleware.JwtSecret), nil
	})

	if err != nil {
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusUnauthorized)

		webResponse := web.WebResponse{
			Code:   http.StatusUnauthorized,
			Status: "UNAUTHORIZED",
			Data:   "Invalid token",
		}

		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusUnauthorized)

		webResponse := web.WebResponse{
			Code:   http.StatusUnauthorized,
			Status: "UNAUTHORIZED",
			Data:   "Invalid token claims",
		}

		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Get user_id from claims
	userID, ok := claims["user_id"].(float64)
	if !ok {
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusUnauthorized)

		webResponse := web.WebResponse{
			Code:   http.StatusUnauthorized,
			Status: "UNAUTHORIZED",
			Data:   "Invalid token: missing user_id",
		}

		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Create context with user_id
	ctx := context.WithValue(request.Context(), "user_id", int(userID))
	request = request.WithContext(ctx)

	// Pass to next handler
	middleware.Handler.ServeHTTP(writer, request)
}
