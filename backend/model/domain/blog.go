// domain/blog.go
package domain

type Blog struct {
	ID        string
	Title     string
	Slug      string
	Category  string
	Content   string
	ImagePath string `json:"image_path"` // Ubah dari Image ke ImagePath
	UserID    string
	Warning   string `json:"warning,omitempty"` // Tambahkan field Warning
	Status    string
	CreatedAt string
	UpdatedAt string
}

