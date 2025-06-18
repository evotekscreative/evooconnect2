package main

import (
	"evoconnect/backend/app"
	"evoconnect/backend/controller"
	"evoconnect/backend/db/seeder"
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

	helper.InitTimezone("Asia/Jakarta")

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
	connectionRepository := repository.NewConnectionRepository(db)
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

	pendingPostRepository := repository.NewPendingPostRepository()
	groupJoinRequestRepository := repository.NewGroupJoinRequestRepository()

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

	// pinned post repository
	groupPinnedPostRepository := repository.NewGroupPinnedPostRepository()

	groupBlockedMemberRepository := repository.NewGroupBlockedMemberRepository()

	adminRepository := repository.NewAdminRepository()

	// ===== Services =====
	// User-related services
	profileViewService := service.NewProfileViewService(db, profileViewRepository, userRepository, notificationService)
	connectionService := service.NewConnectionService(connectionRepository, userRepository, notificationService, db, groupInvitationRepository, validate)
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

	// Pindahkan inisialisasi groupService sebelum postService
	// Group service
	groupService := service.NewGroupService(
		db,
		groupRepository,
		groupMemberRepository,
		groupInvitationRepository,
		userRepository,
		connectionRepository,
		notificationService,
		groupJoinRequestRepository,
		groupBlockedMemberRepository, // Tambahkan parameter baru ini
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
		groupService, // Sekarang groupService sudah diinisialisasi
		pendingPostRepository,
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

	// pinned post service
	groupPinnedPostService := service.NewGroupPinnedPostService(
		groupPinnedPostRepository,
		postRepository,
		groupRepository,
		groupMemberRepository,
		userRepository,
		db,
		validate,
	)

	// Professional info services
	educationService := service.NewEducationService(educationRepository, userRepository, db, validate)
	experienceService := service.NewExperienceService(experienceRepository, userRepository, db, validate)

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
		groupRepository,
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

	adminAuthService := service.NewAdminAuthService(adminRepository, db, validate)

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

	adminAuthController := controller.NewAdminAuthController(adminAuthService)

	// admin report
	adminReportController := controller.NewAdminReportController(reportService)

	// pinned post controller
	groupPinnedPostController := controller.NewGroupPinnedPostController(groupPinnedPostService)

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
		adminAuthController,
		adminReportController,
		groupPinnedPostController,
	)

	seeder.SeedAdmin(db)

	// Create middleware chain
	var handler http.Handler = router
	handler = middleware.NewAdminAuthMiddleware(handler)
	handler = middleware.NewAuthMiddleware(handler, jwtSecret)
	handler = middleware.CORSMiddleware(handler)

	addres := helper.GetEnv("APP_SERVER", "localhost:3000")

	// ===== Start Server =====
	server := http.Server{
		Addr:    addres,
		Handler: handler,
	}
	// http://localhost:5173/
	fmt.Println("\nServer starting on ", addres)
	err := server.ListenAndServe()
	helper.PanicIfError(err)
}
