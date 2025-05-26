package middleware

import (
	"context"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/utils"
	"net/http"
	"strings"
)

type AdminAuthMiddleware struct {
	Handler http.Handler
}

func NewAdminAuthMiddleware(handler http.Handler) *AdminAuthMiddleware {
	return &AdminAuthMiddleware{Handler: handler}
}

func (middleware *AdminAuthMiddleware) ServeHTTP(writer http.ResponseWriter, request *http.Request) {
	// Skip authentication for admin login and register
	if strings.Contains(request.URL.Path, "/api/admin/auth/login") ||
		strings.Contains(request.URL.Path, "/api/admin/auth/register") {
		middleware.Handler.ServeHTTP(writer, request)
		return
	}

	// Check for /api/admin prefix
	if strings.HasPrefix(request.URL.Path, "/api/admin") {
		authHeader := request.Header.Get("Authorization")

		if !strings.Contains(authHeader, "Bearer ") {
			// Return error response
			webResponse := web.WebResponse{
				Code:   401,
				Status: "UNAUTHORIZED",
				Data:   "Unauthorized: No token provided",
			}
			writer.Header().Set("Content-Type", "application/json")
			writer.WriteHeader(http.StatusUnauthorized)
			helper.WriteToResponseBody(writer, webResponse)
			return
		}

		// Extract token
		token := strings.Replace(authHeader, "Bearer ", "", -1)

		// Validate token and ensure it's an admin token
		claims, err := utils.ValidateToken(token)
		if err != nil || claims.Role != "admin" {
			webResponse := web.WebResponse{
				Code:   401,
				Status: "UNAUTHORIZED",
				Data:   "Unauthorized: Invalid or expired token",
			}
			writer.Header().Set("Content-Type", "application/json")
			writer.WriteHeader(http.StatusUnauthorized)
			helper.WriteToResponseBody(writer, webResponse)
			return
		}

		// Set admin ID to context
		ctx := request.Context()
		ctx = context.WithValue(ctx, "user_id", claims.ID)
		ctx = context.WithValue(ctx, "user_role", claims.Role)
		request = request.WithContext(ctx)

		middleware.Handler.ServeHTTP(writer, request)
		return
	}

	// For non-admin routes, continue with regular flow
	middleware.Handler.ServeHTTP(writer, request)
}
