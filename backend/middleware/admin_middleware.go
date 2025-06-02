package middleware

import (
	"context"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/utils"
	"fmt"
	"net/http"
	"strings"

	"github.com/julienschmidt/httprouter"
)

func NewAdminAuthMiddleware() func(httprouter.Handle) httprouter.Handle {
	return func(next httprouter.Handle) httprouter.Handle {
		return func(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
			// Get Authorization header
			authHeader := request.Header.Get("Authorization")
			if authHeader == "" {
				helper.WriteToResponseBody(writer, web.WebResponse{
					Code:   http.StatusUnauthorized,
					Status: "UNAUTHORIZED",
					Data:   "Authorization header is required",
				})
				return
			}

			// Check Bearer token format
			tokenParts := strings.Split(authHeader, " ")
			if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
				helper.WriteToResponseBody(writer, web.WebResponse{
					Code:   http.StatusUnauthorized,
					Status: "UNAUTHORIZED",
					Data:   "Invalid authorization format",
				})
				return
			}

			tokenString := tokenParts[1]

			// Validate admin token using utility function
			claims, err := utils.ValidateAdminToken(tokenString)
			if err != nil {
				fmt.Printf("Admin token validation error: %v\n", err)
				helper.WriteToResponseBody(writer, web.WebResponse{
					Code:   http.StatusUnauthorized,
					Status: "UNAUTHORIZED",
					Data:   "Invalid admin token: " + err.Error(),
				})
				return
			}

			// Add admin info to context
			ctx := context.WithValue(request.Context(), "admin_id", claims.ID)
			ctx = context.WithValue(ctx, "admin_email", claims.Email)
			ctx = context.WithValue(ctx, "admin_role", claims.Role)

			// Continue to next handler
			next(writer, request.WithContext(ctx), params)
		}
	}
}
