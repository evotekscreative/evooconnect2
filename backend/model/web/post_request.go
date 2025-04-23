package web

type CreatePostRequest struct {
	Content    string   `json:"content" validate:"required"`
	Images     []string `json:"images"`
	Visibility string   `json:"visibility" validate:"required,oneof=public private connections"`
}

type UpdatePostRequest struct {
	Content    string   `json:"content" validate:"required"`
	Images     []string `json:"images"`
	Visibility string   `json:"visibility" validate:"required,oneof=public private connections"`
}
