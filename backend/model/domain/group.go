package domain

import (
	"time"

	"github.com/google/uuid"
)

type Group struct {
	Id           uuid.UUID `gorm:"type:uuid;primary_key"`
	Name         string    `gorm:"size:100;not null"`
	Description  string    `gorm:"type:text"`
	Rule         string    `gorm:"type:text"`
	Image        *string   `gorm:"size:255"`
	CreatorId    uuid.UUID `gorm:"type:uuid;not null"`
	Creator      *User     `gorm:"foreignkey:CreatorId;association_foreignkey:Id"`
	PrivacyLevel string    `gorm:"size:20;not null;default:'public'"` // public, private
	InvitePolicy string    `gorm:"size:20;not null;default:'admin'"`  // admin, all_members
	PostApproval bool      `gorm:"not null;default:false"`            // Tambahkan field ini
	CreatedAt    time.Time `gorm:"not null"`
	UpdatedAt    time.Time `gorm:"not null"`
}
type GroupMember struct {
	GroupId  uuid.UUID `gorm:"type:uuid;primary_key"`
	UserId   uuid.UUID `gorm:"type:uuid;primary_key"`
	Role     string    `gorm:"size:20;not null;default:'member'"` // admin, moderator, member
	JoinedAt time.Time `gorm:"not null"`
	IsActive bool      `gorm:"not null;default:true"`
}

type GroupInvitation struct {
	Id        uuid.UUID `gorm:"type:uuid;primary_key"`
	GroupId   uuid.UUID `gorm:"type:uuid;not null"`
	InviterId uuid.UUID `gorm:"type:uuid;not null"`
	InviteeId uuid.UUID `gorm:"type:uuid;not null"`
	Status    string    `gorm:"size:20;not null;default:'pending'"` // pending, accepted, rejected
	CreatedAt time.Time `gorm:"not null"`
	UpdatedAt time.Time `gorm:"not null"`
}
