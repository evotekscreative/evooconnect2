package controller

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

type CompanyFollowerController interface {
	FollowCompany(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	UnfollowCompany(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetCompanyFollowers(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetUserFollowingCompanies(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	CheckFollowStatus(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}
