// main.go
package main

import (
	"be-evoconnect/db"
	"be-evoconnect/routes"

	"github.com/labstack/echo/v4"
)

func main() {
	db.ConnectDB()
	e := echo.New()
	routes.InitAuthRoutes(e)
	e.Logger.Fatal(e.Start(":8080"))
}
