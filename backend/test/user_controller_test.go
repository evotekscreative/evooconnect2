package test

import (
	"database/sql"
	"encoding/json"
	"evoconnect/backend/app"
	"evoconnect/backend/controller"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/middleware"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/repository"
	"evoconnect/backend/service"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"

	// "github.com/go-playground/validator/v10"
	"github.com/julienschmidt/httprouter"
	_ "github.com/lib/pq"
	"github.com/stretchr/testify/assert"
)

func setupUserTestDB() *sql.DB {
	config := app.GetDatabaseConfig()
	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		config.Host, config.Port, config.User, config.Password, config.DbName, config.SSLMode)
	db, err := sql.Open("postgres", dsn)
	helper.PanicIfError(err)

	db.SetMaxIdleConns(5)
	db.SetMaxOpenConns(20)
	db.SetConnMaxLifetime(60 * time.Minute)
	db.SetConnMaxIdleTime(10 * time.Minute)

	return db
}

func truncateUsersTable(db *sql.DB) {
	// Clear users table before each test
	db.Exec("TRUNCATE TABLE users RESTART IDENTITY CASCADE")
}

func createUserForTest(db *sql.DB) domain.User {
	// Insert test user into database
	user := domain.User{
		Name:       "Test User",
		Email:      "test.user@example.com",
		Password:   "hashedpassword", // In real app, this would be hashed
		IsVerified: true,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	var userId uuid.UUID
	err := db.QueryRow(`
        INSERT INTO users(name, email, password, is_verified, created_at, updated_at) 
        VALUES($1, $2, $3, $4, $5, $6) 
        RETURNING id`,
		user.Name, user.Email, user.Password, user.IsVerified, user.CreatedAt, user.UpdatedAt).Scan(&userId)
	helper.PanicIfError(err)

	user.Id = userId
	return user
}

func createJWTToken(userId uuid.UUID) string {
	// Create JWT token for testing
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userId,
		"email":   "test.user@example.com",
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	})

	tokenString, _ := token.SignedString([]byte("test-secret-key"))
	return tokenString
}

func setupUserRouter(db *sql.DB) http.Handler {
	validate := validator.New()
	// User dependencies
	userRepository := repository.NewUserRepository()
	userService := service.NewUserService(userRepository, db, validate)
	userController := controller.NewUserController(userService)

	// Create router
	router := httprouter.New()

	// Register user routes
	router.GET("/api/user/profile", userController.GetProfile)

	// Add panic handler
	router.PanicHandler = exception.ErrorHandler

	// Create middleware with JWT auth
	middleware := middleware.NewAuthMiddleware(router, "test-secret-key")

	return middleware
}

func TestGetProfileSuccess(t *testing.T) {
	// Setup database and router
	db := setupUserTestDB()
	truncateUsersTable(db) // Fixed: using renamed function
	router := setupUserRouter(db)

	// Create test user
	user := createUserForTest(db)
	jwtToken := createJWTToken(user.Id)

	// Create request
	request := httptest.NewRequest(http.MethodGet, "http://localhost:3000/api/user/profile", nil)
	request.Header.Add("Authorization", "Bearer "+jwtToken)

	// Record response
	recorder := httptest.NewRecorder()

	// Execute request
	router.ServeHTTP(recorder, request)

	// Read response
	response := recorder.Result()
	assert.Equal(t, 200, response.StatusCode)

	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	// Output response for debugging if test fails
	if response.StatusCode != 200 {
		t.Logf("Profile Response: %v", string(body))
	}

	// Assertions
	assert.Equal(t, 200, int(responseBody["code"].(float64)))
	assert.Equal(t, "OK", responseBody["status"])
	assert.NotNil(t, responseBody["data"])

	// Check user data in response
	data := responseBody["data"].(map[string]interface{})
	assert.Equal(t, user.Id.String(), data["id"].(string))
	assert.Equal(t, user.Name, data["name"])
	assert.Equal(t, user.Email, data["email"])
	assert.Equal(t, user.IsVerified, data["is_verified"])
	assert.NotContains(t, data, "password") // Password should not be returned
}

func TestGetProfileUnauthorized(t *testing.T) {
	// Setup database and router
	db := setupUserTestDB()
	truncateUsersTable(db) // Fixed: using renamed function
	router := setupUserRouter(db)

	// Create request without token
	request := httptest.NewRequest(http.MethodGet, "http://localhost:3000/api/user/profile", nil)
	// No Authorization header added

	// Record response
	recorder := httptest.NewRecorder()

	// Execute request
	router.ServeHTTP(recorder, request)

	// Read response
	response := recorder.Result()
	assert.Equal(t, 401, response.StatusCode)

	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	// Assertions for unauthorized response
	assert.Equal(t, 401, int(responseBody["code"].(float64)))
	assert.Equal(t, "UNAUTHORIZED", responseBody["status"])
}

func TestGetProfileWithInvalidToken(t *testing.T) {
	// Setup database and router
	db := setupUserTestDB()
	truncateUsersTable(db) // Fixed: using renamed function
	router := setupUserRouter(db)

	// Create request with invalid token
	request := httptest.NewRequest(http.MethodGet, "http://localhost:3000/api/user/profile", nil)
	request.Header.Add("Authorization", "Bearer invalid.token.format")

	// Record response
	recorder := httptest.NewRecorder()

	// Execute request
	router.ServeHTTP(recorder, request)

	// Read response
	response := recorder.Result()
	assert.Equal(t, 401, response.StatusCode)

	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	// Assertions for invalid token response
	assert.Equal(t, 401, int(responseBody["code"].(float64)))
	assert.Equal(t, "UNAUTHORIZED", responseBody["status"])
}
