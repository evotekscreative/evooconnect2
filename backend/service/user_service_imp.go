package service

import (
	"context"
	"database/sql"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
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
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Get user from repository
	user, err := service.UserRepository.FindById(ctx, tx, userId)
	if err != nil {
		panic(exception.NewNotFoundError(err.Error()))
	}

	// Return user profile without sensitive information
	return helper.ToUserProfileResponse(user)
}
