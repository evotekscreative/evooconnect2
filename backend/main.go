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
	commentBlogRepository := repository.NewCommentBlogRepository()

	// Post repository
	postRepository := repository.NewPostRepository()
	
	// Comment repository
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
	
	// Report repository
	reportRepository := repository.NewReportRepository(db)
	
	// Notification repository
	notificationRepository := repository.NewNotificationRepository()

	// Notification service (moved up)
	notificationService := service.NewNotificationService(
		notificationRepository,
		userRepository,
		db,
		validate,
	)

	// ===== Services =====
	// User-related services
	profileViewService := service.NewProfileViewService(db, profileViewRepository, userRepository, notificationService)
	connectionService := service.NewConnectionService(connectionRepository, userRepository, notificationService, db, validate)
	userService := service.NewUserService(userRepository, connectionRepository, profileViewService, db, validate)
	authService := service.NewAuthService(userRepository, db, validate, jwtSecret)

	// Content-related services
	blogService := service.NewBlogService(
		blogRepository,
		userRepository,
		connectionRepository,
		notificationService,
	)
	
	commentBlogService := service.NewCommentBlogService(
		commentBlogRepository,
		blogRepository,
		userRepository,
		notificationService,
		db,
		validate,
	)

// Post service
postService := service.NewPostService(
    userRepository,
    postRepository,
    commentRepository,
    connectionRepository,
    groupRepository,
    groupMemberRepository,
    notificationService,
    db,
    validate,
)

	
	// Comment service
	commentService := service.NewCommentService(
		commentRepository,
		postRepository,
		userRepository,
		notificationService,
		db,
		validate,
	)

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
		notificationService,
		validate,
	)

	// Chat service
	chatService := service.NewChatService(chatRepository, userRepository, db, validate)

	// Report service
	reportService := service.NewReportService(
		reportRepository,
		userRepository,
		postRepository,
		commentRepository,
		blogRepository,
		commentBlogRepository,
		db,
	)

	// Search service
	searchService := service.NewSearchService(
    db,
    userRepository,
    postRepository,
    blogRepository,
    groupRepository,
    connectionRepository,
)

	// ===== Controllers =====
	// User-related controllers
	userController := controller.NewUserController(
		userService,
		profileViewService,
		notificationService,
	)
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


	// ✅ Inject all controllers into router including reportController
	// Report controller
	reportController := controller.NewReportController(reportService)

	// Comment blog controller
	commentBlogController := controller.NewCommentBlogController(commentBlogService)

	// Notification controller
	notificationController := controller.NewNotificationController(notificationService)

	// Search controller
	searchController := controller.NewSearchController(searchService)

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
		commentBlogController,
		connectionController,
		reportController,
		groupController,
		chatController,
		profileViewController,
		notificationController,
		searchController,
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

	fmt.Println("\nServer starting on http://localhost:3000")
	err := server.ListenAndServe()
	helper.PanicIfError(err)
}