package api

import (
	"fmt"
	"net/http"
	"sort"
	"swapper/middleware"
	"swapper/models"
	"time"

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
	messages.GET("/conversations", middleware.AuthMiddleware(), h.GetUserConversations)
	messages.GET("", middleware.AuthMiddleware(), h.GetMessageHistory)
}

type SendMessageReq struct {
	RecipientID string `json:"recipientID" binding:"required"`
	Text        string `json:"text" binding:"required"`
}

// route for sending a message
func (h *MessageHandler) PostMessage(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var messageReq SendMessageReq
	if err := c.ShouldBindJSON(&messageReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request" + err.Error()})
		return
	}

	newMessage := models.Message{
		SenderID:    userID.(string),
		RecipientID: messageReq.RecipientID,
		Text:        messageReq.Text,
		SentAt:      time.Now(), //set sent at time to current time
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

// route to get all user conversations for messages landing page
// TO DO: Define conversation header model
func (h *MessageHandler) GetUserConversations(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	//limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	session, err := h.Store.OpenSession("")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open session"})
		return
	}
	defer session.Close()

	var conversations []*models.Message
	//query grabs all messages where the user is the sender or recipient, and orders by sentAt
	q := session.QueryCollection("messages")
	q = q.WhereEquals("senderID", userID).OrElse().WhereEquals("recipientID", userID)
	q = q.OrderByDescending("sentAt")

	err = q.GetResults(&conversations)
	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query conversations"})
		return
	}

	//post process messages to only be the most recent message per conversation
	mostRecentMessages := getMostRecentMessagePerConversation(conversations, userID.(string))

	var filteredConversations []*models.Message
	for _, msg := range mostRecentMessages {
		filteredConversations = append(filteredConversations, msg)
	}

	sort.Slice(filteredConversations, func(i, j int) bool {
		return filteredConversations[i].SentAt.After(filteredConversations[j].SentAt)
	})

	//return filtered conversations array
	c.JSON(http.StatusOK, gin.H{"conversations": filteredConversations})
}

// post-processing helper to filter out only the most recent message per conversation
func getMostRecentMessagePerConversation(conversations []*models.Message, userID string) map[string]*models.Message {
	//use a map to track the most recent message for each conversation
	mostRecentMessages := make(map[string]*models.Message)

	for _, msg := range conversations {
		otherParticipant := msg.SenderID
		if msg.SenderID == userID {
			otherParticipant = msg.RecipientID
		}

		//create a sorted slice of the participant IDs to generate a consistent key
		participants := []string{userID, otherParticipant}
		sort.Strings(participants)
		convoKey := fmt.Sprintf("%s-%s", participants[0], participants[1])

		//check to see if message already exists for this conversation
		if existingMsg, exists := mostRecentMessages[convoKey]; exists {
			//update if message is more recent
			if msg.SentAt.After(existingMsg.SentAt) {
				mostRecentMessages[convoKey] = msg
			}
		} else {
			mostRecentMessages[convoKey] = msg
		}
	}

	return mostRecentMessages
}

// returns all messages between the current user and another user
func (h *MessageHandler) GetMessageHistory(c *gin.Context) {
	currentUserID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	//other user ID is a required query parameter
	otherUserID := c.Query("otherUserID")
	if otherUserID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing query parameter: otherUserID"})
		return
	}

	session, err := h.Store.OpenSession("")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open session"})
		return
	}
	defer session.Close()

	var messages []*models.Message
	//query for all messages between these users, ordered by the time
	q := session.QueryCollection("messages")
	q = q.WhereEquals("senderID", currentUserID).WhereEquals("recipientID", otherUserID).OrElse().
		WhereEquals("senderID", otherUserID).WhereEquals("recipientID", currentUserID)
	q = q.OrderBy("sentAt")

	err = q.GetResults(&messages)
	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query messages"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"messages": messages})
}
