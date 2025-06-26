-- +goose Up
-- +goose StatementBegin

-- Add location column to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS location VARCHAR(200);

-- Create index for location-based searches
CREATE INDEX IF NOT EXISTS idx_companies_location ON companies(location);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- Remove location column and index
DROP INDEX IF EXISTS idx_companies_location;
ALTER TABLE companies DROP COLUMN IF EXISTS location;

-- +goose StatementEnd