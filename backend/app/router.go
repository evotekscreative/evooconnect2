package app

import (
	"evoconnect/backend/controller"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func NewRouter(
	authController controller.AuthController,
	userController controller.UserController,
	blogController controller.BlogController,
	postController controller.PostController,
	commentController controller.CommentController,
	educationController controller.EducationController,
	experienceController controller.ExperienceController,
	commentBlogController controller.CommentBlogController,
	connectionController controller.ConnectionController,
	reportController controller.ReportController,
	groupController controller.GroupController,
	chatController controller.ChatController,
	profileViewController controller.ProfileViewController,
	notificationController controller.NotificationController,
	searchController controller.SearchController,
	adminAuthController controller.AdminAuthController,
	companySubmissionController controller.CompanySubmissionController,
) *httprouter.Router {
	router := httprouter.New()

	// Setup user routes
	setupUserRoutes(
		router,
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
		companySubmissionController,
	)

	// Setup admin routes
	setupAdminRoutes(
		router,
		adminAuthController,
		companySubmissionController,
	)

	// Static file servers
	setupStaticRoutes(router)

	// Setup error handlers
	setupErrorHandlers(router)

	return router
}

func setupStaticRoutes(router *httprouter.Router) {
	uploadFS := http.FileServer(http.Dir("uploads"))
	publicFS := http.FileServer(http.Dir("public"))

	// Add custom file server handler to serve static files
	router.GET("/uploads/*filepath", func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
		// Remove /uploads prefix from path
		r.URL.Path = ps.ByName("filepath")

		// Set headers for browser caching
		w.Header().Set("Cache-Control", "public, max-age=31536000")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		// Serve the file
		uploadFS.ServeHTTP(w, r)
	})

	router.GET("/public/*filepath", func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
		// Remove /public prefix from path
		r.URL.Path = ps.ByName("filepath")

		// Set headers for browser caching
		w.Header().Set("Cache-Control", "public, max-age=31536000")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		// Serve the file
		publicFS.ServeHTTP(w, r)
	})
}

func setupErrorHandlers(router *httprouter.Router) {
	// Add custom NotFound handler
	router.NotFound = http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusNotFound)

		webResponse := web.WebResponse{
			Code:   http.StatusNotFound,
			Status: "NOT FOUND",
			Data:   "Resource not found",
		}

		helper.WriteToResponseBody(writer, webResponse)
	})

	router.PanicHandler = exception.ErrorHandler
}
