package service

import (
	"context"
	"database/sql"
	"encoding/json"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"mime/multipart"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type UserServiceImpl struct {
	UserRepository       repository.UserRepository
	ConnectionRepository repository.ConnectionRepository
	ProfileViewService   ProfileViewService
	DB                   *sql.DB
	Validate             *validator.Validate
}

func NewUserService(
	userRepository repository.UserRepository,
	connectionRepository repository.ConnectionRepository,
	profileViewService ProfileViewService,
	db *sql.DB,
	validate *validator.Validate,
) UserService {
	return &UserServiceImpl{
		UserRepository:       userRepository,
		ConnectionRepository: connectionRepository,
		ProfileViewService:   profileViewService,
		DB:                   db,
		Validate:             validate,
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
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Find user first
	user, err := service.UserRepository.FindById(ctx, tx, userId)
	if err != nil {
		panic(exception.NewNotFoundError(err.Error()))
	}

	if user.Username != request.Username {
		_, err = service.UserRepository.FindByUsername(ctx, tx, request.Username)
		if err == nil {
			panic(exception.NewBadRequestError("Username already taken"))
		}
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
	user.Username = request.Username

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

func (service *UserServiceImpl) GetByUsername(ctx context.Context, username string) web.UserProfileResponse {
    tx, err := service.DB.Begin()
    helper.PanicIfError(err)
    defer helper.CommitOrRollback(tx)

    user, err := service.UserRepository.FindByUsername(ctx, tx, username)
    if err != nil {
        panic(exception.NewNotFoundError("User not found"))
    }

    // Cek apakah user saat ini sedang melihat profil orang lain
    currentUserIdStr, ok := ctx.Value("user_id").(string)
    var isConnected bool
    var isConnectedRequest string = "none"

    if ok {
        // User sedang login, cek status koneksi
        currentUserId, err := uuid.Parse(currentUserIdStr)
        if err == nil && currentUserId != user.Id {
            // Rekam view secara langsung (tanpa goroutine)
            // Ini akan mencegah duplikasi data
            service.ProfileViewService.RecordView(ctx, user.Id, currentUserId)

            // Hanya cek koneksi jika bukan profil sendiri
            isConnected = service.ConnectionRepository.CheckConnectionExists(ctx, tx, currentUserId, user.Id)
            
            // Cek status permintaan koneksi jika belum terhubung
            if !isConnected {
                // Cek apakah ada permintaan koneksi dari current user ke user ini
                request, err := service.ConnectionRepository.FindConnectionRequestBySenderIdAndReceiverId(ctx, tx, currentUserId, user.Id)
                if err == nil {
                    // Request ditemukan, set status
                    isConnectedRequest = string(request.Status)
                } else {
                    // Cek apakah ada permintaan dari user ini ke current user
                    request, err = service.ConnectionRepository.FindConnectionRequestBySenderIdAndReceiverId(ctx, tx, user.Id, currentUserId)
                    if err == nil {
                        isConnectedRequest = string(request.Status)
                    }
                    // Jika tidak ada request, tetap gunakan nilai default "none"
                }
            } else {
                // Jika sudah terhubung, set nilai ke "connected"
                isConnectedRequest = "connected"
            }
        }
    }

    userResponse := helper.ToUserProfileResponse(user)
    userResponse.IsConnected = isConnected
    userResponse.IsConnectedRequest = isConnectedRequest // Nilai tidak akan pernah kosong

    return userResponse
}

func (service *UserServiceImpl) UploadPhotoProfile(ctx context.Context, userId uuid.UUID, file *multipart.FileHeader) web.UserProfileResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Find user first
	user, err := service.UserRepository.FindById(ctx, tx, userId)
	if err != nil {
		panic(exception.NewNotFoundError(err.Error()))
	}

	var uploadResult *helper.UploadResult
	if file != nil {
		image, err := file.Open()
		helper.PanicIfError(err)
		defer image.Close()

		uploadResult, err = helper.UploadImage(image, file, helper.DirUsers, userId.String(), "photo-profile")
		helper.PanicIfError(err)
	}

	// Update photo field
	// Handle image
	if uploadResult != nil {
		if user.Photo != "" {
			// Delete old photo if it exists
			err = helper.DeleteFile(user.Photo)
			helper.PanicIfError(err)
		}

		user.Photo = uploadResult.RelativePath
	}

	updatedUser := service.UserRepository.Update(ctx, tx, user)
	return helper.ToUserProfileResponse(updatedUser)
}

func (service *UserServiceImpl) DeletePhotoProfile(ctx context.Context, userId uuid.UUID) web.UserProfileResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Find user first
	user, err := service.UserRepository.FindById(ctx, tx, userId)
	if err != nil {
		panic(exception.NewNotFoundError(err.Error()))
	}

	if user.Photo != "" {
		err = helper.DeleteFile(user.Photo)
		helper.PanicIfError(err)
		user.Photo = ""
	}

	updatedUser := service.UserRepository.Update(ctx, tx, user)
	return helper.ToUserProfileResponse(updatedUser)
}

func (service *UserServiceImpl) GetPeoples(ctx context.Context, limit int, offset int, currentUserIdStr string) []web.UserShort {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Parse current user ID
	currentUserId, err := uuid.Parse(currentUserIdStr)
	if err != nil {
		panic(exception.NewBadRequestError(err.Error()))
	}

	// Get users not connected with current user
	users, err := service.UserRepository.FindUsersNotConnectedWith(ctx, tx, currentUserId, limit, offset)
	if err != nil {
		panic(exception.NewInternalServerError(err.Error()))
	}

	// Convert to response objects
	var userResponses []web.UserShort
	for _, user := range users {
		// Check if user is already connected
		isConnected := service.ConnectionRepository.CheckConnectionExists(ctx, tx, currentUserId, user.Id)

		// Check for connection request status
		var isConnectedRequest string = ""
		if !isConnected {
			// Cek apakah ada permintaan koneksi dari current user ke user ini
			request, err := service.ConnectionRepository.FindConnectionRequestBySenderIdAndReceiverId(ctx, tx, currentUserId, user.Id)
			if err == nil {
				// Request ditemukan, set status
				isConnectedRequest = string(request.Status)
			} else {
				// Cek apakah ada permintaan dari user ini ke current user
				request, err = service.ConnectionRepository.FindConnectionRequestBySenderIdAndReceiverId(ctx, tx, user.Id, currentUserId)
				if err == nil {
					isConnectedRequest = string(request.Status)
				}
			}
		}

		userResponse := helper.ToUserShortResponse(user, isConnected, isConnectedRequest)
		userResponses = append(userResponses, userResponse)
	}

	return userResponses
}
