package repository

import (
    "context"
    "database/sql"
    "evoconnect/backend/model/domain"
    "fmt"
    "github.com/google/uuid"
)

type BlogRepositoryImpl struct {
    DB *sql.DB
}

func NewBlogRepository(db *sql.DB) BlogRepository {
    return &BlogRepositoryImpl{DB: db}
}

func (r *BlogRepositoryImpl) Save(ctx context.Context, blog domain.Blog) (domain.Blog, error) {
    query := `
        INSERT INTO tb_blog (id, title, slug, category, content, image_path, user_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `
    _, err := r.DB.ExecContext(ctx, query, blog.ID, blog.Title, blog.Slug, blog.Category, blog.Content, blog.ImagePath, blog.UserID, blog.CreatedAt, blog.UpdatedAt)
    if err != nil {
        return domain.Blog{}, fmt.Errorf("gagal menyimpan blog ke database: %w", err)
    }
    return blog, nil
}

func (r *BlogRepositoryImpl) FindAll(ctx context.Context) ([]domain.Blog, error) {
    query := `
        SELECT id, title, slug, category, content, image_path, user_id, created_at, updated_at
        FROM tb_blog
        WHERE status IS NULL OR status != 'taken_down'
        ORDER BY created_at DESC
    `
    rows, err := r.DB.QueryContext(ctx, query)
    if err != nil {
        return nil, fmt.Errorf("gagal mengambil semua blog: %w", err)
    }
    defer rows.Close()

    var blogs []domain.Blog
    for rows.Next() {
        var blog domain.Blog
        err := rows.Scan(
            &blog.ID,
            &blog.Title,
            &blog.Slug,
            &blog.Category,
            &blog.Content,
            &blog.ImagePath,
            &blog.UserID,
            &blog.CreatedAt,
            &blog.UpdatedAt,
        )
        if err != nil {
            return nil, fmt.Errorf("gagal membaca data blog: %w", err)
        }
        blogs = append(blogs, blog)
    }

    return blogs, nil
}

func (r *BlogRepositoryImpl) Delete(ctx context.Context, blogID string) error {
    query := "DELETE FROM tb_blog WHERE id = $1"
    _, err := r.DB.ExecContext(ctx, query, blogID)
    if err != nil {
        return fmt.Errorf("gagal menghapus blog: %w", err)
    }
    return nil
}

func (r *BlogRepositoryImpl) FindBySlug(ctx context.Context, slug string) (domain.Blog, error) {
    query := `
        SELECT id, title, slug, category, content, image_path, user_id, status, created_at, updated_at
        FROM tb_blog
        WHERE slug = $1
        LIMIT 1
    `

    row := r.DB.QueryRowContext(ctx, query, slug)

    var blog domain.Blog
    err := row.Scan(
        &blog.ID,
        &blog.Title,
        &blog.Slug,
        &blog.Category,
        &blog.Content,
        &blog.ImagePath,
        &blog.UserID,
        &blog.Status,
        &blog.CreatedAt,
        &blog.UpdatedAt,
    )
    if err != nil {
        if err == sql.ErrNoRows {
            return domain.Blog{}, fmt.Errorf("not found")
        }
        return domain.Blog{}, err
    }

    return blog, nil
}

func (r *BlogRepositoryImpl) FindUserByID(ctx context.Context, userID uuid.UUID) (domain.User, error) {
    query := `
        SELECT id, name, username, photo
        FROM users
        WHERE id = $1
        LIMIT 1
    `

    row := r.DB.QueryRowContext(ctx, query, userID)

    var user domain.User
    var photo sql.NullString // Gunakan sql.NullString untuk menangani NULL

    err := row.Scan(&user.Id, &user.Name, &user.Username, &photo)
    if err != nil {
        if err == sql.ErrNoRows {
            return domain.User{}, fmt.Errorf("user not found")
        }
        return domain.User{}, err
    }

    // Konversi sql.NullString ke string
    if photo.Valid {
        user.Photo = photo.String
    } else {
        user.Photo = "" // Berikan nilai default jika NULL
    }

    return user, nil
}

func (r *BlogRepositoryImpl) FindByID(ctx context.Context, blogID string) (domain.Blog, error) {
    query := `
        SELECT id, title, slug, content, category, image_path, user_id, created_at, updated_at
        FROM tb_blog
        WHERE id = $1
    `
    row := r.DB.QueryRowContext(ctx, query, blogID)

    var blog domain.Blog
    err := row.Scan(
        &blog.ID,
        &blog.Title,
        &blog.Slug,
        &blog.Content,
        &blog.Category,
        &blog.ImagePath,
        &blog.UserID,
        &blog.CreatedAt,
        &blog.UpdatedAt,
    )
    if err != nil {
        if err == sql.ErrNoRows {
            return domain.Blog{}, fmt.Errorf("blog dengan ID %s tidak ditemukan", blogID)
        }
        return domain.Blog{}, err
    }

    return blog, nil
}

func (r *BlogRepositoryImpl) Update(ctx context.Context, blog domain.Blog) error {
    query := `
        UPDATE tb_blog
        SET title = $1, slug = $2, content = $3, category = $4, image_path = $5, updated_at = $6
        WHERE id = $7
    `
    _, err := r.DB.ExecContext(ctx, query, blog.Title, blog.Slug, blog.Content, blog.Category, blog.ImagePath, blog.UpdatedAt, blog.ID)
    if err != nil {
        return fmt.Errorf("gagal mengupdate blog: %w", err)
    }
    return nil
}


func (r *BlogRepositoryImpl) GetRandomBlogs(ctx context.Context, limit int) ([]domain.Blog, error) {
    query := `
        SELECT id, title, slug, category, content, image_path, user_id, created_at, updated_at
        FROM tb_blog
        ORDER BY RANDOM()
        LIMIT $1
    `
    rows, err := r.DB.QueryContext(ctx, query, limit)
    if err != nil {
        return nil, fmt.Errorf("gagal mengambil blog random: %w", err)
    }
    defer rows.Close()

    var blogs []domain.Blog
    for rows.Next() {
        var blog domain.Blog
        err := rows.Scan(
            &blog.ID,
            &blog.Title,
            &blog.Slug,
            &blog.Category,
            &blog.Content,
            &blog.ImagePath,
            &blog.UserID,
            &blog.CreatedAt,
            &blog.UpdatedAt,
        )
        if err != nil {
            return nil, fmt.Errorf("gagal membaca data blog: %w", err)
        }
        blogs = append(blogs, blog)
    }

    return blogs, nil
}

func (repository *BlogRepositoryImpl) Search(ctx context.Context, tx *sql.Tx, query string, limit int, offset int) []domain.Blog {
    SQL := `SELECT id, title, slug, content, category, image_path, user_id, created_at, updated_at
            FROM tb_blog
            WHERE LOWER(title) LIKE LOWER($1) OR LOWER(content) LIKE LOWER($1) OR LOWER(category) LIKE LOWER($1)
            ORDER BY
                CASE
                    WHEN LOWER(title) LIKE LOWER($2) THEN 1
                    WHEN LOWER(content) LIKE LOWER($2) THEN 2
                    ELSE 3
                END,
                created_at DESC
            LIMIT $3 OFFSET $4`
   
    searchPattern := "%" + query + "%"
    exactPattern := "%" + query + "%"
    fmt.Printf("Executing blog search SQL with pattern: %s\n", searchPattern)
   
    rows, err := tx.QueryContext(ctx, SQL, searchPattern, exactPattern, limit, offset)
    if err != nil {
        fmt.Printf("Error executing blog search: %v\n", err)
        return []domain.Blog{}
    }
    defer rows.Close()
   
    var blogs []domain.Blog
    for rows.Next() {
        blog := domain.Blog{}
        err := rows.Scan(&blog.ID, &blog.Title, &blog.Slug, &blog.Content, &blog.Category, &blog.ImagePath, &blog.UserID, &blog.CreatedAt, &blog.UpdatedAt)
        if err != nil {
            fmt.Printf("Error scanning blog: %v\n", err)
            continue
        }
        blogs = append(blogs, blog)
        fmt.Printf("Found blog: %s\n", blog.Title)
    }
   
    return blogs
}


