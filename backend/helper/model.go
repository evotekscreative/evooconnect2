package helper

import (
	"encoding/json"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"fmt"
	"github.com/google/uuid"
	
	"time"
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
	var connectedRequest string = ""

	if len(isConnected) > 0 {
		connected = isConnected[0]
	}

	// Buat response dengan field baru
	return web.UserProfileResponse{
		ID:                 user.Id,
		Name:               user.Name,
		Email:              user.Email,
		Username:           user.Username,
		Birthdate:          birthdate,
		Gender:             user.Gender,
		Location:           user.Location,
		Organization:       user.Organization,
		Website:            user.Website,
		Phone:              user.Phone,
		Headline:           user.Headline,
		About:              user.About,
		Skills:             skillsInterface,
		Socials:            socialsInterface,
		Photo:              user.Photo,
		IsVerified:         user.IsVerified,
		IsConnected:        connected,
		IsConnectedRequest: connectedRequest,
		CreatedAt:          user.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:          user.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}
}

func ToUserShortResponse(user domain.User, isConnected bool, isConnectedRequest string) web.UserShort {
	// Tambahkan log untuk debugging
	fmt.Printf("ToUserShortResponse: user=%s, isConnected=%v, isConnectedRequest=%s\n",
		user.Name, isConnected, isConnectedRequest)

	// Jika isConnectedRequest kosong, berikan nilai default "none"
	if isConnectedRequest == "" {
		isConnectedRequest = "none"
	}

	return web.UserShort{
		Id:                 user.Id,
		Name:               user.Name,
		Username:           user.Username,
		Photo:              &user.Photo,
		Headline:           &user.Headline,
		IsConnected:        isConnected,
		IsConnectedRequest: isConnectedRequest,
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
		IsPinned:      post.IsPinned,
		PinnedAt:      post.PinnedAt,
		Status:        post.Status,
		IsReported:    post.IsReported,
	}

	// Perbaikan: Pastikan user tidak nil dan memiliki data yang valid
	if post.User != nil && post.User.Id != uuid.Nil {
		photo := post.User.Photo
		headline := post.User.Headline

		postResponse.User = web.UserShort{
			Id:                 post.User.Id,
			Name:               post.User.Name,
			Username:           post.User.Username,
			Photo:              &photo,
			Headline:           &headline,
			IsConnected:        post.User.IsConnected,
			IsConnectedRequest: "",
		}
	}

	if post.Group != nil {
		// Buat struct baru yang hanya berisi field yang kita inginkan
		postResponse.Group = &web.GroupResponse{
			Id:           post.Group.Id,
			Name:         post.Group.Name,
			Description:  post.Group.Description,
			Rule:         post.Group.Rule,
			PrivacyLevel: post.Group.PrivacyLevel,
			InvitePolicy: post.Group.InvitePolicy,
			PostApproval: post.Group.PostApproval,
			CreatorId:    post.Group.CreatorId,
		}

		if post.Group.Image != nil && *post.Group.Image != "" {
			postResponse.Group.Image = post.Group.Image
		}
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

	// Tambahkan informasi ReplyTo jika ada ReplyToId
	if comment.ReplyToId != nil && comment.ReplyTo != nil && comment.ReplyTo.User != nil {
		commentResponse.ReplyTo = &web.ReplyToInfo{
			Id:           *comment.ReplyToId,
			Content:      comment.ReplyTo.Content,
			Username:     comment.ReplyTo.User.Username,
			Name:         comment.ReplyTo.User.Name,
			ProfilePhoto: comment.ReplyTo.User.Photo,
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
		PostApproval: group.PostApproval,
		CreatorId:    group.CreatorId,
		CreatedAt:    group.CreatedAt,
		UpdatedAt:    group.UpdatedAt,
		IsJoined:     false, // Default value
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

func ToJoinRequestResponse(request domain.GroupJoinRequest) web.JoinRequestResponse {
	response := web.JoinRequestResponse{
		Id:        request.Id,
		GroupId:   request.GroupId,
		UserId:    request.UserId,
		Status:    request.Status,
		Message:   request.Message,
		CreatedAt: request.CreatedAt,
		UpdatedAt: request.UpdatedAt,
	}

	if request.User != nil {
		response.User = web.UserShort{
			Id:       request.User.Id,
			Name:     request.User.Name,
			Username: request.User.Username,
		}

		if request.User.Photo != "" {
			photo := request.User.Photo
			response.User.Photo = &photo
		}

		if request.User.Headline != "" {
			headline := request.User.Headline
			response.User.Headline = &headline
		}
	}

	if request.Group != nil {
		response.Group = &web.GroupResponse{
			Id:           request.Group.Id,
			Name:         request.Group.Name,
			Description:  request.Group.Description,
			PrivacyLevel: request.Group.PrivacyLevel,
		}

		if request.Group.CreatorId != uuid.Nil {
			response.Group.CreatorId = request.Group.CreatorId
		}
	}

	return response
}

func ToNotificationResponse(notification domain.Notification) web.NotificationResponse {
    return web.NotificationResponse{
        Id:           notification.Id,
        Category:     string(notification.Category),
        Type:         string(notification.Type),
        Title:        notification.Title,
        Message:      notification.Message,
        Status:       string(notification.Status),
        ReferenceId:  notification.ReferenceId,
        ReferenceType: notification.ReferenceType,
        CreatedAt:    notification.CreatedAt,
        UpdatedAt:    notification.UpdatedAt,
        Actor:        nil, // Untuk sementara set nil, nanti bisa diisi jika diperlukan
    }}
func ToCompanyFollowerResponse(follower domain.CompanyFollower) web.CompanyFollowerResponse {
	response := web.CompanyFollowerResponse{
		Id:        follower.Id.String(),
		CompanyId: follower.CompanyId.String(),
		UserId:    follower.UserId.String(),
		CreatedAt: follower.CreatedAt,
	}

	// Set company info if available
	if follower.Company != nil {
		response.Company = &web.CompanyBasicInfo{
			Id:   follower.Company.Id.String(),
			Name: follower.Company.Name,
			Logo: follower.Company.Logo,
		}
	}

	// Set user info if available
	if follower.User != nil {
		response.User = &web.UserBasicInfo{
			Id:       follower.User.Id.String(),
			Name:     follower.User.Name,
			Username: follower.User.Username,
			Photo:    follower.User.Photo,
		}
	}

	return response
}

func ToCompanyFollowerResponses(followers []domain.CompanyFollower) []web.CompanyFollowerResponse {
	var responses []web.CompanyFollowerResponse
	for _, follower := range followers {
		responses = append(responses, ToCompanyFollowerResponse(follower))
	}
	return responses
}

func ToJobApplicationResponse(jobApplication domain.JobApplication) web.JobApplicationResponse {
	response := web.JobApplicationResponse{
		Id:                 jobApplication.Id,
		JobVacancyId:       jobApplication.JobVacancyId,
		ApplicantId:        jobApplication.ApplicantId,
		ContactInfo:        ToContactInfoResponse(jobApplication.ContactInfo),
		CvFilePath:         jobApplication.CvFilePath,
		MotivationLetter:   jobApplication.MotivationLetter,
		CoverLetter:        jobApplication.CoverLetter,
		ExpectedSalary:     jobApplication.ExpectedSalary,
		AvailableStartDate: jobApplication.AvailableStartDate,
		Status:             string(jobApplication.Status),
		RejectionReason:    jobApplication.RejectionReason,
		Notes:              jobApplication.Notes,
		ReviewedAt:         jobApplication.ReviewedAt,
		SubmittedAt:        jobApplication.SubmittedAt,
		CreatedAt:          jobApplication.CreatedAt,
		UpdatedAt:          jobApplication.UpdatedAt,
	}

	if jobApplication.ReviewedBy != nil {
		response.ReviewedBy = jobApplication.ReviewedBy
	}

	if jobApplication.JobVacancy != nil {
		jobVacancyBrief := &web.JobVacancyBriefResponse{
			Id:       jobApplication.JobVacancy.Id,
			Title:    jobApplication.JobVacancy.Title,
			Location: jobApplication.JobVacancy.Location,
			JobType:  string(jobApplication.JobVacancy.JobType),
		}
		if jobApplication.JobVacancy.Company != nil {
			jobVacancyBrief.Company = &web.CompanyBriefResponse{
				Id:       jobApplication.JobVacancy.Company.Id,
				Name:     jobApplication.JobVacancy.Company.Name,
				Logo:     &jobApplication.JobVacancy.Company.Logo,
				Industry: jobApplication.JobVacancy.Company.Industry,
				Website:  &jobApplication.JobVacancy.Company.Website,
			}
		}
		response.JobVacancy = jobVacancyBrief
	}

	if jobApplication.Applicant != nil {
		response.Applicant = &web.UserBriefResponse{
			Id:       jobApplication.Applicant.Id,
			Name:     jobApplication.Applicant.Name,
			Username: jobApplication.Applicant.Username,
			Photo:    jobApplication.Applicant.Photo,
			Headline: jobApplication.Applicant.Headline,
		}
	}

	if jobApplication.Reviewer != nil {
		response.Reviewer = &web.UserBriefResponse{
			Id:       jobApplication.Reviewer.Id,
			Name:     jobApplication.Reviewer.Name,
			Username: jobApplication.Reviewer.Username,
			Photo:    jobApplication.Reviewer.Photo,
		}
	}

	return response
}

func ToJobApplicationResponses(jobApplications []domain.JobApplication) []web.JobApplicationResponse {
	var responses []web.JobApplicationResponse
	for _, jobApplication := range jobApplications {
		responses = append(responses, ToJobApplicationResponse(jobApplication))
	}
	return responses
}

func ToContactInfoResponse(contactInfo domain.ContactInfo) web.ContactInfoResponse {
	return web.ContactInfoResponse{
		Phone:    contactInfo.Phone,
		Email:    contactInfo.Email,
		LinkedIn: contactInfo.LinkedIn,
		Address:  contactInfo.Address,
	}
}

func ToJobVacancyResponse(jobVacancy domain.JobVacancy) web.JobVacancyResponse {
	var companyInfo *web.CompanyBasicInfo
	if jobVacancy.Company != nil {
		companyInfo = &web.CompanyBasicInfo{
			Id:   jobVacancy.Company.Id.String(),
			Name: jobVacancy.Company.Name,
			Logo: jobVacancy.Company.Logo,
		}
	}

	var creatorInfo *web.UserBasicInfo
	if jobVacancy.Creator != nil {
		creatorInfo = &web.UserBasicInfo{
			Id:       jobVacancy.Creator.Id.String(),
			Name:     jobVacancy.Creator.Name,
			Username: jobVacancy.Creator.Username,
			Photo:    jobVacancy.Creator.Photo,
		}
	}

	var applicationDeadline *time.Time
	if jobVacancy.ApplicationDeadline != nil {
		applicationDeadline = jobVacancy.ApplicationDeadline
	}

	var companyResponse *web.CompanyBasicResponse
	if companyInfo != nil {
		companyResponse = &web.CompanyBasicResponse{
			Id:   companyInfo.Id,
			Name: companyInfo.Name,
			Logo: &companyInfo.Logo,
		}
	}

	var creatorResponse *web.UserBasicResponse
	if creatorInfo != nil {
		creatorResponse = &web.UserBasicResponse{
			Id:       creatorInfo.Id,
			Name:     creatorInfo.Name,
			Username: creatorInfo.Username,
			Photo:    &creatorInfo.Photo,
		}
	}

	creatorIdStr := jobVacancy.CreatorId.String()

	return web.JobVacancyResponse{
		Id:                  jobVacancy.Id.String(),
		CompanyId:           jobVacancy.CompanyId.String(),
		CreatorId:           &creatorIdStr,
		Title:               jobVacancy.Title,
		Description:         jobVacancy.Description,
		Requirements:        jobVacancy.Requirements,
		Location:            jobVacancy.Location,
		JobType:             jobVacancy.JobType,
		ExperienceLevel:     string(jobVacancy.ExperienceLevel),
		MinSalary:           jobVacancy.MinSalary,
		MaxSalary:           jobVacancy.MaxSalary,
		Currency:            jobVacancy.Currency,
		Skills:              jobVacancy.Skills,
		Benefits:            jobVacancy.Benefits,
		WorkType:            string(jobVacancy.WorkType),
		ApplicationDeadline: applicationDeadline,
		Status:              string(jobVacancy.Status),
		TypeApply:           string(jobVacancy.TypeApply),
		ExternalLink:        jobVacancy.ExternalLink,
		CreatedAt:           jobVacancy.CreatedAt,
		UpdatedAt:           jobVacancy.UpdatedAt,
		Company:             companyResponse,
		Creator:             creatorResponse,
	}
}

func ToJobVacancyResponses(jobVacancies []domain.JobVacancy) []web.JobVacancyResponse {
	var responses []web.JobVacancyResponse
	for _, jobVacancy := range jobVacancies {
		responses = append(responses, ToJobVacancyResponse(jobVacancy))
	}
	return responses
}

func ToAdminResponse(admin domain.Admin) web.AdminResponse {
	return web.AdminResponse{
		ID:        admin.Id,
		Name:      admin.Name,
		Email:     admin.Email,
		CreatedAt: admin.CreatedAt,
	}
}

func ToCompanyJoinRequestResponse(request domain.CompanyJoinRequest) web.CompanyJoinRequestResponse {
	response := web.CompanyJoinRequestResponse{
		Id:              request.Id,
		UserId:          request.UserId,
		CompanyId:       request.CompanyId,
		Message:         request.Message,
		Status:          request.Status,
		RequestedAt:     request.RequestedAt,
		ResponsedAt:     request.ResponsedAt,
		ResponseBy:      request.ResponseBy,
		RejectionReason: request.RejectionReason,
		CreatedAt:       request.CreatedAt,
		UpdatedAt:       request.UpdatedAt,
	}

	if request.User != nil {
		response.User = &web.UserBriefResponse{
			Id:       request.User.Id,
			Name:     request.User.Name,
			Username: request.User.Username,
			Photo:    request.User.Photo,
			Headline: request.User.Headline,
		}
	}

	if request.Company != nil {
		response.Company = &web.CompanyBriefResponse{
			Id:       request.Company.Id,
			Name:     request.Company.Name,
			Logo:     &request.Company.Logo,
			Industry: request.Company.Industry,
			Website:  &request.Company.Website,
		}
	}

	if request.Responder != nil {
		response.Responder = &web.UserBriefResponse{
			Id:       request.Responder.Id,
			Name:     request.Responder.Name,
			Username: request.Responder.Username,
			Photo:    request.Responder.Photo,
			Headline: request.Responder.Headline,
		}
	}

	return response
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

func ToAdminResponseBrief(admin domain.Admin) web.AdminResponse {
	return web.AdminResponse{
		ID:        admin.Id,
		Name:      admin.Name,
		Email:     admin.Email,
		CreatedAt: admin.CreatedAt,
	}
}