-- Update job_applications table for CV management
ALTER TABLE job_applications 
ALTER COLUMN cv_file_path SET NOT NULL,
ALTER COLUMN contact_info SET NOT NULL,
ALTER COLUMN motivation_letter DROP NOT NULL,
ALTER COLUMN cover_letter DROP NOT NULL,
ALTER COLUMN expected_salary DROP NOT NULL,
ALTER COLUMN available_start_date DROP NOT NULL;

-- Add constraint to ensure contact_info has required fields
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

-- Add user_cv_path table for CV management
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

-- Create index for faster lookups
CREATE INDEX idx_user_cv_storage_user_id ON user_cv_storage(user_id);

