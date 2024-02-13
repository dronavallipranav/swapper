package api

import (
	"net/http"
	"swapper/middleware"
	"swapper/models"

	"github.com/gin-gonic/gin"
	"github.com/ravendb/ravendb-go-client"
)

type MessageHandler struct {
	Store *ravendb.DocumentStore
}

func NewMessageHandler(store *ravendb.DocumentStore) *MessageHandler {
	return &MessageHandler{
		Store: store,
	}
}

func (h *MessageHandler) RegisterMessageRoutes(r *gin.Engine) {
	messages := r.Group("/messages")
	// Use auth middleware for all messages routes
	messages.POST("", middleware.AuthMiddleware(), h.PostMessage)
}

func (h *MessageHandler) PostMessage(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var messageReq models.Message
	if err := c.ShouldBindJSON(&messageReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request" + err.Error()})
		return
	}

	//ensure the senderID matches the authenticated user's ID for security
	if messageReq.SenderID != userID.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Sender ID does not match the authenticated user's ID"})
		return
	}

	newMessage := models.Message{
		SenderID:    userID.(string),
		RecipientID: messageReq.RecipientID,
		Text:        messageReq.Text,
	}

	session, err := h.Store.OpenSession("")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open session"})
		return
	}
	defer session.Close()

	err = session.Store(&newMessage)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store message"})
		return
	}

	err = session.SaveChanges()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save changes"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Message sent successfully", "id": newMessage.RecipientID})
}
