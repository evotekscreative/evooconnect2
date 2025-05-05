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

	connectionRepository := repository.NewConnectionRepository()

	userRepository := repository.NewUserRepository()
	connectionService := service.NewConnectionService(connectionRepository, userRepository, db, validate)
	connectionController := controller.NewConnectionController(connectionService)
	userService := service.NewUserService(userRepository, connectionRepository, db, validate)
	userController := controller.NewUserController(userService)

	// Initialize auth components
	authService := service.NewAuthService(userRepository, db, validate, jwtSecret)
	authController := controller.NewAuthController(authService)

	// Initialize blog components
	blogRepository := repository.NewBlogRepository(db)
	blogService := service.NewBlogService(blogRepository)
	blogController := controller.NewBlogController(blogService)

	// Initialize post dependencies
	postRepository := repository.NewPostRepository()
	postService := service.NewPostService(postRepository, connectionRepository, db, validate)
	postController := controller.NewPostController(postService)

	// Create comment repository, service, and controller instances
	commentRepository := repository.NewCommentRepository()
	commentService := service.NewCommentService(commentRepository, postRepository, userRepository, db, validate)
	commentController := controller.NewCommentController(commentService)

	educationRepository := repository.NewEducationRepository()
	educationService := service.NewEducationService(educationRepository, userRepository, db, validate)
	educationController := controller.NewEducationController(educationService)

	// Experience
	experienceRepository := repository.NewExperienceRepository()
	experienceService := service.NewExperienceService(experienceRepository, userRepository, db, validate)
	experienceController := controller.NewExperienceController(experienceService)

	// Initialize router with all controllers
	router := app.NewRouter(
		authController,
		userController,
		blogController,
		postController,
		commentController,
		educationController,
		experienceController,
		connectionController,
	)
	// Create middleware chain
	var handler http.Handler = router
	handler = middleware.NewAuthMiddleware(handler, jwtSecret)
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
