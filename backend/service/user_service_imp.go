package service

import (
	"context"
	"database/sql"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"fmt"
	"time"
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

func (service *UserServiceImpl) UpdateProfile(ctx context.Context, userId int, request web.UpdateProfileRequest) web.UserProfileResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	fmt.Printf("Received update for user ID2 %d: %+v\n", userId, request)
	// Get user from repository
	fmt.Printf("find user")
	user, err := service.UserRepository.FindById(ctx, tx, userId)
	helper.PanicIfError(err)
	fmt.Printf("user success collect to variable")

	fmt.Printf("Starting update step 1")
	birthdate, err := time.Parse("2006-01-02", request.Birthdate)
	if err == nil {
		user.Birthdate = birthdate
	}

	// Update user profile with all fields from request
	user.Name = request.Name
	user.Email = request.Email
	user.Username = request.Username
	user.Gender = request.Gender
	user.Location = request.Location
	user.Organization = request.Organization
	user.Website = request.Website
	user.Phone = request.Phone
	user.Headline = request.Headline
	user.About = request.About
	user.Skills = request.Skills
	user.Socials = request.Socials
	user.Photo = request.Photo
	user.UpdatedAt = time.Now()

	fmt.Printf("Starting update step 2")
	updatedUser := service.UserRepository.Update(ctx, tx, user)

	// Kembalikan respons profil yang diperbarui
	return helper.ToUserProfileResponse(updatedUser)
}
