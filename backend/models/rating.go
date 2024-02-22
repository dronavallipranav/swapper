package models

import "time"

type Rating struct {
	ID              string    `json:"id,omitempty"`
	CreatorID       string    `json:"creatorID,omitempty" validate:"required"`
	RecipientID     string    `json:"recipientID,omitempty" validate:"required"`
	RecipientIsItem bool      `json:"recipientIsItem,omitempty"`
	Title           string    `json:"title,omitempty" validate:"required"`
	Body            string    `json:"body,omitempty" validate:"required"`
	Stars           int       `json:"stars,omitempty" validate:"required,numeric,min=1,max=10"`
	CreatedAt       time.Time `json:"createdAt,omitempty"`
}
