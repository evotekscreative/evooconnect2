package helper

import (
	"encoding/json"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	// "evoconnect/backend/repository"
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

func ToUserProfileResponse(user domain.User, isConnected ...bool) web.UserProfileResponse {
	// Definisikan nilai default untuk skills dan socials
	var skillsInterface, socialsInterface interface{}

	// Periksa apakah skills dan socials valid (tidak NULL)
	if user.Skills.Valid {
		// Coba parse sebagai JSON jika valid
		err := json.Unmarshal([]byte(user.Skills.String), &skillsInterface)
		if err != nil {
			// Jika gagal parse, gunakan string mentah
			skillsInterface = user.Skills.String
		}
	} else {
		// Jika NULL, gunakan array kosong
		skillsInterface = []string{}
	}

	if user.Socials.Valid {
		// Coba parse sebagai JSON jika valid
		err := json.Unmarshal([]byte(user.Socials.String), &socialsInterface)
		if err != nil {
			// Jika gagal parse, gunakan string mentah
			socialsInterface = user.Socials.String
		}
	} else {
		// Jika NULL, gunakan object kosong
		socialsInterface = map[string]string{}
	}

	// Format birthdate
	var birthdate string
	if !user.Birthdate.IsZero() {
		birthdate = user.Birthdate.Format("2006-01-02")
	}

	connected := false
	if len(isConnected) > 0 {
		connected = isConnected[0]
	}

	return web.UserProfileResponse{
		ID:           user.Id,
		Name:         user.Name,
		Email:        user.Email,
		Username:     user.Username,
		Birthdate:    birthdate,
		Gender:       user.Gender,
		Location:     user.Location,
		Organization: user.Organization,
		Website:      user.Website,
		Phone:        user.Phone,
		Headline:     user.Headline,
		About:        user.About,
		Skills:       skillsInterface,
		Socials:      socialsInterface,
		Photo:        user.Photo,
		IsVerified:   user.IsVerified,
		IsConnected:  connected,
		CreatedAt:    user.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:    user.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}
}

func ToUserShortResponse(user domain.User, isConnected bool) web.UserShort {
	return web.UserShort{
		Id:          user.Id,
		Name:        user.Name,
		Username:    user.Username,
		Photo:       &user.Photo,
		Headline:    &user.Headline,
		IsConnected: isConnected,
	}
}




func ToPostResponse(post domain.Post) web.PostResponse {
    postResponse := web.PostResponse{
        Id:            post.Id,
        UserId:        post.UserId,
        Content:       post.Content,
        Images:        post.Images,
        Visibility:    post.Visibility,
        CreatedAt:     post.CreatedAt,
        UpdatedAt:     post.UpdatedAt,
        IsLiked:       post.IsLiked,
        LikesCount:    post.LikesCount,
        CommentsCount: post.CommentsCount,
        GroupId:       post.GroupId,
    }

	if post.User != nil {
		postResponse.User = web.UserShort{
			Id:          post.User.Id,
			Name:        post.User.Name,
			Username:    post.User.Username,
			Photo:       &post.User.Photo,
			Headline:    &post.User.Headline,
			IsConnected: post.User.IsConnected,
		}
	}

    if post.Group != nil {
        group := ToGroupResponse(*post.Group)
        postResponse.Group = &group
    }

    return postResponse
}





func ToPostResponses(posts []domain.Post) []web.PostResponse {
	postResponses := make([]web.PostResponse, 0)
	for _, post := range posts {
		postResponse := ToPostResponse(post)
		postResponses = append(postResponses, postResponse)
	}
	return postResponses
}

// Fungsi untuk mengkonversi comment domain ke comment response
func ToCommentResponse(comment domain.Comment) web.CommentResponse {
	commentResponse := web.CommentResponse{
		Id:        comment.Id,
		PostId:    comment.PostId,
		Content:   comment.Content,
		CreatedAt: comment.CreatedAt,
		UpdatedAt: comment.UpdatedAt,
	}

	if comment.ParentId != nil {
		commentResponse.ParentId = comment.ParentId
	}

	if comment.User != nil {
		commentResponse.User = web.CommentUserInfo{
			Id:       comment.User.Id,
			Name:     comment.User.Name,
			Username: comment.User.Username,
			Photo:    comment.User.Photo,
		}
	}

	// Add replies if available
	if len(comment.Replies) > 0 {
		replies := make([]web.CommentResponse, 0)
		for _, reply := range comment.Replies {
			replies = append(replies, ToCommentResponse(reply))
		}
		commentResponse.Replies = replies
	}

	return commentResponse
}

// Fungsi untuk mengkonversi array comments ke array comment responses
func ToCommentResponses(comments []domain.Comment) []web.CommentResponse {
	commentResponses := make([]web.CommentResponse, 0)
	for _, comment := range comments {
		commentResponses = append(commentResponses, ToCommentResponse(comment))
	}
	return commentResponses
}

func ToEducationResponse(education domain.UserEducation) web.EducationResponse {
	return web.EducationResponse{
		Id:            education.Id,
		UserId:        education.UserId,
		InstituteName: education.InstituteName,
		Major:         education.Major,
		StartMonth:    education.StartMonth,
		StartYear:     education.StartYear,
		EndMonth:      education.EndMonth,
		EndYear:       education.EndYear,
		Caption:       education.Caption,
		Photo:         education.Photo,
		CreatedAt:     education.CreatedAt,
		UpdatedAt:     education.UpdatedAt,
	}
}

func ToEducationResponses(educations []domain.UserEducation) []web.EducationResponse {
	var educationResponses []web.EducationResponse
	for _, education := range educations {
		educationResponses = append(educationResponses, ToEducationResponse(education))
	}
	return educationResponses
}

func ToExperienceResponse(experience domain.UserExperience) web.ExperienceResponse {
	return web.ExperienceResponse{
		Id:          experience.Id.String(),
		UserId:      experience.UserId.String(),
		JobTitle:    experience.JobTitle,
		CompanyName: experience.CompanyName,
		StartMonth:  experience.StartMonth,
		StartYear:   experience.StartYear,
		EndMonth:    experience.EndMonth,
		EndYear:     experience.EndYear,
		Caption:     experience.Caption,
		Photo:       experience.Photo,
		CreatedAt:   experience.CreatedAt,
		UpdatedAt:   experience.UpdatedAt,
	}
}

func ToExperienceResponses(experiences []domain.UserExperience) []web.ExperienceResponse {
	var experienceResponses []web.ExperienceResponse
	for _, experience := range experiences {
		experienceResponses = append(experienceResponses, ToExperienceResponse(experience))
	}
	return experienceResponses
}

// Add this to helper/converter.go or wherever your helper functions are
func ToGroupResponse(group domain.Group) web.GroupResponse {
	groupResponse := web.GroupResponse{
		Id:           group.Id,
		Name:         group.Name,
		Description:  group.Description,
		Rule:         group.Rule,
		Image:        group.Image,
		PrivacyLevel: group.PrivacyLevel,
		InvitePolicy: group.InvitePolicy,
		CreatorId:    group.CreatorId,
		CreatedAt:    group.CreatedAt,
		UpdatedAt:    group.UpdatedAt,
	}

	if group.Creator != nil {
		groupResponse.Creator = ToUserBriefResponse(*group.Creator)
	}

	return groupResponse
}

func ToUserBriefResponse(user domain.User, isConnected ...bool) web.UserBriefResponse {
	connected := false
	if len(isConnected) > 0 {
		connected = isConnected[0]
	}

	return web.UserBriefResponse{
		Id:          user.Id,
		Name:        user.Name,
		Username:    user.Username,
		Photo:       user.Photo,
		IsVerified:  user.IsVerified,
		Email:       user.Email,
		Headline:    user.Headline,
		IsConnected: connected, // Gunakan nilai dari parameter
		CreatedAt:   user.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:   user.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}
}

func ToAdminResponseBrief(admin domain.Admin) web.AdminResponse {
	return web.AdminResponse{
		ID:        admin.Id,
		Name:      admin.Name,
		Email:     admin.Email,
		CreatedAt: admin.CreatedAt,
	}
}

func ToGroupMemberBriefs(members []domain.GroupMember) []web.GroupMemberBrief {
	var groupMemberBriefs []web.GroupMemberBrief
	for _, member := range members {
		groupMemberBriefs = append(groupMemberBriefs, web.GroupMemberBrief{
			UserId:   member.UserId,
			Role:     member.Role,
			JoinedAt: member.JoinedAt,
			IsActive: member.IsActive,
		})
	}
	return groupMemberBriefs
}

func ToGroupMemberResponse(member domain.GroupMember) web.GroupMemberResponse {
	return web.GroupMemberResponse{
		GroupId:  member.GroupId,
		UserId:   member.UserId,
		Role:     member.Role,
		JoinedAt: member.JoinedAt.Format("2006-01-02T15:04:05Z"),
		IsActive: member.IsActive,
	}
}

func ToGroupInvitationResponse(invitation domain.GroupInvitation) web.GroupInvitationResponse {
	return web.GroupInvitationResponse{
		Id:        invitation.Id,
		GroupId:   invitation.GroupId,
		InviterId: invitation.InviterId,
		InviteeId: invitation.InviteeId,
		Status:    invitation.Status,
		CreatedAt: invitation.CreatedAt,
		UpdatedAt: invitation.UpdatedAt,
		// Group, Inviter, and Invitee will be populated separately
	}
}

func ToGroupInvitationResponses(invitations []domain.GroupInvitation) []web.GroupInvitationResponse {
	var responses []web.GroupInvitationResponse
	for _, invitation := range invitations {
		responses = append(responses, ToGroupInvitationResponse(invitation))
	}
	return responses
}

func ToCompanySubmissionResponse(submission domain.CompanySubmission) web.CompanySubmissionResponse {
	response := web.CompanySubmissionResponse{
		ID:              submission.Id,
		UserId:          submission.UserId,
		Name:            submission.Name,
		LinkedinUrl:     submission.LinkedinUrl,
		Website:         submission.Website,
		Industry:        submission.Industry,
		Size:            submission.Size,
		Type:            submission.Type,
		Logo:            submission.Logo,
		Tagline:         submission.Tagline,
		Status:          string(submission.Status),
		RejectionReason: submission.RejectionReason,
		ReviewedBy:      submission.ReviewedBy,
		ReviewedAt:      submission.ReviewedAt,
		CreatedAt:       submission.CreatedAt,
		UpdatedAt:       submission.UpdatedAt,
	}

	if submission.User != nil {
		userResponse := ToUserBriefResponse(*submission.User)
		response.User = &userResponse
	}

	if submission.ReviewedByAdmin != nil {
		adminResponse := ToAdminResponseBrief(*submission.ReviewedByAdmin)
		response.ReviewedByAdmin = &adminResponse
	}

	return response
}

func ToCompanyResponse(company domain.Company) web.CompanyResponse {
	response := web.CompanyResponse{
		ID:          company.Id,
		OwnerId:     company.OwnerId,
		Name:        company.Name,
		LinkedinUrl: company.LinkedinUrl,
		Website:     company.Website,
		Industry:    company.Industry,
		Size:        company.Size,
		Type:        company.Type,
		Logo:        company.Logo,
		Tagline:     company.Tagline,
		Description: company.Description,
		IsVerified:  company.IsVerified,
		CreatedAt:   company.CreatedAt,
		UpdatedAt:   company.UpdatedAt,
	}

	if company.Owner != nil {
		ownerResponse := ToUserBriefResponse(*company.Owner)
		response.Owner = &ownerResponse
	}

	return response
}

func ToAdminResponse(admin domain.Admin) web.AdminResponse {
	return web.AdminResponse{
		ID:        admin.Id,
		Name:      admin.Name,
		Email:     admin.Email,
		CreatedAt: admin.CreatedAt,
	}
}
