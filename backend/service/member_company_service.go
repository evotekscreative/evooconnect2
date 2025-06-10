package service

import (
	"context"
	"database/sql"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/entity"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"fmt"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type MemberCompanyService interface {
	CreateMemberCompany(ctx context.Context, request entity.CreateMemberCompanyRequest) (entity.MemberCompanyResponse, error)
	CreateSuperAdminMember(ctx context.Context, userID, companyID uuid.UUID, approvedBy string) (entity.MemberCompanyResponse, error)
	UpdateMemberRole(ctx context.Context, memberCompanyID uuid.UUID, request entity.UpdateMemberCompanyRoleRequest) (entity.MemberCompanyResponse, error)
	UpdateMemberStatus(ctx context.Context, memberCompanyID uuid.UUID, request entity.UpdateMemberCompanyStatusRequest) (entity.MemberCompanyResponse, error)
	RemoveMember(ctx context.Context, memberCompanyID uuid.UUID) error
	GetMemberByID(ctx context.Context, memberCompanyID uuid.UUID) (entity.MemberCompanyResponse, error)
	GetMemberByUserAndCompany(ctx context.Context, userID, companyID uuid.UUID) (entity.MemberCompanyResponse, error)
	GetCompanyMembers(ctx context.Context, companyID uuid.UUID, limit, offset int) (entity.MemberCompanyListResponse, error)
	GetUserCompanies(ctx context.Context, userID uuid.UUID, limit, offset int) (entity.MemberCompanyListResponse, error)
	IsUserMemberOfCompany(ctx context.Context, userID, companyID uuid.UUID) (bool, error)
	GetUserRoleInCompany(ctx context.Context, userID, companyID uuid.UUID) (entity.MemberCompanyRole, error)
	GetCompanyMemberCount(ctx context.Context, companyID uuid.UUID) (int, error)
	GetCompanyMemberCountByRole(ctx context.Context, companyID uuid.UUID, role entity.MemberCompanyRole) (int, error)
	GetMembersByCompanyId(ctx context.Context, userID, companyID uuid.UUID, limit, offset int) (entity.MemberCompanyListResponse, error)
}

type memberCompanyServiceImpl struct {
	MemberCompanyRepository repository.MemberCompanyRepository
	UserRepository          repository.UserRepository
	CompanyRepository       repository.CompanyRepository
	DB                      *sql.DB
	Validate                *validator.Validate
}

func NewMemberCompanyService(
	memberCompanyRepository repository.MemberCompanyRepository,
	userRepository repository.UserRepository,
	companyRepository repository.CompanyRepository,
	db *sql.DB,
	validate *validator.Validate,
) MemberCompanyService {
	return &memberCompanyServiceImpl{
		MemberCompanyRepository: memberCompanyRepository,
		UserRepository:          userRepository,
		CompanyRepository:       companyRepository,
		DB:                      db,
		Validate:                validate,
	}
}

func (service *memberCompanyServiceImpl) CreateMemberCompany(ctx context.Context, request entity.CreateMemberCompanyRequest) (entity.MemberCompanyResponse, error) {
	err := service.Validate.Struct(request)
	if err != nil {
		return entity.MemberCompanyResponse{}, helper.ValidationError(err)
	}

	tx, err := service.DB.BeginTx(ctx, nil)
	if err != nil {
		return entity.MemberCompanyResponse{}, fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	// Check if user and company exist
	_, err = service.UserRepository.FindById(ctx, tx, request.UserID)
	if err != nil {
		return entity.MemberCompanyResponse{}, fmt.Errorf("user not found")
	}

	_, err = service.CompanyRepository.FindById(ctx, tx, request.CompanyID)
	if err != nil {
		return entity.MemberCompanyResponse{}, fmt.Errorf("company not found")
	}

	// Check if user is already a member
	_, err = service.MemberCompanyRepository.FindByUserAndCompany(ctx, tx, request.UserID, request.CompanyID)
	if err == nil {
		return entity.MemberCompanyResponse{}, fmt.Errorf("user is already a member of this company")
	}

	memberCompany := entity.MemberCompany{
		UserID:    request.UserID,
		CompanyID: request.CompanyID,
		Role:      request.Role,
		Status:    entity.StatusActive,
		JoinedAt:  time.Now(),
	}

	createdMember, err := service.MemberCompanyRepository.Create(ctx, tx, memberCompany)
	if err != nil {
		return entity.MemberCompanyResponse{}, fmt.Errorf("failed to create member company: %w", err)
	}

	err = tx.Commit()
	if err != nil {
		return entity.MemberCompanyResponse{}, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return service.toMemberCompanyResponse(createdMember), nil
}

func (service *memberCompanyServiceImpl) CreateSuperAdminMember(ctx context.Context, userID, companyID uuid.UUID, approvedBy string) (entity.MemberCompanyResponse, error) {
	tx, err := service.DB.BeginTx(ctx, nil)
	if err != nil {
		return entity.MemberCompanyResponse{}, fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	// Check if user and company exist
	_, err = service.UserRepository.FindById(ctx, tx, userID)
	if err != nil {
		return entity.MemberCompanyResponse{}, fmt.Errorf("user not found")
	}

	_, err = service.CompanyRepository.FindById(ctx, tx, companyID)
	if err != nil {
		return entity.MemberCompanyResponse{}, fmt.Errorf("company not found")
	}

	// Check if user is already a member
	_, err = service.MemberCompanyRepository.FindByUserAndCompany(ctx, tx, userID, companyID)
	if err == nil {
		return entity.MemberCompanyResponse{}, fmt.Errorf("user is already a member of this company")
	}

	now := time.Now()
	memberCompany := entity.MemberCompany{
		UserID:     userID,
		CompanyID:  companyID,
		Role:       entity.RoleSuperAdmin,
		Status:     entity.StatusActive,
		JoinedAt:   now,
		ApprovedBy: &approvedBy,
		ApprovedAt: &now,
	}

	createdMember, err := service.MemberCompanyRepository.Create(ctx, tx, memberCompany)
	if err != nil {
		return entity.MemberCompanyResponse{}, fmt.Errorf("failed to create super admin member: %w", err)
	}

	err = tx.Commit()
	if err != nil {
		return entity.MemberCompanyResponse{}, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return service.toMemberCompanyResponse(createdMember), nil
}

func (service *memberCompanyServiceImpl) UpdateMemberRole(ctx context.Context, memberCompanyID uuid.UUID, request entity.UpdateMemberCompanyRoleRequest) (entity.MemberCompanyResponse, error) {
	err := service.Validate.Struct(request)
	if err != nil {
		return entity.MemberCompanyResponse{}, helper.ValidationError(err)
	}

	tx, err := service.DB.BeginTx(ctx, nil)
	if err != nil {
		return entity.MemberCompanyResponse{}, fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	memberCompany, err := service.MemberCompanyRepository.FindByID(ctx, tx, memberCompanyID)
	if err != nil {
		return entity.MemberCompanyResponse{}, fmt.Errorf("member company not found")
	}

	memberCompany.Role = request.Role

	updatedMember, err := service.MemberCompanyRepository.Update(ctx, tx, memberCompany)
	if err != nil {
		return entity.MemberCompanyResponse{}, fmt.Errorf("failed to update member role: %w", err)
	}

	err = tx.Commit()
	if err != nil {
		return entity.MemberCompanyResponse{}, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return service.toMemberCompanyResponse(updatedMember), nil
}

func (service *memberCompanyServiceImpl) UpdateMemberStatus(ctx context.Context, memberCompanyID uuid.UUID, request entity.UpdateMemberCompanyStatusRequest) (entity.MemberCompanyResponse, error) {
	err := service.Validate.Struct(request)
	if err != nil {
		return entity.MemberCompanyResponse{}, helper.ValidationError(err)
	}

	tx, err := service.DB.BeginTx(ctx, nil)
	if err != nil {
		return entity.MemberCompanyResponse{}, fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	memberCompany, err := service.MemberCompanyRepository.FindByID(ctx, tx, memberCompanyID)
	if err != nil {
		return entity.MemberCompanyResponse{}, fmt.Errorf("member company not found")
	}

	memberCompany.Status = request.Status

	// Set left_at when status becomes inactive
	if request.Status == entity.StatusInactive {
		now := time.Now()
		memberCompany.LeftAt = &now
	} else {
		memberCompany.LeftAt = nil
	}

	updatedMember, err := service.MemberCompanyRepository.Update(ctx, tx, memberCompany)
	if err != nil {
		return entity.MemberCompanyResponse{}, fmt.Errorf("failed to update member status: %w", err)
	}

	err = tx.Commit()
	if err != nil {
		return entity.MemberCompanyResponse{}, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return service.toMemberCompanyResponse(updatedMember), nil
}

func (service *memberCompanyServiceImpl) RemoveMember(ctx context.Context, memberCompanyID uuid.UUID) error {
	tx, err := service.DB.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	_, err = service.MemberCompanyRepository.FindByID(ctx, tx, memberCompanyID)
	if err != nil {
		return fmt.Errorf("member company not found")
	}

	err = service.MemberCompanyRepository.Delete(ctx, tx, memberCompanyID)
	if err != nil {
		return fmt.Errorf("failed to remove member: %w", err)
	}

	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (service *memberCompanyServiceImpl) GetMemberByID(ctx context.Context, memberCompanyID uuid.UUID) (entity.MemberCompanyResponse, error) {
	tx, err := service.DB.BeginTx(ctx, &sql.TxOptions{ReadOnly: true})
	if err != nil {
		return entity.MemberCompanyResponse{}, fmt.Errorf("failed to start read transaction: %w", err)
	}
	defer tx.Rollback()

	memberCompany, err := service.MemberCompanyRepository.FindByID(ctx, tx, memberCompanyID)
	if err != nil {
		return entity.MemberCompanyResponse{}, fmt.Errorf("member company not found")
	}

	err = tx.Commit()
	if err != nil {
		return entity.MemberCompanyResponse{}, fmt.Errorf("failed to commit read transaction: %w", err)
	}

	return service.toMemberCompanyResponse(memberCompany), nil
}

func (service *memberCompanyServiceImpl) GetMemberByUserAndCompany(ctx context.Context, userID, companyID uuid.UUID) (entity.MemberCompanyResponse, error) {
	tx, err := service.DB.BeginTx(ctx, &sql.TxOptions{ReadOnly: true})
	if err != nil {
		return entity.MemberCompanyResponse{}, fmt.Errorf("failed to start read transaction: %w", err)
	}
	defer tx.Rollback()

	memberCompany, err := service.MemberCompanyRepository.FindByUserAndCompany(ctx, tx, userID, companyID)
	if err != nil {
		return entity.MemberCompanyResponse{}, fmt.Errorf("member company not found")
	}

	err = tx.Commit()
	if err != nil {
		return entity.MemberCompanyResponse{}, fmt.Errorf("failed to commit read transaction: %w", err)
	}

	return service.toMemberCompanyResponse(memberCompany), nil
}

func (service *memberCompanyServiceImpl) GetCompanyMembers(ctx context.Context, companyID uuid.UUID, limit, offset int) (entity.MemberCompanyListResponse, error) {
	tx, err := service.DB.BeginTx(ctx, &sql.TxOptions{ReadOnly: true})
	if err != nil {
		return entity.MemberCompanyListResponse{}, fmt.Errorf("failed to start read transaction: %w", err)
	}
	defer tx.Rollback()

	// Check if company exists
	_, err = service.CompanyRepository.FindById(ctx, tx, companyID)
	if err != nil {
		return entity.MemberCompanyListResponse{}, fmt.Errorf("company not found")
	}

	members, total, err := service.MemberCompanyRepository.FindByCompanyID(ctx, tx, companyID, limit, offset)
	if err != nil {
		return entity.MemberCompanyListResponse{}, fmt.Errorf("failed to get company members: %w", err)
	}

	err = tx.Commit()
	if err != nil {
		return entity.MemberCompanyListResponse{}, fmt.Errorf("failed to commit read transaction: %w", err)
	}

	var memberResponses []entity.MemberCompanyResponse
	for _, member := range members {
		memberResponses = append(memberResponses, service.toMemberCompanyResponse(member))
	}

	return entity.MemberCompanyListResponse{
		Members: memberResponses,
		Total:   total,
	}, nil
}

func (service *memberCompanyServiceImpl) GetUserCompanies(ctx context.Context, userID uuid.UUID, limit, offset int) (entity.MemberCompanyListResponse, error) {
	tx, err := service.DB.BeginTx(ctx, &sql.TxOptions{ReadOnly: true})
	if err != nil {
		return entity.MemberCompanyListResponse{}, fmt.Errorf("failed to start read transaction: %w", err)
	}
	defer tx.Rollback()

	// Check if user exists
	_, err = service.UserRepository.FindById(ctx, tx, userID)
	if err != nil {
		return entity.MemberCompanyListResponse{}, fmt.Errorf("user not found")
	}

	members, total, err := service.MemberCompanyRepository.FindByUserID(ctx, tx, userID, limit, offset)
	if err != nil {
		return entity.MemberCompanyListResponse{}, fmt.Errorf("failed to get user companies: %w", err)
	}

	err = tx.Commit()
	if err != nil {
		return entity.MemberCompanyListResponse{}, fmt.Errorf("failed to commit read transaction: %w", err)
	}

	var memberResponses []entity.MemberCompanyResponse
	for _, member := range members {
		memberResponses = append(memberResponses, service.toMemberCompanyResponse(member))
	}

	return entity.MemberCompanyListResponse{
		Members: memberResponses,
		Total:   total,
	}, nil
}

func (service *memberCompanyServiceImpl) IsUserMemberOfCompany(ctx context.Context, userID, companyID uuid.UUID) (bool, error) {
	tx, err := service.DB.BeginTx(ctx, &sql.TxOptions{ReadOnly: true})
	if err != nil {
		return false, fmt.Errorf("failed to start read transaction: %w", err)
	}
	defer tx.Rollback()

	result, err := service.MemberCompanyRepository.IsUserMemberOfCompany(ctx, tx, userID, companyID)
	if err != nil {
		return false, err
	}

	err = tx.Commit()
	if err != nil {
		return false, fmt.Errorf("failed to commit read transaction: %w", err)
	}

	return result, nil
}

func (service *memberCompanyServiceImpl) GetUserRoleInCompany(ctx context.Context, userID, companyID uuid.UUID) (entity.MemberCompanyRole, error) {
	tx, err := service.DB.BeginTx(ctx, &sql.TxOptions{ReadOnly: true})
	if err != nil {
		return "", fmt.Errorf("failed to start read transaction: %w", err)
	}
	defer tx.Rollback()

	role, err := service.MemberCompanyRepository.GetUserRoleInCompany(ctx, tx, userID, companyID)
	if err != nil {
		return "", err
	}

	err = tx.Commit()
	if err != nil {
		return "", fmt.Errorf("failed to commit read transaction: %w", err)
	}

	return role, nil
}

func (service *memberCompanyServiceImpl) GetCompanyMemberCount(ctx context.Context, companyID uuid.UUID) (int, error) {
	tx, err := service.DB.BeginTx(ctx, &sql.TxOptions{ReadOnly: true})
	if err != nil {
		return 0, fmt.Errorf("failed to start read transaction: %w", err)
	}
	defer tx.Rollback()

	count, err := service.MemberCompanyRepository.CountByCompanyID(ctx, tx, companyID)
	if err != nil {
		return 0, err
	}

	err = tx.Commit()
	if err != nil {
		return 0, fmt.Errorf("failed to commit read transaction: %w", err)
	}

	return count, nil
}

func (service *memberCompanyServiceImpl) GetCompanyMemberCountByRole(ctx context.Context, companyID uuid.UUID, role entity.MemberCompanyRole) (int, error) {
	tx, err := service.DB.BeginTx(ctx, &sql.TxOptions{ReadOnly: true})
	if err != nil {
		return 0, fmt.Errorf("failed to start read transaction: %w", err)
	}
	defer tx.Rollback()

	count, err := service.MemberCompanyRepository.CountByRole(ctx, tx, companyID, role)
	if err != nil {
		return 0, err
	}

	err = tx.Commit()
	if err != nil {
		return 0, fmt.Errorf("failed to commit read transaction: %w", err)
	}

	return count, nil
}

func (service *memberCompanyServiceImpl) GetMembersByCompanyId(ctx context.Context, userID, companyID uuid.UUID, limit, offset int) (entity.MemberCompanyListResponse, error) {
	tx, err := service.DB.BeginTx(ctx, &sql.TxOptions{ReadOnly: true})
	if err != nil {
		return entity.MemberCompanyListResponse{}, fmt.Errorf("failed to start read transaction: %w", err)
	}
	defer tx.Rollback()

	// Check if company exists
	_, err = service.CompanyRepository.FindById(ctx, tx, companyID)
	if err != nil {
		return entity.MemberCompanyListResponse{}, fmt.Errorf("company not found")
	}

	// Check if user is a member of the company
	isMember, err := service.IsUserMemberOfCompany(ctx, userID, companyID)
	if err != nil {
		return entity.MemberCompanyListResponse{}, fmt.Errorf("failed to check user membership: %w", err)
	}
	if !isMember {
		return entity.MemberCompanyListResponse{}, fmt.Errorf("user is not a member of this company")
	}

	members, total, err := service.MemberCompanyRepository.FindByCompanyID(ctx, tx, companyID, limit, offset)
	if err != nil {
		return entity.MemberCompanyListResponse{}, fmt.Errorf("failed to get company members: %w", err)
	}

	err = tx.Commit()
	if err != nil {
		return entity.MemberCompanyListResponse{}, fmt.Errorf("failed to commit read transaction: %w", err)
	}
	var memberResponses []entity.MemberCompanyResponse
	for _, member := range members {
		memberResponses = append(memberResponses, service.toMemberCompanyResponse(member))
	}
	return entity.MemberCompanyListResponse{
		Members: memberResponses,
		Total:   total,
	}, nil
}

func (service *memberCompanyServiceImpl) toMemberCompanyResponse(memberCompany entity.MemberCompany) entity.MemberCompanyResponse {
	response := entity.MemberCompanyResponse{
		ID:         memberCompany.ID,
		UserID:     memberCompany.UserID,
		CompanyID:  memberCompany.CompanyID,
		Role:       memberCompany.Role,
		Status:     memberCompany.Status,
		JoinedAt:   memberCompany.JoinedAt,
		LeftAt:     memberCompany.LeftAt,
		ApprovedBy: memberCompany.ApprovedBy,
		ApprovedAt: memberCompany.ApprovedAt,
		CreatedAt:  memberCompany.CreatedAt,
		UpdatedAt:  memberCompany.UpdatedAt,
	}

	if memberCompany.User != nil {
		response.User = &web.UserMinimal{
			Id:       memberCompany.User.Id,
			Name:     memberCompany.User.Name,
			Email:    memberCompany.User.Email,
			Username: memberCompany.User.Username,
			Photo:    memberCompany.User.Photo,
		}
	}

	if memberCompany.Company != nil {
		response.Company = &web.CompanyResponse{
			ID:          memberCompany.Company.Id,
			Name:        memberCompany.Company.Name,
			LinkedinUrl: memberCompany.Company.LinkedinUrl,
			Website:     memberCompany.Company.Website,
			Industry:    memberCompany.Company.Industry,
			Size:        memberCompany.Company.Size,
			Type:        memberCompany.Company.Type,
			Logo:        memberCompany.Company.Logo,
			Tagline:     memberCompany.Company.Tagline,
			IsVerified:  memberCompany.Company.IsVerified,
		}
	}

	return response
}
