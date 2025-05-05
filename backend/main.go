package main

import (
    "evoconnect/backend/app"
    "evoconnect/backend/controller"
    "evoconnect/backend/helper"
    "evoconnect/backend/middleware"
    "evoconnect/backend/repository"
    "evoconnect/backend/service"
    "fmt"
    "net/http"

    "github.com/go-playground/validator/v10"
    _ "github.com/lib/pq"
)

func main() {
    // Load environment variables
    helper.LoadEnv()
    db := app.NewDB()
    validate := validator.New()

    jwtSecret := helper.GetEnv("JWT_SECRET_KEY", "your-secret-key")

    // Initialize user components
    userRepository := repository.NewUserRepository()
    userService := service.NewUserService(userRepository, db, validate)
    userController := controller.NewUserController(userService)

    // Initialize auth components
    authService := service.NewAuthService(userRepository, db, validate, jwtSecret)
    authController := controller.NewAuthController(authService)

    // Initialize blog components
    blogRepository := repository.NewBlogRepository(db)
    blogService := service.NewBlogService(blogRepository)
    blogController := controller.NewBlogController(blogService)

    // Initialize post components
    postRepository := repository.NewPostRepository()
    postService := service.NewPostService(postRepository, db, validate)
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

    // Initialize comment blog components
    commentBlogRepository := repository.NewCommentBlogRepository()
    commentBlogService := service.NewCommentBlogService(commentBlogRepository, blogRepository, userRepository, db, validate)
    commentBlogController := controller.NewCommentBlogController(commentBlogService)

    // Initialize router with all controllers
    router := app.NewRouter(
        authController,
        userController,
        blogController,
        postController,
        commentController,
        educationController,
        experienceController,
        commentBlogController, // Add commentBlogController here
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

    fmt.Println("Server starting on localhost:3000")
    err := server.ListenAndServe()
    helper.PanicIfError(err)
}