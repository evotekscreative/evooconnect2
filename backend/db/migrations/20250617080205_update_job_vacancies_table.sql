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