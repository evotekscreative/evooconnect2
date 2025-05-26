package service

import (
	"context"
	"database/sql"
	"fmt"
	"mime/multipart"
	"time"

	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type GroupServiceImpl struct {
	DB                   *sql.DB
	GroupRepository      repository.GroupRepository
	MemberRepository     repository.GroupMemberRepository
	InvitationRepository repository.GroupInvitationRepository
	UserRepository       repository.UserRepository
	NotificationService  NotificationService
	Validate             *validator.Validate
}

func NewGroupService(
	db *sql.DB,
	groupRepository repository.GroupRepository,
	memberRepository repository.GroupMemberRepository,
	invitationRepository repository.GroupInvitationRepository,
	userRepository repository.UserRepository,
	notificationService NotificationService,
	validate *validator.Validate) GroupService {
	return &GroupServiceImpl{
		DB:                   db,
		GroupRepository:      groupRepository,
		MemberRepository:     memberRepository,
		InvitationRepository: invitationRepository,
		UserRepository:       userRepository,
		NotificationService:  notificationService,
		Validate:             validate,
	}
}

func (service *GroupServiceImpl) Create(ctx context.Context, userId uuid.UUID, request web.CreateGroupRequest, file *multipart.FileHeader) web.GroupResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	image, err := file.Open()
	helper.PanicIfError(err)
	defer image.Close()

	uploadResult, err := helper.UploadImage(image, file, helper.DirGroups, userId.String(), "images")
	helper.PanicIfError(err)

	// Create group
	group := domain.Group{
		Id:           uuid.New(),
		Name:         request.Name,
		Description:  request.Description,
		Rule:         request.Rule,
		CreatorId:    userId,
		PrivacyLevel: request.PrivacyLevel,
		InvitePolicy: request.InvitePolicy,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// Handle image
	if uploadResult != nil {
		group.Image = &uploadResult.RelativePath
	} else if request.Image != "" {
		group.Image = &request.Image
	}

	group = service.GroupRepository.Create(ctx, tx, group)

	// Create initial membership for creator as admin
	member := domain.GroupMember{
		GroupId:  group.Id,
		UserId:   userId,
		Role:     "admin",
		JoinedAt: time.Now(),
		IsActive: true,
	}

	service.MemberRepository.AddMember(ctx, tx, member)

	creator, err := service.UserRepository.FindById(ctx, tx, userId)
	helper.PanicIfError(err)
	group.Creator = &creator

	return helper.ToGroupResponse(group)
}

func (service *GroupServiceImpl) Update(ctx context.Context, groupId, userId uuid.UUID, request web.UpdateGroupRequest, file *multipart.FileHeader) web.GroupResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Get existing group
	group, err := service.GroupRepository.FindById(ctx, tx, groupId)
	if err != nil {
		panic(exception.NewNotFoundError("group not found"))
	}

	// Check if user is group admin
	if !service.isGroupAdmin(ctx, tx, groupId, userId) {
		panic(exception.NewForbiddenError("only group admin can update group"))
	}

	// Update group fields
	if request.Name != "" {
		group.Name = request.Name
	}
	if request.Description != "" {
		group.Description = request.Description
	}
	if request.Rule != "" {
		group.Rule = request.Rule
	}
	if request.PrivacyLevel != "" {
		group.PrivacyLevel = request.PrivacyLevel
	}
	if request.InvitePolicy != "" {
		group.InvitePolicy = request.InvitePolicy
	}
	group.UpdatedAt = time.Now()

	// Handle image update based on what was provided
	if file != nil {
		// Case 1: Image file was uploaded - process the upload
		image, err := file.Open()
		helper.PanicIfError(err)
		defer image.Close()

		// Upload new image
		uploadResult, err := helper.UploadImage(image, file, helper.DirGroups, userId.String(), "images")
		helper.PanicIfError(err)

		// Delete old image if it exists
		if group.Image != nil && *group.Image != "" {
			err = helper.DeleteFile(*group.Image)
			if err != nil {
				// Just log the error but don't stop the process
				fmt.Printf("Failed to delete old image: %v\n", err)
			}
		}

		if uploadResult != nil {
			relativePath := uploadResult.RelativePath
			group.Image = &relativePath
		}
	} else if request.Image != "" {
		// Case 2: Image string/URL was provided - use directly
		group.Image = &request.Image
	}
	// If neither file nor image string was provided, keep existing image

	// Update group in database
	group = service.GroupRepository.Update(ctx, tx, group)

	// Get creator information
	creator, err := service.UserRepository.FindById(ctx, tx, group.CreatorId)
	if err != nil {
		creator = domain.User{Id: group.CreatorId}
	}

	// Get members count
	members := service.MemberRepository.FindByGroupId(ctx, tx, groupId)

	// Build response
	response := helper.ToGroupResponse(group)
	response.Creator = helper.ToUserBriefResponse(creator)
	response.MembersCount = len(members)

	return response
}

func (service *GroupServiceImpl) Delete(ctx context.Context, groupId, userId uuid.UUID) {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	group, err := service.GroupRepository.FindById(ctx, tx, groupId)
	if err != nil {
		panic(exception.NewNotFoundError("group not found"))
	}

	// Only creator can delete group
	if group.CreatorId != userId {
		panic(exception.NewForbiddenError("only group creator can delete group"))
	}

	service.GroupRepository.Delete(ctx, tx, groupId)
}

func (service *GroupServiceImpl) FindById(ctx context.Context, groupId uuid.UUID) web.GroupResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Get the group
	group, err := service.GroupRepository.FindById(ctx, tx, groupId)
	if err != nil {
		panic(exception.NewNotFoundError("group not found"))
	}

	// Get the creator
	creator, err := service.UserRepository.FindById(ctx, tx, group.CreatorId)
	if err != nil {
		// If creator not found, we might want to handle this gracefully
		// rather than return an error for the whole group request
		creator = domain.User{Id: group.CreatorId} // Set at least the ID
	}

	// Get members for the group
	members := service.MemberRepository.FindByGroupId(ctx, tx, groupId)

	// Build the response
	response := helper.ToGroupResponse(group)
	response.Creator = helper.ToUserBriefResponse(creator)
	response.MembersCount = len(members)

	// Optionally load member details if needed
	var memberResponses []web.GroupMemberBrief
	for _, member := range members {
		user, err := service.UserRepository.FindById(ctx, tx, member.UserId)
		if err == nil {
			memberBrief := web.GroupMemberBrief{
				UserId:   user.Id,
				User:     helper.ToUserBriefResponse(user),
				Role:     member.Role,
				JoinedAt: member.JoinedAt,
			}
			memberResponses = append(memberResponses, memberBrief)
		}
	}
	response.Members = memberResponses

	return response
}

func (service *GroupServiceImpl) FindAll(ctx context.Context, limit, offset int) []web.GroupResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	groups := service.GroupRepository.FindAll(ctx, tx, limit, offset)

	var responses []web.GroupResponse
	for _, group := range groups {
		if group.PrivacyLevel == "public" {
			members := service.MemberRepository.FindByGroupId(ctx, tx, group.Id)

			// Load creator data
			creator, err := service.UserRepository.FindById(ctx, tx, group.CreatorId)
			if err == nil {
				response := helper.ToGroupResponse(group)
				response.Creator = helper.ToUserBriefResponse(creator)
				response.MembersCount = len(members)
				responses = append(responses, response)
			}
		}
	}

	return responses
}

func (service *GroupServiceImpl) FindMyGroups(ctx context.Context, userId uuid.UUID) []web.GroupResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	memberships := service.MemberRepository.FindByUserId(ctx, tx, userId)

	var responses []web.GroupResponse
	for _, member := range memberships {
		group, err := service.GroupRepository.FindById(ctx, tx, member.GroupId)
		if err == nil {
			members := service.MemberRepository.FindByGroupId(ctx, tx, group.Id)

			creator, err := service.UserRepository.FindById(ctx, tx, group.CreatorId)
			if err == nil {
				response := helper.ToGroupResponse(group)
				response.Creator = helper.ToUserBriefResponse(creator)
				response.MembersCount = len(members)
				responses = append(responses, response)
			}
		}
	}

	return responses
}

func (service *GroupServiceImpl) AddMember(ctx context.Context, groupId, userId, newMemberId uuid.UUID) web.GroupMemberResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// First, check if the user to be added exists
	_, err = service.UserRepository.FindById(ctx, tx, newMemberId)
	if err != nil {
		panic(exception.NewNotFoundError("user to be added does not exist"))
	}

	group, err := service.GroupRepository.FindById(ctx, tx, groupId)
	if err != nil {
		panic(exception.NewNotFoundError("group not found"))
	}

	// Check if user has permission to add members
	if group.InvitePolicy == "admin" {
		if !service.isGroupAdmin(ctx, tx, groupId, userId) {
			panic(exception.NewForbiddenError("only group admins can add members"))
		}
	} else { // all_members
		isMember := service.MemberRepository.IsMember(ctx, tx, groupId, userId)
		if !isMember {
			panic(exception.NewForbiddenError("only group members can add members"))
		}
	}

	// Check if member already exists
	existingMember := service.MemberRepository.FindByGroupIdAndUserId(ctx, tx, groupId, newMemberId)
	if existingMember.GroupId != uuid.Nil {
		if existingMember.IsActive {
			panic(exception.NewBadRequestError("user is already a member of this group"))
		} else {
			// If user was previously removed, reactivate them
			existingMember.IsActive = true
			existingMember = service.MemberRepository.UpdateMemberActive(ctx, tx, groupId, newMemberId, true)

			user, _ := service.UserRepository.FindById(ctx, tx, newMemberId)
			response := helper.ToGroupMemberResponse(existingMember)
			response.User = helper.ToUserBriefResponse(user)
			return response
		}
	}

	// Add new member
	member := domain.GroupMember{
		GroupId:  groupId,
		UserId:   newMemberId,
		Role:     "member",
		JoinedAt: time.Now(),
		IsActive: true,
	}

	member = service.MemberRepository.AddMember(ctx, tx, member)

	// Ambil data yang diperlukan untuk notifikasi
	adder, _ := service.UserRepository.FindById(ctx, tx, userId)
	adderName := "Someone"
	if adder.Id != uuid.Nil {
		adderName = adder.Name
	}

	groupName := group.Name

	// Kirim notifikasi ke user yang ditambahkan
	if service.NotificationService != nil {
		refType := "group_member_added"
		go func() {
			service.NotificationService.Create(
				context.Background(),
				newMemberId,
				string(domain.NotificationCategoryGroup),
				"group_member_added",
				"Added to Group",
				fmt.Sprintf("%s added you to the group %s", adderName, groupName),
				&groupId,
				&refType,
				&userId,
			)
		}()
	}
	user, _ := service.UserRepository.FindById(ctx, tx, newMemberId) // Error already checked above

	response := helper.ToGroupMemberResponse(member)
	response.User = helper.ToUserBriefResponse(user)

	return response
}

func (service *GroupServiceImpl) RemoveMember(ctx context.Context, groupId, userId, memberId uuid.UUID) {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	group, err := service.GroupRepository.FindById(ctx, tx, groupId)
	if err != nil {
		panic(exception.NewNotFoundError("group not found"))
	}

	member := service.MemberRepository.FindByGroupIdAndUserId(ctx, tx, groupId, memberId)
	if member.GroupId == uuid.Nil {
		panic(exception.NewNotFoundError("member not found in this group"))
	}

	if userId == memberId {
		// User leaving the group
		if group.CreatorId == userId {
			panic(exception.NewBadRequestError("group creator cannot leave the group"))
		}
	} else {
		// Removing someone else
		if !service.isGroupAdmin(ctx, tx, groupId, userId) {
			panic(exception.NewForbiddenError("only group admins can remove members"))
		}

		if memberId == group.CreatorId {
			panic(exception.NewBadRequestError("cannot remove the group creator"))
		}

		if userId != group.CreatorId && member.Role == "admin" {
			panic(exception.NewForbiddenError("only the group creator can remove admins"))
		}
	}

	service.MemberRepository.RemoveMember(ctx, tx, groupId, memberId)
}

func (service *GroupServiceImpl) UpdateMemberRole(ctx context.Context, groupId, userId, memberId uuid.UUID, role string) web.GroupMemberResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	if role != "admin" && role != "member" {
		panic(exception.NewBadRequestError("invalid role"))
	}

	group, err := service.GroupRepository.FindById(ctx, tx, groupId)
	if err != nil {
		panic(exception.NewNotFoundError("group not found"))
	}

	// Only creator can change roles
	if group.CreatorId != userId {
		panic(exception.NewForbiddenError("only group creator can change member roles"))
	}

	member := service.MemberRepository.FindByGroupIdAndUserId(ctx, tx, groupId, memberId)
	if member.GroupId == uuid.Nil {
		panic(exception.NewNotFoundError("member not found in this group"))
	}

	if memberId == group.CreatorId {
		panic(exception.NewBadRequestError("cannot change creator's role"))
	}

	// Simpan role lama untuk perbandingan
	oldRole := member.Role

	member.Role = role
	member = service.MemberRepository.UpdateMemberRole(ctx, tx, groupId, memberId, role)

	user, err := service.UserRepository.FindById(ctx, tx, memberId)
	if err != nil {
		panic(exception.NewNotFoundError("user not found"))
	}

	// Ambil data yang diperlukan untuk notifikasi
	updater, _ := service.UserRepository.FindById(ctx, tx, userId)
	updaterName := "Group admin"
	if updater.Id != uuid.Nil {
		updaterName = updater.Name
	}

	groupName := group.Name

	// Kirim notifikasi jika role berubah
	if oldRole != role && service.NotificationService != nil {
		refType := "group_role_updated"
		roleText := "member"
		if role == "admin" {
			roleText = "admin"
		}

		go func() {
			service.NotificationService.Create(
				context.Background(),
				memberId,
				string(domain.NotificationCategoryGroup),
				"group_role_updated",
				"Role Updated",
				fmt.Sprintf("%s made you %s of the group %s", updaterName, roleText, groupName),
				&groupId,
				&refType,
				&userId,
			)
		}()
	}
	response := helper.ToGroupMemberResponse(member)
	response.User = helper.ToUserBriefResponse(user)

	return response
}

func (service *GroupServiceImpl) GetMembers(ctx context.Context, groupId uuid.UUID) []web.GroupMemberResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	_, err = service.GroupRepository.FindById(ctx, tx, groupId)
	if err != nil {
		panic(exception.NewNotFoundError("group not found"))
	}

	members := service.MemberRepository.FindByGroupId(ctx, tx, groupId)

	var responses []web.GroupMemberResponse
	for _, member := range members {
		user, err := service.UserRepository.FindById(ctx, tx, member.UserId)
		if err == nil {
			response := helper.ToGroupMemberResponse(member)
			response.User = helper.ToUserBriefResponse(user)
			responses = append(responses, response)
		}
	}

	return responses
}

func (service *GroupServiceImpl) CreateInvitation(ctx context.Context, groupId, userId, inviteeId uuid.UUID) web.GroupInvitationResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if user is admin of the group
	if !service.isGroupAdmin(ctx, tx, groupId, userId) {
		panic(exception.NewForbiddenError("only group admin can send invitations"))
	}

	// Check if invitee exists
	invitee, err := service.UserRepository.FindById(ctx, tx, inviteeId)
	if err != nil {
		panic(exception.NewNotFoundError("user to invite not found"))
	}

	// Check if invitee is already a member
	existingMember := service.MemberRepository.FindByGroupIdAndUserId(ctx, tx, groupId, inviteeId)
	if existingMember.GroupId != uuid.Nil {
		panic(exception.NewBadRequestError("user is already a member of this group"))
	}

	// Check if invitation already exists
	existingInvitation := service.InvitationRepository.FindByGroupIdAndInviteeId(ctx, tx, groupId, inviteeId)
	if existingInvitation.Id != uuid.Nil {
		panic(exception.NewBadRequestError("invitation already sent to this user"))
	}

	// Get group info
	group, err := service.GroupRepository.FindById(ctx, tx, groupId)
	if err != nil {
		panic(exception.NewNotFoundError("group not found"))
	}

	// Get inviter info
	inviter, err := service.UserRepository.FindById(ctx, tx, userId)
	if err != nil {
		panic(exception.NewNotFoundError("inviter not found"))
	}

	invitation := domain.GroupInvitation{
		Id:        uuid.New(),
		GroupId:   groupId,
		InviterId: userId,
		InviteeId: inviteeId,
		Status:    "pending",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	invitation = service.InvitationRepository.Save(ctx, tx, invitation)

	// Kirim notifikasi ke user yang diundang
	if service.NotificationService != nil {
		refType := "group_invite"
		inviterName := inviter.Name
		groupName := group.Name

		go func() {
			service.NotificationService.Create(
				context.Background(),
				inviteeId,
				string(domain.NotificationCategoryGroup),
				string(domain.NotificationTypeGroupInvite),
				"Group Invitation",
				fmt.Sprintf("%s invited you to join %s", inviterName, groupName),
				&invitation.Id,
				&refType,
				&userId,
			)
		}()
	}

	// Build the complete response
	response := helper.ToGroupInvitationResponse(invitation)

	// Add group details
	response.Group = web.GroupBriefResponse{
		Id:           group.Id,
		Name:         group.Name,
		Description:  group.Description,
		Image:        group.Image,
		PrivacyLevel: group.PrivacyLevel,
	}

	// Count members
	members := service.MemberRepository.FindByGroupId(ctx, tx, groupId)
	response.Group.MembersCount = len(members)

	// Add inviter details
	response.Inviter = helper.ToUserBriefResponse(inviter)

	// Add invitee details
	response.Invitee = helper.ToUserBriefResponse(invitee)

	return response
}

func (service *GroupServiceImpl) AcceptInvitation(ctx context.Context, invitationId, userId uuid.UUID) web.GroupMemberResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	invitation := service.InvitationRepository.FindById(ctx, tx, invitationId)
	if invitation.Id == uuid.Nil {
		panic(exception.NewNotFoundError("invitation not found"))
	}

	if invitation.InviteeId != userId {
		panic(exception.NewForbiddenError("you can only accept your own invitations"))
	}

	if invitation.Status != "pending" {
		panic(exception.NewBadRequestError("invitation is not pending"))
	}

	// Update invitation status
	invitation.Status = "accepted"
	invitation.UpdatedAt = time.Now()
	service.InvitationRepository.Update(ctx, tx, invitation)

	// Ambil data yang diperlukan untuk notifikasi
	group, err := service.GroupRepository.FindById(ctx, tx, invitation.GroupId)
	if err == nil {
		groupName := group.Name

		user, err := service.UserRepository.FindById(ctx, tx, userId)
		if err == nil && service.NotificationService != nil {
			userName := user.Name

			// Kirim notifikasi ke user yang mengundang
			refType := "group_invitation_accepted"
			go func() {
				service.NotificationService.Create(
					context.Background(),
					invitation.InviterId,
					string(domain.NotificationCategoryGroup),
					"group_invitation_accepted",
					"Invitation Accepted",
					fmt.Sprintf("%s accepted your invitation to join %s", userName, groupName),
					&invitation.GroupId,
					&refType,
					&userId,
				)
			}()
		}
	}

	// Add user to group
	member := domain.GroupMember{
		GroupId:  invitation.GroupId,
		UserId:   userId,
		Role:     "member",
		JoinedAt: time.Now(),
		IsActive: true,
	}

	member = service.MemberRepository.AddMember(ctx, tx, member)
	return helper.ToGroupMemberResponse(member)
}

func (service *GroupServiceImpl) RejectInvitation(ctx context.Context, invitationId, userId uuid.UUID) {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	invitation := service.InvitationRepository.FindById(ctx, tx, invitationId)
	if invitation.Id == uuid.Nil {
		panic(exception.NewNotFoundError("invitation not found"))
	}

	if invitation.InviteeId != userId {
		panic(exception.NewForbiddenError("you can only reject your own invitations"))
	}

	if invitation.Status != "pending" {
		panic(exception.NewBadRequestError("invitation is not pending"))
	}

	// Update invitation status
	invitation.Status = "rejected"
	invitation.UpdatedAt = time.Now()
	service.InvitationRepository.Update(ctx, tx, invitation)
}

func (service *GroupServiceImpl) GetMyInvitations(ctx context.Context, userId uuid.UUID) []web.GroupInvitationResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	invitations := service.InvitationRepository.FindByInviteeId(ctx, tx, userId)

	var responses []web.GroupInvitationResponse
	for _, invitation := range invitations {
		response := helper.ToGroupInvitationResponse(invitation)

		// Get group details
		group, err := service.GroupRepository.FindById(ctx, tx, invitation.GroupId)
		if err == nil {
			response.Group = web.GroupBriefResponse{
				Id:           group.Id,
				Name:         group.Name,
				Description:  group.Description,
				Image:        group.Image,
				PrivacyLevel: group.PrivacyLevel,
			}

			// Count members
			members := service.MemberRepository.FindByGroupId(ctx, tx, invitation.GroupId)
			response.Group.MembersCount = len(members)
		}

		// Get inviter details
		inviter, err := service.UserRepository.FindById(ctx, tx, invitation.InviterId)
		if err == nil {
			response.Inviter = helper.ToUserBriefResponse(inviter)
		}

		// Get invitee details
		invitee, err := service.UserRepository.FindById(ctx, tx, invitation.InviteeId)
		if err == nil {
			response.Invitee = helper.ToUserBriefResponse(invitee)
		}

		responses = append(responses, response)
	}

	return responses
}

// Helper methods
func (service *GroupServiceImpl) isGroupAdmin(ctx context.Context, tx *sql.Tx, groupId, userId uuid.UUID) bool {
	member := service.MemberRepository.FindByGroupIdAndUserId(ctx, tx, groupId, userId)
	return member.GroupId != uuid.Nil && member.Role == "admin"
}

func (service *GroupServiceImpl) LeaveGroup(ctx context.Context, groupId, userId uuid.UUID) web.LeaveGroupResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	group, err := service.GroupRepository.FindById(ctx, tx, groupId)
	if err != nil {
		panic(exception.NewNotFoundError("group not found"))
	}

	member := service.MemberRepository.FindByGroupIdAndUserId(ctx, tx, groupId, userId)
	if member.GroupId == uuid.Nil {
		panic(exception.NewNotFoundError("member not found in this group"))
	}

	if group.CreatorId == userId {
		panic(exception.NewBadRequestError("group creator cannot leave the group"))
	}

	service.MemberRepository.RemoveMember(ctx, tx, groupId, userId)

	// Optionally, you can also delete the group if it has no members left
	if len(service.MemberRepository.FindByGroupId(ctx, tx, groupId)) == 0 {
		service.GroupRepository.Delete(ctx, tx, groupId)
	}

	// Return a response indicating the user has left the group
	leaveResponse := web.LeaveGroupResponse{
		Message: "You have left the group",
		GroupId: groupId,
		UserId:  userId,
		LeftAt:  time.Now(),
	}

	return leaveResponse
}

func (service *GroupServiceImpl) JoinGroup(ctx context.Context, userId uuid.UUID, groupId uuid.UUID) web.GroupMemberResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if the group exists
	group, err := service.GroupRepository.FindById(ctx, tx, groupId)
	if err != nil {
		panic(exception.NewNotFoundError("group not found"))
	}

	// If the group is private, hide its existence with "not found" error
	if group.PrivacyLevel == "private" {
		panic(exception.NewNotFoundError("group not found"))
	}

	// Check if user is already a member
	existingMember := service.MemberRepository.FindByGroupIdAndUserId(ctx, tx, groupId, userId)
	if existingMember.GroupId != uuid.Nil {
		if existingMember.IsActive {
			panic(exception.NewBadRequestError("you are already a member of this group"))
		} else {
			// Reactivate membership if user was previously a member but inactive
			existingMember.IsActive = true
			existingMember = service.MemberRepository.UpdateMemberActive(ctx, tx, groupId, userId, true)

			user, _ := service.UserRepository.FindById(ctx, tx, userId)
			response := helper.ToGroupMemberResponse(existingMember)
			response.User = helper.ToUserBriefResponse(user)
			return response
		}
	}

	// Send notification to group admins about join request
	user, err := service.UserRepository.FindById(ctx, tx, userId)
	if err == nil {
		// Get group admins - using existing methods instead of FindAdminsByGroupId
		members := service.MemberRepository.FindByGroupId(ctx, tx, groupId)

		refType := "group_join_request"
		for _, admin := range members {
			if admin.Role == "admin" && admin.UserId != userId { // Only notify admins
				go func(adminId uuid.UUID) {
					if service.NotificationService != nil {
						service.NotificationService.Create(
							context.Background(),
							adminId,
							string(domain.NotificationCategoryGroup),
							string(domain.NotificationTypeGroupJoinRequest),
							"Group Join Request",
							fmt.Sprintf("%s requested to join %s", user.Name, group.Name),
							&groupId,
							&refType,
							&userId,
						)
					}
				}(admin.UserId)
			}
		}
	}

	// Add user as a new member
	member := domain.GroupMember{
		GroupId:  groupId,
		UserId:   userId,
		Role:     "member",
		JoinedAt: time.Now(),
		IsActive: true,
	}

	member = service.MemberRepository.AddMember(ctx, tx, member)

	// Return member response
	response := helper.ToGroupMemberResponse(member)
	if user.Id != uuid.Nil {
		response.User = helper.ToUserBriefResponse(user)
	}

	return response
}

func (service *GroupServiceImpl) CancelInvitation(ctx context.Context, invitationId, userId uuid.UUID) web.GroupInvitationResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	invitation := service.InvitationRepository.FindById(ctx, tx, invitationId)
	if invitation.Id == uuid.Nil {
		panic(exception.NewNotFoundError("invitation not found"))
	}

	if invitation.InviterId != userId {
		panic(exception.NewForbiddenError("only the inviter can cancel the invitation"))
	}

	if invitation.Status != "pending" {
		panic(exception.NewBadRequestError("invitation is not pending"))
	}

	err = service.InvitationRepository.CancelRequest(ctx, tx, invitationId)
	helper.PanicIfError(err)

	response := helper.ToGroupInvitationResponse(invitation)
	return response
}

func (service *GroupServiceImpl) JoinPublicGroup(ctx context.Context, userId uuid.UUID, groupId uuid.UUID) web.GroupMemberResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Tambahkan log untuk debugging
	fmt.Printf("DEBUG: Attempting to join public group. UserID: %s, GroupID: %s\n", userId, groupId)

	// Check if the group exists - tambahkan log SQL query
	fmt.Printf("DEBUG: Executing FindById for group\n")
	group, err := service.GroupRepository.FindById(ctx, tx, groupId)
	if err != nil {
		fmt.Printf("DEBUG: Group not found error: %v\n", err)
		panic(exception.NewNotFoundError("group not found"))
	}

	fmt.Printf("DEBUG: Group found: %s (ID: %s), Privacy Level: %s\n", group.Name, group.Id, group.PrivacyLevel)

	// If the group is private, hide its existence with "not found" error
	if group.PrivacyLevel == "private" {
		fmt.Printf("DEBUG: Group is private, denying access\n")
		panic(exception.NewNotFoundError("group not found"))
	}

	// Check if user is already a member - perbaiki pengecekan is_active
	existingMember := service.MemberRepository.FindByGroupIdAndUserId(ctx, tx, groupId, userId)
	fmt.Printf("DEBUG: Existing member check - GroupId: %v, IsActive: %v\n",
		existingMember.GroupId, existingMember.IsActive)

	if existingMember.GroupId != uuid.Nil {
		// Jika member sudah ada tapi tidak aktif, aktifkan kembali
		if !existingMember.IsActive {
			fmt.Printf("DEBUG: Reactivating inactive membership\n")
			existingMember.IsActive = true
			existingMember = service.MemberRepository.UpdateMemberActive(ctx, tx, groupId, userId, true)

			user, _ := service.UserRepository.FindById(ctx, tx, userId)
			response := helper.ToGroupMemberResponse(existingMember)
			response.User = helper.ToUserBriefResponse(user)
			return response
		} else {
			// Jika member sudah aktif, tolak
			fmt.Printf("DEBUG: User is already an active member\n")
			panic(exception.NewBadRequestError("you are already a member of this group"))
		}
	}

	fmt.Printf("DEBUG: Adding user as new member\n")
	// Add user as a new member
	member := domain.GroupMember{
		GroupId:  groupId,
		UserId:   userId,
		Role:     "member",
		JoinedAt: time.Now(),
		IsActive: true, // Pastikan is_active = true
	}

	member = service.MemberRepository.AddMember(ctx, tx, member)
	fmt.Printf("DEBUG: Member added successfully with ID: %v, IsActive: %v\n",
		member.GroupId, member.IsActive)

	user, err := service.UserRepository.FindById(ctx, tx, userId)
	if err != nil {
		fmt.Printf("DEBUG: Error finding user: %v\n", err)
	}

	userName := "Someone"
	if user.Id != uuid.Nil {
		userName = user.Name
	}

	// Kirim notifikasi ke pembuat grup
	if service.NotificationService != nil && group.CreatorId != userId {
		refType := "group_new_member"
		groupName := group.Name
		creatorId := group.CreatorId

		fmt.Printf("DEBUG: Sending notification to group creator %s\n", creatorId)

		go func() {
			notifResponse := service.NotificationService.Create(
				context.Background(),
				creatorId,
				string(domain.NotificationCategoryGroup),
				"group_new_member",
				"New Group Member",
				fmt.Sprintf("%s joined your group %s", userName, groupName),
				&groupId,
				&refType,
				&userId,
			)
			fmt.Printf("DEBUG: Notification sent with ID: %v\n", notifResponse.ID)
		}()
	} else {
		fmt.Printf("DEBUG: Not sending notification. NotificationService nil: %v, Creator is joiner: %v\n",
			service.NotificationService == nil, group.CreatorId == userId)
	}

	response := helper.ToGroupMemberResponse(member)
	response.User = helper.ToUserBriefResponse(user)

	return response
}
