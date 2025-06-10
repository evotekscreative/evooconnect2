package service

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/entity"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type CompanyJoinRequestServiceImpl struct {
	DB                           *sql.DB
	CompanyJoinRequestRepository repository.CompanyJoinRequestRepository
	CompanyRepository            repository.CompanyRepository
	UserRepository               repository.UserRepository
	MemberCompanyRepository      repository.MemberCompanyRepository
	NotificationService          NotificationService
	Validate                     *validator.Validate
}

func NewCompanyJoinRequestService(
	db *sql.DB,
	companyJoinRequestRepository repository.CompanyJoinRequestRepository,
	companyRepository repository.CompanyRepository,
	userRepository repository.UserRepository,
	memberCompanyRepository repository.MemberCompanyRepository,
	notificationService NotificationService,
	validate *validator.Validate,
) CompanyJoinRequestService {
	return &CompanyJoinRequestServiceImpl{
		DB:                           db,
		CompanyJoinRequestRepository: companyJoinRequestRepository,
		CompanyRepository:            companyRepository,
		UserRepository:               userRepository,
		MemberCompanyRepository:      memberCompanyRepository,
		NotificationService:          notificationService,
		Validate:                     validate,
	}
}

func (service *CompanyJoinRequestServiceImpl) Create(ctx context.Context, userId uuid.UUID, request web.CreateCompanyJoinRequestRequest) web.CompanyJoinRequestResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if company exists
	company, err := service.CompanyRepository.FindById(ctx, tx, request.CompanyId)
	if err != nil {
		panic(exception.NewNotFoundError("company not found"))
	}

	// Check if user is already a member - handle error properly
	existingMember, err := service.MemberCompanyRepository.FindByUserAndCompany(ctx, tx, userId, request.CompanyId)
	if err == nil && existingMember.ID != uuid.Nil {
		panic(exception.NewBadRequestError("you are already a member of this company"))
	}
	// If error is not "not found", it's a real error that should be handled
	if err != nil && err.Error() != "member company not found" {
		helper.PanicIfError(err)
	}

	// Check if there's already a pending request - handle error properly
	existingRequest, err := service.CompanyJoinRequestRepository.FindByUserIdAndCompanyId(ctx, tx, userId, request.CompanyId)
	if err == nil && existingRequest.Status == "pending" {
		panic(exception.NewBadRequestError("you already have a pending join request for this company"))
	}
	// If error is not "not found", it's a real error that should be handled
	if err != nil && err.Error() != "join request not found" {
		helper.PanicIfError(err)
	}

	// Create new request
	joinRequest := domain.CompanyJoinRequest{
		Id:          uuid.New(),
		UserId:      userId,
		CompanyId:   request.CompanyId,
		Message:     request.Message,
		Status:      "pending",
		RequestedAt: time.Now(),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	joinRequest = service.CompanyJoinRequestRepository.Create(ctx, tx, joinRequest)

	// Get user data for notification - handle error properly
	user, err := service.UserRepository.FindById(ctx, tx, userId)
	if err != nil {
		// Log error but don't panic - notification is not critical
		fmt.Printf("Warning: Could not get user data for notification: %v\n", err)
	} else if service.NotificationService != nil {
		// Send notification to company admins/super_admins in a separate transaction
		go func() {
			// Create new transaction for notification
			notifTx, notifErr := service.DB.Begin()
			if notifErr != nil {
				fmt.Printf("Warning: Could not start notification transaction: %v\n", notifErr)
				return
			}
			defer func() {
				if r := recover(); r != nil {
					notifTx.Rollback()
				} else {
					notifTx.Commit()
				}
			}()

			// Get company admins and super_admins
			members, count, err := service.MemberCompanyRepository.FindByCompanyIdAndRoles(ctx, notifTx, request.CompanyId, []entity.MemberCompanyRole{"admin", "super_admin"}, 100, 0)
			if err != nil || count == 0 {
				fmt.Printf("Warning: Could not get admins for notification: %v\n", err)
				return // No admins to notify
			}

			refType := "company_join_request"
			for _, member := range members {
				service.NotificationService.Create(
					context.Background(),
					member.UserID,
					string(domain.NotificationCategoryCompany),
					"company_join_request",
					"New Join Request",
					fmt.Sprintf("%s wants to join %s", user.Name, company.Name),
					&request.CompanyId,
					&refType,
					&userId,
				)
			}
		}()
	}

	return helper.ToCompanyJoinRequestResponse(joinRequest)
}

func (service *CompanyJoinRequestServiceImpl) FindById(ctx context.Context, requestId uuid.UUID) web.CompanyJoinRequestResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	joinRequest, err := service.CompanyJoinRequestRepository.FindById(ctx, tx, requestId)
	if err != nil {
		panic(exception.NewNotFoundError("join request not found"))
	}

	return helper.ToCompanyJoinRequestResponse(joinRequest)
}

func (service *CompanyJoinRequestServiceImpl) FindByUserId(ctx context.Context, userId uuid.UUID, limit, offset int) []web.CompanyJoinRequestResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	requests := service.CompanyJoinRequestRepository.FindByUserId(ctx, tx, userId, limit, offset)

	var responses []web.CompanyJoinRequestResponse
	for _, request := range requests {
		responses = append(responses, helper.ToCompanyJoinRequestResponse(request))
	}

	return responses
}

func (service *CompanyJoinRequestServiceImpl) FindByCompanyId(ctx context.Context, companyId uuid.UUID, status string, limit, offset int) []web.CompanyJoinRequestResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	requests := service.CompanyJoinRequestRepository.FindByCompanyId(ctx, tx, companyId, status, limit, offset)

	var responses []web.CompanyJoinRequestResponse
	for _, request := range requests {
		responses = append(responses, helper.ToCompanyJoinRequestResponse(request))
	}

	return responses
}

func (service *CompanyJoinRequestServiceImpl) Review(ctx context.Context, requestId, reviewerId uuid.UUID, request web.ReviewCompanyJoinRequestRequest) web.CompanyJoinRequestResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Find the join request
	joinRequest, err := service.CompanyJoinRequestRepository.FindById(ctx, tx, requestId)
	if err != nil {
		panic(exception.NewNotFoundError("join request not found"))
	}

	if joinRequest.Status != "pending" {
		panic(exception.NewBadRequestError("this request has already been processed"))
	}

	// Check if reviewer has permission (admin or super_admin of the company)
	member, err := service.MemberCompanyRepository.FindByUserAndCompany(ctx, tx, reviewerId, joinRequest.CompanyId)
	if err != nil {
		panic(exception.NewForbiddenError("you don't have permission to review this request"))
	}
	if member.Role != "admin" && member.Role != "super_admin" {
		panic(exception.NewForbiddenError("you don't have permission to review this request"))
	}

	// Update request status
	now := time.Now()
	joinRequest.Status = request.Status
	joinRequest.ResponsedAt = &now
	joinRequest.ResponseBy = &reviewerId
	joinRequest.RejectionReason = request.RejectionReason
	joinRequest.UpdatedAt = now

	if request.Status == "rejected" && request.RejectionReason == nil {
		reason := "Your application does not meet our requirements"
		joinRequest.RejectionReason = &reason
	}

	joinRequest = service.CompanyJoinRequestRepository.Update(ctx, tx, joinRequest)

	// If approved, add user as member
	if request.Status == "approved" {
		memberCompany := entity.MemberCompany{
			ID:        uuid.New(),
			UserID:    joinRequest.UserId,
			CompanyID: joinRequest.CompanyId,
			Role:      "member",
			Status:    "active",
			JoinedAt:  time.Now(),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		_, err := service.MemberCompanyRepository.Create(ctx, tx, memberCompany)
		if err != nil {
			helper.PanicIfError(err)
		}
	}

	// Send notification to requester in separate transaction
	if service.NotificationService != nil {
		_, errUser := service.UserRepository.FindById(ctx, tx, joinRequest.UserId)
		company, errCompany := service.CompanyRepository.FindById(ctx, tx, joinRequest.CompanyId)

		if errUser == nil && errCompany == nil {
			go func() {
				// Create new transaction for notification
				notifTx, notifErr := service.DB.Begin()
				if notifErr != nil {
					fmt.Printf("Warning: Could not start notification transaction: %v\n", notifErr)
					return
				}
				defer func() {
					if r := recover(); r != nil {
						notifTx.Rollback()
					} else {
						notifTx.Commit()
					}
				}()

				var title, message string
				refType := "company_join_response"

				if request.Status == "approved" {
					title = "Join Request Approved"
					message = fmt.Sprintf("Congratulations! Your request to join %s has been approved", company.Name)
				} else {
					title = "Join Request Rejected"
					message = fmt.Sprintf("Your request to join %s has been rejected", company.Name)
					if joinRequest.RejectionReason != nil {
						message += ". Reason: " + *joinRequest.RejectionReason
					}
				}

				service.NotificationService.Create(
					context.Background(),
					joinRequest.UserId,
					string(domain.NotificationCategoryCompany),
					"company_join_response",
					title,
					message,
					&joinRequest.CompanyId,
					&refType,
					&reviewerId,
				)
			}()
		}
	}

	return helper.ToCompanyJoinRequestResponse(joinRequest)
}

func (service *CompanyJoinRequestServiceImpl) Cancel(ctx context.Context, requestId, userId uuid.UUID) {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	joinRequest, err := service.CompanyJoinRequestRepository.FindById(ctx, tx, requestId)
	if err != nil {
		panic(exception.NewNotFoundError("join request not found"))
	}

	if joinRequest.UserId != userId {
		panic(exception.NewForbiddenError("you can only cancel your own requests"))
	}

	if joinRequest.Status != "pending" {
		panic(exception.NewBadRequestError("only pending requests can be cancelled"))
	}

	service.CompanyJoinRequestRepository.Delete(ctx, tx, requestId)
}

func (service *CompanyJoinRequestServiceImpl) GetPendingCount(ctx context.Context, companyId uuid.UUID) int {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	return service.CompanyJoinRequestRepository.CountPendingByCompanyId(ctx, tx, companyId)
}
