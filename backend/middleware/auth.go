package middleware

import "github.com/labstack/echo/v4"


func AuthMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		token := c.Request().Header.Get("Authorization")
		if token == "" {
			return echo.ErrUnauthorized
		}

		return next(c)
	}
}