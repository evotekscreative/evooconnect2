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
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            is_verified BOOLEAN DEFAULT FALSE,
            verification_token VARCHAR(255),
            verification_expires TIMESTAMP,
            reset_token VARCHAR(255),
            reset_expires TIMESTAMP,
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
	middleware := middleware.NewSelectiveAuthMiddleware(router, "test-jwt-secret")
	middleware.PublicPaths = []string{
		"/api/auth/login",
		"/api/auth/register",
		"/api/auth/verify/send",
		"/api/auth/verify",
		"/api/auth/forgot-password",
		"/api/auth/reset-password",
	}

	return middleware
}

func TestRegisterSuccess(t *testing.T) {
	// Setup email test first to prevent actual emails being sent
	setupEmailTest()

	// Setup database and router
	db := setupAuthTestDB()
	truncateUsers(db)
	router := setupAuthRouter()

	// Verify database connection
	err := db.Ping()
	assert.NoError(t, err, "Database connection failed")

	// Create request body
	requestBody := map[string]interface{}{
		"name":     "John Doe",
		"email":    "john.doe@example.com",
		"password": "password123",
	}
	requestBodyJson, err := json.Marshal(requestBody)
	assert.NoError(t, err, "Failed to marshal request body")

	// Create request with correct headers
	request := httptest.NewRequest(http.MethodPost, "/api/auth/register",
		strings.NewReader(string(requestBodyJson)))
	request.Header.Set("Content-Type", "application/json")

	// Record response
	recorder := httptest.NewRecorder()

	// Execute request with panic recovery
	func() {
		defer func() {
			if r := recover(); r != nil {
				t.Logf("Panic during request: %v", r)
			}
		}()
		router.ServeHTTP(recorder, request)
	}()

	// Read response
	response := recorder.Result()
	body, err := io.ReadAll(response.Body)
	assert.NoError(t, err, "Failed to read response body")

	// Log response details for debugging
	t.Logf("Response Status: %d", response.StatusCode)
	t.Logf("Response Headers: %v", response.Header)
	t.Logf("Response Body: %s", string(body))

	// Verify response is not empty
	if len(body) == 0 {
		// Check database for diagnostic info
		var count int
		err := db.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
		t.Logf("Users in database: %d (error: %v)", count, err)
		t.Fatal("Response body is empty")
	}

	// Parse response body
	var responseBody map[string]interface{}
	err = json.Unmarshal(body, &responseBody)
	assert.NoError(t, err, "Failed to parse response body")

	// Verify response structure
	assert.Equal(t, 201, response.StatusCode, "Expected status code 201")
	assert.NotNil(t, responseBody["code"], "Response missing 'code' field")
	assert.NotNil(t, responseBody["status"], "Response missing 'status' field")
	assert.NotNil(t, responseBody["data"], "Response missing 'data' field")

	// Verify response data
	data, ok := responseBody["data"].(map[string]interface{})
	assert.True(t, ok, "Data field is not a map")
	assert.NotEmpty(t, data["token"], "Token is empty")

	user, ok := data["user"].(map[string]interface{})
	assert.True(t, ok, "User field is not a map")
	assert.Equal(t, "John Doe", user["name"])
	assert.Equal(t, "john.doe@example.com", user["email"])
	assert.NotContains(t, user, "password")

	// Verify database state
	var dbUser struct {
		ID         int
		Name       string
		Email      string
		Password   string
		IsVerified bool
		CreatedAt  time.Time
		UpdatedAt  time.Time
	}
	err = db.QueryRow(`
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
	assert.NotEqual(t, "password123", dbUser.Password)
	assert.False(t, dbUser.IsVerified)
	assert.False(t, dbUser.CreatedAt.IsZero())
	assert.False(t, dbUser.UpdatedAt.IsZero())
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

	registerReq := httptest.NewRequest(http.MethodPost, "http://localhost:3000/api/auth/register", strings.NewReader(string(registerJson)))
	registerReq.Header.Add("Content-Type", "application/json")

	registerRec := httptest.NewRecorder()
	router.ServeHTTP(registerRec, registerReq)

	// Ensure registration was successful
	assert.Equal(t, 201, registerRec.Result().StatusCode)

	// Verify the user's email
	var verificationToken string
	err := db.QueryRow("SELECT verification_token FROM users WHERE email = $1", "john.doe@example.com").Scan(&verificationToken)
	helper.PanicIfError(err)

	_, err = db.Exec("UPDATE users SET is_verified = true WHERE email = $1", "john.doe@example.com")
	helper.PanicIfError(err)

	// Create login request body
	requestBody := map[string]interface{}{
		"email":    "john.doe@example.com",
		"password": "password123",
	}
	requestBodyJson, _ := json.Marshal(requestBody)

	// Create request
	request := httptest.NewRequest(http.MethodPost, "http://localhost:3000/api/auth/login", strings.NewReader(string(requestBodyJson)))
	request.Header.Add("Content-Type", "application/json")

	// Record response
	recorder := httptest.NewRecorder()

	// Execute request
	router.ServeHTTP(recorder, request)

	// Read response
	response := recorder.Result()
	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	// Output response for debugging if test fails
	if response.StatusCode != 200 {
		t.Logf("Login Response: %v", string(body))
	}

	// Assertions
	assert.Equal(t, 200, response.StatusCode)
	assert.Equal(t, 200, int(responseBody["code"].(float64)))
	assert.Equal(t, "OK", responseBody["status"])
	assert.NotNil(t, responseBody["data"])

	// Check response data
	data := responseBody["data"].(map[string]interface{})
	assert.NotEmpty(t, data["token"])
	assert.NotNil(t, data["user"])

	user := data["user"].(map[string]interface{})
	assert.Equal(t, "john.doe@example.com", user["email"])
	assert.NotContains(t, user, "password") // Password should not be returned
}

func TestLoginFailed(t *testing.T) {
	// Setup
	db := setupAuthTestDB()
	truncateUsers(db)
	router := setupAuthRouter()

	// Create request body with invalid credentials
	requestBody := map[string]interface{}{
		"email":    "nonexistent@example.com",
		"password": "wrongpassword",
	}
	requestBodyJson, _ := json.Marshal(requestBody)

	// Create request
	request := httptest.NewRequest(http.MethodPost, "http://localhost:3000/api/auth/login", strings.NewReader(string(requestBodyJson)))
	request.Header.Add("Content-Type", "application/json")

	// Record response
	recorder := httptest.NewRecorder()

	// Execute request
	router.ServeHTTP(recorder, request)

	// Read response
	response := recorder.Result()
	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	// Output response for debugging
	t.Logf("Login Failed Response: %v", string(body))

	// Assertions - the exact status code depends on your implementation
	// For "user not found", it should be 404 NOT FOUND
	assert.Equal(t, 404, response.StatusCode)
	assert.Equal(t, 404, int(responseBody["code"].(float64)))
	assert.Equal(t, "NOT FOUND", responseBody["status"])
	// The exact error message might vary based on your implementation
	assert.Contains(t, responseBody["data"], "not found")
}

func TestRegisterDuplicateEmail(t *testing.T) {
	// Setup
	db := setupAuthTestDB()
	truncateUsers(db)
	router := setupAuthRouter()

	// Register first user
	registerBody := map[string]interface{}{
		"name":     "John Doe",
		"email":    "duplicate@example.com",
		"password": "password123",
	}
	registerJson, _ := json.Marshal(registerBody)

	registerReq := httptest.NewRequest(http.MethodPost, "http://localhost:3000/api/auth/register", strings.NewReader(string(registerJson)))
	registerReq.Header.Add("Content-Type", "application/json")

	registerRec := httptest.NewRecorder()
	router.ServeHTTP(registerRec, registerReq)

	// Ensure first registration was successful
	assert.Equal(t, 201, registerRec.Result().StatusCode)

	// Try to register with same email
	duplicateReq := httptest.NewRequest(http.MethodPost, "http://localhost:3000/api/auth/register", strings.NewReader(string(registerJson)))
	duplicateReq.Header.Add("Content-Type", "application/json")

	duplicateRec := httptest.NewRecorder()
	router.ServeHTTP(duplicateRec, duplicateReq)

	// Read response
	response := duplicateRec.Result()
	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	// Output response for debugging
	t.Logf("Duplicate Email Response: %v", string(body))

	// Assertions - should be 400 BAD REQUEST
	assert.Equal(t, 400, response.StatusCode)
	assert.Equal(t, 400, int(responseBody["code"].(float64)))
	assert.Equal(t, "BAD REQUEST", responseBody["status"])
	// The exact error message might vary
	assert.Contains(t, responseBody["data"], "already registered")
}

func TestLoginInvalidPassword(t *testing.T) {
	// Setup
	db := setupAuthTestDB()
	truncateUsers(db)
	router := setupAuthRouter()

	// Register user first
	registerBody := map[string]interface{}{
		"name":     "Password Test",
		"email":    "password.test@example.com",
		"password": "correctpassword",
	}
	registerJson, _ := json.Marshal(registerBody)

	registerReq := httptest.NewRequest(http.MethodPost, "http://localhost:3000/api/auth/register", strings.NewReader(string(registerJson)))
	registerReq.Header.Add("Content-Type", "application/json")

	registerRec := httptest.NewRecorder()
	router.ServeHTTP(registerRec, registerReq)

	// Ensure registration was successful
	assert.Equal(t, 201, registerRec.Result().StatusCode)

	// Verify the user's email
	_, err := db.Exec("UPDATE users SET is_verified = true WHERE email = $1", "password.test@example.com")
	helper.PanicIfError(err)

	// Try to login with wrong password
	loginBody := map[string]interface{}{
		"email":    "password.test@example.com",
		"password": "wrongpassword",
	}
	loginJson, _ := json.Marshal(loginBody)

	loginReq := httptest.NewRequest(http.MethodPost, "http://localhost:3000/api/auth/login", strings.NewReader(string(loginJson)))
	loginReq.Header.Add("Content-Type", "application/json")

	loginRec := httptest.NewRecorder()
	router.ServeHTTP(loginRec, loginReq)

	// Read response
	response := loginRec.Result()
	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	// Output response for debugging
	t.Logf("Invalid Password Response: %v", string(body))

	// Assertions - should be 401 UNAUTHORIZED
	assert.Equal(t, 401, response.StatusCode)
	assert.Equal(t, 401, int(responseBody["code"].(float64)))
	assert.Equal(t, "UNAUTHORIZED", responseBody["status"])
	// The exact error message might vary
	assert.Contains(t, responseBody["data"], "Invalid credentials")
}

// Mock email sender for testing
func setupEmailTest() {
	// Override the email sender to capture emails instead of sending them
	helper.EmailSender = func(to, subject, body string) error {
		// Just log or store the email information for assertions
		return nil
	}
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

	registerReq := httptest.NewRequest(http.MethodPost, "http://localhost:3000/api/auth/register",
		strings.NewReader(string(registerJson)))
	registerReq.Header.Add("Content-Type", "application/json")

	registerRec := httptest.NewRecorder()
	router.ServeHTTP(registerRec, registerReq)

	// Ensure registration was successful
	assert.Equal(t, 201, registerRec.Result().StatusCode)

	// Now test forgot password
	forgotBody := map[string]interface{}{
		"email": "reset.test@example.com",
	}
	forgotJson, _ := json.Marshal(forgotBody)

	forgotReq := httptest.NewRequest(http.MethodPost, "http://localhost:3000/api/auth/forgot-password",
		strings.NewReader(string(forgotJson)))
	forgotReq.Header.Add("Content-Type", "application/json")

	forgotRec := httptest.NewRecorder()
	router.ServeHTTP(forgotRec, forgotReq)

	// Read response
	response := forgotRec.Result()
	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	// Output response for debugging if test fails
	if response.StatusCode != 200 {
		t.Logf("Response: %v", string(body))
	}

	// Assertions
	assert.Equal(t, 200, response.StatusCode)
	assert.Equal(t, 200, int(responseBody["code"].(float64)))
	assert.Equal(t, "OK", responseBody["status"])

	// Check data contains the success message
	data := responseBody["data"].(map[string]interface{})
	assert.Contains(t, data["message"], "sent to your email")

	// Additional verification: Check database has reset token
	var hasToken bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1 AND reset_token IS NOT NULL)",
		"reset.test@example.com").Scan(&hasToken)

	assert.NoError(t, err)
	assert.True(t, hasToken)
}

func TestVerifyEmail(t *testing.T) {
	setupEmailTest()
	db := setupAuthTestDB()
	truncateUsers(db)
	router := setupAuthRouter()

	// Register a user
	registerBody := map[string]interface{}{
		"name":     "Verify Email Test",
		"email":    "verify.test@example.com",
		"password": "password123",
	}
	registerJson, _ := json.Marshal(registerBody)

	registerReq := httptest.NewRequest(http.MethodPost, "http://localhost:3000/api/auth/register",
		strings.NewReader(string(registerJson)))
	registerReq.Header.Add("Content-Type", "application/json")

	registerRec := httptest.NewRecorder()
	router.ServeHTTP(registerRec, registerReq)

	// Ensure registration was successful
	assert.Equal(t, 201, registerRec.Result().StatusCode)

	// Get the verification token from the database
	var token string
	err := db.QueryRow("SELECT verification_token FROM users WHERE email = $1",
		"verify.test@example.com").Scan(&token)
	assert.NoError(t, err)
	assert.NotEmpty(t, token)

	// Test verifying email
	verifyBody := map[string]interface{}{
		"token": token,
	}
	verifyJson, _ := json.Marshal(verifyBody)

	verifyReq := httptest.NewRequest(http.MethodPost, "http://localhost:3000/api/auth/verify",
		strings.NewReader(string(verifyJson)))
	verifyReq.Header.Add("Content-Type", "application/json")

	verifyRec := httptest.NewRecorder()
	router.ServeHTTP(verifyRec, verifyReq)

	// Read response
	response := verifyRec.Result()
	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	// Output response for debugging if test fails
	if response.StatusCode != 200 {
		t.Logf("Response: %v", string(body))
	}

	// Assertions
	assert.Equal(t, 200, response.StatusCode)
	assert.Equal(t, 200, int(responseBody["code"].(float64)))
	assert.Equal(t, "OK", responseBody["status"])

	// Check data contains the success message
	data := responseBody["data"].(map[string]interface{})
	assert.Contains(t, data["message"], "successfully verified")

	// Check user is now verified
	var isVerified bool
	err = db.QueryRow("SELECT is_verified FROM users WHERE email = $1",
		"verify.test@example.com").Scan(&isVerified)
	assert.NoError(t, err)
	assert.True(t, isVerified)
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

	registerReq := httptest.NewRequest(http.MethodPost, "http://localhost:3000/api/auth/register",
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

	// Verify token was set
	var storedToken string
	err = db.QueryRow("SELECT reset_token FROM users WHERE email = $1",
		"reset.password@example.com").Scan(&storedToken)
	assert.NoError(t, err)
	assert.Equal(t, resetToken, storedToken)

	// Test password reset
	resetBody := map[string]interface{}{
		"token":    resetToken,
		"password": "newpassword123",
	}
	resetJson, _ := json.Marshal(resetBody)

	resetReq := httptest.NewRequest(http.MethodPost, "http://localhost:3000/api/auth/reset-password",
		strings.NewReader(string(resetJson)))
	resetReq.Header.Add("Content-Type", "application/json")

	resetRec := httptest.NewRecorder()
	router.ServeHTTP(resetRec, resetReq)

	// Read response
	response := resetRec.Result()
	body, err := io.ReadAll(response.Body)
	assert.NoError(t, err, "Failed to read response body")

	// Log response for debugging
	t.Logf("Reset password response: %s", string(body))

	// Check if response body is empty
	if len(body) == 0 {
		t.Fatal("Response body is empty")
	}

	var responseBody map[string]interface{}
	err = json.Unmarshal(body, &responseBody)
	assert.NoError(t, err, "Failed to parse response body")

	// Check response structure first
	assert.NotNil(t, responseBody, "Response body should not be nil")

	// Verify HTTP status code
	assert.Equal(t, 200, response.StatusCode, "Expected status code 200")

	// Safe type assertions with validation
	if code, ok := responseBody["code"].(float64); ok {
		assert.Equal(t, float64(200), code, "Expected response code 200")
	} else {
		t.Logf("Warning: 'code' field missing or not a number")
	}

	if status, ok := responseBody["status"].(string); ok {
		assert.Equal(t, "OK", status, "Expected status OK")
	} else {
		t.Logf("Warning: 'status' field missing or not a string")
	}

	// Verify response data safely
	data, ok := responseBody["data"].(map[string]interface{})
	if !ok {
		t.Logf("Warning: 'data' field missing or not a map")
	} else {
		message, ok := data["message"].(string)
		if ok {
			assert.Contains(t, message, "successfully reset", "Expected success message")
		} else {
			t.Logf("Warning: 'message' field missing or not a string")
		}
	}

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

	loginReq := httptest.NewRequest(http.MethodPost, "http://localhost:3000/api/auth/login",
		strings.NewReader(string(loginJson)))
	loginReq.Header.Add("Content-Type", "application/json")

	loginRec := httptest.NewRecorder()
	router.ServeHTTP(loginRec, loginReq)

	loginResponse := loginRec.Result()
	assert.Equal(t, 200, loginResponse.StatusCode, "Should be able to login with new password")
}
