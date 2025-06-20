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
	err := db.QueryRow("SELECT COUNT(*) FROM admins").Scan(&count)
	helper.PanicIfError(err)

	if count > 0 {
		log.Println("Admin seeder: Default admin already exists")
		return
	}

	// Create default admin
	id := uuid.New()
	email := "admin@example.com"
	password, err := utils.HashPassword("admin123")
	helper.PanicIfError(err)
	name := "Administrator"
	now := time.Now()

	// Use RETURNING to get the inserted ID (more consistent with repository pattern)
	query := `INSERT INTO admins (id, email, password, name, created_at, updated_at) 
              VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`

	var insertedId uuid.UUID
	err = db.QueryRow(query, id, email, password, name, now, now).Scan(&insertedId)
	helper.PanicIfError(err)

	log.Println("Admin seeder: Default admin created successfully")
	log.Printf("Default admin credentials - Email: %s, Password: admin123", email)
	log.Printf("Admin ID: %s", insertedId.String())
}

func createAdminTable(db *sql.DB) {
	query := `
    CREATE TABLE IF NOT EXISTS admins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Create index for better performance
    CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
    `

	_, err := db.Exec(query)
	helper.PanicIfError(err)

	log.Println("Admin seeder: Admin table created/verified successfully")
}
