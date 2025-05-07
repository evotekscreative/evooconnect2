package service

import (
	"context"
	"database/sql"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
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
	Validate             *validator.Validate
}

func NewGroupService(
	db *sql.DB,
	groupRepository repository.GroupRepository,
	memberRepository repository.GroupMemberRepository,
	invitationRepository repository.GroupInvitationRepository,
	userRepository repository.UserRepository,
	validate *validator.Validate) GroupService {
	return &GroupServiceImpl{
		DB:                   db,
		GroupRepository:      groupRepository,
		MemberRepository:     memberRepository,
		InvitationRepository: invitationRepository,
		UserRepository:       userRepository,
		Validate:             validate,
	}
}

func (service *GroupServiceImpl) Create(ctx context.Context, userId uuid.UUID, request web.CreateGroupRequest) web.GroupResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	if err != nil {
		panic(err)
	}
	defer helper.CommitOrRollback(tx)

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
	if request.Image != "" {
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

	return helper.ToGroupResponse(group)
}

func (service *GroupServiceImpl) UploadPhoto(ctx context.Context, groupId, userId uuid.UUID, file multipart.File, fileHeader *multipart.FileHeader) string {
	tx, err := service.DB.Begin()
	if err != nil {
		panic(err)
	}
	defer helper.CommitOrRollback(tx)

	// Check if the group exists
	group, err := service.GroupRepository.FindById(ctx, tx, groupId)
	if err != nil {
		panic(exception.NewNotFoundError("group not found"))
	}

	// Check if user is admin of the group
	if !service.isGroupAdmin(ctx, tx, groupId, userId) {
		panic(exception.NewForbiddenError("only group admin can update group photo"))
	}

	// Create directory if it doesn't exist
	uploadDir := fmt.Sprintf("uploads/groups/%s", groupId)
	err = os.MkdirAll(uploadDir, os.ModePerm)
	if err != nil {
		panic(exception.NewInternalServerError("failed to create upload directory: " + err.Error()))
	}

	// Generate unique filename with timestamp
	filename := fmt.Sprintf("group-%d%s", time.Now().Unix(), filepath.Ext(fileHeader.Filename))
	filepath := fmt.Sprintf("%s/%s", uploadDir, filename)

	// Save the file
	dst, err := os.Create(filepath)
	if err != nil {
		panic(exception.NewInternalServerError("failed to create file: " + err.Error()))
	}
	defer dst.Close()

	// Copy the uploaded file to the destination file
	_, err = io.Copy(dst, file)
	if err != nil {
		panic(exception.NewInternalServerError("failed to save file: " + err.Error()))
	}

	// Update the group in the database with the new image path
	imagePath := filepath
	group.Image = &imagePath
	group.UpdatedAt = time.Now()
	service.GroupRepository.Update(ctx, tx, group)

	return filepath
}

func (service *GroupServiceImpl) Update(ctx context.Context, groupId, userId uuid.UUID, request web.UpdateGroupRequest) web.GroupResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	if err != nil {
		panic(err)
	}
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
	group.Name = request.Name
	group.Description = request.Description
	group.Rule = request.Rule
	group.PrivacyLevel = request.PrivacyLevel
	group.InvitePolicy = request.InvitePolicy
	group.UpdatedAt = time.Now()

	// Update image if provided
	if request.Image != "" {
		group.Image = &request.Image
	}

	group = service.GroupRepository.Update(ctx, tx, group)

	// Get creator information
	creator, err := service.UserRepository.FindById(ctx, tx, group.CreatorId)
	if err != nil {
		creator = domain.User{Id: group.CreatorId}
	}

	// Get members
	members := service.MemberRepository.FindByGroupId(ctx, tx, groupId)

	// Build response
	response := helper.ToGroupResponse(group)
	response.Creator = helper.ToUserBriefResponse(creator)
	response.MembersCount = len(members)

	return response
}

func (service *GroupServiceImpl) Delete(ctx context.Context, groupId, userId uuid.UUID) {
	tx, err := service.DB.Begin()
	if err != nil {
		panic(err)
	}
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
	if err != nil {
		panic(err)
	}
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
	if err != nil {
		panic(err)
	}
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
	if err != nil {
		panic(err)
	}
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
	if err != nil {
		panic(err)
	}
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

	user, _ := service.UserRepository.FindById(ctx, tx, newMemberId) // Error already checked above

	response := helper.ToGroupMemberResponse(member)
	response.User = helper.ToUserBriefResponse(user)

	return response
}

func (service *GroupServiceImpl) RemoveMember(ctx context.Context, groupId, userId, memberId uuid.UUID) {
	tx, err := service.DB.Begin()
	if err != nil {
		panic(err)
	}
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
	if err != nil {
		panic(err)
	}
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

	member.Role = role
	member = service.MemberRepository.UpdateMemberRole(ctx, tx, groupId, memberId, role)

	user, err := service.UserRepository.FindById(ctx, tx, memberId)
	if err != nil {
		panic(exception.NewNotFoundError("user not found"))
	}

	response := helper.ToGroupMemberResponse(member)
	response.User = helper.ToUserBriefResponse(user)

	return response
}

func (service *GroupServiceImpl) GetMembers(ctx context.Context, groupId uuid.UUID) []web.GroupMemberResponse {
	tx, err := service.DB.Begin()
	if err != nil {
		panic(err)
	}
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
	if err != nil {
		panic(err)
	}
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
	if err != nil {
		panic(err)
	}
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
	if err != nil {
		panic(err)
	}
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
	if err != nil {
		panic(err)
	}
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
	if err != nil {
		panic(err)
	}
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
