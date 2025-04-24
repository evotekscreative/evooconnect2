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
	postController controller.PostController,
) *httprouter.Router {
	router := httprouter.New()

	// Auth routes
	router.POST("/api/auth/login", authController.Login)
	router.POST("/api/auth/register", authController.Register)
	router.POST("/api/auth/verify/send", authController.SendVerificationEmail)
	router.POST("/api/auth/verify", authController.VerifyEmail)
	router.POST("/api/auth/forgot-password", authController.ForgotPassword)
	router.POST("/api/auth/reset-password", authController.ResetPassword)

	router.GET("/api/user/profile", userController.GetProfile)
	router.PUT("/api/user/profile", userController.UpdateProfile)

	router.POST("/api/posts", postController.Create)
	router.GET("/api/posts", postController.FindAll)
	router.GET("/api/posts/:postId", postController.FindById)
	router.PUT("/api/posts/:postId", postController.Update)
	router.DELETE("/api/posts/:postId", postController.Delete)
	router.GET("/api/users/:userId/posts", postController.FindByUserId)
	router.POST("/api/posts/:postId/like", postController.LikePost)
	router.DELETE("/api/posts/:postId/like", postController.UnlikePost)

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
