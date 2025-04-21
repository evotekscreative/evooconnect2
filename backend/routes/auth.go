package routes

import (
	"be-evoconnect/handler"

	"github.com/labstack/echo/v4"
)

func InitAuthRoutes(e *echo.Echo) {
	auth := e.Group("/api/auth")

	auth.POST("/register", handler.Register)
	auth.POST("/login", handler.Login)
}
