-- +goose Up
-- +goose StatementBegin

-- Create enum for application type
CREATE TYPE job_apply_type AS ENUM ('simple_apply', 'external_apply');

-- Add new columns to job_vacancies table
ALTER TABLE job_vacancies ADD COLUMN type_apply job_apply_type NOT NULL DEFAULT 'simple_apply';
ALTER TABLE job_vacancies ADD COLUMN external_link TEXT;

-- Add constraint: external_link is required when type_apply is 'external_apply'
ALTER TABLE job_vacancies ADD CONSTRAINT chk_external_link_required 
    CHECK (
        (type_apply = 'external_apply' AND external_link IS NOT NULL AND external_link != '') 
        OR type_apply = 'simple_apply'
    );

-- Create index for better performance
CREATE INDEX idx_job_vacancies_type_apply ON job_vacancies(type_apply);



-- First, drop all existing constraints that will be recreated
ALTER TABLE job_vacancies DROP CONSTRAINT IF EXISTS job_vacancies_job_type_check;
ALTER TABLE job_vacancies DROP CONSTRAINT IF EXISTS job_vacancies_experience_level_check;
ALTER TABLE job_vacancies DROP CONSTRAINT IF EXISTS job_vacancies_status_check;

-- Rename columns to match domain model
ALTER TABLE job_vacancies RENAME COLUMN job_description TO description;
ALTER TABLE job_vacancies RENAME COLUMN salary_min TO min_salary;
ALTER TABLE job_vacancies RENAME COLUMN salary_max TO max_salary;
ALTER TABLE job_vacancies RENAME COLUMN skills TO skills;

-- Drop unused columns
ALTER TABLE job_vacancies DROP COLUMN IF EXISTS department;
ALTER TABLE job_vacancies DROP COLUMN IF EXISTS education_requirement;
ALTER TABLE job_vacancies DROP COLUMN IF EXISTS is_urgent;
ALTER TABLE job_vacancies DROP COLUMN IF EXISTS remote_work_allowed;
ALTER TABLE job_vacancies DROP COLUMN IF EXISTS application_count;
ALTER TABLE job_vacancies DROP COLUMN IF EXISTS view_count;

-- Add missing columns
ALTER TABLE job_vacancies ADD COLUMN IF NOT EXISTS work_type VARCHAR(20) NOT NULL DEFAULT 'in-office';

-- Update job_type values and constraint to use hyphens
UPDATE job_vacancies SET job_type = 'full-time' WHERE job_type = 'full_time';
UPDATE job_vacancies SET job_type = 'part-time' WHERE job_type = 'part_time';

-- Update experience_level values to match domain constants
UPDATE job_vacancies SET experience_level = 'entry' WHERE experience_level = 'entry_level';
UPDATE job_vacancies SET experience_level = 'mid' WHERE experience_level = 'mid_level';
UPDATE job_vacancies SET experience_level = 'senior' WHERE experience_level = 'senior_level';
UPDATE job_vacancies SET experience_level = 'executive' WHERE experience_level = 'executive';

-- Update status values to match domain constants
UPDATE job_vacancies SET status = 'active' WHERE status = 'published';

-- Add new constraints with correct values
ALTER TABLE job_vacancies ADD CONSTRAINT job_vacancies_job_type_check 
    CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship', 'freelance'));

ALTER TABLE job_vacancies ADD CONSTRAINT job_vacancies_experience_level_check 
    CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive'));

ALTER TABLE job_vacancies ADD CONSTRAINT job_vacancies_status_check 
    CHECK (status IN ('draft', 'active', 'closed', 'archived'));

ALTER TABLE job_vacancies ADD CONSTRAINT job_vacancies_work_type_check 
    CHECK (work_type IN ('remote', 'hybrid', 'in-office'));

-- Update creator_id to allow NULL (for system-created jobs)
ALTER TABLE job_vacancies ALTER COLUMN creator_id DROP NOT NULL;

-- Add constraint for external link requirement
ALTER TABLE job_vacancies ADD CONSTRAINT chk_external_link_with_type 
    CHECK (
        (type_apply = 'external_apply' AND external_link IS NOT NULL AND external_link != '') 
        OR type_apply = 'simple_apply'
    );

-- Create additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_vacancies_work_type ON job_vacancies(work_type);
CREATE INDEX IF NOT EXISTS idx_job_vacancies_min_salary ON job_vacancies(min_salary);
CREATE INDEX IF NOT EXISTS idx_job_vacancies_max_salary ON job_vacancies(max_salary);
CREATE INDEX IF NOT EXISTS idx_job_vacancies_currency ON job_vacancies(currency);
CREATE INDEX IF NOT EXISTS idx_job_vacancies_skills ON job_vacancies USING GIN(skills);

-- Update the trigger function to handle updated_at
DROP TRIGGER IF EXISTS update_job_vacancies_updated_at ON job_vacancies;
DROP FUNCTION IF EXISTS update_job_vacancies_updated_at();

CREATE OR REPLACE FUNCTION update_job_vacancies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_job_vacancies_updated_at
    BEFORE UPDATE ON job_vacancies
    FOR EACH ROW
    EXECUTE FUNCTION update_job_vacancies_updated_at();


-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- Drop constraint and columns
ALTER TABLE job_vacancies DROP CONSTRAINT IF EXISTS chk_external_link_required;
ALTER TABLE job_vacancies DROP COLUMN IF EXISTS external_link;
ALTER TABLE job_vacancies DROP COLUMN IF EXISTS type_apply;

-- Drop enum type
DROP TYPE IF EXISTS job_apply_type;

-- Drop index
DROP INDEX IF EXISTS idx_job_vacancies_type_apply;
-- +goose StatementEnd