package service

import (
	"context"
	"database/sql"
	"encoding/json"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"time"

	"github.com/google/uuid"
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

func (service *UserServiceImpl) GetProfile(ctx context.Context, userId uuid.UUID) web.UserProfileResponse {
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

func (service *UserServiceImpl) UpdateProfile(ctx context.Context, userId uuid.UUID, request web.UpdateProfileRequest) web.UserProfileResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Find user first
	user, err := service.UserRepository.FindById(ctx, tx, userId)
	if err != nil {
		panic(exception.NewNotFoundError(err.Error()))
	}

	// Update fields
	user.Name = request.Name

	// Convert birthdate string to time.Time if not empty
	if request.Birthdate != "" {
		birthdate, err := time.Parse("2006-01-02", request.Birthdate)
		if err != nil {
			panic(exception.NewBadRequestError("Invalid birthdate format. Use YYYY-MM-DD"))
		}
		user.Birthdate = birthdate
	}

	user.Gender = request.Gender
	user.Location = request.Location
	user.Organization = request.Organization
	user.Website = request.Website
	user.Phone = request.Phone
	user.Headline = request.Headline
	user.About = request.About

	// Convert skills and socials to JSON string
	if request.Skills != nil {
		skillsJSON, err := json.Marshal(request.Skills)
		helper.PanicIfError(err)
		user.Skills = sql.NullString{
			String: string(skillsJSON),
			Valid:  true,
		}
	} else {
		user.Skills = sql.NullString{Valid: false}
	}

	if request.Socials != nil {
		socialsJSON, err := json.Marshal(request.Socials)
		helper.PanicIfError(err)
		user.Socials = sql.NullString{
			String: string(socialsJSON),
			Valid:  true,
		}
	} else {
		user.Socials = sql.NullString{Valid: false}
	}

	// Update photo if provided
	if request.Photo != "" {
		user.Photo = request.Photo
	}

	updatedUser := service.UserRepository.Update(ctx, tx, user)
	return helper.ToUserProfileResponse(updatedUser)
}
