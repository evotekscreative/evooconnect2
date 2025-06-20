package controller

import (
	"context"
	"net/http"
	"strconv"

	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
)

type CompanyJoinRequestControllerImpl struct {
	CompanyJoinRequestService service.CompanyJoinRequestService
}

func NewCompanyJoinRequestController(companyJoinRequestService service.CompanyJoinRequestService) CompanyJoinRequestController {
	return &CompanyJoinRequestControllerImpl{
		CompanyJoinRequestService: companyJoinRequestService,
	}
}

func (controller *CompanyJoinRequestControllerImpl) Create(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	requestBody := web.CreateCompanyJoinRequestRequest{}
	helper.ReadFromRequestBody(request, &requestBody)

	joinRequestResponse := controller.CompanyJoinRequestService.Create(context.Background(), userId, requestBody)

	webResponse := web.WebResponse{
		Code:   201,
		Status: "CREATED",
		Data:   joinRequestResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CompanyJoinRequestControllerImpl) FindById(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	requestIdStr := params.ByName("requestId")
	requestId, err := uuid.Parse(requestIdStr)
	helper.PanicIfError(err)

	joinRequestResponse := controller.CompanyJoinRequestService.FindById(context.Background(), requestId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   joinRequestResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CompanyJoinRequestControllerImpl) FindMyRequests(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Get query parameters
	limitStr := request.URL.Query().Get("limit")
	offsetStr := request.URL.Query().Get("offset")

	limit := 10
	offset := 0

	if limitStr != "" {
		limit, _ = strconv.Atoi(limitStr)
	}
	if offsetStr != "" {
		offset, _ = strconv.Atoi(offsetStr)
	}

	responses := controller.CompanyJoinRequestService.FindByUserId(context.Background(), userId, limit, offset)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   responses,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CompanyJoinRequestControllerImpl) FindByCompanyId(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	companyIdStr := params.ByName("companyId")
	companyId, err := uuid.Parse(companyIdStr)
	helper.PanicIfError(err)

	// Get query parameters
	status := request.URL.Query().Get("status")
	limitStr := request.URL.Query().Get("limit")
	offsetStr := request.URL.Query().Get("offset")

	limit := 10
	offset := 0

	if limitStr != "" {
		limit, _ = strconv.Atoi(limitStr)
	}
	if offsetStr != "" {
		offset, _ = strconv.Atoi(offsetStr)
	}

	responses := controller.CompanyJoinRequestService.FindByCompanyId(context.Background(), companyId, status, limit, offset)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   responses,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CompanyJoinRequestControllerImpl) Review(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {

	reviewerId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	requestIdStr := params.ByName("requestId")
	requestId, err := uuid.Parse(requestIdStr)
	helper.PanicIfError(err)

	requestBody := web.ReviewCompanyJoinRequestRequest{}
	helper.ReadFromRequestBody(request, &requestBody)

	joinRequestResponse := controller.CompanyJoinRequestService.Review(context.Background(), requestId, reviewerId, requestBody)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   joinRequestResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CompanyJoinRequestControllerImpl) Cancel(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	requestIdStr := params.ByName("requestId")
	requestId, err := uuid.Parse(requestIdStr)
	helper.PanicIfError(err)

	controller.CompanyJoinRequestService.Cancel(context.Background(), requestId, userId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   "Join request cancelled successfully",
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CompanyJoinRequestControllerImpl) GetPendingCount(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	companyIdStr := params.ByName("companyId")
	companyId, err := uuid.Parse(companyIdStr)
	helper.PanicIfError(err)

	count := controller.CompanyJoinRequestService.GetPendingCount(context.Background(), companyId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   map[string]int{"pending_count": count},
	}

	helper.WriteToResponseBody(writer, webResponse)
}
