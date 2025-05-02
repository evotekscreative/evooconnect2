package helper

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// SaveUploadedFile saves an uploaded file to the specified category folder
// and returns the relative path to the saved file
// Create the necessary directory structure under uploads/{category}/{userId}/
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
