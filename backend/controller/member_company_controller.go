package controller

import (
	"context"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/entity"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
)

type MemberCompanyController interface {
	CreateMemberCompany(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	UpdateMemberRole(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	UpdateMemberStatus(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	RemoveMember(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetMemberByID(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetMemberByUserAndCompany(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetCompanyMembers(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetUserCompanies(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	CheckMembership(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetUserRole(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetCompanyMemberCount(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetMembersByCompanyId(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	LeaveCompany(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}

type MemberCompanyControllerImpl struct {
	MemberCompanyService service.MemberCompanyService
}

func NewMemberCompanyController(memberCompanyService service.MemberCompanyService) MemberCompanyController {
	return &MemberCompanyControllerImpl{
		MemberCompanyService: memberCompanyService,
	}
}

// CreateMemberCompany - Add a new member to company (Super Admin/Admin only)
func (controller *MemberCompanyControllerImpl) CreateMemberCompany(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from token
	userID, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse request body
	createMemberCompanyRequest := entity.CreateMemberCompanyRequest{}
	helper.ReadFromRequestBody(request, &createMemberCompanyRequest)

	// Check if requester has permission (super_admin or admin of the company)
	companyID := createMemberCompanyRequest.CompanyID
	requesterRole, err := controller.MemberCompanyService.GetUserRoleInCompany(context.Background(), userID, companyID)
	if err != nil || (requesterRole != entity.RoleSuperAdmin && requesterRole != entity.RoleAdmin) {
		webResponse := web.WebResponse{
			Code:   http.StatusForbidden,
			Status: "FORBIDDEN",
			Data:   "Only super admin or admin can add new members",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Create member company
	memberCompanyResponse, err := controller.MemberCompanyService.CreateMemberCompany(context.Background(), createMemberCompanyRequest)
	if err != nil {
		webResponse := web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Data:   err.Error(),
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusCreated,
		Status: "CREATED",
		Data:   memberCompanyResponse,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

// UpdateMemberRole - Update member role (Super Admin only)
func (controller *MemberCompanyControllerImpl) UpdateMemberRole(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from token
	userID, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse member company ID from URL
	memberCompanyID, err := uuid.Parse(params.ByName("memberCompanyId"))
	helper.PanicIfError(err)
	if memberCompanyID == uuid.Nil {
		helper.NewBadRequestError("Member company ID is required")
		return
	}

	// Get member company info to check company ID
	memberInfo, err := controller.MemberCompanyService.GetMemberByID(context.Background(), memberCompanyID)
	if err != nil {
		webResponse := web.WebResponse{
			Code:   http.StatusNotFound,
			Status: "NOT_FOUND",
			Data:   "Member company not found",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Check if requester is super admin of the company
	requesterRole, err := controller.MemberCompanyService.GetUserRoleInCompany(context.Background(), userID, memberInfo.CompanyID)
	if err != nil || requesterRole != entity.RoleSuperAdmin {
		webResponse := web.WebResponse{
			Code:   http.StatusForbidden,
			Status: "FORBIDDEN",
			Data:   "Only super admin can update member roles",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Parse request body
	updateRoleRequest := entity.UpdateMemberCompanyRoleRequest{}
	helper.ReadFromRequestBody(request, &updateRoleRequest)

	// Cannot Update role to super_admin
	if updateRoleRequest.Role == entity.RoleSuperAdmin {
		webResponse := web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Data:   "Cannot update role to super_admin",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Update member role
	memberCompanyResponse, err := controller.MemberCompanyService.UpdateMemberRole(context.Background(), memberCompanyID, updateRoleRequest)
	if err != nil {
		webResponse := web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Data:   err.Error(),
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   memberCompanyResponse,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

// UpdateMemberStatus - Update member status (Super Admin/Admin only)
func (controller *MemberCompanyControllerImpl) UpdateMemberStatus(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from token
	userID, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse member company ID from URL
	memberCompanyID, err := uuid.Parse(params.ByName("memberCompanyId"))
	helper.PanicIfError(err)
	if memberCompanyID == uuid.Nil {
		helper.NewBadRequestError("Member company ID is required")
		return
	}

	// Get member company info to check company ID
	memberInfo, err := controller.MemberCompanyService.GetMemberByID(context.Background(), memberCompanyID)
	if err != nil {
		webResponse := web.WebResponse{
			Code:   http.StatusNotFound,
			Status: "NOT_FOUND",
			Data:   "Member company not found",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Check if requester has permission
	requesterRole, err := controller.MemberCompanyService.GetUserRoleInCompany(context.Background(), userID, memberInfo.CompanyID)
	if err != nil || (requesterRole != entity.RoleSuperAdmin && requesterRole != entity.RoleAdmin) {
		webResponse := web.WebResponse{
			Code:   http.StatusForbidden,
			Status: "FORBIDDEN",
			Data:   "Only super admin or admin can update member status",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Parse request body
	updateStatusRequest := entity.UpdateMemberCompanyStatusRequest{}
	helper.ReadFromRequestBody(request, &updateStatusRequest)

	// Update member status
	memberCompanyResponse, err := controller.MemberCompanyService.UpdateMemberStatus(context.Background(), memberCompanyID, updateStatusRequest)
	if err != nil {
		webResponse := web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Data:   err.Error(),
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   memberCompanyResponse,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

// RemoveMember - Remove member from company (Super Admin only)
func (controller *MemberCompanyControllerImpl) RemoveMember(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from token
	userID, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse member company ID from URL
	memberCompanyID, err := uuid.Parse(params.ByName("memberCompanyId"))
	helper.PanicIfError(err)
	if memberCompanyID == uuid.Nil {
		helper.NewBadRequestError("Member company ID is required")
		return
	}

	// Get member company info to check company ID
	memberInfo, err := controller.MemberCompanyService.GetMemberByID(context.Background(), memberCompanyID)
	if err != nil {
		webResponse := web.WebResponse{
			Code:   http.StatusNotFound,
			Status: "NOT_FOUND",
			Data:   "Member company not found",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Cannot remove self
	if memberInfo.UserID == userID {
		webResponse := web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Data:   "Cannot remove yourself from the company",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}
	// Cannot remove super admin
	if memberInfo.Role == entity.RoleSuperAdmin {
		webResponse := web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Data:   "Cannot remove super admin from the company",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Check if requester is super admin of the company
	requesterRole, err := controller.MemberCompanyService.GetUserRoleInCompany(context.Background(), userID, memberInfo.CompanyID)
	if err != nil || requesterRole != entity.RoleSuperAdmin {
		webResponse := web.WebResponse{
			Code:   http.StatusForbidden,
			Status: "FORBIDDEN",
			Data:   "Only super admin can remove members",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Remove member
	err = controller.MemberCompanyService.RemoveMember(context.Background(), memberCompanyID)
	if err != nil {
		webResponse := web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Data:   err.Error(),
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   "Member removed successfully",
	}
	helper.WriteToResponseBody(writer, webResponse)
}

// GetMemberByID - Get member company by ID
func (controller *MemberCompanyControllerImpl) GetMemberByID(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from token
	userID, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse member company ID from URL
	memberCompanyID, err := uuid.Parse(params.ByName("memberCompanyId"))
	helper.PanicIfError(err)
	if memberCompanyID == uuid.Nil {
		helper.NewBadRequestError("Member company ID is required")
		return
	}

	// Get member company
	memberCompanyResponse, err := controller.MemberCompanyService.GetMemberByID(context.Background(), memberCompanyID)
	if err != nil {
		webResponse := web.WebResponse{
			Code:   http.StatusNotFound,
			Status: "NOT_FOUND",
			Data:   "Member company not found",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Check if requester has access (member of the same company or the user themselves)
	isMember, _ := controller.MemberCompanyService.IsUserMemberOfCompany(context.Background(), userID, memberCompanyResponse.CompanyID)
	if !isMember && userID != memberCompanyResponse.UserID {
		webResponse := web.WebResponse{
			Code:   http.StatusForbidden,
			Status: "FORBIDDEN",
			Data:   "Access denied",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   memberCompanyResponse,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

// GetMemberByUserAndCompany - Get member company by user and company ID
func (controller *MemberCompanyControllerImpl) GetMemberByUserAndCompany(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from token
	requesterID, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse user ID and company ID from URL
	userID, err := uuid.Parse(params.ByName("userId"))
	helper.PanicIfError(err)
	companyID, err := uuid.Parse(params.ByName("companyId"))
	helper.PanicIfError(err)

	if userID == uuid.Nil || companyID == uuid.Nil {
		helper.NewBadRequestError("User ID and Company ID are required")
		return
	}

	// Check if requester has access (member of the same company or requesting their own info)
	isMember, _ := controller.MemberCompanyService.IsUserMemberOfCompany(context.Background(), requesterID, companyID)
	if !isMember && requesterID != userID {
		webResponse := web.WebResponse{
			Code:   http.StatusForbidden,
			Status: "FORBIDDEN",
			Data:   "Access denied",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Get member company
	memberCompanyResponse, err := controller.MemberCompanyService.GetMemberByUserAndCompany(context.Background(), userID, companyID)
	if err != nil {
		webResponse := web.WebResponse{
			Code:   http.StatusNotFound,
			Status: "NOT_FOUND",
			Data:   "Member company not found",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   memberCompanyResponse,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

// GetCompanyMembers - Get all members of a company
func (controller *MemberCompanyControllerImpl) GetCompanyMembers(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from token
	userID, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse company ID from URL
	companyID, err := uuid.Parse(params.ByName("companyId"))
	helper.PanicIfError(err)

	if companyID == uuid.Nil {
		helper.NewBadRequestError("Company ID is required")
		return
	}

	// Check if requester is member of the company
	isMember, err := controller.MemberCompanyService.IsUserMemberOfCompany(context.Background(), userID, companyID)
	if err != nil || !isMember {
		webResponse := web.WebResponse{
			Code:   http.StatusForbidden,
			Status: "FORBIDDEN",
			Data:   "Only company members can view member list",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	limit := 10
	offset := 0

	limitParam := request.URL.Query().Get("limit")
	if limitParam != "" {
		limit, _ = strconv.Atoi(limitParam)
	}

	offsetParam := request.URL.Query().Get("offset")
	if offsetParam != "" {
		offset, _ = strconv.Atoi(offsetParam)
	}

	// Get company members
	membersResponse, err := controller.MemberCompanyService.GetCompanyMembers(context.Background(), companyID, limit, offset)
	if err != nil {
		webResponse := web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Data:   err.Error(),
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   membersResponse,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

// GetUserCompanies - Get all companies for a user
func (controller *MemberCompanyControllerImpl) GetUserCompanies(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from token
	requesterID, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse user ID from URL
	userID, err := uuid.Parse(params.ByName("userId"))
	helper.PanicIfError(err)
	if userID == uuid.Nil {
		helper.NewBadRequestError("User ID is required")
		return
	}

	// Users can only view their own companies unless they have admin access
	if requesterID != userID {
		webResponse := web.WebResponse{
			Code:   http.StatusForbidden,
			Status: "FORBIDDEN",
			Data:   "Access denied",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	limit := 10
	offset := 0

	limitParam := request.URL.Query().Get("limit")
	if limitParam != "" {
		limit, _ = strconv.Atoi(limitParam)
	}

	offsetParam := request.URL.Query().Get("offset")
	if offsetParam != "" {
		offset, _ = strconv.Atoi(offsetParam)
	}

	// Get user companies
	companiesResponse, err := controller.MemberCompanyService.GetUserCompanies(context.Background(), userID, limit, offset)
	if err != nil {
		webResponse := web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Data:   err.Error(),
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   companiesResponse,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

// CheckMembership - Check if user is member of company
func (controller *MemberCompanyControllerImpl) CheckMembership(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from token
	_, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse user ID and company ID from URL
	userID, err := uuid.Parse(params.ByName("userId"))
	helper.PanicIfError(err)
	companyID, err := uuid.Parse(params.ByName("companyId"))
	helper.PanicIfError(err)

	if userID == uuid.Nil || companyID == uuid.Nil {
		webResponse := web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Data:   "User ID and Company ID are required",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Check membership
	isMember, err := controller.MemberCompanyService.IsUserMemberOfCompany(context.Background(), userID, companyID)
	if err != nil {
		webResponse := web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Data:   err.Error(),
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	response := map[string]interface{}{
		"user_id":    userID,
		"company_id": companyID,
		"is_member":  isMember,
	}

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   response,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

// GetUserRole - Get user role in company
func (controller *MemberCompanyControllerImpl) GetUserRole(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from token
	requesterID, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse user ID and company ID from URL
	userID, err := uuid.Parse(params.ByName("userId"))
	helper.PanicIfError(err)
	companyID, err := uuid.Parse(params.ByName("companyId"))
	helper.PanicIfError(err)
	if userID == uuid.Nil || companyID == uuid.Nil {
		helper.NewBadRequestError("User ID and Company ID are required")
		return
	}

	// Check if requester has access (member of the same company or requesting their own role)
	isMember, _ := controller.MemberCompanyService.IsUserMemberOfCompany(context.Background(), requesterID, companyID)
	if !isMember && requesterID != userID {
		webResponse := web.WebResponse{
			Code:   http.StatusForbidden,
			Status: "FORBIDDEN",
			Data:   "Access denied",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Get user role
	userRole, err := controller.MemberCompanyService.GetUserRoleInCompany(context.Background(), userID, companyID)
	if err != nil {
		webResponse := web.WebResponse{
			Code:   http.StatusNotFound,
			Status: "NOT_FOUND",
			Data:   "User is not a member of this company",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	response := map[string]interface{}{
		"user_id":    userID,
		"company_id": companyID,
		"role":       userRole,
	}

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   response,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

// GetCompanyMemberCount - Get total member count for a company
func (controller *MemberCompanyControllerImpl) GetCompanyMemberCount(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from token
	userID, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse company ID from URL
	companyID, err := uuid.Parse(params.ByName("companyId"))
	helper.PanicIfError(err)
	if companyID == uuid.Nil {
		helper.NewBadRequestError("Company ID is required")
		return
	}

	// Get member count
	totalCount, err := controller.MemberCompanyService.GetCompanyMemberCount(context.Background(), companyID)
	if err != nil {
		webResponse := web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Data:   err.Error(),
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Get count by roles for detailed info (optional, only for company members)
	var roleBreakdown map[string]int
	isMember, _ := controller.MemberCompanyService.IsUserMemberOfCompany(context.Background(), userID, companyID)
	if isMember {
		roleBreakdown = make(map[string]int)

		// Get count for each role
		roles := []entity.MemberCompanyRole{
			entity.RoleSuperAdmin,
			entity.RoleAdmin,
			entity.RoleHRD,
			entity.RoleMember,
		}

		for _, role := range roles {
			count, _ := controller.MemberCompanyService.GetCompanyMemberCountByRole(context.Background(), companyID, role)
			roleBreakdown[string(role)] = count
		}
	}

	response := map[string]interface{}{
		"company_id":    companyID,
		"total_members": totalCount,
	}

	if roleBreakdown != nil {
		response["role_breakdown"] = roleBreakdown
	}

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   response,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

// GetMembersByCompanyId - Get members by company ID
func (controller *MemberCompanyControllerImpl) GetMembersByCompanyId(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from token
	userID, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse company ID from URL
	companyID, err := uuid.Parse(params.ByName("companyId"))
	helper.PanicIfError(err)
	if companyID == uuid.Nil {
		helper.NewBadRequestError("Company ID is required")
		return
	}

	limit := 10
	offset := 0

	limitParam := request.URL.Query().Get("limit")
	if limitParam != "" {
		limit, _ = strconv.Atoi(limitParam)
	}

	offsetParam := request.URL.Query().Get("offset")
	if offsetParam != "" {
		offset, _ = strconv.Atoi(offsetParam)
	}

	// Get members by company ID
	membersResponse, err := controller.MemberCompanyService.GetMembersByCompanyId(context.Background(), userID, companyID, limit, offset)
	if err != nil {
		webResponse := web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Data:   err.Error(),
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Send response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   membersResponse,
	}
	helper.WriteToResponseBody(writer, webResponse)
}

// LeaveCompany - Allow user to leave a company
func (controller *MemberCompanyControllerImpl) LeaveCompany(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from token
	userID, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse company ID from URL
	companyID, err := uuid.Parse(params.ByName("companyId"))
	helper.PanicIfError(err)
	if companyID == uuid.Nil {
		helper.NewBadRequestError("Company ID is required")
		return
	}

	// Check if user is a member of the company
	isMember, err := controller.MemberCompanyService.IsUserMemberOfCompany(context.Background(), userID, companyID)
	if err != nil || !isMember {
		webResponse := web.WebResponse{
			Code:   http.StatusForbidden,
			Status: "FORBIDDEN",
			Data:   "You are not a member of this company",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Allow user to leave the company
	err = controller.MemberCompanyService.LeaveCompany(context.Background(), userID, companyID)
	if err != nil {
		webResponse := web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD_REQUEST",
			Data:   err.Error(),
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   "Successfully left the company",
	}
	helper.WriteToResponseBody(writer, webResponse)
}
