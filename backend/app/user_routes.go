package app

import (
	"evoconnect/backend/controller"
	"evoconnect/backend/middleware"

	"github.com/julienschmidt/httprouter"
)

func setupUserRoutes(
	router *httprouter.Router,
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
	groupPinnedPostController controller.GroupPinnedPostController,
	chatController controller.ChatController,
	profileViewController controller.ProfileViewController,
	notificationController controller.NotificationController,
	searchController controller.SearchController,
	companySubmissionController controller.CompanySubmissionController,
	companyManagementController controller.CompanyManagementController,
	memberCompanyController controller.MemberCompanyController,
	companyJoinRequestController controller.CompanyJoinRequestController,
	companyPostController controller.CompanyPostController,
	companyPostCommentController controller.CompanyPostCommentController,
	companyFollowerController controller.CompanyFollowerController,
	jobVacancyController controller.JobVacancyController,
	jobApplicationController controller.JobApplicationController,
	userCvStorageController controller.UserCvStorageController,
	savedJobController controller.SavedJobController,
) {
	// Create user middleware
	userAuth := middleware.NewUserAuthMiddleware()

	// ========== PUBLIC AUTH ROUTES ==========
	router.POST("/api/auth/google", authController.GoogleAuth)
	router.POST("/api/auth/login", authController.Login)
	router.POST("/api/auth/register", authController.Register)
	router.POST("/api/auth/verify/send", authController.SendVerificationEmail)
	router.POST("/api/auth/verify", authController.VerifyEmail)
	router.POST("/api/auth/forgot-password", authController.ForgotPassword)
	router.POST("/api/auth/reset-password", authController.ResetPassword)

	// ========== SAVED JOBS ROUTES ==========
	router.GET("/api/saved-jobs", userAuth(savedJobController.FindSavedJobs))
	router.POST("/api/saved-jobs/:jobVacancyId", userAuth(savedJobController.SaveJob))
	router.DELETE("/api/saved-jobs/:jobVacancyId", userAuth(savedJobController.UnsaveJob))
	router.GET("/api/saved-jobs/:jobVacancyId/status", userAuth(savedJobController.IsJobSaved))

	// ========== PUBLIC JOB VACANCY ROUTES ==========
	// All specific routes MUST come before wildcard routes
	router.GET("/api/jobs/active", jobVacancyController.FindActiveJobs)
	router.GET("/api/jobs/search", jobVacancyController.SearchJobs)
	router.GET("/api/jobs", jobVacancyController.FindAll)

	// Wildcard routes MUST come after all specific routes
	router.GET("/api/job-details/:vacancyId", jobVacancyController.GetPublicJobDetail)

	// ========== PROTECTED USER PROFILE ROUTES ==========
	router.GET("/api/user/profile", userAuth(userController.GetProfile))
	router.PUT("/api/user/profile", userAuth(userController.UpdateProfile))
	router.GET("/api/user-profile/:username", userAuth(userController.GetByUsername))
	router.POST("/api/user/photo", userAuth(userController.UploadPhotoProfile))
	router.DELETE("/api/user/photo", userAuth(userController.DeletePhotoProfile))
	router.GET("/api/user-peoples", userAuth(userController.GetPeoples))

	// ========== BLOG ROUTES ==========
	router.POST("/api/blogs", userAuth(blogController.Create))
	router.GET("/api/blogs", userAuth(blogController.FindAll))
	router.GET("/api/blogs/random", userAuth(blogController.GetRandomBlogs))
	router.GET("/api/blogs/slug/:slug", userAuth(blogController.GetBySlug))
	router.DELETE("/api/blogs/:blogId", userAuth(blogController.Delete))
	router.PUT("/api/blogs/:blogId", userAuth(blogController.Update))
	router.POST("/api/blogs/:blogId/upload-photo", userAuth(blogController.UploadPhoto))

	// ========== BLOG COMMENT ROUTES ==========
	router.POST("/api/blog-comments/:blogId", userAuth(commentBlogController.Create))
	router.GET("/api/blog-comments/:blogId", userAuth(commentBlogController.GetByBlogId))
	router.GET("/api/blog/comments/:commentId", userAuth(commentBlogController.GetById))
	router.PUT("/api/blog/comments/:commentId", userAuth(commentBlogController.Update))
	router.DELETE("/api/blog/comments/:commentId", userAuth(commentBlogController.Delete))
	router.POST("/api/blog/comments/:commentId/replies", userAuth(commentBlogController.Reply))
	router.GET("/api/blog/comments/:commentId/replies", userAuth(commentBlogController.GetReplies))

	// ========== POST ROUTES ==========
	router.POST("/api/posts", userAuth(postController.Create))
	router.GET("/api/posts", userAuth(postController.FindAll))
	router.GET("/api/posts/:postId", userAuth(postController.FindById))
	router.PUT("/api/posts/:postId", userAuth(postController.Update))
	router.DELETE("/api/posts/:postId", userAuth(postController.Delete))

	// Post actions
	router.POST("/api/post-actions/:postId/like", userAuth(postController.LikePost))
	router.DELETE("/api/post-actions/:postId/like", userAuth(postController.UnlikePost))

	// User-specific posts
	router.GET("/api/users/:userId/posts", userAuth(postController.FindByUserId))

	// ========== POST COMMENT ROUTES ==========
	router.POST("/api/post-comments/:postId", userAuth(commentController.Create))
	router.GET("/api/post-comments/:postId", userAuth(commentController.GetByPostId))
	router.GET("/api/comments/:commentId", userAuth(commentController.GetById))
	router.PUT("/api/comments/:commentId", userAuth(commentController.Update))
	router.DELETE("/api/comments/:commentId", userAuth(commentController.Delete))
	router.POST("/api/comments/:commentId/replies", userAuth(commentController.Reply))
	router.GET("/api/comments/:commentId/replies", userAuth(commentController.GetReplies))

	// ========== EDUCATION ROUTES ==========
	router.POST("/api/education", userAuth(educationController.Create))
	router.PUT("/api/education/:educationId", userAuth(educationController.Update))
	router.DELETE("/api/education/:educationId", userAuth(educationController.Delete))
	router.GET("/api/education/:educationId", userAuth(educationController.GetById))
	router.GET("/api/users/:userId/education", userAuth(educationController.GetByUserId))

	// ========== EXPERIENCE ROUTES ==========
	router.POST("/api/experience", userAuth(experienceController.Create))
	router.PUT("/api/experience/:experienceId", userAuth(experienceController.Update))
	router.DELETE("/api/experience/:experienceId", userAuth(experienceController.Delete))
	router.GET("/api/experience/:experienceId", userAuth(experienceController.GetById))
	router.GET("/api/users/:userId/experience", userAuth(experienceController.GetByUserId))

	// ========== CONNECTION ROUTES ==========
	router.GET("/api/connections/requests", userAuth(connectionController.GetConnectionRequests))
	router.PUT("/api/connections/requests/:requestId/accept", userAuth(connectionController.AcceptConnectionRequest))
	router.PUT("/api/connections/requests/:requestId/reject", userAuth(connectionController.RejectConnectionRequest))
	router.DELETE("/api/connections/requests/:toUserId", userAuth(connectionController.CancelConnectionRequest))
	router.GET("/api/users/:userId/connections", userAuth(connectionController.GetConnections))
	router.POST("/api/users/:userId/connect", userAuth(connectionController.SendConnectionRequest))
	router.DELETE("/api/users/:userId/connect", userAuth(connectionController.Disconnect))

	// ========== REPORT ROUTES ==========
	router.POST("/api/reports/:userId/:targetType/:targetId", userAuth(reportController.CreateReportHandler()))

	// ========== GROUP ROUTES ==========
	// Group management
	router.POST("/api/groups", userAuth(groupController.Create))
	router.GET("/api/groups", userAuth(groupController.FindAll))
	router.GET("/api/my-groups", userAuth(groupController.FindMyGroups))
	router.GET("/api/groups/:groupId", userAuth(groupController.FindById))
	router.PUT("/api/groups/:groupId", userAuth(groupController.Update))
	router.DELETE("/api/groups/:groupId", userAuth(groupController.Delete))

	// Group posts
	router.POST("/api/groups/:groupId/posts", userAuth(groupController.CreatePost))
	router.GET("/api/groups/:groupId/posts", userAuth(groupController.GetGroupPosts))
	router.POST("/api/posts/:postId/pin",  userAuth(postController.PinPost))
	router.POST("/api/posts/:postId/unpin",  userAuth(postController.UnpinPost))
	router.GET("/api/groups/:groupId/pinned-posts",  userAuth(groupPinnedPostController.GetPinnedPosts))

	// Group members
	router.POST("/api/groups/:groupId/members/:userId", userAuth(groupController.AddMember))
	router.DELETE("/api/groups/:groupId/members/:userId", userAuth(groupController.RemoveMember))
	router.PUT("/api/groups/:groupId/members/:userId/role", userAuth(groupController.UpdateMemberRole))
	router.GET("/api/groups/:groupId/members", userAuth(groupController.FindMembers))
	router.POST("/api/groups/:groupId/join", userAuth(groupController.JoinGroup))
	router.DELETE("/api/groups/:groupId/leave", userAuth(groupController.LeaveGroup))

	// Group invitations
	router.POST("/api/groups/:groupId/invitations/:userId", userAuth(groupController.CreateInvitation))
	router.PUT("/api/invitations/:invitationId/accept", userAuth(groupController.AcceptInvitation))
	router.PUT("/api/invitations/:invitationId/reject", userAuth(groupController.RejectInvitation))
	router.GET("/api/my-invitations", userAuth(groupController.FindMyInvitations))
	router.DELETE("/api/invitations/:invitationId", userAuth(groupController.CancelInvitation))

	// ========== CHAT ROUTES ==========
	// Conversations
	router.POST("/api/conversations", userAuth(chatController.CreateConversation))
	router.GET("/api/conversations", userAuth(chatController.GetConversations))
	router.GET("/api/conversations/:conversationId", userAuth(chatController.GetConversation))
	router.PUT("/api/conversations/:conversationId/read", userAuth(chatController.MarkConversationAsRead))

	// Messages
	router.POST("/api/conversations/:conversationId/messages", userAuth(chatController.SendMessage))
	router.POST("/api/conversations/:conversationId/files", userAuth(chatController.SendFileMessage))
	router.GET("/api/conversations/:conversationId/messages", userAuth(chatController.GetMessages))
	router.PUT("/api/messages/:messageId", userAuth(chatController.UpdateMessage))
	router.DELETE("/api/messages/:messageId", userAuth(chatController.DeleteMessage))

	// Pusher authentication
	router.POST("/api/pusher/auth", userAuth(chatController.AuthPusher))

	// ========== PROFILE VIEW ROUTES ==========
	router.GET("/api/user/profile/views/this-week", userAuth(profileViewController.GetViewsThisWeek))
	router.GET("/api/user/profile/views/last-week", userAuth(profileViewController.GetViewsLastWeek))

	// ========== NOTIFICATION ROUTES ==========
	router.GET("/api/notifications", userAuth(notificationController.GetNotifications))
	router.POST("/api/notifications/mark-read", userAuth(notificationController.MarkAsRead))
	router.POST("/api/notifications/mark-all-read", userAuth(notificationController.MarkAllAsRead))
	router.DELETE("/api/notifications", userAuth(notificationController.DeleteNotifications))
	router.DELETE("/api/notifications/selected", userAuth(notificationController.DeleteSelectedNotifications))

	// ========== SEARCH ROUTES ==========
	router.GET("/api/search", userAuth(searchController.Search))

	// ========== COMPANY SUBMISSION ROUTES ==========
	router.POST("/api/company/submissions", userAuth(companySubmissionController.Create))
	router.GET("/api/company/submissions/my", userAuth(companySubmissionController.FindByUserId))
	router.GET("/api/company/submission/:submissionId", userAuth(companySubmissionController.FindById))
	router.DELETE("/api/company/submission/:submissionId", userAuth(companySubmissionController.Delete))

	// ========== COMPANY MANAGEMENT ROUTES ==========
	// Specific routes first
	router.GET("/api/companies", userAuth(companyManagementController.GetAllCompanies))
	router.GET("/api/my-companies", userAuth(companyManagementController.GetMyCompanies))
	router.GET("/api/my-company-edit-requests", userAuth(companyManagementController.GetMyEditRequests))

	// Company-specific routes
	router.GET("/api/companies/:companyId/details", userAuth(companyManagementController.GetCompanyDetail))
	router.GET("/api/companies/:companyId/member-companies", userAuth(memberCompanyController.GetMembersByCompanyId))
	router.DELETE("/api/companies/:companyId", userAuth(companyManagementController.DeleteCompany))
	router.POST("/api/companies/:companyId/request-edit", userAuth(companyManagementController.RequestEdit))
	router.DELETE("/api/companies/:companyId/request-edit", userAuth(companyManagementController.DeleteCompanyEditRequest))

	// ========== MEMBER COMPANY ROUTES ==========
	router.GET("/api/member-companies/:memberCompanyId", userAuth(memberCompanyController.GetMemberByID))
	router.PUT("/api/member-companies/:memberCompanyId/role", userAuth(memberCompanyController.UpdateMemberRole))
	router.PUT("/api/member-companies/:memberCompanyId/status", userAuth(memberCompanyController.UpdateMemberStatus))
	router.DELETE("/api/member-companies/:memberCompanyId", userAuth(memberCompanyController.RemoveMember))
	router.DELETE("/api/member-companies/:memberCompanyId/leave", userAuth(memberCompanyController.LeaveCompany))

	// ========== COMPANY JOIN REQUEST ROUTES ==========
	router.POST("/api/companies/:companyId/join-request", userAuth(companyJoinRequestController.Create))
	router.GET("/api/my-company-join-requests", userAuth(companyJoinRequestController.FindMyRequests))
	router.GET("/api/companies/:companyId/join-requests", userAuth(companyJoinRequestController.FindByCompanyId))
	router.GET("/api/companies/:companyId/join-requests/pending-count", userAuth(companyJoinRequestController.GetPendingCount))
	router.PUT("/api/company-join-requests/:requestId/review", userAuth(companyJoinRequestController.Review))
	router.DELETE("/api/company-join-requests/:requestId", userAuth(companyJoinRequestController.Cancel))

	// ========== COMPANY POST ROUTES ==========
	// Company posts management
	router.POST("/api/companies/:companyId/posts", userAuth(companyPostController.Create))
	router.GET("/api/companies/:companyId/posts", userAuth(companyPostController.FindByCompanyId))
	router.GET("/api/company-posts", userAuth(companyPostController.FindWithFilters))
	router.GET("/api/company-posts/:postId", userAuth(companyPostController.FindById))
	router.PUT("/api/company-posts/:postId", userAuth(companyPostController.Update))
	router.DELETE("/api/company-posts/:postId", userAuth(companyPostController.Delete))
	router.GET("/api/users/:userId/company-posts", userAuth(companyPostController.FindByCreatorId))

	// Company post actions
	router.POST("/api/company-posts/:postId/like", userAuth(companyPostController.LikePost))
	router.DELETE("/api/company-posts/:postId/like", userAuth(companyPostController.UnlikePost))

	// ========== COMPANY POST COMMENT ROUTES ==========
	// Comment creation
	router.POST("/api/company-posts/:postId/comments", userAuth(companyPostCommentController.CreateComment))
	router.GET("/api/company-posts/:postId/comments", userAuth(companyPostCommentController.GetCommentsByPostId))
	router.POST("/api/company-posts/:postId/comments/reply", userAuth(companyPostCommentController.CreateReply))
	router.POST("/api/company-posts/:postId/comments/sub-reply", userAuth(companyPostCommentController.CreateSubReply))

	// Comment management
	router.GET("/api/company-post-comments/:commentId", userAuth(companyPostCommentController.FindById))
	router.PUT("/api/company-post-comments/:commentId", userAuth(companyPostCommentController.Update))
	router.DELETE("/api/company-post-comments/:commentId", userAuth(companyPostCommentController.Delete))
	router.GET("/api/company-post-comments/:commentId/replies", userAuth(companyPostCommentController.GetRepliesByParentId))

	// ========== COMPANY FOLLOWER ROUTES ==========
	router.POST("/api/company-follow/follow", userAuth(companyFollowerController.FollowCompany))
	router.POST("/api/company-follow/unfollow", userAuth(companyFollowerController.UnfollowCompany))
	router.GET("/api/company-follow/:companyId/followers", companyFollowerController.GetCompanyFollowers)
	router.GET("/api/company-follow/:companyId/status", userAuth(companyFollowerController.CheckFollowStatus))
	router.GET("/api/user/following-companies", userAuth(companyFollowerController.GetUserFollowingCompanies))

	// ========== CV STORAGE ROUTES ==========
	// User CV management
	router.POST("/api/user/cv", userAuth(userCvStorageController.UploadCv))
	router.GET("/api/user/cv", userAuth(userCvStorageController.GetUserCv))
	router.DELETE("/api/user/cv", userAuth(userCvStorageController.DeleteCv))

	// Admin/HR access to user CVs
	router.POST("/api/users/:userId/cv", userAuth(userCvStorageController.UploadCv))
	router.GET("/api/users/:userId/cv", userAuth(userCvStorageController.GetUserCv))
	router.DELETE("/api/users/:userId/cv", userAuth(userCvStorageController.DeleteCv))
	router.GET("/api/users/:userId/cv/download", userAuth(userCvStorageController.DownloadCv))

	// ========== PROTECTED JOB VACANCY ROUTES ==========
	// User's job vacancy management
	router.GET("/api/user/job-vacancies", userAuth(jobVacancyController.FindByCreatorId))

	// Company job vacancy management
	router.POST("/api/companies/:companyId/jobs", userAuth(jobVacancyController.Create))
	router.GET("/api/companies/:companyId/jobs", userAuth(jobVacancyController.FindByCompanyId))

	// Job vacancy operations - specific routes first
	router.PUT("/api/job-vacancies/:jobVacancyId/status", userAuth(jobVacancyController.UpdateStatus))
	router.PUT("/api/job-vacancies/:jobVacancyId", userAuth(jobVacancyController.Update))
	router.DELETE("/api/job-vacancies/:jobVacancyId", userAuth(jobVacancyController.Delete))
	router.GET("/api/job-vacancies/:jobVacancyId", userAuth(jobVacancyController.FindById))

	// ========== JOB APPLICATION ROUTES ==========
	// IMPORTANT: Use separate namespaces to avoid ALL conflicts

	// Application search and stats
	router.GET("/api/job-app-search", userAuth(jobApplicationController.FindWithFilters))
	router.GET("/api/job-app-stats", userAuth(jobApplicationController.GetStats))

	// User's job applications
	router.GET("/api/my-applications", userAuth(jobApplicationController.FindByApplicant))
	router.GET("/api/users/:userId/job-applications", userAuth(jobApplicationController.FindByApplicant))

	// Company job application management
	router.GET("/api/companies/:companyId/job-applications", userAuth(jobApplicationController.FindByCompany))
	router.GET("/api/companies/:companyId/app-stats", userAuth(jobApplicationController.GetStats))

	// Job vacancy specific routes
	router.GET("/api/job-vacancies/:jobVacancyId/my-app-status", userAuth(jobApplicationController.CheckApplicationStatus))
	router.GET("/api/job-vacancies/:jobVacancyId/applicants", userAuth(jobApplicationController.FindByJobVacancy))
	router.POST("/api/job-applications/:jobVacancyId/apply", userAuth(jobApplicationController.Create))

	// Individual job application operations - Use separate namespace
	router.GET("/api/job-applications/:applicationId", userAuth(jobApplicationController.FindById))
	router.PUT("/api/job-applications/:applicationId", userAuth(jobApplicationController.Update))
	router.PUT("/api/job-app/:applicationId/review", userAuth(jobApplicationController.ReviewApplication))
	router.DELETE("/api/job-app/:applicationId", userAuth(jobApplicationController.Delete))
}
