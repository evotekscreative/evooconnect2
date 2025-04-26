package main

import (
    "evoconnect/backend/app"
    "evoconnect/backend/controller"
    "evoconnect/backend/helper"
    "evoconnect/backend/middleware"
    "evoconnect/backend/repository"
    "evoconnect/backend/service"
    "fmt"
    "net/http"

    "github.com/go-playground/validator/v10"
    _ "github.com/lib/pq"
)

func main() {
    helper.LoadEnv()
    db := app.NewDB()
    validate := validator.New()

    jwtSecret := helper.GetEnv("JWT_SECRET_KEY", "your-secret-key")

    // Initialize user components
    userRepository := repository.NewUserRepository()
    userService := service.NewUserService(userRepository, db)
    userController := controller.NewUserController(userService)

    // Initialize auth components
    authService := service.NewAuthService(userRepository, db, validate, jwtSecret)
    authController := controller.NewAuthController(authService)

    // Initialize blog components
	blogRepository := repository.NewBlogRepository(db)
	blogService := service.NewBlogService(blogRepository)
	blogController := controller.NewBlogController(blogService)
	
	router := app.NewRouter(authController, userController, blogController)
	

    // Create middleware chain
    var handler http.Handler = router
    handler = middleware.NewSelectiveAuthMiddleware(handler, jwtSecret)
    handler = middleware.CORSMiddleware(handler)

    // Start server
    server := http.Server{
        Addr:    "localhost:3000",
        Handler: handler,
    }

    fmt.Println("Server starting on localhost:3000")
    err := server.ListenAndServe()
    helper.PanicIfError(err)
}