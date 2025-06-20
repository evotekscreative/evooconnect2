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
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"evoconnect/backend/service"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	_ "github.com/lib/pq"
	"github.com/stretchr/testify/assert"
)

func setupPostTestDB() *sql.DB {
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

func truncatePosts(db *sql.DB) {
	// Clear posts and post_likes tables before each test
	db.Exec("DELETE FROM post_likes")
	db.Exec("DELETE FROM posts")
}

func createTestUser(db *sql.DB) domain.User {
	// Insert test user into database
	userId := uuid.New()
	user := domain.User{
		Id:         userId,
		Name:       "Test User",
		Email:      "test.user@example.com",
		Username:   "testuser",
		Password:   "hashedpassword",
		IsVerified: true,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	_, err := db.Exec(`
        INSERT INTO users(id, name, email, username, password, is_verified, created_at, updated_at) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
		user.Id, user.Name, user.Email, user.Username, user.Password, user.IsVerified, user.CreatedAt, user.UpdatedAt)
	helper.PanicIfError(err)

	return user
}

func createTestPost(db *sql.DB, user domain.User) domain.Post {
	// Insert test post into database
	postId := uuid.New()
	post := domain.Post{
		Id:         postId,
		UserId:     user.Id,
		Content:    "This is a test post content",
		Images:     []string{"image1.jpg", "image2.jpg"},
		Visibility: "public",
		LikesCount: 0,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	// Marshal Images to JSON
	imagesJSON, err := json.Marshal(post.Images)
	helper.PanicIfError(err)

	_, err = db.Exec(`
        INSERT INTO posts(id, user_id, content, images, visibility, created_at, updated_at) 
        VALUES($1, $2, $3, $4, $5, $6, $7)`,
		post.Id, post.UserId, post.Content, imagesJSON, post.Visibility, post.CreatedAt, post.UpdatedAt)
	helper.PanicIfError(err)

	return post
}

func createJWTTokenForUser(user domain.User) string {
	// Create JWT token for testing
	claims := map[string]interface{}{
		"user_id": user.Id.String(),
		"email":   user.Email,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims(claims))
	tokenString, _ := token.SignedString([]byte("test-secret-key"))
	return tokenString
}

func setupPostRouter(db *sql.DB) http.Handler {
	validate := validator.New()

	// Post dependencies
	postRepository := repository.NewPostRepository()
	postService := service.NewPostService(postRepository, db, validate)
	postController := controller.NewPostController(postService)

	// User dependencies for testing
	userRepository := repository.NewUserRepository()
	userService := service.NewUserService(userRepository, db, validate)
	userController := controller.NewUserController(userService)

	// Auth dependencies for testing
	authService := service.NewAuthService(userRepository, db, validate, "test-secret-key")
	authController := controller.NewAuthController(authService)

	commentRepository := repository.NewCommentRepository()
	commentService := service.NewCommentService(commentRepository, postRepository, userRepository, db, validate)
	commentController := controller.NewCommentController(commentService)

	// Create router
	router := app.NewRouter(authController, userController, postController, commentController)

	// Add panic handler
	router.PanicHandler = exception.ErrorHandler

	// Create middleware with JWT auth
	middleware := middleware.NewAuthMiddleware(router, "test-secret-key")

	return middleware
}

// Test cases for Create Post
func TestCreatePostSuccess(t *testing.T) {
	db := setupPostTestDB()
	defer db.Close()

	truncatePosts(db)
	user := createTestUser(db)
	router := setupPostRouter(db)
	token := createJWTTokenForUser(user)

	requestBody := web.CreatePostRequest{
		Content:    "This is a new post content",
		Images:     []string{"new_image1.jpg", "new_image2.jpg"},
		Visibility: "public",
	}
	requestJSON, _ := json.Marshal(requestBody)

	request := httptest.NewRequest(http.MethodPost, "http://localhost:3000/api/posts", strings.NewReader(string(requestJSON)))
	request.Header.Add("Content-Type", "application/json")
	request.Header.Add("Authorization", "Bearer "+token)

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	response := recorder.Result()
	assert.Equal(t, 201, response.StatusCode)

	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	assert.Equal(t, float64(201), responseBody["code"].(float64))
	assert.Equal(t, "CREATED", responseBody["status"])

	data := responseBody["data"].(map[string]interface{})
	assert.Equal(t, requestBody.Content, data["content"])
	assert.Equal(t, user.Id.String(), data["user_id"])
}

func TestCreatePostValidationError(t *testing.T) {
	db := setupPostTestDB()
	defer db.Close()

	truncatePosts(db)
	user := createTestUser(db)
	router := setupPostRouter(db)
	token := createJWTTokenForUser(user)

	// Empty content should fail validation
	requestBody := web.CreatePostRequest{
		Content:    "",
		Images:     []string{"new_image1.jpg"},
		Visibility: "public",
	}
	requestJSON, _ := json.Marshal(requestBody)

	request := httptest.NewRequest(http.MethodPost, "http://localhost:3000/api/posts", strings.NewReader(string(requestJSON)))
	request.Header.Add("Content-Type", "application/json")
	request.Header.Add("Authorization", "Bearer "+token)

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	response := recorder.Result()
	assert.Equal(t, 400, response.StatusCode)

	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	assert.Equal(t, float64(400), responseBody["code"].(float64))
	assert.Equal(t, "BAD REQUEST", responseBody["status"])
}

func TestCreatePostUnauthorized(t *testing.T) {
	db := setupPostTestDB()
	defer db.Close()

	truncatePosts(db)
	router := setupPostRouter(db)

	requestBody := web.CreatePostRequest{
		Content:    "This is a new post content",
		Images:     []string{"new_image1.jpg"},
		Visibility: "public",
	}
	requestJSON, _ := json.Marshal(requestBody)

	// No authorization token provided
	request := httptest.NewRequest(http.MethodPost, "http://localhost:3000/api/posts", strings.NewReader(string(requestJSON)))
	request.Header.Add("Content-Type", "application/json")

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	response := recorder.Result()
	assert.Equal(t, 401, response.StatusCode)
}

// Test cases for Update Post
func TestUpdatePostSuccess(t *testing.T) {
	db := setupPostTestDB()
	defer db.Close()

	truncatePosts(db)
	user := createTestUser(db)
	post := createTestPost(db, user)
	router := setupPostRouter(db)
	token := createJWTTokenForUser(user)

	requestBody := web.UpdatePostRequest{
		Content:    "Updated post content",
		Images:     []string{"updated_image.jpg"},
		Visibility: "private",
	}
	requestJSON, _ := json.Marshal(requestBody)

	request := httptest.NewRequest(http.MethodPut, fmt.Sprintf("http://localhost:3000/api/posts/%s", post.Id), strings.NewReader(string(requestJSON)))
	request.Header.Add("Content-Type", "application/json")
	request.Header.Add("Authorization", "Bearer "+token)

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	response := recorder.Result()
	assert.Equal(t, 200, response.StatusCode)

	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	assert.Equal(t, float64(200), responseBody["code"].(float64))

	data := responseBody["data"].(map[string]interface{})
	assert.Equal(t, requestBody.Content, data["content"])
	assert.Equal(t, requestBody.Visibility, data["visibility"])

	images := data["images"].([]interface{})
	assert.Equal(t, 1, len(images))
	assert.Equal(t, "updated_image.jpg", images[0].(string))
}

func TestUpdatePostNotFound(t *testing.T) {
	db := setupPostTestDB()
	defer db.Close()

	truncatePosts(db)
	user := createTestUser(db)
	router := setupPostRouter(db)
	token := createJWTTokenForUser(user)

	nonExistentId := uuid.New()

	requestBody := web.UpdatePostRequest{
		Content:    "Updated content",
		Images:     []string{"image.jpg"},
		Visibility: "public",
	}
	requestJSON, _ := json.Marshal(requestBody)

	request := httptest.NewRequest(http.MethodPut, fmt.Sprintf("http://localhost:3000/api/posts/%s", nonExistentId), strings.NewReader(string(requestJSON)))
	request.Header.Add("Content-Type", "application/json")
	request.Header.Add("Authorization", "Bearer "+token)

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	response := recorder.Result()
	assert.Equal(t, 404, response.StatusCode)
}

func TestUpdatePostForbidden(t *testing.T) {
	db := setupPostTestDB()
	defer db.Close()

	truncatePosts(db)
	user1 := createTestUser(db)
	post := createTestPost(db, user1)

	// Create another user
	user2 := domain.User{
		Id:         uuid.New(),
		Name:       "Other User",
		Email:      "other.user@example.com",
		Username:   "otheruser",
		Password:   "hashedpassword",
		IsVerified: true,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	_, err := db.Exec(`
        INSERT INTO users(id, name, email, username, password, is_verified, created_at, updated_at) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
		user2.Id, user2.Name, user2.Email, user2.Username, user2.Password, user2.IsVerified, user2.CreatedAt, user2.UpdatedAt)
	helper.PanicIfError(err)

	router := setupPostRouter(db)

	// Use token for user2 who doesn't own the post
	token := createJWTTokenForUser(user2)

	requestBody := web.UpdatePostRequest{
		Content:    "Attempting to update someone else's post",
		Images:     []string{},
		Visibility: "public",
	}
	requestJSON, _ := json.Marshal(requestBody)

	request := httptest.NewRequest(http.MethodPut, fmt.Sprintf("http://localhost:3000/api/posts/%s", post.Id), strings.NewReader(string(requestJSON)))
	request.Header.Add("Content-Type", "application/json")
	request.Header.Add("Authorization", "Bearer "+token)

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	response := recorder.Result()
	assert.Equal(t, 403, response.StatusCode)
}

// Test cases for Get Post By ID
func TestGetPostByIdSuccess(t *testing.T) {
	db := setupPostTestDB()
	defer db.Close()

	truncatePosts(db)
	user := createTestUser(db)
	post := createTestPost(db, user)
	router := setupPostRouter(db)
	token := createJWTTokenForUser(user)

	request := httptest.NewRequest(http.MethodGet, fmt.Sprintf("http://localhost:3000/api/posts/%s", post.Id), nil)
	request.Header.Add("Authorization", "Bearer "+token)

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	response := recorder.Result()
	assert.Equal(t, 200, response.StatusCode)

	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	assert.Equal(t, float64(200), responseBody["code"].(float64))

	data := responseBody["data"].(map[string]interface{})
	assert.Equal(t, post.Id.String(), data["id"])
	assert.Equal(t, post.Content, data["content"])
}

func TestGetPostByIdNotFound(t *testing.T) {
	db := setupPostTestDB()
	defer db.Close()

	truncatePosts(db)
	user := createTestUser(db)
	router := setupPostRouter(db)
	token := createJWTTokenForUser(user)

	nonExistentId := uuid.New()

	request := httptest.NewRequest(http.MethodGet, fmt.Sprintf("http://localhost:3000/api/posts/%s", nonExistentId), nil)
	request.Header.Add("Authorization", "Bearer "+token)

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	response := recorder.Result()
	assert.Equal(t, 404, response.StatusCode)
}

// Test cases for Delete Post
func TestDeletePostSuccess(t *testing.T) {
	db := setupPostTestDB()
	defer db.Close()

	truncatePosts(db)
	user := createTestUser(db)
	post := createTestPost(db, user)
	router := setupPostRouter(db)
	token := createJWTTokenForUser(user)

	request := httptest.NewRequest(http.MethodDelete, fmt.Sprintf("http://localhost:3000/api/posts/%s", post.Id), nil)
	request.Header.Add("Authorization", "Bearer "+token)

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	response := recorder.Result()
	assert.Equal(t, 200, response.StatusCode)

	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	assert.Equal(t, float64(200), responseBody["code"].(float64))
	assert.Equal(t, "Post deleted successfully", responseBody["data"])
}

func TestDeletePostNotFound(t *testing.T) {
	db := setupPostTestDB()
	defer db.Close()

	truncatePosts(db)
	user := createTestUser(db)
	router := setupPostRouter(db)
	token := createJWTTokenForUser(user)

	nonExistentId := uuid.New()

	request := httptest.NewRequest(http.MethodDelete, fmt.Sprintf("http://localhost:3000/api/posts/%s", nonExistentId), nil)
	request.Header.Add("Authorization", "Bearer "+token)

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	response := recorder.Result()
	assert.Equal(t, 404, response.StatusCode)
}

func TestDeletePostForbidden(t *testing.T) {
	db := setupPostTestDB()
	defer db.Close()

	truncatePosts(db)
	user1 := createTestUser(db)
	post := createTestPost(db, user1)

	// Create another user
	user2 := domain.User{
		Id:         uuid.New(),
		Name:       "Other User",
		Email:      "other.user@example.com",
		Username:   "otheruser",
		Password:   "hashedpassword",
		IsVerified: true,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	_, err := db.Exec(`
        INSERT INTO users(id, name, email, username, password, is_verified, created_at, updated_at) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
		user2.Id, user2.Name, user2.Email, user2.Username, user2.Password, user2.IsVerified, user2.CreatedAt, user2.UpdatedAt)
	helper.PanicIfError(err)

	router := setupPostRouter(db)

	// Use token for user2 who doesn't own the post
	token := createJWTTokenForUser(user2)

	request := httptest.NewRequest(http.MethodDelete, fmt.Sprintf("http://localhost:3000/api/posts/%s", post.Id), nil)
	request.Header.Add("Authorization", "Bearer "+token)

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	response := recorder.Result()
	assert.Equal(t, 403, response.StatusCode)
}

// Test cases for Find All Posts
func TestFindAllPostsSuccess(t *testing.T) {
	db := setupPostTestDB()
	defer db.Close()

	truncatePosts(db)
	user := createTestUser(db)
	createTestPost(db, user)
	createTestPost(db, user) // Create a second post

	router := setupPostRouter(db)
	token := createJWTTokenForUser(user)

	request := httptest.NewRequest(http.MethodGet, "http://localhost:3000/api/posts?limit=10&offset=0", nil)
	request.Header.Add("Authorization", "Bearer "+token)

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	response := recorder.Result()
	assert.Equal(t, 200, response.StatusCode)

	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	assert.Equal(t, float64(200), responseBody["code"].(float64))

	data := responseBody["data"].(map[string]interface{})
	posts := data["posts"].([]interface{})
	total := int(data["total"].(float64))

	assert.Equal(t, 2, total)
	assert.Equal(t, 2, len(posts))
}

func TestFindAllPostsEmptyResult(t *testing.T) {
	db := setupPostTestDB()
	defer db.Close()

	truncatePosts(db)
	user := createTestUser(db)

	router := setupPostRouter(db)
	token := createJWTTokenForUser(user)

	request := httptest.NewRequest(http.MethodGet, "http://localhost:3000/api/posts?limit=10&offset=0", nil)
	request.Header.Add("Authorization", "Bearer "+token)

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	response := recorder.Result()
	assert.Equal(t, 200, response.StatusCode)

	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	assert.Equal(t, float64(200), responseBody["code"].(float64))

	data := responseBody["data"].(map[string]interface{})
	posts := data["posts"].([]interface{})
	total := int(data["total"].(float64))

	assert.Equal(t, 0, total)
	assert.Equal(t, 0, len(posts))
}

// Test cases for Find Posts By User ID
func TestFindPostsByUserIdSuccess(t *testing.T) {
	db := setupPostTestDB()
	defer db.Close()

	truncatePosts(db)
	user := createTestUser(db)
	createTestPost(db, user)
	createTestPost(db, user)

	router := setupPostRouter(db)
	token := createJWTTokenForUser(user)

	request := httptest.NewRequest(http.MethodGet, fmt.Sprintf("http://localhost:3000/api/users/%s/posts?limit=10&offset=0", user.Id), nil)
	request.Header.Add("Authorization", "Bearer "+token)

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	response := recorder.Result()
	assert.Equal(t, 200, response.StatusCode)

	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	assert.Equal(t, float64(200), responseBody["code"].(float64))

	data := responseBody["data"].(map[string]interface{})
	posts := data["posts"].([]interface{})
	total := int(data["total"].(float64))

	assert.Equal(t, 2, total)
	assert.Equal(t, 2, len(posts))
}

// Test cases for Like Post
func TestLikePostSuccess(t *testing.T) {
	db := setupPostTestDB()
	defer db.Close()

	truncatePosts(db)
	user := createTestUser(db)
	post := createTestPost(db, user)
	router := setupPostRouter(db)
	token := createJWTTokenForUser(user)

	request := httptest.NewRequest(http.MethodPost, fmt.Sprintf("http://localhost:3000/api/posts/%s/like", post.Id), nil)
	request.Header.Add("Authorization", "Bearer "+token)

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	response := recorder.Result()
	assert.Equal(t, 200, response.StatusCode)

	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	assert.Equal(t, float64(200), responseBody["code"].(float64))

	data := responseBody["data"].(map[string]interface{})
	assert.Equal(t, true, data["is_liked"])
	assert.Equal(t, float64(1), data["likes_count"].(float64))
}

// Test cases for Unlike Post
func TestUnlikePostSuccess(t *testing.T) {
	db := setupPostTestDB()
	defer db.Close()

	truncatePosts(db)
	user := createTestUser(db)
	post := createTestPost(db, user)
	router := setupPostRouter(db)
	token := createJWTTokenForUser(user)

	// First, like the post
	likeRequest := httptest.NewRequest(http.MethodPost, fmt.Sprintf("http://localhost:3000/api/posts/%s/like", post.Id), nil)
	likeRequest.Header.Add("Authorization", "Bearer "+token)

	likeRecorder := httptest.NewRecorder()
	router.ServeHTTP(likeRecorder, likeRequest)

	// Then unlike the post
	request := httptest.NewRequest(http.MethodDelete, fmt.Sprintf("http://localhost:3000/api/posts/%s/like", post.Id), nil)
	request.Header.Add("Authorization", "Bearer "+token)

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	response := recorder.Result()
	assert.Equal(t, 200, response.StatusCode)

	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	assert.Equal(t, float64(200), responseBody["code"].(float64))

	data := responseBody["data"].(map[string]interface{})
	assert.Equal(t, false, data["is_liked"])
	assert.Equal(t, float64(0), data["likes_count"].(float64))
}

func TestUnlikePostNotLiked(t *testing.T) {
	db := setupPostTestDB()
	defer db.Close()

	truncatePosts(db)
	user := createTestUser(db)
	post := createTestPost(db, user)
	router := setupPostRouter(db)
	token := createJWTTokenForUser(user)

	// Unlike a post that wasn't liked first
	request := httptest.NewRequest(http.MethodDelete, fmt.Sprintf("http://localhost:3000/api/posts/%s/like", post.Id), nil)
	request.Header.Add("Authorization", "Bearer "+token)

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	response := recorder.Result()
	assert.Equal(t, 200, response.StatusCode) // Still returns 200 as the end state is the same (not liked)

	body, _ := io.ReadAll(response.Body)
	var responseBody map[string]interface{}
	json.Unmarshal(body, &responseBody)

	data := responseBody["data"].(map[string]interface{})
	assert.Equal(t, false, data["is_liked"])
	assert.Equal(t, float64(0), data["likes_count"].(float64))
}
