package app

import (
	"evoconnect/backend/controller"
	"evoconnect/backend/middleware"

	"github.com/julienschmidt/httprouter"
)

func setupAdminRoutes(
	router *httprouter.Router,
	adminAuthController controller.AdminAuthController,
	companySubmissionController controller.CompanySubmissionController,
) {
	// Create admin middleware
	adminAuth := middleware.NewAdminAuthMiddleware()

	// Public admin auth routes (no middleware needed)
	router.POST("/api/admin/auth/login", adminAuthController.Login)
	router.POST("/api/admin/auth/register", adminAuthController.Register)

	// Protected admin routes (require admin authentication)
	// Company submission management routes
	router.GET("/api/admin/company/submissions", adminAuth(companySubmissionController.FindAll))
	router.GET("/api/admin/company/submissions/stats", adminAuth(companySubmissionController.GetStats))
	router.GET("/api/admin/company/submissions/status/:status", adminAuth(companySubmissionController.FindByStatus))
	router.PUT("/api/admin/company/submission/:submissionId/review", adminAuth(companySubmissionController.Review))

	// Add more admin routes here as needed
	// Examples:
	// router.GET("/api/admin/users", adminAuth(adminUserController.GetAllUsers))
	// router.PUT("/api/admin/users/:userId/status", adminAuth(adminUserController.UpdateUserStatus))
	// router.GET("/api/admin/reports", adminAuth(adminReportController.GetAllReports))
	// router.PUT("/api/admin/reports/:reportId/resolve", adminAuth(adminReportController.ResolveReport))
	// router.GET("/api/admin/analytics", adminAuth(adminAnalyticsController.GetAnalytics))
}
