package domain

import (
	"time"

	"github.com/google/uuid"
)

type UserExperience struct {
	Id          uuid.UUID `db:"id"`
	UserId      uuid.UUID `db:"user_id"`
	JobTitle    string    `db:"job_title"`
	CompanyName string    `db:"company_name"`
	StartMonth  string    `db:"start_month"`
	StartYear   string    `db:"start_year"`
	EndMonth    *string   `db:"end_month"`
	EndYear     *string   `db:"end_year"`
	Caption     *string   `db:"caption"`
	Photo       *string   `db:"photo"`
	CreatedAt   time.Time `db:"created_at"`
	UpdatedAt   time.Time `db:"updated_at"`
}
