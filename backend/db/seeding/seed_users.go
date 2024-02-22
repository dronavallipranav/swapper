package seeding

import (
	"bytes"
	"encoding/base64"
	"mime"
	"swapper/models"

	"github.com/brianvoe/gofakeit/v7"
	"github.com/ravendb/ravendb-go-client"
)

// GenerateFakeUser creates and returns a User struct filled with fake data.
func GenerateFakeUser() *models.User {
	gofakeit.Seed(0)

	return &models.User{
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

func CreateUser(u *models.User, store *ravendb.DocumentStore) (string, error) {
	session, err := store.OpenSession("")
	if err != nil {
		return "", err
	}
	defer session.Close()

	err = session.Store(u)
	if err != nil {
		return "", err
	}

	// Save changes
	err = session.SaveChanges()
	if err != nil {
		return "", err
	}

	return u.ID, nil
}

func AddUserAttachments(base64Encoded string, u *models.User, store *ravendb.DocumentStore) error {
	fileBytes, err := base64.StdEncoding.DecodeString(base64Encoded)
	if err != nil {
		return err
	}
	// Now, convert fileBytes back into a stream for the .Store method
	byteReader := bytes.NewReader(fileBytes)
	mimeType := mime.TypeByExtension("image/png")

	session, err := store.OpenSession("")
	if err != nil {
		return err
	}
	defer session.Close()

	// retrieve user
	err = session.Load(&u, u.ID)
	if err != nil {
		return err
	}

	// Store the byteReader as an attachment
	err = session.Advanced().Attachments().Store(u, "pfp.png", byteReader, mimeType)
	if err != nil {
		return err
	}

	// Save changes
	err = session.SaveChanges()
	if err != nil {
		return err
	}

	return nil
}
