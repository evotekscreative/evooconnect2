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
	connectionController controller.ConnectionController,
	groupController controller.GroupController,
) *httprouter.Router {
	router := httprouter.New()

	// Auth routes - all static paths
	router.POST("/api/auth/google", authController.GoogleAuth)
	router.POST("/api/auth/login", authController.Login)
	router.POST("/api/auth/register", authController.Register)
	router.POST("/api/auth/verify/send", authController.SendVerificationEmail)
	router.POST("/api/auth/verify", authController.VerifyEmail)
	router.POST("/api/auth/forgot-password", authController.ForgotPassword)
	router.POST("/api/auth/reset-password", authController.ResetPassword)

	// User routes - all static paths
	router.GET("/api/user/profile", userController.GetProfile)
	router.PUT("/api/user/profile", userController.UpdateProfile)
	router.GET("/api/user-profile/:username", userController.GetByUsername)
	router.POST("/api/user/photo", userController.UploadPhotoProfile)
	router.GET("/api/user-peoples", userController.GetPeoples)

	// Blog routes - static paths first
	router.POST("/api/blogs", blogController.Create)
	router.GET("/api/blogs", blogController.FindAll)

	// Post routes - static paths first
	router.POST("/api/posts/images", postController.UploadImages)
	router.POST("/api/posts", postController.Create)
	router.GET("/api/posts", postController.FindAll)

	// Comment routes - static paths only
	router.GET("/api/comments/:commentId", commentController.GetById)
	router.PUT("/api/comments/:commentId", commentController.Update)
	router.DELETE("/api/comments/:commentId", commentController.Delete)
	router.POST("/api/comments/:commentId/replies", commentController.Reply)
	router.GET("/api/comments/:commentId/replies", commentController.GetReplies)

	// Education routes - static paths first
	router.POST("/api/education", educationController.Create)
	router.POST("/api/education/photo", educationController.UploadPhoto)

	// Experience routes - static paths first
	router.POST("/api/experience", experienceController.Create)
	router.POST("/api/experience/photo", experienceController.UploadPhoto)

	// Blog routes with parameters
	router.GET("/api/blogs/slug/:slug", blogController.GetBySlug)
	router.DELETE("/api/blogs/:blogId", blogController.Delete)
	router.PUT("/api/blogs/:blogId", blogController.Update)
	router.GET("/api/blogs/random", blogController.GetRandomBlogs)

	// blog routes static paths first
	router.POST("/api/blogs/:blogId/upload-photo", blogController.UploadPhoto)

	// Education routes with parameters
	router.PUT("/api/education/:educationId", educationController.Update)
	router.DELETE("/api/education/:educationId", educationController.Delete)
	router.GET("/api/education/:educationId", educationController.GetById)
	router.GET("/api/users/:userId/education", educationController.GetByUserId)

	// Experience routes with parameters
	router.PUT("/api/experience/:experienceId", experienceController.Update)
	router.DELETE("/api/experience/:experienceId", experienceController.Delete)
	router.GET("/api/experience/:experienceId", experienceController.GetById)
	router.GET("/api/users/:userId/experience", experienceController.GetByUserId)

	// Post like routes - carefully ordered to avoid conflicts
	router.POST("/api/post-actions/:postId/like", postController.LikePost)
	router.DELETE("/api/post-actions/:postId/like", postController.UnlikePost)

	// Post comment routes - carefully ordered to avoid conflicts
	router.POST("/api/post-comments/:postId", commentController.Create)
	router.GET("/api/post-comments/:postId", commentController.GetByPostId)

	// User post routes
	router.GET("/api/users/:userId/posts", postController.FindByUserId)

	// Post routes with parameters - last because they're most generic
	router.GET("/api/posts/:postId", postController.FindById)
	router.PUT("/api/posts/:postId", postController.Update)
	router.DELETE("/api/posts/:postId", postController.Delete)

	router.GET("/api/connections/requests", connectionController.GetConnectionRequests)
	router.PUT("/api/connections/requests/:requestId/accept", connectionController.AcceptConnectionRequest)
	router.PUT("/api/connections/requests/:requestId/reject", connectionController.RejectConnectionRequest)
	router.GET("/api/users/:userId/connections", connectionController.GetConnections)
	router.POST("/api/users/:userId/connect", connectionController.SendConnectionRequest)

	router.POST("/api/groups", groupController.Create)
	router.GET("/api/groups", groupController.FindAll)
	router.GET("/api/my-groups", groupController.FindMyGroups)
	router.GET("/api/groups/:groupId", groupController.FindById)
	router.PUT("/api/groups/:groupId", groupController.Update)
	router.DELETE("/api/groups/:groupId", groupController.Delete)
	router.POST("/api/groups/:groupId/photo", groupController.UploadPhoto)

	// Group member management routes
	router.POST("/api/groups/:groupId/members/:userId", groupController.AddMember)
	router.DELETE("/api/groups/:groupId/members/:userId", groupController.RemoveMember)
	router.PUT("/api/groups/:groupId/members/:userId/role", groupController.UpdateMemberRole)
	router.GET("/api/groups/:groupId/members", groupController.FindMembers)

	// Group invitation management routes
	router.POST("/api/groups/:groupId/invitations/:userId", groupController.CreateInvitation)
	router.PUT("/api/invitations/:invitationId/accept", groupController.AcceptInvitation)
	router.PUT("/api/invitations/:invitationId/reject", groupController.RejectInvitation)
	router.GET("/api/my-invitations", groupController.FindMyInvitations)

	uploadFS := http.FileServer(http.Dir("uploads"))

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

	return router
}
