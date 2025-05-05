package helper

import (
    "evoconnect/backend/model/domain"
    "evoconnect/backend/model/web"
    "errors"
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

func ValidateBlogInput(title, content, category string) error {
    if title == "" {
        return errors.New("title harus diisi")
    }
    if content == "" {
        return errors.New("content harus diisi")
    }
    if category == "" {
        return errors.New("category harus diisi")
    }
    if !isValidCategory(category) {
        return errors.New("category tidak valid")
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




