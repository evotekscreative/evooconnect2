-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS administrators (
    id UUID PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indeks untuk mempercepat pencarian
CREATE INDEX IF NOT EXISTS idx_administrators_email ON administrators(email);
CREATE INDEX IF NOT EXISTS idx_administrators_username ON administrators(username);

-- Komentar untuk dokumentasi tabel
COMMENT ON TABLE administrators IS 'Tabel untuk menyimpan data administrator sistem';
COMMENT ON COLUMN administrators.id IS 'ID unik administrator';
COMMENT ON COLUMN administrators.username IS 'Username unik administrator untuk login';
COMMENT ON COLUMN administrators.email IS 'Alamat email unik administrator untuk login';
COMMENT ON COLUMN administrators.password IS 'Password terenkripsi administrator';
COMMENT ON COLUMN administrators.name IS 'Nama lengkap administrator';
COMMENT ON COLUMN administrators.role IS 'Peran administrator (super_admin, admin, dll)';
COMMENT ON COLUMN administrators.created_at IS 'Waktu pembuatan akun administrator';
COMMENT ON COLUMN administrators.updated_at IS 'Waktu terakhir pembaruan data administrator';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
