// domain/blog.go
package domain

type Blog struct {
	ID        string
	Title     string
	Slug      string
	Category  string
	Content   string
	Image     string
	UserID    string
	CreatedAt string
	UpdatedAt string
}