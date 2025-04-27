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
	
// In the main function, remove debugging lines
func main() {
	helper.LoadEnv()
	db := app.NewDB()
	validate := validator.New()

	jwtSecret := helper.GetEnv("JWT_SECRET_KEY", "your-secret-key")

	userRepository := repository.NewUserRepository()
	userService := service.NewUserService(userRepository, db, validate)
	userController := controller.NewUserController(userService)

	authService := service.NewAuthService(userRepository, db, validate, jwtSecret)
	authController := controller.NewAuthController(authService)

	// Initialize post dependencies
	postRepository := repository.NewPostRepository()
	postService := service.NewPostService(postRepository, db, validate)
	postController := controller.NewPostController(postService)

	// Create comment repository, service, and controller instances
	commentRepository := repository.NewCommentRepository()
	commentService := service.NewCommentService(
		commentRepository,
		postRepository,
		userRepository,
		db,
		validate)
	commentController := controller.NewCommentController(commentService)

	// Initialize router with all controllers
	router := app.NewRouter(authController, userController, postController, commentController)

	// Create middleware chain correctly by converting to http.Handler first
	var handler http.Handler = router

	// Apply middlewares
	handler = middleware.NewAuthMiddleware(handler, jwtSecret)
	handler = middleware.CORSMiddleware(handler)

	// Start the server with the wrapped handler
	server := http.Server{
		Addr:    "localhost:3000",
		Handler: handler,
	}

	fmt.Println("Server starting on localhost:3000")
	err := server.ListenAndServe()
	helper.PanicIfError(err)
}
