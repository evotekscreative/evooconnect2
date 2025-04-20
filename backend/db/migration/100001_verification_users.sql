-- Add verification fields to users table
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS verification_expires TIMESTAMP NULL,
    ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS reset_expires TIMESTAMP NULL;