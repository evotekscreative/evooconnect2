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
)

// Helper function to convert string to *string
func stringPtr(s string) *string {
	return &s
}

// Helper function to handle optional strings
func optionalStringPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

type ConnectionServiceImpl struct {
	ConnectionRepository repository.ConnectionRepository
	UserRepository       repository.UserRepository
	DB                   *sql.DB
	Validate             *validator.Validate
}

func NewConnectionService(connectionRepository repository.ConnectionRepository, userRepository repository.UserRepository, db *sql.DB, validate *validator.Validate) ConnectionService {
	return &ConnectionServiceImpl{
		ConnectionRepository: connectionRepository,
		UserRepository:       userRepository,
		DB:                   db,
		Validate:             validate,
	}
}

func (service *ConnectionServiceImpl) SendConnectionRequest(ctx context.Context, senderId uuid.UUID, receiverId uuid.UUID, request web.ConnectionRequestCreate) web.ConnectionRequestResponse {
	// Validate request
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if users exist
	_, err = service.UserRepository.FindById(ctx, tx, senderId)
	if err != nil {
		panic(exception.NewNotFoundError("Sender user not found"))
	}

	receiver, err := service.UserRepository.FindById(ctx, tx, receiverId)
	if err != nil {
		panic(exception.NewNotFoundError("Receiver user not found"))
	}

	// Check if sender is trying to connect with themselves
	if senderId == receiverId {
		panic(exception.NewBadRequestError("Cannot send connection request to yourself"))
	}

	// Check if users are already connected
	if service.ConnectionRepository.CheckConnectionExists(ctx, tx, senderId, receiverId) {
		panic(exception.NewBadRequestError("Users are already connected"))
	}

	// Check if there's already a pending request between these users
	existingRequest, err := service.ConnectionRepository.FindConnectionRequestBySenderIdAndReceiverId(ctx, tx, senderId, receiverId)
	if err == nil {
		// Request exists, check its status
		if existingRequest.Status == domain.ConnectionStatusPending {
			if existingRequest.SenderId == senderId {
				panic(exception.NewBadRequestError("You've already sent a connection request to this user"))
			} else {
				panic(exception.NewBadRequestError("This user has already sent you a connection request"))
			}
		} else if existingRequest.Status == domain.ConnectionStatusRejected {
			// Previous request was rejected, allow sending a new one
			// This is a design choice - you could also prevent new requests after rejection
		}
	}

	// Create connection request
	connectionRequest := domain.ConnectionRequest{
		SenderId:   senderId,
		ReceiverId: receiverId,
		Message:    request.Message,
	}

	createdRequest := service.ConnectionRepository.SaveConnectionRequest(ctx, tx, connectionRequest)

	// Get sender info
	sender, err := service.UserRepository.FindById(ctx, tx, senderId)
	if err != nil {
		panic(exception.NewNotFoundError("Sender user not found"))
	}

	// Prepare response
	return web.ConnectionRequestResponse{
		Id:        createdRequest.Id,
		Status:    string(createdRequest.Status),
		Message:   createdRequest.Message,
		CreatedAt: createdRequest.CreatedAt,
		UpdatedAt: createdRequest.UpdatedAt,
		Receiver: &web.UserShort{
			Id:       receiver.Id,
			Name:     receiver.Name,
			Username: receiver.Username,
			Headline: optionalStringPtr(receiver.Headline),
			Photo:    optionalStringPtr(receiver.Photo),
		},
		Sender: &web.UserShort{
			Id:       sender.Id,
			Name:     sender.Name,
			Username: sender.Username,
			Headline: optionalStringPtr(sender.Headline),
			Photo:    optionalStringPtr(sender.Photo),
		},
	}
}

func (service *ConnectionServiceImpl) GetConnectionRequests(ctx context.Context, userId uuid.UUID, limit, offset int) web.ConnectionRequestListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if user exists
	_, err = service.UserRepository.FindById(ctx, tx, userId)
	if err != nil {
		panic(exception.NewNotFoundError("User not found"))
	}

	// Get connection requests for user
	requests, count := service.ConnectionRepository.FindConnectionRequestsByReceiverId(ctx, tx, userId, limit, offset)

	var requestResponses []web.ConnectionRequestResponse
	for _, request := range requests {
		requestResponse := web.ConnectionRequestResponse{
			Id:        request.Id,
			Status:    string(request.Status),
			Message:   request.Message,
			CreatedAt: request.CreatedAt,
			UpdatedAt: request.UpdatedAt,
		}

		// Add sender info if available
		if request.Sender != nil {
			requestResponse.Sender = &web.UserShort{
				Id:       request.Sender.Id,
				Name:     request.Sender.Name,
				Username: request.Sender.Username,
				Headline: optionalStringPtr(request.Sender.Headline),
				Photo:    optionalStringPtr(request.Sender.Photo),
			}
		}

		requestResponses = append(requestResponses, requestResponse)
	}

	return web.ConnectionRequestListResponse{
		Requests: requestResponses,
		Total:    count,
	}
}

func (service *ConnectionServiceImpl) AcceptConnectionRequest(ctx context.Context, userId uuid.UUID, requestId uuid.UUID) web.ConnectionRequestResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Get connection request
	request, err := service.ConnectionRepository.FindConnectionRequestById(ctx, tx, requestId)
	if err != nil {
		panic(exception.NewNotFoundError("Connection request not found"))
	}

	// Verify the current user is the receiver of the request
	if request.ReceiverId != userId {
		panic(exception.NewForbiddenError("You can only accept requests sent to you"))
	}

	// Verify the request is pending
	if request.Status != domain.ConnectionStatusPending {
		panic(exception.NewBadRequestError("Connection request is not pending"))
	}

	// Update request status
	request.Status = domain.ConnectionStatusAccepted
	updatedRequest := service.ConnectionRepository.UpdateConnectionRequest(ctx, tx, request)

	// Create connection
	connection := domain.Connection{
		UserId1: request.SenderId,
		UserId2: request.ReceiverId,
	}
	service.ConnectionRepository.SaveConnection(ctx, tx, connection)

	// Get user info for response
	sender, err := service.UserRepository.FindById(ctx, tx, request.SenderId)
	if err != nil {
		panic(exception.NewNotFoundError("Sender user not found"))
	}

	receiver, err := service.UserRepository.FindById(ctx, tx, request.ReceiverId)
	if err != nil {
		panic(exception.NewNotFoundError("Receiver user not found"))
	}

	// Prepare response
	return web.ConnectionRequestResponse{
		Id:        updatedRequest.Id,
		Status:    string(updatedRequest.Status),
		Message:   updatedRequest.Message,
		CreatedAt: updatedRequest.CreatedAt,
		UpdatedAt: updatedRequest.UpdatedAt,
		Sender: &web.UserShort{
			Id:       sender.Id,
			Name:     sender.Name,
			Username: sender.Username,
			Headline: optionalStringPtr(sender.Headline),
			Photo:    optionalStringPtr(sender.Photo),
		},
		Receiver: &web.UserShort{
			Id:       receiver.Id,
			Name:     receiver.Name,
			Username: receiver.Username,
			Headline: optionalStringPtr(receiver.Headline),
			Photo:    optionalStringPtr(receiver.Photo),
		},
	}
}

func (service *ConnectionServiceImpl) RejectConnectionRequest(ctx context.Context, userId uuid.UUID, requestId uuid.UUID) web.ConnectionRequestResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Get connection request
	request, err := service.ConnectionRepository.FindConnectionRequestById(ctx, tx, requestId)
	if err != nil {
		panic(exception.NewNotFoundError("Connection request not found"))
	}

	// Verify the current user is the receiver of the request
	if request.ReceiverId != userId {
		panic(exception.NewForbiddenError("You can only reject requests sent to you"))
	}

	// Verify the request is pending
	if request.Status != domain.ConnectionStatusPending {
		panic(exception.NewBadRequestError("Connection request is not pending"))
	}

	// Update request status
	request.Status = domain.ConnectionStatusRejected
	updatedRequest := service.ConnectionRepository.UpdateConnectionRequest(ctx, tx, request)

	// Get user info for response
	sender, err := service.UserRepository.FindById(ctx, tx, request.SenderId)
	if err != nil {
		panic(exception.NewNotFoundError("Sender user not found"))
	}

	receiver, err := service.UserRepository.FindById(ctx, tx, request.ReceiverId)
	if err != nil {
		panic(exception.NewNotFoundError("Receiver user not found"))
	}

	// Prepare response
	return web.ConnectionRequestResponse{
		Id:        updatedRequest.Id,
		Status:    string(updatedRequest.Status),
		Message:   updatedRequest.Message,
		CreatedAt: updatedRequest.CreatedAt,
		UpdatedAt: updatedRequest.UpdatedAt,
		Sender: &web.UserShort{
			Id:       sender.Id,
			Name:     sender.Name,
			Username: sender.Username,
			Headline: optionalStringPtr(sender.Headline),
			Photo:    optionalStringPtr(sender.Photo),
		},
		Receiver: &web.UserShort{
			Id:       receiver.Id,
			Name:     receiver.Name,
			Username: receiver.Username,
			Headline: optionalStringPtr(receiver.Headline),
			Photo:    optionalStringPtr(receiver.Photo),
		},
	}
}

func (service *ConnectionServiceImpl) GetConnections(ctx context.Context, userId uuid.UUID, limit, offset int) web.ConnectionListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if user exists
	_, err = service.UserRepository.FindById(ctx, tx, userId)
	if err != nil {
		panic(exception.NewNotFoundError("User not found"))
	}

	// Get connections for user
	connections, count := service.ConnectionRepository.FindConnectionsByUserId(ctx, tx, userId, limit, offset)

	var connectionResponses []web.ConnectionResponse
	for _, connection := range connections {
		var otherUser *domain.User
		if connection.UserId1 == userId && connection.User2 != nil {
			otherUser = connection.User2
		} else if connection.UserId2 == userId && connection.User1 != nil {
			otherUser = connection.User1
		} else {
			continue
		}

		userShort := utils.ToUserShortWithConnection(ctx, tx, service.ConnectionRepository, userId, *otherUser)
		connectionResponse := web.ConnectionResponse{
			Id:        connection.Id,
			CreatedAt: connection.CreatedAt.Format("2006-01-02T15:04:05Z"),
			User:      &userShort, // Buat pointer secara manual
		}

		connectionResponses = append(connectionResponses, connectionResponse)
	}

	return web.ConnectionListResponse{
		Connections: connectionResponses,
		Total:       count,
	}
}

func (service *ConnectionServiceImpl) Disconnect(ctx context.Context, userId, targetUserId uuid.UUID) web.DisconnectResponse {
	tx, err := service.DB.Begin()
	if err != nil {
		panic(err)
	}
	defer helper.CommitOrRollback(tx)

	// Check if the users are connected
	isConnected := service.ConnectionRepository.CheckConnectionExists(ctx, tx, userId, targetUserId)
	if !isConnected {
		panic(exception.NewBadRequestError("You are not connected with this user"))
	}

	// Perform disconnect operation
	err = service.ConnectionRepository.Disconnect(ctx, tx, userId, targetUserId)
	if err != nil {
		panic(exception.NewInternalServerError("Failed to disconnect users: " + err.Error()))
	}

	return web.DisconnectResponse{
		Message:        "Successfully disconnected",
		UserId:         targetUserId,
		DisconnectedAt: time.Now(),
	}
}
