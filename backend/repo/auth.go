package repo

import (
	"be-evoconnect/model"
	"fmt"

	"gorm.io/gorm"
)

type UserRepo interface {
	Register(user model.User) error
	Login(user model.User) (model.User, error)
	GetUserByEmail(email string) (model.User, error)
}

type userRepo struct {
	db *gorm.DB
}

// NewUserRepo: Constructor untuk UserRepo
func NewUserRepo(db *gorm.DB) UserRepo {
	return &userRepo{db: db}
}

// Register: Menyimpan data user baru
func (r *userRepo) Register(user model.User) error {
	// Check if email already exists
	var existingUser model.User
	result := r.db.Where("email = ?", user.Email).Limit(1).Find(&existingUser)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected > 0 {
		return fmt.Errorf("email already registered")
	}

	// If email doesn't exist, create new user
	return r.db.Create(&user).Error
}

// Login: Memeriksa apakah user ada berdasarkan email dan password
func (r *userRepo) Login(user model.User) (model.User, error) {
	// Mengambil user berdasarkan email
	existingUser, err := r.GetUserByEmail(user.Email)
	if err != nil {
		return model.User{}, fmt.Errorf("email atau password salah: %w", err)
	}

	// Mengecek password (anda bisa melakukan hashing disini jika diperlukan)
	if existingUser.Password != user.Password {
		return model.User{}, fmt.Errorf("email atau password salah")
	}

	return existingUser, nil
}

func (r *userRepo) GetUserByEmail(email string) (model.User, error) {
	var user model.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		return model.User{}, err
	}
	return user, nil
}
