package controller

import (
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
)

type ConnectionControllerImpl struct {
	ConnectionService service.ConnectionService
}

func NewConnectionController(connectionService service.ConnectionService) ConnectionController {
	return &ConnectionControllerImpl{
		ConnectionService: connectionService,
	}
}

func (controller *ConnectionControllerImpl) SendConnectionRequest(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Parse request body
	connectionRequest := web.ConnectionRequestCreate{}
	helper.ReadFromRequestBody(request, &connectionRequest)

	// Get receiver ID from URL params
	receiverId, err := uuid.Parse(params.ByName("userId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid user ID format"))
	}

	// Get sender ID from context (set by JWT middleware)
	senderIdString, ok := request.Context().Value("user_id").(string)
	if !ok {
		panic(exception.NewUnauthorizedError("Unauthorized access"))
	}

	// Parse sender ID
	senderId, err := uuid.Parse(senderIdString)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid user ID format"))
	}

	// Call service to create connection request
	connectionResponse := controller.ConnectionService.SendConnectionRequest(request.Context(), senderId, receiverId, connectionRequest)

	// Create web response
	webResponse := web.WebResponse{
		Code:   201,
		Status: "CREATED",
		Data:   connectionResponse,
	}

	// Write response
	writer.WriteHeader(http.StatusCreated)
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *ConnectionControllerImpl) GetConnectionRequests(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context (set by JWT middleware)
	userIdString, ok := request.Context().Value("user_id").(string)
	if !ok {
		panic(exception.NewUnauthorizedError("Unauthorized access"))
	}

	// Parse user ID
	userId, err := uuid.Parse(userIdString)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid user ID format"))
	}

	// Parse pagination parameters
	limitStr := request.URL.Query().Get("limit")
	offsetStr := request.URL.Query().Get("offset")

	limit := 10 // default
	if limitStr != "" {
		l, err := strconv.Atoi(limitStr)
		if err == nil && l > 0 {
			limit = l
		}
	}

	offset := 0 // default
	if offsetStr != "" {
		o, err := strconv.Atoi(offsetStr)
		if err == nil && o >= 0 {
			offset = o
		}
	}

	// Call service to get connection requests
	requestsResponse := controller.ConnectionService.GetConnectionRequests(request.Context(), userId, limit, offset)

	// Create web response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   requestsResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *ConnectionControllerImpl) AcceptConnectionRequest(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get request ID from URL params
	requestId, err := uuid.Parse(params.ByName("requestId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid request ID format"))
	}

	// Get user ID from context (set by JWT middleware)
	userIdString, ok := request.Context().Value("user_id").(string)
	if !ok {
		panic(exception.NewUnauthorizedError("Unauthorized access"))
	}

	// Parse user ID
	userId, err := uuid.Parse(userIdString)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid user ID format"))
	}

	// Call service to accept connection request
	connectionResponse := controller.ConnectionService.AcceptConnectionRequest(request.Context(), userId, requestId)

	// Create web response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   connectionResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *ConnectionControllerImpl) RejectConnectionRequest(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get request ID from URL params
	requestId, err := uuid.Parse(params.ByName("requestId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid request ID format"))
	}

	// Get user ID from context (set by JWT middleware)
	userIdString, ok := request.Context().Value("user_id").(string)
	if !ok {
		panic(exception.NewUnauthorizedError("Unauthorized access"))
	}

	// Parse user ID
	userId, err := uuid.Parse(userIdString)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid user ID format"))
	}

	// Call service to reject connection request
	connectionResponse := controller.ConnectionService.RejectConnectionRequest(request.Context(), userId, requestId)

	// Create web response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   connectionResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *ConnectionControllerImpl) GetConnections(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from URL params (can be the current user or another user)
	userId, err := uuid.Parse(params.ByName("userId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid user ID format"))
	}

	// Parse pagination parameters
	limitStr := request.URL.Query().Get("limit")
	offsetStr := request.URL.Query().Get("offset")

	limit := 10 // default
	if limitStr != "" {
		l, err := strconv.Atoi(limitStr)
		if err == nil && l > 0 {
			limit = l
		}
	}

	offset := 0 // default
	if offsetStr != "" {
		o, err := strconv.Atoi(offsetStr)
		if err == nil && o >= 0 {
			offset = o
		}
	}

	// Call service to get connections
	connectionsResponse := controller.ConnectionService.GetConnections(request.Context(), userId, limit, offset)

	// Create web response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   connectionsResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}
