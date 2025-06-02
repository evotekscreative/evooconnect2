-- +goose Up
-- +goose StatementBegin
CREATE TABLE company_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    linkedin_url VARCHAR(100) NOT NULL,
    website VARCHAR(255),
    industry VARCHAR(100) NOT NULL,
    size VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    logo VARCHAR(255),
    tagline VARCHAR(250),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX idx_company_submissions_user_id ON company_submissions(user_id);
CREATE INDEX idx_company_submissions_status ON company_submissions(status);
CREATE INDEX idx_company_submissions_created_at ON company_submissions(created_at);

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_company_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_company_submissions_updated_at
    BEFORE UPDATE ON company_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_company_submissions_updated_at();
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS update_company_submissions_updated_at ON company_submissions;
DROP FUNCTION IF EXISTS update_company_submissions_updated_at();
DROP TABLE IF EXISTS company_submissions;
-- +goose StatementEnd