package domain

import "time"

type User struct {
	Id                  int       `json:"id"`
	Name                string    `json:"name"`
	Email               string    `json:"email"`
	Password            string    `json:"-"`
	IsVerified          bool      `json:"is_verified"`
	VerificationToken   string    `json:"-"`
	VerificationExpires time.Time `json:"-"`
	ResetToken          string    `json:"-"`
	ResetExpires        time.Time `json:"-"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}
