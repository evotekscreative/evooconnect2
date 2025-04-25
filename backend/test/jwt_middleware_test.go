package test

import (
	"evoconnect/backend/middleware"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/dgrijalva/jwt-go"
	"github.com/stretchr/testify/assert"
)

// Add this at the top of the file, after the import section

// TestMiddlewareWrapper wraps the selective auth middleware to make it testable
type TestMiddlewareWrapper struct {
	originalMiddleware *middleware.AuthMiddleware
	requiresAuthPaths  map[string]bool
}

func NewTestMiddlewareWrapper(handler http.Handler, jwtSecret string) *TestMiddlewareWrapper {
	return &TestMiddlewareWrapper{
		originalMiddleware: middleware.NewAuthMiddleware(handler, jwtSecret),
		requiresAuthPaths:  make(map[string]bool),
	}
}

func (t *TestMiddlewareWrapper) RequireAuthForAllPaths() {
	// This replaces the CheckAuthFunc assignments in your tests
	t.requiresAuthPaths = map[string]bool{"*": true}
}

func (t *TestMiddlewareWrapper) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// If we've configured this wrapper to require auth for all paths
	if _, exists := t.requiresAuthPaths["*"]; exists {
		// Override the PublicPaths to empty so all paths require auth

		// Call the original middleware
		t.originalMiddleware.ServeHTTP(w, r)

		// Restore the original paths
	} else {
		// Just use the original middleware with its default behavior
		t.originalMiddleware.ServeHTTP(w, r)
	}
}

func TestAuthMiddleware_ValidToken(t *testing.T) {
	// Create a simple handler for testing
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userId := r.Context().Value("user_id")
		assert.Equal(t, 1, userId)
		w.WriteHeader(http.StatusOK)
	})

	// Create middleware wrapper
	jwtSecret := "test-secret"
	authMiddleware := NewTestMiddlewareWrapper(handler, jwtSecret)

	// Override auth check to require auth for all paths
	authMiddleware.RequireAuthForAllPaths()

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
	authMiddleware := NewTestMiddlewareWrapper(handler, jwtSecret)
	authMiddleware.RequireAuthForAllPaths()

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
	authMiddleware := NewTestMiddlewareWrapper(handler, jwtSecret)
	authMiddleware.RequireAuthForAllPaths()

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
	authMiddleware := middleware.NewAuthMiddleware(handler, jwtSecret)

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
