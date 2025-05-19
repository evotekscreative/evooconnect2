package controller

import (
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"github.com/julienschmidt/httprouter"
	"net/http"
)

type ProfileViewControllerImpl struct {
	ProfileViewService service.ProfileViewService
}

func NewProfileViewController(profileViewService service.ProfileViewService) ProfileViewController {
	return &ProfileViewControllerImpl{
		ProfileViewService: profileViewService,
	}
}

func (controller *ProfileViewControllerImpl) GetViewsThisWeek(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	response := controller.ProfileViewService.GetViewsThisWeek(request.Context(), userId)
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   response,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *ProfileViewControllerImpl) GetViewsLastWeek(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	response := controller.ProfileViewService.GetViewsLastWeek(request.Context(), userId)
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   response,
	}
	helper.WriteToResponseBody(writer, webResponse)
}
