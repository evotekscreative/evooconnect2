package controller

import (
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"net/http"

	"github.com/julienschmidt/httprouter"
)

type AdminAuthControllerImpl struct {
	AdminAuthService service.AdminAuthService
}

func NewAdminAuthController(adminAuthService service.AdminAuthService) AdminAuthController {
	return &AdminAuthControllerImpl{
		AdminAuthService: adminAuthService,
	}
}

func (controller *AdminAuthControllerImpl) Login(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	loginRequest := web.AdminLoginRequest{}
	helper.ReadFromRequestBody(request, &loginRequest)

	loginResponse := controller.AdminAuthService.Login(request.Context(), loginRequest)
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   loginResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *AdminAuthControllerImpl) Register(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	registerRequest := web.AdminRegisterRequest{}
	helper.ReadFromRequestBody(request, &registerRequest)

	registerResponse := controller.AdminAuthService.Register(request.Context(), registerRequest)
	webResponse := web.WebResponse{
		Code:   201,
		Status: "CREATED",
		Data:   registerResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}
