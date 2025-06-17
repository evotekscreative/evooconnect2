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

	// ===== Server initialization =====
	helper.LoadEnv()
	db := app.NewDB()
	if db == nil {
		log.Fatal("Failed to connect to the database")
		return
	}
	helper.InitTimezone("Asia/Jakarta")
	validate := validator.New()
	utils.InitPusherClient()

	// Initialize JWT dengan secret dari environment
	jwtSecret := helper.GetEnv("JWT_SECRET_KEY", "your-super-secret-jwt-key-at-least-32-characters-long")
	utils.InitJWT(jwtSecret) // Initialize JWT utils dengan secret

	log.Printf("JWT Secret loaded successfully")

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

	// Chat repository
	chatRepository := repository.NewChatRepository()

	// Report repository
	reportRepository := repository.NewReportRepository(db)

	// Notification repository
	notificationRepository := repository.NewNotificationRepository()

	// Admin repository
	adminRepository := repository.NewAdminRepository()

	// Company-related repositories
	companyRepository := repository.NewCompanyRepository()
	companySubmissionRepository := repository.NewCompanySubmissionRepository()
	companyEditRequestRepository := repository.NewCompanyEditRequestRepository()
	memberCompanyRepository := repository.NewMemberCompanyRepository()
	companyJoinRequestRepository := repository.NewCompanyJoinRequestRepository()
	companyPostRepository := repository.NewCompanyPostRepository()
	companyPostCommentRepository := repository.NewCompanyPostCommentRepository()

	// Add company follower repository
	companyFollowerRepository := repository.NewCompanyFollowerRepository()

	// Job-related repositories
	jobVacancyRepository := repository.NewJobVacancyRepository()
	jobApplicationRepository := repository.NewJobApplicationRepository()

	// ===== Services =====
	// Notification service (moved up because it's used by many other services)
	notificationService := service.NewNotificationService(
		notificationRepository,
		userRepository,
		db,
		validate,
	)

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
		connectionRepository,
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

	// Admin auth service
	adminAuthService := service.NewAdminAuthService(adminRepository, db, validate)

	// Member company service
	memberCompanyService := service.NewMemberCompanyService(
		memberCompanyRepository,
		userRepository,
		companyRepository,
		db,
		validate,
	)

	// Company submission service
	companySubmissionService := service.NewCompanySubmissionService(
		companySubmissionRepository,
		companyRepository,
		userRepository,
		memberCompanyRepository,
		adminRepository,
		notificationService,
		db,
		validate,
	)

	// Company follower service
	companyFollowerService := service.NewCompanyFollowerService(
		companyFollowerRepository,
		companyRepository,
		userRepository,
		notificationService,
		db,
		validate,
	)

	// Company management service (updated with follower repository)
	companyManagementService := service.NewCompanyManagementService(
		companyRepository,
		companyEditRequestRepository,
		companyJoinRequestRepository,
		memberCompanyRepository,
		companyFollowerRepository, // Add this parameter
		userRepository,
		adminRepository,
		notificationService,
		db,
		validate,
	)

	companyJoinRequestService := service.NewCompanyJoinRequestService(
		db,
		companyJoinRequestRepository,
		companyRepository,
		userRepository,
		memberCompanyRepository,
		notificationService,
		validate,
	)

	companyPostService := service.NewCompanyPostService(
		db,
		companyPostRepository,
		memberCompanyRepository,
		companyRepository,
		userRepository,
		notificationService,
		validate,
	)

	companyPostCommentService := service.NewCompanyPostCommentService(
		db,
		companyPostCommentRepository,
		companyPostRepository,
		memberCompanyRepository,
		userRepository,
		notificationService,
		validate,
	)

	jobVacancyService := service.NewJobVacancyService(
		jobVacancyRepository,
		companyRepository,
		userRepository,
		db,
		validate,
	)

	jobApplicationService := service.NewJobApplicationService(
		jobApplicationRepository,
		jobVacancyRepository,
		companyRepository,
		memberCompanyRepository,
		userRepository,
		db,
		validate,
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
	commentBlogController := controller.NewCommentBlogController(commentBlogService)

	// Professional info controllers
	educationController := controller.NewEducationController(educationService)
	experienceController := controller.NewExperienceController(experienceService)

	// Group controller
	groupController := controller.NewGroupController(groupService, postService)

	// Chat controller
	chatController := controller.NewChatController(chatService)

	// Report controller
	reportController := controller.NewReportController(reportService)

	// Notification controller
	notificationController := controller.NewNotificationController(notificationService)

	// Search controller
	searchController := controller.NewSearchController(searchService)

	adminAuthController := controller.NewAdminAuthController(adminAuthService)

	// Company submission controller
	companySubmissionController := controller.NewCompanySubmissionController(companySubmissionService)

	companyManagementController := controller.NewCompanyManagementController(companyManagementService)
	adminCompanyEditController := controller.NewAdminCompanyEditController(companyManagementService)

	// Member company controller
	memberCompanyController := controller.NewMemberCompanyController(memberCompanyService)

	companyJoinRequestController := controller.NewCompanyJoinRequestController(companyJoinRequestService)

	companyPostController := controller.NewCompanyPostController(companyPostService)

	companyPostCommentController := controller.NewCompanyPostCommentController(companyPostCommentService)

	// Add company follower controller
	companyFollowerController := controller.NewCompanyFollowerController(companyFollowerService)

	jobVacancyController := controller.NewJobVacancyController(jobVacancyService)
	jobApplicationController := controller.NewJobApplicationController(jobApplicationService)

	// ===== Router and Middleware =====
	// Initialize router with all controllers and JWT secret
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
		companySubmissionController,
		companyManagementController,
		adminCompanyEditController,
		memberCompanyController,
		companyJoinRequestController,
		companyPostController,
		companyPostCommentController,
		companyFollowerController,
		jobVacancyController,
		jobApplicationController,
	)

	// Seed admin data
	seeder.SeedAdmin(db)
	// seeder.SeedAllData(db)

	// Create middleware chain (only CORS needed now since auth is handled per route)
	var handler http.Handler = router
	handler = middleware.CORSMiddleware(handler)

	address := helper.GetEnv("APP_SERVER", "localhost:3000")

	// ===== Start Server =====
	server := http.Server{
		Addr:    address,
		Handler: handler,
	}

	fmt.Println("\nServer starting on ", address)
	err := server.ListenAndServe()
	helper.PanicIfError(err)
}
