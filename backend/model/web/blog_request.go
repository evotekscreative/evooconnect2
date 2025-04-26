package web

type BlogCreateRequest struct {
	Title    string   `json:"title"`
	Category string   `json:"category"`
	Content  string   `json:"content"`
	Image    string   `json:"image"`
}