package helper

import (
    "evoconnect/backend/model/domain"
    "evoconnect/backend/model/web"
    "errors"
    "fmt"
    "io"
    "os"
    "mime/multipart"
    "path/filepath"
    "time"  
)

func ToBlogResponse(blog domain.Blog) web.BlogResponse {
    return web.BlogResponse{
        ID:        blog.ID,
        Title:     blog.Title,
        Slug:      blog.Slug,
        Category:  blog.Category,
        Content:   blog.Content,
        Photo:     blog.ImagePath,
        UserID:    blog.UserID,
        CreatedAt: blog.CreatedAt,
        UpdatedAt: blog.UpdatedAt,
    }
}

// Fungsi baru yang menerima user dan isConnected sebagai parameter terpisah
func ToBlogResponseWithUser(blog domain.Blog, user domain.User, isConnected bool) web.BlogResponse {
    // Tambahkan warning jika blog di-take down
    warning := ""
    if blog.Status == "taken_down" {
        warning = "This blog has been removed for violating our community guidelines. Only you can view this content."
    }
    
    return web.BlogResponse{
        ID:        blog.ID,
        Title:     blog.Title,
        Slug:      blog.Slug,
        Category:  blog.Category,
        Content:   blog.Content,
        Photo:     blog.ImagePath,
        UserID:    blog.UserID,
        Warning:   warning,
        CreatedAt: blog.CreatedAt,
        UpdatedAt: blog.UpdatedAt,
        User: web.BlogUserResponse{
            ID:          user.Id.String(),
            Name:        user.Name,
            Username:    user.Username,
            Photo:       user.Photo,
            IsConnected: isConnected,
        },
    }
}

func ValidateBlogInput(title, content, category string) error {
    if title == "" {
        return errors.New("title is required")
    }
    if content == "" {
        return errors.New("content is required")
    }
    if category == "" {
        return errors.New("category is required")
    }
    if !isValidCategory(category) {
        return errors.New("invalid category")
    }
    return nil
}


func isValidCategory(category string) bool {
    allowedCategories := []string{
        "Fashion", "Beauty", "Travel", "Lifestyle", "Personal", "Technology",
        "Health", "Fitness", "Healthcare", "SaaS Services", "Business",
        "Education", "Food & Recipes", "Love & Relationships", "Alternative Topics",
        "Eco-Friendly Living", "Music", "Automotive", "Marketing", "Internet Services",
        "Finance", "Sports", "Entertainment", "Productivity", "Hobbies",
        "Parenting", "Pets", "Photography", "Farming", "Art",
    }
    for _, cat := range allowedCategories {
        if cat == category {
            return true
        }
    }
    return false
}

func SaveBlogImage(file multipart.File, header *multipart.FileHeader, userID string) (string, error) {
    // Buat direktori untuk user
    uploadDir := fmt.Sprintf("uploads/blogs/%s", userID)
    if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
        return "", fmt.Errorf("gagal membuat direktori upload: %w", err)
    }

    // Generate unique filename
    timestamp := fmt.Sprintf("%d", time.Now().UnixNano())
    ext := filepath.Ext(header.Filename)
    fileName := fmt.Sprintf("blog-%s%s", timestamp, ext)
    filePath := fmt.Sprintf("%s/%s", uploadDir, fileName)

    // Simpan file
    out, err := os.Create(filePath)
    if err != nil {
        return "", err
    }
    defer out.Close()

    _, err = io.Copy(out, file)
    if err != nil {
        return "", err
    }

    return filePath, nil
}

// DeleteBlogImage menghapus file gambar blog jika ada
func DeleteBlogImage(filePath string) error {
    if filePath == "" {
        return nil // Tidak ada file untuk dihapus
    }

    // Periksa apakah file ada
    if _, err := os.Stat(filePath); os.IsNotExist(err) {
        return nil // File sudah tidak ada, tidak perlu error
    }

    // Hapus file
    return os.Remove(filePath)
}
