package seeder

import (
	"database/sql"
	"evoconnect/backend/helper"
	"evoconnect/backend/utils"
	"log"
	"time"

	"github.com/google/uuid"
)

func SeedAdmin(db *sql.DB) {
	// Check if admin table exists
	createAdminTable(db)

	// Check if admin already exists
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM administrators").Scan(&count)
	helper.PanicIfError(err)

	if count > 0 {
		log.Println("Admin seeder: Default admin already exists")
		return
	}

	// Create default admin
	id := uuid.New()
	username := "admin"
	email := "admin@example.com"
	password, err := utils.HashPassword("admin123")
	helper.PanicIfError(err)
	name := "Administrator"
	role := "super_admin"
	now := time.Now()

	// PostgreSQL uses $1, $2, etc. instead of ? for parameterized queries
	query := `INSERT INTO administrators (id, username, email, password, name, role, created_at, updated_at) 
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`

	_, err = db.Exec(query, id, username, email, password, name, role, now, now)
	helper.PanicIfError(err)

	log.Println("Admin seeder: Default admin created successfully")
}

func createAdminTable(db *sql.DB) {
	query := `
    CREATE TABLE IF NOT EXISTS administrators (
        id UUID PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
    );
    `

	_, err := db.Exec(query)
	helper.PanicIfError(err)
}
