package test

import (
    "database/sql"
    "encoding/json"
    "evoconnect/backend/app"
    "evoconnect/backend/controller"
    "evoconnect/backend/exception"
    "evoconnect/backend/helper"
    "evoconnect/backend/model/domain"
    "evoconnect/backend/repository"
    "evoconnect/backend/service"
    "fmt"
    "io"
    "net/http"
    "net/http/httptest"
    "strings"
    "testing"
    "time"

    "github.com/julienschmidt/httprouter"
    "github.com/stretchr/testify/assert"
)

func setupBlogTestDB() *sql.DB {
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

func truncateBlogsTable(db *sql.DB) {
    db.Exec("TRUNCATE TABLE tb_blog RESTART IDENTITY CASCADE")
}

func createBlogForTest(db *sql.DB) domain.Blog {
    blog := domain.Blog{
        ID:        "1",
        Title:     "Test Blog",
        Slug:      "test-blog",
        Category:  "Technology",
        Content:   "This is a test blog.",
        Image:     "https://example.com/image.jpg",
        UserID:    "123",
        CreatedAt: time.Now().Format(time.RFC3339),
        UpdatedAt: time.Now().Format(time.RFC3339),
    }

    _, err := db.Exec(`
        INSERT INTO tb_blog (id, title, slug, category, content, image, user_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        blog.ID, blog.Title, blog.Slug, blog.Category, blog.Content, blog.Image, blog.UserID, blog.CreatedAt, blog.UpdatedAt)
    helper.PanicIfError(err)

    return blog
}

func setupBlogRouter(db *sql.DB) http.Handler {
    blogRepository := repository.NewBlogRepository(db)
    blogService := service.NewBlogService(blogRepository)
    blogController := controller.NewBlogController(blogService)

    router := httprouter.New()

    router.POST("/api/blogs", blogController.Create)
    router.GET("/api/blogs", blogController.FindAll)
    router.GET("/api/blogs/:slug", blogController.GetBySlug)
    router.DELETE("/api/blogs/:blogId", blogController.Delete)

    router.PanicHandler = exception.ErrorHandler

    return router
}

func TestCreateBlogSuccess(t *testing.T) {
    db := setupBlogTestDB()
    truncateBlogsTable(db)
    router := setupBlogRouter(db)

    requestBody := strings.NewReader(`{
        "title": "New Blog",
        "category": "Technology",
        "content": "This is a new blog.",
        "image": "https://example.com/new-image.jpg"
    }`)
    request := httptest.NewRequest(http.MethodPost, "http://localhost:3000/api/blogs", requestBody)
    request.Header.Add("Content-Type", "application/json")

    recorder := httptest.NewRecorder()

    router.ServeHTTP(recorder, request)

    response := recorder.Result()
    assert.Equal(t, 201, response.StatusCode)

    body, _ := io.ReadAll(response.Body)
    var responseBody map[string]interface{}
    json.Unmarshal(body, &responseBody)

    assert.Equal(t, 201, int(responseBody["code"].(float64)))
    assert.Equal(t, "CREATED", responseBody["status"])
    assert.NotNil(t, responseBody["data"])
}

func TestFindAllBlogsSuccess(t *testing.T) {
    db := setupBlogTestDB()
    truncateBlogsTable(db)
    router := setupBlogRouter(db)

    // Create test blog
    createBlogForTest(db)

    request := httptest.NewRequest(http.MethodGet, "http://localhost:3000/api/blogs", nil)
    recorder := httptest.NewRecorder()

    router.ServeHTTP(recorder, request)

    response := recorder.Result()
    assert.Equal(t, 200, response.StatusCode)

    body, _ := io.ReadAll(response.Body)
    var responseBody map[string]interface{}
    json.Unmarshal(body, &responseBody)

    assert.Equal(t, 200, int(responseBody["code"].(float64)))
    assert.Equal(t, "OK", responseBody["status"])
    assert.NotNil(t, responseBody["data"])
}

func TestGetBlogBySlugSuccess(t *testing.T) {
    db := setupBlogTestDB()
    truncateBlogsTable(db)
    router := setupBlogRouter(db)

    // Create test blog
    blog := createBlogForTest(db)

    request := httptest.NewRequest(http.MethodGet, fmt.Sprintf("http://localhost:3000/api/blogs/%s", blog.Slug), nil)
    recorder := httptest.NewRecorder()

    router.ServeHTTP(recorder, request)

    response := recorder.Result()
    assert.Equal(t, 200, response.StatusCode)

    body, _ := io.ReadAll(response.Body)
    var responseBody map[string]interface{}
    json.Unmarshal(body, &responseBody)

    assert.Equal(t, 200, int(responseBody["code"].(float64)))
    assert.Equal(t, "OK", responseBody["status"])
    assert.NotNil(t, responseBody["data"])

    data := responseBody["data"].(map[string]interface{})
    assert.Equal(t, blog.ID, data["id"])
    assert.Equal(t, blog.Title, data["title"])
    assert.Equal(t, blog.Slug, data["slug"])
}

func TestDeleteBlogSuccess(t *testing.T) {
    db := setupBlogTestDB()
    truncateBlogsTable(db)
    router := setupBlogRouter(db)

    // Create test blog
    blog := createBlogForTest(db)

    request := httptest.NewRequest(http.MethodDelete, fmt.Sprintf("http://localhost:3000/api/blogs/%s", blog.ID), nil)
    recorder := httptest.NewRecorder()

    router.ServeHTTP(recorder, request)

    response := recorder.Result()
    assert.Equal(t, 200, response.StatusCode)

    body, _ := io.ReadAll(response.Body)
    var responseBody map[string]interface{}
    json.Unmarshal(body, &responseBody)

    assert.Equal(t, 200, int(responseBody["code"].(float64)))
    assert.Equal(t, "OK", responseBody["status"])
    assert.Equal(t, "Blog berhasil dihapus", responseBody["data"].(map[string]interface{})["message"])
}