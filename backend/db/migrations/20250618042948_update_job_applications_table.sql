-- +goose Up
-- Update job_applications table for CV management

-- Check if cv_file_path column exists and update constraints
ALTER TABLE job_applications ALTER COLUMN cv_file_path SET NOT NULL;

-- Check if contact_info column exists and update constraints
ALTER TABLE job_applications ALTER COLUMN contact_info SET NOT NULL;

-- Drop NOT NULL constraints from optional columns
ALTER TABLE job_applications ALTER COLUMN motivation_letter DROP NOT NULL;
ALTER TABLE job_applications ALTER COLUMN cover_letter DROP NOT NULL;
ALTER TABLE job_applications ALTER COLUMN expected_salary DROP NOT NULL;
ALTER TABLE job_applications ALTER COLUMN available_start_date DROP NOT NULL;

-- Add constraint
ALTER TABLE job_applications 
ADD CONSTRAINT check_contact_info_required 
CHECK (
    contact_info::jsonb ? 'phone' AND 
    contact_info::jsonb ? 'email' AND 
    contact_info::jsonb ? 'address' AND
    length(contact_info::jsonb->>'phone') > 0 AND
    length(contact_info::jsonb->>'email') > 0 AND
    length(contact_info::jsonb->>'address') > 0
);

-- Create table only if it doesn't exist
CREATE TABLE IF NOT EXISTS user_cv_storage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cv_file_path VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_cv_storage_user_id ON user_cv_storage(user_id);

-- +goose Down
-- Drop index
DROP INDEX IF EXISTS idx_user_cv_storage_user_id;

-- Drop table
DROP TABLE IF EXISTS user_cv_storage;

-- Drop constraint
ALTER TABLE job_applications DROP CONSTRAINT IF EXISTS check_contact_info_required;

-- Revert column constraints
ALTER TABLE job_applications ALTER COLUMN cv_file_path DROP NOT NULL;
ALTER TABLE job_applications ALTER COLUMN contact_info DROP NOT NULL;
ALTER TABLE job_applications ALTER COLUMN motivation_letter SET NOT NULL;
ALTER TABLE job_applications ALTER COLUMN cover_letter SET NOT NULL;
ALTER TABLE job_applications ALTER COLUMN expected_salary SET NOT NULL;
ALTER TABLE job_applications ALTER COLUMN available_start_date SET NOT NULL;
