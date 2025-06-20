-- +goose Up
-- +goose StatementBegin
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE member_company_role AS ENUM ('super_admin', 'admin', 'hrd', 'member');
CREATE TYPE member_company_status AS ENUM ('active', 'inactive');

-- Create member_company table
CREATE TABLE member_company (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    role member_company_role NOT NULL DEFAULT 'member',
    status member_company_status NOT NULL DEFAULT 'active',
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP WITH TIME ZONE NULL,
    approved_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(user_id, company_id),
    CHECK (left_at IS NULL OR left_at >= joined_at),
    CHECK (approved_at IS NULL OR approved_at >= created_at)
);

-- Create indexes for better performance
CREATE INDEX idx_member_company_user_id ON member_company(user_id);
CREATE INDEX idx_member_company_company_id ON member_company(company_id);
CREATE INDEX idx_member_company_role ON member_company(role);
CREATE INDEX idx_member_company_status ON member_company(status);
CREATE INDEX idx_member_company_joined_at ON member_company(joined_at);
CREATE INDEX idx_member_company_user_company ON member_company(user_id, company_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_member_company_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_member_company_updated_at
    BEFORE UPDATE ON member_company
    FOR EACH ROW
    EXECUTE FUNCTION update_member_company_updated_at();

-- Add comments for documentation
COMMENT ON TABLE member_company IS 'Stores company membership information for users';
COMMENT ON COLUMN member_company.role IS 'User role in the company: super_admin (owner), admin, hrd, member';
COMMENT ON COLUMN member_company.status IS 'Membership status: active or inactive';
COMMENT ON COLUMN member_company.joined_at IS 'When the user joined the company';
COMMENT ON COLUMN member_company.left_at IS 'When the user left the company (NULL if still active)';
COMMENT ON COLUMN member_company.approved_by IS 'Admin who approved the membership';
COMMENT ON COLUMN member_company.approved_at IS 'When the membership was approved';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS update_member_company_updated_at ON member_company;
DROP FUNCTION IF EXISTS update_member_company_updated_at;
DROP TABLE IF EXISTS member_company;
DROP TYPE IF EXISTS member_company_role;
DROP TYPE IF EXISTS member_company_status;

-- +goose StatementEnd
