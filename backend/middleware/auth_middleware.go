package middleware

import (
	"context"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"net/http"
	"strings"

	"github.com/dgrijalva/jwt-go"
)

type SelectiveAuthMiddleware struct {
	Handler       http.Handler
	JwtSecret     string
	PublicPaths   []string
	CheckAuthFunc func(string) bool
}

func NewSelectiveAuthMiddleware(handler http.Handler, jwtSecret string) *SelectiveAuthMiddleware {
	middleware := &SelectiveAuthMiddleware{
		Handler:   handler,
		JwtSecret: jwtSecret,
		// Define public paths that don't require authentication
		PublicPaths: []string{
			"/api/auth/login",
			"/api/auth/register",
			"/api/auth/verify/send",
			"/api/auth/verify",
			"/api/auth/forgot-password",
			"/api/auth/reset-password",
		},
	}

	// Define the function to check if a path requires auth
	middleware.CheckAuthFunc = func(path string) bool {
		// Check if path matches any of the public paths
		for _, publicPath := range middleware.PublicPaths {
			if path == publicPath {
				return false // No auth needed
			}
		}

		// Define protected paths or patterns
		if strings.HasPrefix(path, "/api/categories") {
			return true // Auth needed
		}

		// Default to not requiring auth for undefined paths
		return false
	}

	return middleware
}

func (middleware *SelectiveAuthMiddleware) ServeHTTP(writer http.ResponseWriter, request *http.Request) {
	path := request.URL.Path

	// Check if authentication is required for this path
	if !middleware.CheckAuthFunc(path) {
		// No auth required, continue with the request
		middleware.Handler.ServeHTTP(writer, request)
		return
	}

	// This path requires authentication, check for token
	authHeader := request.Header.Get("Authorization")
	if !strings.Contains(authHeader, "Bearer ") {
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

	// Rest of the middleware code (validate token)
	tokenString := strings.Replace(authHeader, "Bearer ", "", -1)

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(middleware.JwtSecret), nil
	})

	if err != nil || !token.Valid {
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusUnauthorized)

		webResponse := web.WebResponse{
			Code:   http.StatusUnauthorized,
			Status: "UNAUTHORIZED",
			Data:   "Invalid or expired token",
		}

		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
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

	userId := int(claims["user_id"].(float64))
	ctx := context.WithValue(request.Context(), "user_id", userId)
	request = request.WithContext(ctx)

	middleware.Handler.ServeHTTP(writer, request)
}
