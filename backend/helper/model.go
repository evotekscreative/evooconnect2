package helper

import (
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
)

// func ToCategoryResponse(category domain.Category) web.CategoryResponse {
// 	return web.CategoryResponse{
// 		Id:   category.Id,
// 		Name: category.Name,
// 	}
// }

//	func ToCategoryResponses(categories []domain.Category) []web.CategoryResponse {
//		var categoryResponses []web.CategoryResponse
//		for _, category := range categories {
//			categoryResponses = append(categoryResponses, ToCategoryResponse(category))
//		}
//		return categoryResponses
//	}

func ToUserProfileResponse(user domain.User) web.UserProfileResponse {
	return web.UserProfileResponse{
		ID:           user.Id,
		Name:         user.Name,
		Email:        user.Email,
		Username:     user.Username,
		Birthdate:    user.Birthdate,
		Gender:       user.Gender,
		Location:     user.Location,
		Organization: user.Organization,
		Website:      user.Website,
		Phone:        user.Phone,
		Headline:     user.Headline,
		About:        user.About,
		Skills:       user.Skills,
		Socials:      user.Socials,
		Photo:        user.Photo,
		IsVerified:   user.IsVerified,
		CreatedAt:    user.CreatedAt,
		UpdatedAt:    user.UpdatedAt,
	}
}
