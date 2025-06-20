-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_vacancy_id UUID NOT NULL,
    applicant_id UUID NOT NULL,
    cv_file_path VARCHAR(500),
    contact_info JSONB NOT NULL, -- {phone, email, linkedin, etc}
    motivation_letter TEXT NOT NULL,
    cover_letter TEXT,
    expected_salary DECIMAL(15,2),
    available_start_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'accepted', 'rejected')),
    rejection_reason TEXT,
    notes TEXT, -- Internal notes from HR/recruiter
    reviewed_by UUID,
    reviewed_at TIMESTAMP,
    interview_scheduled_at TIMESTAMP,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_vacancy_id) REFERENCES job_vacancies(id) ON DELETE CASCADE,
    FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Prevent duplicate applications
    UNIQUE(job_vacancy_id, applicant_id)
);

-- Create indexes for better performance
CREATE INDEX idx_job_applications_vacancy_id ON job_applications(job_vacancy_id);
CREATE INDEX idx_job_applications_applicant_id ON job_applications(applicant_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_job_applications_reviewed_by ON job_applications(reviewed_by);
CREATE INDEX idx_job_applications_submitted_at ON job_applications(submitted_at DESC);
CREATE INDEX idx_job_applications_company_status ON job_applications(job_vacancy_id, status);

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_job_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_job_applications_updated_at
    BEFORE UPDATE ON job_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_job_applications_updated_at();

-- Create trigger to update application count in job_vacancies
CREATE OR REPLACE FUNCTION update_job_vacancy_application_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE job_vacancies 
        SET application_count = application_count + 1 
        WHERE id = NEW.job_vacancy_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE job_vacancies 
        SET application_count = application_count - 1 
        WHERE id = OLD.job_vacancy_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_job_vacancy_application_count_trigger
    AFTER INSERT OR DELETE ON job_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_job_vacancy_application_count();
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS update_job_vacancy_application_count_trigger ON job_applications;
DROP TRIGGER IF EXISTS update_job_applications_updated_at ON job_applications;
DROP FUNCTION IF EXISTS update_job_vacancy_application_count();
DROP FUNCTION IF EXISTS update_job_applications_updated_at();
DROP TABLE IF EXISTS job_applications;
-- +goose StatementEnd