package migrations

import (
	"database/sql"
	"evoconnect/backend/helper"
	"log"
)

func RunMigrations(db *sql.DB) {
	log.Println("Running database migrations...")

	// Create tables if not exists
	createTables(db)

	// Fix foreign key constraints
	fixForeignKeyConstraints(db)

	log.Println("Database migrations completed successfully")
}

func createTables(db *sql.DB) {
	// Create admins table
	adminTableQuery := `
    CREATE TABLE IF NOT EXISTS admins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
    `

	_, err := db.Exec(adminTableQuery)
	helper.PanicIfError(err)
	log.Println("Migration: Admins table created/verified")
}

func fixForeignKeyConstraints(db *sql.DB) {
	log.Println("Migration: Fixing foreign key constraints...")

	// Check if company_submissions table exists
	var exists bool
	err := db.QueryRow(`
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'company_submissions'
        );
    `).Scan(&exists)
	helper.PanicIfError(err)

	if !exists {
		log.Println("Migration: company_submissions table doesn't exist yet, skipping FK fix")
		return
	}

	// Drop existing foreign key constraint if exists
	dropConstraintQuery := `
        DO $$ 
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'company_submissions_reviewed_by_fkey'
                AND table_name = 'company_submissions'
            ) THEN
                ALTER TABLE company_submissions 
                DROP CONSTRAINT company_submissions_reviewed_by_fkey;
            END IF;
        END $$;
    `

	_, err = db.Exec(dropConstraintQuery)
	helper.PanicIfError(err)
	log.Println("Migration: Dropped old foreign key constraint (if existed)")

	// Add new foreign key constraint referencing admins table
	addConstraintQuery := `
        ALTER TABLE company_submissions 
        ADD CONSTRAINT company_submissions_reviewed_by_fkey 
        FOREIGN KEY (reviewed_by) REFERENCES admins(id) ON DELETE SET NULL;
    `

	_, err = db.Exec(addConstraintQuery)
	helper.PanicIfError(err)
	log.Println("Migration: Added new foreign key constraint referencing admins table")
}
