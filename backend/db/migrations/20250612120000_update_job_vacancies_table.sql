-- +goose Up
-- +goose StatementBegin

-- Create enum for work type
CREATE TYPE work_type AS ENUM ('remote', 'hybrid', 'in-office');

-- Drop existing constraints if any
ALTER TABLE job_vacancies DROP CONSTRAINT IF EXISTS chk_job_vacancies_remote_work_allowed;

-- Add new work_type column
ALTER TABLE job_vacancies ADD COLUMN work_type work_type;

-- Migrate existing data: if remote_work_allowed is true, set to 'remote', otherwise 'in-office'
UPDATE job_vacancies SET work_type = CASE 
    WHEN remote_work_allowed = true THEN 'remote'::work_type
    ELSE 'in-office'::work_type
END;

-- Make work_type NOT NULL and set default
ALTER TABLE job_vacancies ALTER COLUMN work_type SET NOT NULL;
ALTER TABLE job_vacancies ALTER COLUMN work_type SET DEFAULT 'in-office';

-- Drop old remote_work_allowed column
ALTER TABLE job_vacancies DROP COLUMN IF EXISTS remote_work_allowed;

-- Make application_deadline nullable
ALTER TABLE job_vacancies ALTER COLUMN application_deadline DROP NOT NULL;

-- Rename education_requirement to education_minimum and make nullable
ALTER TABLE job_vacancies RENAME COLUMN education_requirement TO education_minimum;
ALTER TABLE job_vacancies ALTER COLUMN education_minimum DROP NOT NULL;

-- Make salary columns nullable
ALTER TABLE job_vacancies ALTER COLUMN salary_min DROP NOT NULL;
ALTER TABLE job_vacancies ALTER COLUMN salary_max DROP NOT NULL;

-- Drop department column
ALTER TABLE job_vacancies DROP COLUMN IF EXISTS department;

-- Update indexes
DROP INDEX IF EXISTS idx_job_vacancies_department;
CREATE INDEX idx_job_vacancies_work_type ON job_vacancies(work_type);
CREATE INDEX idx_job_vacancies_education_minimum ON job_vacancies(education_minimum);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- Add back department column
ALTER TABLE job_vacancies ADD COLUMN department VARCHAR(100);

-- Add back remote_work_allowed column
ALTER TABLE job_vacancies ADD COLUMN remote_work_allowed BOOLEAN DEFAULT false;

-- Migrate work_type back to remote_work_allowed
UPDATE job_vacancies SET remote_work_allowed = CASE 
    WHEN work_type = 'remote' THEN true
    ELSE false
END;

-- Make remote_work_allowed NOT NULL
ALTER TABLE job_vacancies ALTER COLUMN remote_work_allowed SET NOT NULL;

-- Drop work_type column
ALTER TABLE job_vacancies DROP COLUMN work_type;

-- Rename education_minimum back to education_requirement and make NOT NULL
ALTER TABLE job_vacancies RENAME COLUMN education_minimum TO education_requirement;
-- Note: We can't safely make it NOT NULL in rollback without knowing what default value to use

-- Make application_deadline NOT NULL
-- Note: We can't safely make it NOT NULL in rollback without knowing what default value to use

-- Make salary columns NOT NULL
-- Note: We can't safely make them NOT NULL in rollback without knowing what default values to use

-- Drop new indexes and recreate old ones
DROP INDEX IF EXISTS idx_job_vacancies_work_type;
DROP INDEX IF EXISTS idx_job_vacancies_education_minimum;
CREATE INDEX idx_job_vacancies_department ON job_vacancies(department);

-- Drop work_type enum
DROP TYPE IF EXISTS work_type;

-- +goose StatementEnd