package service

import (
    "context"
    "database/sql"
    "evoconnect/backend/exception"
    "evoconnect/backend/helper"
    "evoconnect/backend/model/domain"
    "evoconnect/backend/model/web"
    "evoconnect/backend/repository"
    "github.com/go-playground/validator/v10"
    "github.com/google/uuid"
)

type GroupPinnedPostServiceImpl struct {
    GroupPinnedPostRepository repository.GroupPinnedPostRepository
    PostRepository            repository.PostRepository
    GroupRepository           repository.GroupRepository
    GroupMemberRepository     repository.GroupMemberRepository
    UserRepository            repository.UserRepository
    DB                        *sql.DB
    Validate                  *validator.Validate
}

func NewGroupPinnedPostService(
    groupPinnedPostRepository repository.GroupPinnedPostRepository,
    postRepository repository.PostRepository,
    groupRepository repository.GroupRepository,
    groupMemberRepository repository.GroupMemberRepository,
    userRepository repository.UserRepository,
    db *sql.DB,
    validate *validator.Validate) GroupPinnedPostService {
    return &GroupPinnedPostServiceImpl{
        GroupPinnedPostRepository: groupPinnedPostRepository,
        PostRepository:            postRepository,
        GroupRepository:           groupRepository,
        GroupMemberRepository:     groupMemberRepository,
        UserRepository:            userRepository,
        DB:                        db,
        Validate:                  validate,
    }
}

func (service *GroupPinnedPostServiceImpl) PinPost(ctx context.Context, postId uuid.UUID, userId uuid.UUID) web.PostResponse {
    tx, err := service.DB.Begin()
    helper.PanicIfError(err)
    defer helper.CommitOrRollback(tx)

    // Cari post
    post, err := service.PostRepository.FindById(ctx, tx, postId)
    if err != nil {
        panic(exception.NewNotFoundError("Post not found"))
    }

    // Periksa apakah post berada dalam grup
    if post.GroupId == nil {
        panic(exception.NewBadRequestError("This post is not in a group"))
    }

    // Periksa apakah user adalah admin/moderator/creator grup
    member := service.GroupMemberRepository.FindByGroupIdAndUserId(ctx, tx, *post.GroupId, userId)
    if member.GroupId == uuid.Nil {
        panic(exception.NewForbiddenError("You are not a member of this group"))
    }

    if member.Role != "admin" && member.Role != "creator" && member.Role != "moderator" {
        panic(exception.NewForbiddenError("Only admin, creator, or moderator can pin posts"))
    }

    // Periksa jumlah post yang sudah di-pin
    pinnedCount, err := service.GroupPinnedPostRepository.CountByGroupId(ctx, tx, *post.GroupId)
    helper.PanicIfError(err)

    if pinnedCount >= 3 {
        panic(exception.NewBadRequestError("Maximum number of pinned posts (3) has been reached"))
    }

    // Pin post
    pinnedPost := domain.GroupPinnedPost{
        GroupId:  *post.GroupId,
        PostId:   postId,
        PinnedBy: userId,
    }
    
    service.GroupPinnedPostRepository.Save(ctx, tx, pinnedPost)

    // Ambil informasi user
    user, err := service.UserRepository.FindById(ctx, tx, post.UserId)
    if err == nil {
        post.User = &user
    }

    // Ambil informasi grup
    if post.GroupId != nil {
        group, err := service.GroupRepository.FindById(ctx, tx, *post.GroupId)
        if err == nil {
            post.Group = &group
        }
    }

    return helper.ToPostResponse(post)
}

func (service *GroupPinnedPostServiceImpl) UnpinPost(ctx context.Context, postId uuid.UUID, userId uuid.UUID) web.PostResponse {
    tx, err := service.DB.Begin()
    helper.PanicIfError(err)
    defer helper.CommitOrRollback(tx)

    // Cari post
    post, err := service.PostRepository.FindById(ctx, tx, postId)
    if err != nil {
        panic(exception.NewNotFoundError("Post not found"))
    }

    // Periksa apakah post berada dalam grup
    if post.GroupId == nil {
        panic(exception.NewBadRequestError("This post is not in a group"))
    }

    // Periksa apakah post di-pin
    

    // Periksa apakah user adalah admin/moderator/creator grup
    member := service.GroupMemberRepository.FindByGroupIdAndUserId(ctx, tx, *post.GroupId, userId)
    if member.GroupId == uuid.Nil {
        panic(exception.NewForbiddenError("You are not a member of this group"))
    }

    if member.Role != "admin" && member.Role != "creator" && member.Role != "moderator" {
        panic(exception.NewForbiddenError("Only admin, creator, or moderator can unpin posts"))
    }

    // Unpin post
    err = service.GroupPinnedPostRepository.Delete(ctx, tx, *post.GroupId, postId)
    helper.PanicIfError(err)

    // Ambil informasi user
    user, err := service.UserRepository.FindById(ctx, tx, post.UserId)
    if err == nil {
        post.User = &user
    }

    // Ambil informasi grup
    if post.GroupId != nil {
        group, err := service.GroupRepository.FindById(ctx, tx, *post.GroupId)
        if err == nil {
            post.Group = &group
        }
    }

    return helper.ToPostResponse(post)
}

func (service *GroupPinnedPostServiceImpl) GetPinnedPosts(ctx context.Context, groupId uuid.UUID) []web.PostResponse {
    tx, err := service.DB.Begin()
    helper.PanicIfError(err)
    defer helper.CommitOrRollback(tx)

    // Ambil semua post yang di-pin di grup
    pinnedPosts := service.GroupPinnedPostRepository.FindByGroupId(ctx, tx, groupId)
    
    var postResponses []web.PostResponse
    for _, pinnedPost := range pinnedPosts {
        if pinnedPost.Post != nil {
            // Set is_pinned flag to true
            pinnedPost.Post.IsPinned = true
            
            // Set pinned_at time
            pinnedPost.Post.PinnedAt = &pinnedPost.PinnedAt
            
            // Get post status if not already set
            if pinnedPost.Post.Status == "" {
                // Default to "approved" for pinned posts if no status is set
                pinnedPost.Post.Status = "approved"
            }
            
            postResponses = append(postResponses, helper.ToPostResponse(*pinnedPost.Post))
        }
    }
    
    return postResponses
}