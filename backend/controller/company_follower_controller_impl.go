package controller

import (
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"net/http"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
)

type CompanyFollowerControllerImpl struct {
	CompanyFollowerService service.CompanyFollowerService
}

func NewCompanyFollowerController(companyFollowerService service.CompanyFollowerService) CompanyFollowerController {
	return &CompanyFollowerControllerImpl{
		CompanyFollowerService: companyFollowerService,
	}
}

func (controller *CompanyFollowerControllerImpl) FollowCompany(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context
	userId, err := helper.GetUserIdFromToken(request)
	if err != nil {
		panic(exception.NewUnauthorizedError("Unauthorized"))
	}

	// Parse request body
	followRequest := web.FollowCompanyRequest{}
	helper.ReadFromRequestBody(request, &followRequest)

	// Call service
	followerResponse := controller.CompanyFollowerService.FollowCompany(request.Context(), userId, followRequest)

	// Create response
	webResponse := web.WebResponse{
		Code:   201,
		Status: "CREATED",
		Data:   followerResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CompanyFollowerControllerImpl) UnfollowCompany(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context
	userId, err := helper.GetUserIdFromToken(request)
	if err != nil {
		panic(exception.NewUnauthorizedError("Unauthorized"))
	}

	// Parse request body
	unfollowRequest := web.UnfollowCompanyRequest{}
	helper.ReadFromRequestBody(request, &unfollowRequest)

	// Call service
	controller.CompanyFollowerService.UnfollowCompany(request.Context(), userId, unfollowRequest)

	// Create response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   "Successfully unfollowed company",
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CompanyFollowerControllerImpl) GetCompanyFollowers(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get company ID from URL params
	companyIdStr := params.ByName("companyId")
	companyId, err := uuid.Parse(companyIdStr)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid company ID"))
	}

	// Get pagination parameters
	limit, offset, err := helper.GetPaginationParams(request)
	if err != nil {
		panic(exception.NewBadRequestError(err.Error()))
	}

	// Call service
	followersResponse := controller.CompanyFollowerService.GetCompanyFollowers(request.Context(), companyId, limit, offset)

	// Create response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   followersResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CompanyFollowerControllerImpl) GetUserFollowingCompanies(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context
	userId, err := helper.GetUserIdFromToken(request)
	if err != nil {
		panic(exception.NewUnauthorizedError("Unauthorized"))
	}

	// Get pagination parameters
	limit, offset, err := helper.GetPaginationParams(request)
	if err != nil {
		panic(exception.NewBadRequestError(err.Error()))
	}

	// Call service
	followingResponse := controller.CompanyFollowerService.GetUserFollowingCompanies(request.Context(), userId, limit, offset)

	// Create response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   followingResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *CompanyFollowerControllerImpl) CheckFollowStatus(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context
	userId, err := helper.GetUserIdFromToken(request)
	if err != nil {
		panic(exception.NewUnauthorizedError("Unauthorized"))
	}

	// Get company ID from URL params
	companyIdStr := params.ByName("companyId")
	companyId, err := uuid.Parse(companyIdStr)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid company ID"))
	}

	// Call service
	followStatusResponse := controller.CompanyFollowerService.CheckFollowStatus(request.Context(), userId, companyId)

	// Create response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   followStatusResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}
