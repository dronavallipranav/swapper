package api

import (
	"net/http"

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
	c.JSON(http.StatusOK, gin.H{"message": "User signed up"})
}
