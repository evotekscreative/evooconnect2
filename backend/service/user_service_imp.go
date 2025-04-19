package service

import (
	"context"
	"database/sql"
	"evoconnect/backend/exception"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
)

type UserServiceImpl struct {
	UserRepository repository.UserRepository
	DB             *sql.DB
}

func NewUserService(userRepository repository.UserRepository, db *sql.DB) UserService {
	return &UserServiceImpl{
		UserRepository: userRepository,
		DB:             db,
	}
}

func (service *UserServiceImpl) GetProfile(ctx context.Context, userId int) web.UserProfileResponse {
	tx, err := service.DB.Begin()
	if err != nil {
		panic(exception.NewInternalServerError("Database error: " + err.Error()))
	}
	defer tx.Rollback()

	// Get user from repository
	user, err := service.UserRepository.FindById(ctx, tx, userId)
	if err != nil {
		panic(exception.NewNotFoundError("User not found"))
	}

	err = tx.Commit()
	if err != nil {
		panic(exception.NewInternalServerError("Database error: " + err.Error()))
	}

	// Return user profile without sensitive information
	return web.UserProfileResponse{
		ID:         user.Id,
		Name:       user.Name,
		Email:      user.Email,
		IsVerified: user.IsVerified,
		CreatedAt:  user.CreatedAt,
		UpdatedAt:  user.UpdatedAt,
	}
}
