package helper

import (
	"encoding/json"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
)

func ToCompanyEditRequestResponse(editRequest domain.CompanyEditRequest) web.CompanyEditRequestResponse {
	response := web.CompanyEditRequestResponse{
		Id:              editRequest.Id.String(),
		CompanyId:       editRequest.CompanyId.String(),
		UserId:          editRequest.UserId.String(),
		Status:          string(editRequest.Status),
		RejectionReason: editRequest.RejectionReason,
		CreatedAt:       editRequest.CreatedAt,
		UpdatedAt:       editRequest.UpdatedAt,
	}

	// Parse JSON data
	var requestedChanges web.CompanyEditData
	if err := json.Unmarshal([]byte(editRequest.RequestedChanges), &requestedChanges); err == nil {
		response.RequestedChanges = requestedChanges
	}

	var currentData web.CompanyEditData
	if err := json.Unmarshal([]byte(editRequest.CurrentData), &currentData); err == nil {
		response.CurrentData = currentData
	}

	if editRequest.ReviewedBy != nil {
		response.ReviewedBy = editRequest.ReviewedBy.String()
	}

	if editRequest.ReviewedAt != nil {
		response.ReviewedAt = editRequest.ReviewedAt
	}

	if editRequest.Company != nil {
		response.Company = &web.CompanyResponse{
			ID:          editRequest.Company.Id,
			Name:        editRequest.Company.Name,
			LinkedinUrl: editRequest.Company.LinkedinUrl,
			Website:     editRequest.Company.Website,
			Industry:    editRequest.Company.Industry,
			Size:        editRequest.Company.Size,
			Type:        editRequest.Company.Type,
			Logo:        editRequest.Company.Logo,
			Tagline:     editRequest.Company.Tagline,
			IsVerified:  editRequest.Company.IsVerified,
			CreatedAt:   editRequest.Company.CreatedAt,
			UpdatedAt:   editRequest.Company.UpdatedAt,
		}
	}

	if editRequest.User != nil {
		response.User = &web.UserBriefResponse{
			Id:       editRequest.User.Id,
			Name:     editRequest.User.Name,
			Email:    editRequest.User.Email,
			Username: editRequest.User.Username,
			Photo:    editRequest.User.Photo,
		}
	}

	return response
}
