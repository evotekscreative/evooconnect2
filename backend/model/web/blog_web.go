package web

type BlogCreateRequest struct {
	Title    string `json:"title"`
	Category string `json:"category"`
	Content  string `json:"content"`
	Image    string `json:"image"`
}

type BlogUserResponse struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Username string `json:"username"`
	Photo    string `json:"photo"`
	IsConnected bool `json:"is_connected"`
}

type BlogResponse struct {
	ID        string           `json:"id"`
	Title     string           `json:"title"`
	Slug      string           `json:"slug"`
	Category  string           `json:"category"`
	Content   string           `json:"content"`
	Photo     string           `json:"photo"`
	UserID    string           `json:"user_id"`
	CreatedAt string           `json:"created_at"`
	UpdatedAt string           `json:"updated_at"`
	User      BlogUserResponse `json:"user"`
}
