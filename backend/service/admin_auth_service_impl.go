package service

import (
	"context"
	"database/sql"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"evoconnect/backend/utils"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AdminAuthServiceImpl struct {
	AdminRepository repository.AdminRepository
	DB              *sql.DB
	Validate        *validator.Validate
}

func NewAdminAuthService(adminRepository repository.AdminRepository, db *sql.DB, validate *validator.Validate) AdminAuthService {
	return &AdminAuthServiceImpl{
		AdminRepository: adminRepository,
		DB:              db,
		Validate:        validate,
	}
}

func (service *AdminAuthServiceImpl) Login(ctx context.Context, request web.AdminLoginRequest) web.AdminLoginResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	admin, err := service.AdminRepository.FindByEmail(ctx, tx, request.Email)
	if err != nil {
		panic(exception.NewNotFoundError("Admin not found"))
	}

	// Verify password
	err = bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(request.Password))
	if err != nil {
		panic(exception.NewUnauthorizedError("Invalid credentials"))
	}

	// Generate JWT token using the new utility function
	token, err := utils.GenerateAdminToken(
		admin.Id.String(),
		admin.Email,
		time.Hour*24*7, // 7 days
	)
	helper.PanicIfError(err)

	return web.AdminLoginResponse{
		Token: token,
		Admin: helper.ToAdminResponse(admin),
	}
}

func (service *AdminAuthServiceImpl) Register(ctx context.Context, request web.AdminRegisterRequest) web.AdminResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if admin already exists
	admin, err := service.AdminRepository.FindByEmail(ctx, tx, request.Email)
	if err == nil {
		panic(exception.NewBadRequestError("Admin with this email already exists"))
	}

	// Hash password using the utility function
	hashedPassword, err := utils.HashPassword(request.Password)
	helper.PanicIfError(err)

	// Create admin
	admin = domain.Admin{
		Id:        uuid.New(),
		Name:      request.Name,
		Email:     request.Email,
		Password:  hashedPassword,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Ubah dari Save ke Create
	admin = service.AdminRepository.Create(ctx, tx, admin)

	return helper.ToAdminResponse(admin)
}

func (service *AdminAuthServiceImpl) FindById(ctx context.Context, id uuid.UUID) web.AdminResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	admin, err := service.AdminRepository.FindById(ctx, tx, id)
	if err != nil {
		panic(exception.NewNotFoundError("Admin not found"))
	}

	return helper.ToAdminResponse(admin)
}
