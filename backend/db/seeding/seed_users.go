package seeding

import (
	"encoding/base64"
	"swapper/models"

	"github.com/brianvoe/gofakeit/v7"
)

// GenerateFakeUser creates and returns a User struct filled with fake data.
func GenerateFakeUser() *models.User {
	gofakeit.Seed(0)

	return &models.User{
		ID:             gofakeit.UUID(),
		Name:           gofakeit.Name(),
		Username:       gofakeit.Username(),
		Email:          gofakeit.Email(),
		PasswordHash:   "password", // not a real hash, but it's fake data
		ProfilePicture: base64.StdEncoding.EncodeToString(gofakeit.ImagePng(480, 480)),
	}
}

func GenerateFakeUsers(numUsers int) []*models.User {
	users := make([]*models.User, numUsers)
	for i := 0; i < numUsers; i++ {
		users[i] = GenerateFakeUser()
	}
	return users
}
