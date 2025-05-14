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
	helper.LoadEnv()
	db := app.NewDB()
	validate := validator.New()
	utils.InitPusherClient()

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

	groupRepository := repository.NewGroupRepository()
	groupMemberRepository := repository.NewGroupMemberRepository()

	// Initialize post dependencies
	postRepository := repository.NewPostRepository()
	postService := service.NewPostService(userRepository, postRepository, connectionRepository, groupRepository, groupMemberRepository, db, validate)
	postController := controller.NewPostController(postService)

	// Initialize comment components
	commentRepository := repository.NewCommentRepository()
	commentService := service.NewCommentService(commentRepository, postRepository, userRepository, db, validate)
	commentController := controller.NewCommentController(commentService)

	// Initialize education components
	educationRepository := repository.NewEducationRepository()
	educationService := service.NewEducationService(educationRepository, userRepository, db, validate)
	educationController := controller.NewEducationController(educationService)

	// Initialize experience components
	experienceRepository := repository.NewExperienceRepository()
	experienceService := service.NewExperienceService(experienceRepository, userRepository, db, validate)
	experienceController := controller.NewExperienceController(experienceService)

	groupInvitationRepository := repository.NewGroupInvitationRepository()
	groupService := service.NewGroupService(
		db,
		groupRepository,
		groupMemberRepository,
		groupInvitationRepository,
		userRepository,
		validate,
	)
	groupController := controller.NewGroupController(groupService, postService)

	// Initialize chat components
	chatRepository := repository.NewChatRepository()
	chatService := service.NewChatService(chatRepository, userRepository, db, validate)
	chatController := controller.NewChatController(chatService)


	// ✅ Inject all controllers into router including reportController
	router := app.NewRouter(
		authController,
		userController,
		blogController,
		postController,
		commentController,
		educationController,
		experienceController,
		commentBlogController,
		connectionController,
		reportController,
		groupController,
		chatController,
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

	fmt.Println("\nServer starting on http://localhost:3000")
	err := server.ListenAndServe()
	helper.PanicIfError(err)
}