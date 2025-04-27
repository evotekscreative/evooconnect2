package web

type UpdateProfileRequest struct {
	Name         string      `json:"name" validate:"required"`
	Email        string      `json:"email" validate:"required,email"`
	Username     string      `json:"username" validate:"required,max=100"`
	Birthdate    string      `json:"birthdate"`
	Gender       string      `json:"gender" validate:"max=20"`
	Location     string      `json:"location" validate:"max=100"`
	Organization string      `json:"organization" validate:"max=100"`
	Website      string      `json:"website"`
	Phone        string      `json:"phone" validate:"max=20"`
	Headline     string      `json:"headline" validate:"max=100"`
	About        string      `json:"about"`
	Skills       interface{} `json:"skills"`
	Socials      interface{} `json:"socials"`
	Photo        string      `json:"photo"`
}

type SocialMediaRequest struct {
	Platform string `json:"platform" validate:"required,max=50"`
	Link     string `json:"link" validate:"required,max=200"`
}
