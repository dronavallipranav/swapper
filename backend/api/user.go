package api

import (
	"net/http"
	"swapper/models"

	"github.com/gin-gonic/gin"
	"github.com/ravendb/ravendb-go-client"
)

type UserHandler struct {
	Store *ravendb.DocumentStore
}

func NewUserHandler(store *ravendb.DocumentStore) *UserHandler {
	return &UserHandler{
		Store: store,
	}
}

func (h *UserHandler) RegisterUserRoutes(r *gin.Engine) {
	r.POST("/signup", h.SignUp)
}

func (h *UserHandler) SignUp(c *gin.Context) {
	//mock data remove
	user := models.User{
		ID:    "1",
		Name:  "mockName",
		Email: "mockEmail",
	}

	//open session to document store
	session, err := h.Store.OpenSession("swapper")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open session"})
		return
	}
	defer session.Close()

	//store mock user in document store
	err = session.Store(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store user"})
		return
	}
	err = session.SaveChanges()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save changes"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User signed up", "userId": user.ID})
}
