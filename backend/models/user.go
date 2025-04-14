package models

type Users struct {
	id        int64  `gorm:"primaryKey" json="id"`
	email     string `json:"email" gorm:"unique"`
	password  string `json:"password" gorm:"not null"`
	fistname  string `json:"first_name" gorm:"not null"`
	lastname  string `json:"last_name"`
	phone     string `json:"phone"`
	address   string `json:"address"`
	createdAt string `json:"created_at" gorm:"autoCreateTime"`
	updatedAt string `json:"updated_at" gorm:"autoUpdateTime"`
}
