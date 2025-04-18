package main

import (
	"evoconnect/backend/app"
	"evoconnect/backend/controller"
	"evoconnect/backend/helper"
	"evoconnect/backend/middleware"
	"evoconnect/backend/repository"
	"evoconnect/backend/service"
	"net/http"

	"github.com/go-playground/validator/v10"
	_ "github.com/lib/pq"
)

func main() {
	helper.LoadEnv()
	db := app.NewDB()
	validate := validator.New()

	jwtSecret := helper.GetEnv("JWT_SECRET_KEY", "your-secret-key")

	userRepository := repository.NewUserRepository()
	authService := service.NewAuthService(userRepository, db, validate, jwtSecret)
	authController := controller.NewAuthController(authService)

	categoryRepository := repository.NewCategoryRepository()
	categoryService := service.NewCategoryService(categoryRepository, db, validate)
	categoryController := controller.NewCategoryController(categoryService)

	router := app.NewRouter(categoryController, authController)

	// Menggunakan jwtSecret yang sama untuk middleware
	authMiddleware := middleware.NewSelectiveAuthMiddleware(router, jwtSecret) // Use the new middleware

	server := http.Server{
		Addr:    "localhost:3000",
		Handler: authMiddleware,
	}

	err := server.ListenAndServe()
	helper.PanicIfError(err)
}
