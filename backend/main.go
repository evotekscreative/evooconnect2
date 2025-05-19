package main

import (
	"evoconnect/backend/app"
	"evoconnect/backend/controller"
	"evoconnect/backend/helper"
	"evoconnect/backend/middleware"
	"evoconnect/backend/repository"
	"evoconnect/backend/service"
	"evoconnect/backend/utils"
	"fmt"
	"log"
	"net/http"

	"github.com/go-playground/validator/v10"
	_ "github.com/lib/pq"
)

func main() {
	log.Println("Starting server...")

	// ===== Server initialization =====
	helper.LoadEnv()
	db := app.NewDB()
	if db == nil {
		log.Fatal("Failed to connect to the database")
		return
	}
	validate := validator.New()
	utils.InitPusherClient()
	jwtSecret := helper.GetEnv("JWT_SECRET_KEY", "your-secret-key")

	// ===== Repositories =====
	// User-related repositories
	userRepository := repository.NewUserRepository()
	connectionRepository := repository.NewConnectionRepository()
	profileViewRepository := repository.NewProfileViewRepository()

	// Content-related repositories
	blogRepository := repository.NewBlogRepository(db)
	postRepository := repository.NewPostRepository()
	commentRepository := repository.NewCommentRepository()

	// Professional info repositories
	educationRepository := repository.NewEducationRepository()
	experienceRepository := repository.NewExperienceRepository()

	// Group-related repositories
	groupRepository := repository.NewGroupRepository()
	groupMemberRepository := repository.NewGroupMemberRepository()
	groupInvitationRepository := repository.NewGroupInvitationRepository()

	// Chat repository
	chatRepository := repository.NewChatRepository()

	// ===== Services =====
	// User-related services
	profileViewService := service.NewProfileViewService(db, profileViewRepository, userRepository)
	connectionService := service.NewConnectionService(connectionRepository, userRepository, db, validate)
	userService := service.NewUserService(userRepository, connectionRepository, profileViewService, db, validate)
	authService := service.NewAuthService(userRepository, db, validate, jwtSecret)

	// Content-related services
	blogService := service.NewBlogService(blogRepository)
	postService := service.NewPostService(
		userRepository,
		postRepository,
		connectionRepository,
		groupRepository,
		groupMemberRepository,
		db,
		validate,
	)
	commentService := service.NewCommentService(commentRepository, postRepository, userRepository, db, validate)

	// Professional info services
	educationService := service.NewEducationService(educationRepository, userRepository, db, validate)
	experienceService := service.NewExperienceService(experienceRepository, userRepository, db, validate)

	// Group service
	groupService := service.NewGroupService(
		db,
		groupRepository,
		groupMemberRepository,
		groupInvitationRepository,
		userRepository,
		validate,
	)

	// Chat service
	chatService := service.NewChatService(chatRepository, userRepository, db, validate)

	// ===== Controllers =====
	// User-related controllers
	userController := controller.NewUserController(userService)
	connectionController := controller.NewConnectionController(connectionService)
	profileViewController := controller.NewProfileViewController(profileViewService)
	authController := controller.NewAuthController(authService)

	// Content-related controllers
	blogController := controller.NewBlogController(blogService)
	postController := controller.NewPostController(postService)
	commentController := controller.NewCommentController(commentService)

	// Professional info controllers
	educationController := controller.NewEducationController(educationService)
	experienceController := controller.NewExperienceController(experienceService)

	// Group controller
	groupController := controller.NewGroupController(groupService, postService)

	// Chat controller
	chatController := controller.NewChatController(chatService)

	// ===== Router and Middleware =====
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
		groupController,
		chatController,
		profileViewController,
	)

	// Create middleware chain
	var handler http.Handler = router
	handler = middleware.NewAuthMiddleware(handler, jwtSecret)
	handler = middleware.CORSMiddleware(handler)

	// ===== Start Server =====
	server := http.Server{
		Addr:    "localhost:3000",
		Handler: handler,
	}
	// http://localhost:5173/
	fmt.Println("\nServer starting on http://localhost:3000")
	err := server.ListenAndServe()
	helper.PanicIfError(err)
}
