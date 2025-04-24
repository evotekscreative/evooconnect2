package test

import (
	"database/sql"
	"encoding/json"
	"evoconnect/backend/app"
	"evoconnect/backend/controller"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/middleware"
	"evoconnect/backend/repository"
	"evoconnect/backend/service"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/julienschmidt/httprouter"
	_ "github.com/lib/pq"
	"github.com/stretchr/testify/assert"
)

func setupAuthTestDB() *sql.DB {
	config := app.GetDatabaseConfig()
	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		config.Host, config.Port, config.User, config.Password, config.DbName, config.SSLMode)
	db, err := sql.Open("postgres", dsn)
	helper.PanicIfError(err)

	db.SetMaxIdleConns(5)
	db.SetMaxOpenConns(20)
	db.SetConnMaxLifetime(60 * time.Minute)
	db.SetConnMaxIdleTime(10 * time.Minute)

	// Create/update required tables
	_, err = db.Exec(`
        -- Create users table if not exists
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            username VARCHAR(255) UNIQUE,
            password VARCHAR(255) NOT NULL,
            is_verified BOOLEAN DEFAULT FALSE,
            verification_token VARCHAR(255),
            verification_expires TIMESTAMP,
            reset_token VARCHAR(255),
            reset_expires TIMESTAMP,
            skills JSONB,
            socials JSONB, 
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        -- Create failed_attempts table if not exists
        CREATE TABLE IF NOT EXISTS failed_attempts (
            id SERIAL PRIMARY KEY,
            ip_address VARCHAR(255) NOT NULL,
            action_type VARCHAR(50) NOT NULL,
            token VARCHAR(255),
            attempt_time TIMESTAMP NOT NULL DEFAULT NOW()
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_failed_attempts_ip ON failed_attempts(ip_address, action_type, attempt_time);
    `)
	helper.PanicIfError(err)

	return db
}

func truncateUsers(db *sql.DB) {
	// Clear both tables before each test
	db.Exec("TRUNCATE TABLE users RESTART IDENTITY CASCADE")
	db.Exec("TRUNCATE TABLE failed_attempts RESTART IDENTITY CASCADE")
}

func setupAuthRouter() http.Handler {
	db := setupAuthTestDB()
	validate := validator.New()

	userRepository := repository.NewUserRepository()
	authService := service.NewAuthService(userRepository, db, validate, "test-jwt-secret")
	authController := controller.NewAuthController(authService)

	router := httprouter.New()

	// Register auth routes
	router.POST("/api/auth/login", authController.Login)
	router.POST("/api/auth/register", authController.Register)
	router.POST("/api/auth/verify/send", authController.SendVerificationEmail)
	router.POST("/api/auth/verify", authController.VerifyEmail)
	router.POST("/api/auth/forgot-password", authController.ForgotPassword)
	router.POST("/api/auth/reset-password", authController.ResetPassword)

	// Add error handler
	router.PanicHandler = exception.ErrorHandler

	// Create middleware with public paths
	middleware := middleware.NewAuthMiddleware(router, "test-jwt-secret")

	return middleware
}

// Mock email sender for testing
func setupEmailTest() {
	// Override the email sender to capture emails instead of sending them
	helper.EmailSender = func(to, subject, body string) error {
		// Just log or store the email information for assertions
		return nil
	}
}

func TestRegisterSuccess(t *testing.T) {
	// Setup email test first to prevent actual emails being sent
	setupEmailTest()

	// Setup database and router
	db := setupAuthTestDB()
	truncateUsers(db)
	router := setupAuthRouter()

	// Create request body
	requestBody := map[string]interface{}{
		"name":     "John Doe",
		"email":    "john.doe@example.com",
		"password": "password123",
	}
	requestBodyJson, _ := json.Marshal(requestBody)

	// Create request
	request := httptest.NewRequest(http.MethodPost, "/api/auth/register",
		strings.NewReader(string(requestBodyJson)))
	request.Header.Set("Content-Type", "application/json")

	// Record response
	recorder := httptest.NewRecorder()

	// Execute request
	router.ServeHTTP(recorder, request)

	// Read response
	response := recorder.Result()
	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	// Assertions
	assert.Equal(t, 201, response.StatusCode)
	assert.Equal(t, float64(201), responseBody["code"].(float64))
	assert.Equal(t, "CREATED", responseBody["status"])
	assert.NotNil(t, responseBody["data"])

	// Check user data in response
	data := responseBody["data"].(map[string]interface{})
	assert.NotEmpty(t, data["token"])

	user := data["user"].(map[string]interface{})
	assert.Equal(t, "John Doe", user["name"])
	assert.Equal(t, "john.doe@example.com", user["email"])
	assert.NotContains(t, user, "password") // Password should not be returned

	// Verify database state
	var dbUser struct {
		ID         string
		Name       string
		Email      string
		Password   string
		IsVerified bool
		CreatedAt  time.Time
		UpdatedAt  time.Time
	}

	err := db.QueryRow(`
        SELECT id, name, email, password, is_verified, created_at, updated_at 
        FROM users 
        WHERE email = $1`,
		"john.doe@example.com",
	).Scan(
		&dbUser.ID,
		&dbUser.Name,
		&dbUser.Email,
		&dbUser.Password,
		&dbUser.IsVerified,
		&dbUser.CreatedAt,
		&dbUser.UpdatedAt,
	)

	assert.NoError(t, err, "Failed to query user from database")
	assert.Equal(t, "John Doe", dbUser.Name)
	assert.Equal(t, "john.doe@example.com", dbUser.Email)
	assert.NotEmpty(t, dbUser.Password)
	assert.NotEqual(t, "password123", dbUser.Password) // Password should be hashed
	assert.False(t, dbUser.IsVerified)
	assert.False(t, dbUser.CreatedAt.IsZero())
	assert.False(t, dbUser.UpdatedAt.IsZero())
}

func TestRegisterValidationError(t *testing.T) {
	// Setup
	setupEmailTest()
	db := setupAuthTestDB()
	truncateUsers(db)
	router := setupAuthRouter()

	// Test with missing required fields
	requestBody := map[string]interface{}{
		"name": "Invalid User",
		// Missing email and password
	}
	requestBodyJson, _ := json.Marshal(requestBody)

	request := httptest.NewRequest(http.MethodPost, "/api/auth/register",
		strings.NewReader(string(requestBodyJson)))
	request.Header.Set("Content-Type", "application/json")

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	response := recorder.Result()
	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	// Verify validation error response
	assert.Equal(t, 400, response.StatusCode)
	assert.Equal(t, float64(400), responseBody["code"].(float64))
	assert.Equal(t, "BAD REQUEST", responseBody["status"])

	// Check validation errors
	errors := responseBody["data"].(map[string]interface{})
	assert.Contains(t, errors, "Email")
	assert.Contains(t, errors, "Password")
}

func TestRegisterDuplicateEmail(t *testing.T) {
	// Setup
	setupEmailTest()
	db := setupAuthTestDB()
	truncateUsers(db)
	router := setupAuthRouter()

	// Register first user
	requestBody := map[string]interface{}{
		"name":     "First User",
		"email":    "duplicate@example.com",
		"password": "password123",
	}
	requestJson, _ := json.Marshal(requestBody)

	firstRequest := httptest.NewRequest(http.MethodPost, "/api/auth/register",
		strings.NewReader(string(requestJson)))
	firstRequest.Header.Set("Content-Type", "application/json")

	firstRecorder := httptest.NewRecorder()
	router.ServeHTTP(firstRecorder, firstRequest)
	assert.Equal(t, 201, firstRecorder.Result().StatusCode)

	// Try to register with same email
	secondRequest := httptest.NewRequest(http.MethodPost, "/api/auth/register",
		strings.NewReader(string(requestJson)))
	secondRequest.Header.Set("Content-Type", "application/json")

	secondRecorder := httptest.NewRecorder()
	router.ServeHTTP(secondRecorder, secondRequest)

	response := secondRecorder.Result()
	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	// Verify conflict response
	assert.Equal(t, 409, response.StatusCode) // or whatever your API returns for conflicts
	assert.Equal(t, "CONFLICT", responseBody["status"])
}

func TestLoginSuccess(t *testing.T) {
	// Setup
	db := setupAuthTestDB()
	truncateUsers(db)
	router := setupAuthRouter()

	// Register a user first for login test
	registerBody := map[string]interface{}{
		"name":     "John Doe",
		"email":    "john.doe@example.com",
		"password": "password123",
	}
	registerJson, _ := json.Marshal(registerBody)

	registerReq := httptest.NewRequest(http.MethodPost, "/api/auth/register",
		strings.NewReader(string(registerJson)))
	registerReq.Header.Add("Content-Type", "application/json")

	registerRec := httptest.NewRecorder()
	router.ServeHTTP(registerRec, registerReq)

	// Ensure registration was successful
	assert.Equal(t, 201, registerRec.Result().StatusCode)

	// Verify the user's email
	_, err := db.Exec("UPDATE users SET is_verified = true WHERE email = $1",
		"john.doe@example.com")
	assert.NoError(t, err)

	// Create login request
	loginBody := map[string]interface{}{
		"email":    "john.doe@example.com",
		"password": "password123",
	}
	loginJson, _ := json.Marshal(loginBody)

	loginReq := httptest.NewRequest(http.MethodPost, "/api/auth/login",
		strings.NewReader(string(loginJson)))
	loginReq.Header.Add("Content-Type", "application/json")

	loginRec := httptest.NewRecorder()
	router.ServeHTTP(loginRec, loginReq)

	// Read response
	response := loginRec.Result()
	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	// Assertions
	assert.Equal(t, 200, response.StatusCode)
	assert.Equal(t, float64(200), responseBody["code"].(float64))
	assert.Equal(t, "OK", responseBody["status"])

	// Check response data
	data := responseBody["data"].(map[string]interface{})
	assert.NotEmpty(t, data["token"])

	user := data["user"].(map[string]interface{})
	assert.Equal(t, "john.doe@example.com", user["email"])
	assert.NotContains(t, user, "password") // Password should not be returned
}

func TestLoginWrongPassword(t *testing.T) {
	// Setup
	db := setupAuthTestDB()
	truncateUsers(db)
	router := setupAuthRouter()

	// Register a user first
	registerBody := map[string]interface{}{
		"name":     "Login Test",
		"email":    "login.test@example.com",
		"password": "correctpassword",
	}
	registerJson, _ := json.Marshal(registerBody)

	registerReq := httptest.NewRequest(http.MethodPost, "/api/auth/register",
		strings.NewReader(string(registerJson)))
	registerReq.Header.Add("Content-Type", "application/json")

	registerRec := httptest.NewRecorder()
	router.ServeHTTP(registerRec, registerReq)

	// Verify the user
	_, err := db.Exec("UPDATE users SET is_verified = true WHERE email = $1",
		"login.test@example.com")
	assert.NoError(t, err)

	// Try to login with wrong password
	loginBody := map[string]interface{}{
		"email":    "login.test@example.com",
		"password": "wrongpassword",
	}
	loginJson, _ := json.Marshal(loginBody)

	loginReq := httptest.NewRequest(http.MethodPost, "/api/auth/login",
		strings.NewReader(string(loginJson)))
	loginReq.Header.Add("Content-Type", "application/json")

	loginRec := httptest.NewRecorder()
	router.ServeHTTP(loginRec, loginReq)

	// Check response
	response := loginRec.Result()
	assert.Equal(t, 401, response.StatusCode)

	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	assert.Equal(t, "UNAUTHORIZED", responseBody["status"])
}

func TestLoginNotVerified(t *testing.T) {
	// Setup
	db := setupAuthTestDB()
	truncateUsers(db)
	router := setupAuthRouter()

	// Register a user first but don't verify
	registerBody := map[string]interface{}{
		"name":     "Unverified User",
		"email":    "unverified@example.com",
		"password": "password123",
	}
	registerJson, _ := json.Marshal(registerBody)

	registerReq := httptest.NewRequest(http.MethodPost, "/api/auth/register",
		strings.NewReader(string(registerJson)))
	registerReq.Header.Add("Content-Type", "application/json")

	registerRec := httptest.NewRecorder()
	router.ServeHTTP(registerRec, registerReq)

	// Ensure user is not verified (default behavior)

	// Try to login
	loginBody := map[string]interface{}{
		"email":    "unverified@example.com",
		"password": "password123",
	}
	loginJson, _ := json.Marshal(loginBody)

	loginReq := httptest.NewRequest(http.MethodPost, "/api/auth/login",
		strings.NewReader(string(loginJson)))
	loginReq.Header.Add("Content-Type", "application/json")

	loginRec := httptest.NewRecorder()
	router.ServeHTTP(loginRec, loginReq)

	// Check response
	response := loginRec.Result()

	// Depending on your implementation - could return 401 or 403
	assert.True(t, response.StatusCode == 401 || response.StatusCode == 403)

	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	// Error message should mention verification
	if message, ok := responseBody["data"].(string); ok {
		assert.Contains(t, strings.ToLower(message), "verif")
	}
}

func TestSendVerificationEmail(t *testing.T) {
	// Setup
	setupEmailTest()
	db := setupAuthTestDB()
	truncateUsers(db)
	router := setupAuthRouter()

	// Register a user first
	registerBody := map[string]interface{}{
		"name":     "Verification Test",
		"email":    "verification@example.com",
		"password": "password123",
	}
	registerJson, _ := json.Marshal(registerBody)

	registerReq := httptest.NewRequest(http.MethodPost, "/api/auth/register",
		strings.NewReader(string(registerJson)))
	registerReq.Header.Add("Content-Type", "application/json")

	registerRec := httptest.NewRecorder()
	router.ServeHTTP(registerRec, registerReq)

	// Send verification email request
	verifyBody := map[string]interface{}{
		"email": "verification@example.com",
	}
	verifyJson, _ := json.Marshal(verifyBody)

	verifyReq := httptest.NewRequest(http.MethodPost, "/api/auth/verify/send",
		strings.NewReader(string(verifyJson)))
	verifyReq.Header.Add("Content-Type", "application/json")

	verifyRec := httptest.NewRecorder()
	router.ServeHTTP(verifyRec, verifyReq)

	// Check response
	response := verifyRec.Result()
	assert.Equal(t, 200, response.StatusCode)

	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	data := responseBody["data"].(map[string]interface{})
	assert.Contains(t, data["message"], "verification")

	// Check if token was created in database
	var hasToken bool
	err := db.QueryRow(`
        SELECT EXISTS(
            SELECT 1 FROM users 
            WHERE email = $1 AND verification_token IS NOT NULL
        )`,
		"verification@example.com").Scan(&hasToken)
	assert.NoError(t, err)
	assert.True(t, hasToken)
}

func TestVerifyEmail(t *testing.T) {
	// Setup
	setupEmailTest()
	db := setupAuthTestDB()
	truncateUsers(db)
	router := setupAuthRouter()

	// Register a user first
	registerBody := map[string]interface{}{
		"name":     "Email Verify Test",
		"email":    "verify@example.com",
		"password": "password123",
	}
	registerJson, _ := json.Marshal(registerBody)

	registerReq := httptest.NewRequest(http.MethodPost, "/api/auth/register",
		strings.NewReader(string(registerJson)))
	registerReq.Header.Add("Content-Type", "application/json")

	registerRec := httptest.NewRecorder()
	router.ServeHTTP(registerRec, registerReq)

	// Set verification token
	verificationToken := "verify123"
	verificationExpires := time.Now().Add(1 * time.Hour)

	_, err := db.Exec(`
        UPDATE users
        SET verification_token = $1,
            verification_expires = $2
        WHERE email = $3`,
		verificationToken, verificationExpires, "verify@example.com")
	assert.NoError(t, err)

	// Verify email
	verifyBody := map[string]interface{}{
		"token": verificationToken,
	}
	verifyJson, _ := json.Marshal(verifyBody)

	verifyReq := httptest.NewRequest(http.MethodPost, "/api/auth/verify",
		strings.NewReader(string(verifyJson)))
	verifyReq.Header.Add("Content-Type", "application/json")

	verifyRec := httptest.NewRecorder()
	router.ServeHTTP(verifyRec, verifyReq)

	// Check response
	response := verifyRec.Result()
	assert.Equal(t, 200, response.StatusCode)

	// Check if user is verified in database
	var isVerified bool
	err = db.QueryRow(`
        SELECT is_verified
        FROM users
        WHERE email = $1`,
		"verify@example.com").Scan(&isVerified)
	assert.NoError(t, err)
	assert.True(t, isVerified)

	// Check if verification token is cleared
	var hasToken bool
	err = db.QueryRow(`
        SELECT EXISTS(
            SELECT 1 FROM users 
            WHERE email = $1 AND verification_token IS NOT NULL
        )`,
		"verify@example.com").Scan(&hasToken)
	assert.NoError(t, err)
	assert.False(t, hasToken)
}

func TestForgotPassword(t *testing.T) {
	setupEmailTest()
	db := setupAuthTestDB()
	truncateUsers(db)
	router := setupAuthRouter()

	// Register a user first
	registerBody := map[string]interface{}{
		"name":     "Password Reset Test",
		"email":    "reset.test@example.com",
		"password": "password123",
	}
	registerJson, _ := json.Marshal(registerBody)

	registerReq := httptest.NewRequest(http.MethodPost, "/api/auth/register",
		strings.NewReader(string(registerJson)))
	registerReq.Header.Add("Content-Type", "application/json")

	registerRec := httptest.NewRecorder()
	router.ServeHTTP(registerRec, registerReq)

	// Ensure registration was successful
	assert.Equal(t, 201, registerRec.Result().StatusCode)

	// Test forgot password
	forgotBody := map[string]interface{}{
		"email": "reset.test@example.com",
	}
	forgotJson, _ := json.Marshal(forgotBody)

	forgotReq := httptest.NewRequest(http.MethodPost, "/api/auth/forgot-password",
		strings.NewReader(string(forgotJson)))
	forgotReq.Header.Add("Content-Type", "application/json")

	forgotRec := httptest.NewRecorder()
	router.ServeHTTP(forgotRec, forgotReq)

	// Read response
	response := forgotRec.Result()
	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	// Assertions
	assert.Equal(t, 200, response.StatusCode)
	assert.Equal(t, float64(200), responseBody["code"].(float64))
	assert.Equal(t, "OK", responseBody["status"])

	// Check data contains the success message
	data := responseBody["data"].(map[string]interface{})
	assert.Contains(t, data["message"], "sent to your email")

	// Verify database has reset token
	var hasToken bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1 AND reset_token IS NOT NULL)",
		"reset.test@example.com").Scan(&hasToken)
	assert.NoError(t, err)
	assert.True(t, hasToken)
}

func TestForgotPasswordInvalidEmail(t *testing.T) {
	// Setup
	setupEmailTest()
	db := setupAuthTestDB()
	truncateUsers(db)
	router := setupAuthRouter()

	// Try with non-existing email
	forgotBody := map[string]interface{}{
		"email": "nonexistent@example.com",
	}
	forgotJson, _ := json.Marshal(forgotBody)

	forgotReq := httptest.NewRequest(http.MethodPost, "/api/auth/forgot-password",
		strings.NewReader(string(forgotJson)))
	forgotReq.Header.Add("Content-Type", "application/json")

	forgotRec := httptest.NewRecorder()
	router.ServeHTTP(forgotRec, forgotReq)

	// Check response
	response := forgotRec.Result()
	// Some implementations return 200 even for non-existent emails to prevent email enumeration
	// So we'll just check the general flow

	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	// Most implementations will return status 200 to prevent user enumeration
	assert.Equal(t, 200, response.StatusCode)
}

func TestResetPassword(t *testing.T) {
	setupEmailTest()
	db := setupAuthTestDB()
	truncateUsers(db)
	router := setupAuthRouter()

	// Register user first
	registerBody := map[string]interface{}{
		"name":     "Reset Password Test",
		"email":    "reset.password@example.com",
		"password": "oldpassword",
	}
	registerJson, _ := json.Marshal(registerBody)

	registerReq := httptest.NewRequest(http.MethodPost, "/api/auth/register",
		strings.NewReader(string(registerJson)))
	registerReq.Header.Add("Content-Type", "application/json")

	registerRec := httptest.NewRecorder()
	router.ServeHTTP(registerRec, registerReq)

	// Verify registration was successful
	assert.Equal(t, 201, registerRec.Result().StatusCode)

	// Set up reset token
	resetToken := "123654"
	resetExpires := time.Now().Add(1 * time.Hour)

	// Update user with reset token
	_, err := db.Exec(`
        UPDATE users 
        SET reset_token = $1, 
            reset_expires = $2, 
            is_verified = true 
        WHERE email = $3`,
		resetToken, resetExpires, "reset.password@example.com")
	assert.NoError(t, err)

	// Test password reset
	resetBody := map[string]interface{}{
		"token":    resetToken,
		"password": "newpassword123",
	}
	resetJson, _ := json.Marshal(resetBody)

	resetReq := httptest.NewRequest(http.MethodPost, "/api/auth/reset-password",
		strings.NewReader(string(resetJson)))
	resetReq.Header.Add("Content-Type", "application/json")

	resetRec := httptest.NewRecorder()
	router.ServeHTTP(resetRec, resetReq)

	// Read response
	response := resetRec.Result()
	assert.Equal(t, 200, response.StatusCode)

	// Verify reset token is cleared
	var hasToken bool
	err = db.QueryRow(`
        SELECT EXISTS(
            SELECT 1 FROM users 
            WHERE email = $1 AND reset_token IS NOT NULL
        )`,
		"reset.password@example.com").Scan(&hasToken)
	assert.NoError(t, err)
	assert.False(t, hasToken, "Reset token should be cleared after password reset")

	// Test login with new password
	loginBody := map[string]interface{}{
		"email":    "reset.password@example.com",
		"password": "newpassword123",
	}
	loginJson, _ := json.Marshal(loginBody)

	loginReq := httptest.NewRequest(http.MethodPost, "/api/auth/login",
		strings.NewReader(string(loginJson)))
	loginReq.Header.Add("Content-Type", "application/json")

	loginRec := httptest.NewRecorder()
	router.ServeHTTP(loginRec, loginReq)

	loginResponse := loginRec.Result()
	assert.Equal(t, 200, loginResponse.StatusCode, "Should be able to login with new password")
}

func TestResetPasswordInvalidToken(t *testing.T) {
	// Setup
	setupEmailTest()
	db := setupAuthTestDB()
	truncateUsers(db)
	router := setupAuthRouter()

	// Register user first
	registerBody := map[string]interface{}{
		"name":     "Invalid Token Test",
		"email":    "invalid.token@example.com",
		"password": "password123",
	}
	registerJson, _ := json.Marshal(registerBody)

	registerReq := httptest.NewRequest(http.MethodPost, "/api/auth/register",
		strings.NewReader(string(registerJson)))
	registerReq.Header.Add("Content-Type", "application/json")

	registerRec := httptest.NewRecorder()
	router.ServeHTTP(registerRec, registerReq)

	// Set up valid reset token
	validToken := "validtoken"
	resetExpires := time.Now().Add(1 * time.Hour)

	_, err := db.Exec(`
        UPDATE users 
        SET reset_token = $1, 
            reset_expires = $2, 
            is_verified = true 
        WHERE email = $3`,
		validToken, resetExpires, "invalid.token@example.com")
	assert.NoError(t, err)

	// Try with invalid token
	resetBody := map[string]interface{}{
		"token":    "invalidtoken",
		"password": "newpassword123",
	}
	resetJson, _ := json.Marshal(resetBody)

	resetReq := httptest.NewRequest(http.MethodPost, "/api/auth/reset-password",
		strings.NewReader(string(resetJson)))
	resetReq.Header.Add("Content-Type", "application/json")

	resetRec := httptest.NewRecorder()
	router.ServeHTTP(resetRec, resetReq)

	// Check response
	response := resetRec.Result()
	assert.Equal(t, 400, response.StatusCode)

	// Verify original token still exists
	var token string
	err = db.QueryRow(`
        SELECT reset_token
        FROM users 
        WHERE email = $1`,
		"invalid.token@example.com").Scan(&token)
	assert.NoError(t, err)
	assert.Equal(t, validToken, token, "Token should remain unchanged after failed reset attempt")
}

func TestResetPasswordExpiredToken(t *testing.T) {
	// Setup
	setupEmailTest()
	db := setupAuthTestDB()
	truncateUsers(db)
	router := setupAuthRouter()

	// Register user first
	registerBody := map[string]interface{}{
		"name":     "Expired Token Test",
		"email":    "expired.token@example.com",
		"password": "password123",
	}
	registerJson, _ := json.Marshal(registerBody)

	registerReq := httptest.NewRequest(http.MethodPost, "/api/auth/register",
		strings.NewReader(string(registerJson)))
	registerReq.Header.Add("Content-Type", "application/json")

	registerRec := httptest.NewRecorder()
	router.ServeHTTP(registerRec, registerReq)

	// Set up expired reset token
	expiredToken := "expiredtoken"
	resetExpires := time.Now().Add(-1 * time.Hour) // Expired 1 hour ago

	_, err := db.Exec(`
        UPDATE users 
        SET reset_token = $1, 
            reset_expires = $2, 
            is_verified = true 
        WHERE email = $3`,
		expiredToken, resetExpires, "expired.token@example.com")
	assert.NoError(t, err)

	// Try with expired token
	resetBody := map[string]interface{}{
		"token":    expiredToken,
		"password": "newpassword123",
	}
	resetJson, _ := json.Marshal(resetBody)

	resetReq := httptest.NewRequest(http.MethodPost, "/api/auth/reset-password",
		strings.NewReader(string(resetJson)))
	resetReq.Header.Add("Content-Type", "application/json")

	resetRec := httptest.NewRecorder()
	router.ServeHTTP(resetRec, resetReq)

	// Check response - should be 400 Bad Request or 410 Gone
	response := resetRec.Result()
	assert.True(t, response.StatusCode == 400 || response.StatusCode == 410)
}
