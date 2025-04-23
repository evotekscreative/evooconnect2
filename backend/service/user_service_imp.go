package service

import (
	"context"
	"database/sql"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
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

	// Get user from repository
	user, err := service.UserRepository.FindById(ctx, tx, userId)
	helper.PanicIfError(err)

	// Update user profile fields
	user.Name = request.Name
	user.Email = request.Email
	user.Username = request.Username

	// Parse birthdate if provided
	if request.Birthdate != "" {
		birthdate, err := time.Parse("2006-01-02", request.Birthdate)
		if err == nil {
			user.Birthdate = birthdate
		}
	}

	user.Gender = request.Gender
	user.Location = request.Location
	user.Organization = request.Organization
	user.Website = request.Website
	user.Phone = request.Phone
	user.Headline = request.Headline
	user.About = request.About

	// Convert skills to JSONB
	var skills domain.JSONB
	if skillsSlice, ok := request.Skills.([]interface{}); ok && len(skillsSlice) > 0 {
		for _, skill := range skillsSlice {
			skills = append(skills, skill)
		}
		user.Skills = skills
	}

	// Convert socials to SocialMedia
	var socials domain.SocialMedia
	if socialsSlice, ok := request.Socials.([]interface{}); ok && len(socialsSlice) > 0 {
		for _, social := range socialsSlice {
			if socialMap, ok := social.(map[string]interface{}); ok {
				socials = append(socials, socialMap)
			}
		}
		user.Socials = socials
	}

	user.Photo = request.Photo
	user.UpdatedAt = time.Now()

	// Update user in database
	updatedUser := service.UserRepository.Update(ctx, tx, user)

	// Return updated profile
	return helper.ToUserProfileResponse(updatedUser)
}
