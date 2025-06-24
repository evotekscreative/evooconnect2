-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    job_vacancy_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_vacancy_id) REFERENCES job_vacancies(id) ON DELETE CASCADE,
    UNIQUE (user_id, job_vacancy_id)
);

-- Create indexes for better performance
CREATE INDEX idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX idx_saved_jobs_job_vacancy_id ON saved_jobs(job_vacancy_id);
CREATE INDEX idx_saved_jobs_created_at ON saved_jobs(created_at DESC);

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_saved_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_saved_jobs_updated_at
    BEFORE UPDATE ON saved_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_saved_jobs_updated_at();
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS update_saved_jobs_updated_at ON saved_jobs;
DROP FUNCTION IF EXISTS update_saved_jobs_updated_at();
DROP TABLE IF EXISTS saved_jobs;
-- +goose StatementEnd