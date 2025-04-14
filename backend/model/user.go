package model

type User struct {
	Id       int    `json:"id"`
	Name     string `json:"name" validate:"required,min=3,max=50"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
	Token    string `json:"token" nullable`
	Role     string `json:"role"`
}
