package helper

import (
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
)

const (
	// Default allowed types
	TypeImage    = "image"
	TypeDocument = "document"
	TypeVideo    = "video"
	TypeAudio    = "audio"

	// Common upload directories
	DirUsers        = "users"
	DirGroups       = "groups"
	DirPosts        = "posts"
	DirComments     = "comments"
	DirExperience   = "experience"
	DirEducation    = "education"
	DirBlogs        = "blogs"
	DirCompanies    = "companies"
	DirCompanyPosts = "company_posts"
)

// FileUploadOptions provides configuration options for file uploads
type FileUploadOptions struct {
	// Base directory for uploads (default: "uploads")
	BaseDir string

	// Entity directory (e.g., "users", "groups", "posts")
	EntityDir string

	// Entity ID (e.g., user_id, group_id)
	EntityID string

	// Sub-directory under entity (e.g., "profile", "cover", "attachments")
	SubDir string

	// Prefix for the filename
	FilePrefix string

	// Max file size in bytes (0 = unlimited)
	MaxSize int64

	// Allowed file types/extensions (nil = allow all)
	AllowedTypes []string

	// Whether to include random UUID in filename for uniqueness
	IncludeUUID bool
}

// File upload result
type UploadResult struct {
	// Complete file path
	FilePath string

	// Relative URL path for serving
	RelativePath string

	// Filename (without path)
	Filename string
}

// UploadFile handles file upload with extensive options
func UploadFile(file multipart.File, fileHeader *multipart.FileHeader, options FileUploadOptions) (*UploadResult, error) {
	// Set default base directory if not provided
	if options.BaseDir == "" {
		options.BaseDir = "uploads"
	}

	// Set default file prefix if not provided
	if options.FilePrefix == "" {
		options.FilePrefix = "file"
	}

	// Check file size if max size is specified
	if options.MaxSize > 0 && fileHeader.Size > options.MaxSize {
		return nil, fmt.Errorf("file size exceeds the maximum allowed size of %d bytes", options.MaxSize)
	}

	// Validate file type if allowed types are specified
	if len(options.AllowedTypes) > 0 {
		valid := false
		fileExt := strings.ToLower(filepath.Ext(fileHeader.Filename))

		for _, allowedType := range options.AllowedTypes {
			if strings.HasPrefix(fileExt, ".") && fileExt == allowedType {
				valid = true
				break
			} else if !strings.HasPrefix(allowedType, ".") && fileExt == "."+allowedType {
				valid = true
				break
			}
		}

		if !valid {
			return nil, errors.New("file type not allowed")
		}
	}

	// Build upload directory path
	pathComponents := []string{options.BaseDir}

	if options.EntityDir != "" {
		pathComponents = append(pathComponents, options.EntityDir)
	}

	if options.EntityID != "" {
		pathComponents = append(pathComponents, options.EntityID)
	}

	if options.SubDir != "" {
		pathComponents = append(pathComponents, options.SubDir)
	}

	uploadDir := filepath.Join(pathComponents...)

	// Create directory structure if it doesn't exist
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create upload directory: %w", err)
	}

	// Generate unique filename
	fileExt := filepath.Ext(fileHeader.Filename)
	timestamp := time.Now().Unix()
	var filename string

	if options.IncludeUUID {
		uuidStr := strings.ReplaceAll(uuid.New().String(), "-", "")[:8]
		filename = fmt.Sprintf("%s-%d-%s%s", options.FilePrefix, timestamp, uuidStr, fileExt)
	} else {
		filename = fmt.Sprintf("%s-%d%s", options.FilePrefix, timestamp, fileExt)
	}

	filePath := filepath.Join(uploadDir, filename)

	// Create destination file
	dst, err := os.Create(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to create file: %w", err)
	}
	defer dst.Close()

	// Copy uploaded file to destination
	if _, err = io.Copy(dst, file); err != nil {
		return nil, fmt.Errorf("failed to save file: %w", err)
	}

	// Convert backslashes to forward slashes for URL consistency
	relativePath := strings.ReplaceAll(filePath, "\\", "/")

	return &UploadResult{
		FilePath:     filePath,
		RelativePath: relativePath,
		Filename:     filename,
	}, nil
}

// ValidateImageFile checks if file is a valid image
func ValidateImageFile(fileHeader *multipart.FileHeader) error {
	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	allowedExts := []string{".jpg", ".jpeg", ".png", ".gif", ".webp"}

	for _, allowed := range allowedExts {
		if ext == allowed {
			return nil
		}
	}

	return errors.New("only JPG, JPEG, PNG, GIF and WEBP files are allowed")
}

// Helper function specifically for image uploads with default settings
func UploadImage(file multipart.File, fileHeader *multipart.FileHeader, entityDir string, entityID string, subDir string) (*UploadResult, error) {
	// Validate that it's an image file
	if err := ValidateImageFile(fileHeader); err != nil {
		return nil, err
	}

	options := FileUploadOptions{
		BaseDir:     "uploads",
		EntityDir:   entityDir,
		EntityID:    entityID,
		SubDir:      subDir,
		FilePrefix:  subDir,
		MaxSize:     10 * 1024 * 1024, // 10 MB
		IncludeUUID: true,
	}

	return UploadFile(file, fileHeader, options)
}

// DeleteFile removes a file if it exists
func DeleteFile(filePath string) error {
	if filePath == "" {
		return nil
	}

	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return nil // File doesn't exist, which is fine
	}

	return os.Remove(filePath)
}

func ParseMultipartForm(request *http.Request, maxMemory int64) error {
	if err := request.ParseMultipartForm(maxMemory); err != nil {
		return fmt.Errorf("failed to parse multipart form: %w", err)
	}
	return nil
}

// ///////////////////////////////////////////
func SaveUploadedFile(file multipart.File, category string, userId string, fileExt string) string {
	// Create directory structure if it doesn't exist
	uploadDir := filepath.Join("uploads", category, userId)
	err := os.MkdirAll(uploadDir, 0755)
	PanicIfError(err)

	// Generate unique filename using timestamp
	timestamp := time.Now().Unix()
	filename := fmt.Sprintf("%s-%d%s", category, timestamp, fileExt)
	filepath := filepath.Join(uploadDir, filename)

	// Create destination file
	dst, err := os.Create(filepath)
	PanicIfError(err)
	defer dst.Close()

	// Copy uploaded file to destination
	_, err = io.Copy(dst, file)
	PanicIfError(err)

	// Return relative path with forward slashes for consistency across platforms
	return strings.ReplaceAll(filepath, "\\", "/")
}

func GetFileHeaderFromForm(request *http.Request, fieldName string) (*multipart.FileHeader, error) {
	fileHeaders := request.MultipartForm.File[fieldName]
	if len(fileHeaders) == 0 {
		return nil, fmt.Errorf("no file found for field: %s", fieldName)
	}
	return fileHeaders[0], nil
}
