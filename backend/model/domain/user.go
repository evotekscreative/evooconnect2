package domain

import (
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
)

// Tipe khusus untuk kolom JSONB
type JSONB []interface{}

// Value - Implementasi interface driver.Valuer
func (j JSONB) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	return json.Marshal(j)
}

// Scan - Implementasi interface sql.Scanner
func (j *JSONB) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}

	s, ok := value.([]byte)
	if !ok {
		return errors.New("Invalid scan source for JSONB")
	}

	return json.Unmarshal(s, j)
}

// Tipe khusus untuk socials
type SocialMedia []map[string]interface{}

// Value - Implementasi interface driver.Valuer
func (s SocialMedia) Value() (driver.Value, error) {
	if s == nil {
		return nil, nil
	}
	return json.Marshal(s)
}

// Scan - Implementasi interface sql.Scanner
func (s *SocialMedia) Scan(value interface{}) error {
	if value == nil {
		*s = nil
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("Invalid scan source for SocialMedia")
	}

	return json.Unmarshal(bytes, s)
}

type User struct {
	Id                  uuid.UUID      `json:"id"`
	Name                string         `json:"name"`
	Email               string         `json:"email"`
	Password            string         `json:"-"`
	Username            string         `json:"username" `
	Birthdate           time.Time      `json:"birthdate"`
	Gender              string         `json:"gender" `
	Location            string         `json:"location" `
	Organization        string         `json:"organization" `
	Website             string         `json:"website"`
	Phone               string         `json:"phone" `
	Headline            string         `json:"headline"`
	About               string         `json:"about"`
	Skills              sql.NullString `json:"skills"`
	Socials             sql.NullString `json:"socials"`
	Photo               string         `json:"photo"`
	IsVerified          bool           `json:"is_verified"`
	IsConnected         bool           `json:"is_connected"`
	VerificationToken   string         `json:"-"`
	VerificationExpires time.Time      `json:"-"`
	ResetToken          string         `json:"-"`
	ResetExpires        time.Time      `json:"-"`
	CreatedAt           time.Time      `json:"created_at"`
	UpdatedAt           time.Time      `json:"updated_at"`
}
