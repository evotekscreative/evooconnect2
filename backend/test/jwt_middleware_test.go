package test

import (
	"evoconnect/backend/middleware"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/dgrijalva/jwt-go"
	"github.com/stretchr/testify/assert"
)

func TestAuthMiddleware_ValidToken(t *testing.T) {
	// Create a simple handler for testing
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userId := r.Context().Value("user_id")
		assert.Equal(t, 1, userId)
		w.WriteHeader(http.StatusOK)
	})

	// Create middleware
	jwtSecret := "test-secret"
	authMiddleware := middleware.NewSelectiveAuthMiddleware(handler, jwtSecret)

	// Override the CheckAuthFunc to always require auth for this test path
	authMiddleware.CheckAuthFunc = func(path string) bool {
		return true // Always require auth for tests
	}

	// Create a test request
	request := httptest.NewRequest("GET", "http://example.com/api/protected", nil)

	// Create a valid token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": 1,
		"email":   "test@example.com",
	})
	tokenString, _ := token.SignedString([]byte(jwtSecret))

	// Add token to request
	request.Header.Set("Authorization", "Bearer "+tokenString)

	// Record response
	recorder := httptest.NewRecorder()

	// Process request
	authMiddleware.ServeHTTP(recorder, request)

	// Verify response
	response := recorder.Result()
	assert.Equal(t, http.StatusOK, response.StatusCode)
}

func TestAuthMiddleware_InvalidToken(t *testing.T) {
	// Create a simple handler for testing
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// This should not be called
		t.Error("Handler should not be called with invalid token")
	})

	// Create middleware
	jwtSecret := "test-secret"
	authMiddleware := middleware.NewSelectiveAuthMiddleware(handler, jwtSecret)

	// Override the CheckAuthFunc to always require auth for this test path
	authMiddleware.CheckAuthFunc = func(path string) bool {
		return true // Always require auth for tests
	}

	// Create a test request with invalid token
	request := httptest.NewRequest("GET", "http://example.com/api/protected", nil)
	request.Header.Set("Authorization", "Bearer invalidtoken")

	// Record response
	recorder := httptest.NewRecorder()

	// Process request
	authMiddleware.ServeHTTP(recorder, request)

	// Check the response
	response := recorder.Result()
	assert.Equal(t, http.StatusUnauthorized, response.StatusCode)
}

func TestAuthMiddleware_MissingToken(t *testing.T) {
	// Create a simple handler for testing
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// This should not be called
		t.Error("Handler should not be called without token")
	})

	// Create middleware
	jwtSecret := "test-secret"
	authMiddleware := middleware.NewSelectiveAuthMiddleware(handler, jwtSecret)

	// Override the CheckAuthFunc to always require auth for this test path
	authMiddleware.CheckAuthFunc = func(path string) bool {
		return true // Always require auth for tests
	}

	// Create a test request without Authorization header
	request := httptest.NewRequest("GET", "http://example.com/api/protected", nil)
	// No Authorization header set

	// Record response
	recorder := httptest.NewRecorder()

	// Process request
	authMiddleware.ServeHTTP(recorder, request)

	// Check the response
	response := recorder.Result()
	assert.Equal(t, http.StatusUnauthorized, response.StatusCode)
}

func TestAuthMiddleware_PublicEndpoints(t *testing.T) {
	// Create a simple handler for testing
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	// Create middleware
	jwtSecret := "test-secret"
	authMiddleware := middleware.NewSelectiveAuthMiddleware(handler, jwtSecret)

	// Test login endpoint (should not require token)
	loginRequest := httptest.NewRequest("POST", "http://example.com/api/auth/login", nil)
	loginRecorder := httptest.NewRecorder()
	authMiddleware.ServeHTTP(loginRecorder, loginRequest)
	assert.Equal(t, http.StatusOK, loginRecorder.Result().StatusCode)

	// Test register endpoint (should not require token)
	registerRequest := httptest.NewRequest("POST", "http://example.com/api/auth/register", nil)
	registerRecorder := httptest.NewRecorder()
	authMiddleware.ServeHTTP(registerRecorder, registerRequest)
	assert.Equal(t, http.StatusOK, registerRecorder.Result().StatusCode)
}
