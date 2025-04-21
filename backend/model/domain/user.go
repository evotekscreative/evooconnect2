package domain

import "time"

type User struct {
	Id                  int         `json:"id"`
	Name                string      `json:"name"`
	Email               string      `json:"email"`
	Password            string      `json:"-"`
	Username            string      `json:"username" `
	Birthdate           time.Time   `json:"birthdate"`
	Gender              string      `json:"gender" `
	Location            string      `json:"location" `
	Organization        string      `json:"organization" `
	Website             string      `json:"website"`
	Phone               string      `json:"phone" `
	Headline            string      `json:"headline"`
	About               string      `json:"about"`
	Skills              interface{} `json:"skills"`
	Socials             interface{} `json:"socials"`
	Photo               string      `json:"photo"`
	IsVerified          bool        `json:"is_verified"`
	VerificationToken   string      `json:"-"`
	VerificationExpires time.Time   `json:"-"`
	ResetToken          string      `json:"-"`
	ResetExpires        time.Time   `json:"-"`
	CreatedAt           time.Time   `json:"created_at"`
	UpdatedAt           time.Time   `json:"updated_at"`
}
