-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS job_vacancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    creator_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    department VARCHAR(100),
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('full_time', 'part_time', 'contract', 'internship', 'freelance')),
    location VARCHAR(200) NOT NULL,
    salary_min DECIMAL(15,2),
    salary_max DECIMAL(15,2),
    currency VARCHAR(10) DEFAULT 'IDR',
    experience_level VARCHAR(50) NOT NULL CHECK (experience_level IN ('entry_level', 'mid_level', 'senior_level', 'executive')),
    education_requirement VARCHAR(100),
    job_description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    benefits TEXT,
    skills_required JSONB DEFAULT '[]'::jsonb,
    application_deadline TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'archived')),
    is_urgent BOOLEAN DEFAULT false,
    remote_work_allowed BOOLEAN DEFAULT false,
    application_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_job_vacancies_company_id ON job_vacancies(company_id);
CREATE INDEX idx_job_vacancies_creator_id ON job_vacancies(creator_id);
CREATE INDEX idx_job_vacancies_status ON job_vacancies(status);
CREATE INDEX idx_job_vacancies_job_type ON job_vacancies(job_type);
CREATE INDEX idx_job_vacancies_experience_level ON job_vacancies(experience_level);
CREATE INDEX idx_job_vacancies_created_at ON job_vacancies(created_at DESC);
CREATE INDEX idx_job_vacancies_deadline ON job_vacancies(application_deadline);
CREATE INDEX idx_job_vacancies_location ON job_vacancies(location);
CREATE INDEX idx_job_vacancies_active ON job_vacancies(status, application_deadline) WHERE status = 'published';

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_job_vacancies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_job_vacancies_updated_at
    BEFORE UPDATE ON job_vacancies
    FOR EACH ROW
    EXECUTE FUNCTION update_job_vacancies_updated_at();
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS update_job_vacancies_updated_at ON job_vacancies;
DROP FUNCTION IF EXISTS update_job_vacancies_updated_at();
DROP TABLE IF EXISTS job_vacancies;
-- +goose StatementEnd