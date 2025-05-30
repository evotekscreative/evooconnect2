-- +goose Up
-- +goose StatementBegin
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    linkedin_url VARCHAR(100) NOT NULL,
    website VARCHAR(255),
    industry VARCHAR(100) NOT NULL,
    size VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    logo VARCHAR(255),
    tagline VARCHAR(250),
    description TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_companies_owner_id ON companies(owner_id);
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_is_verified ON companies(is_verified);
CREATE INDEX idx_companies_created_at ON companies(created_at);

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_companies_updated_at();
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
DROP FUNCTION IF EXISTS update_companies_updated_at();
DROP TABLE IF EXISTS companies;
-- +goose StatementEnd