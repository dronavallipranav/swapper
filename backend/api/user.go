package api

import (
	"fmt"
	"log"
	"net/http"
<<<<<<< HEAD
	"swapper/models"
=======
	"os"
	"swapper/models"
	"time"
>>>>>>> 5d1e0f4 (wip auth)

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"github.com/ravendb/ravendb-go-client"
	"golang.org/x/crypto/bcrypt"
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
	r.POST("/login", h.LoginUser)
}

type SignUpRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *UserHandler) SignUp(c *gin.Context) {
<<<<<<< HEAD
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
=======
	// Parse the request body into a User struct
	var signUpReq SignUpRequest
	if err := c.ShouldBindJSON(&signUpReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Hash password
	hash, err := bcrypt.GenerateFromPassword([]byte(signUpReq.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	newUser := models.User{
		Name:         signUpReq.Name,
		Email:        signUpReq.Email,
		PasswordHash: string(hash),
	}

	// Open a session for operations against the database
	session, err := h.Store.OpenSession("")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open a session"})
>>>>>>> 5d1e0f4 (wip auth)
		return
	}
	defer session.Close()

<<<<<<< HEAD
	//store mock user in document store
	err = session.Store(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store user"})
		return
	}
	err = session.SaveChanges()
	if err != nil {
=======
	// Store the new user in the database
	if err := session.Store(&newUser); err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store user"})
		return
	}

	// Save changes to the database
	if err := session.SaveChanges(); err != nil {
>>>>>>> 5d1e0f4 (wip auth)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save changes"})
		return
	}

<<<<<<< HEAD
	c.JSON(http.StatusOK, gin.H{"message": "User signed up", "userId": user.ID})
=======
	// Respond to the client
	c.JSON(http.StatusOK, gin.H{"message": "User signed up successfully", "userName": newUser.Name})
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

var jwtSecret []byte

func init() {
	jwtSecret = []byte(os.Getenv("JWT_SECRET_TOKEN"))
}

func (h *UserHandler) LoginUser(c *gin.Context) {
	// Parse the request body into a User struct
	var loginReq LoginRequest
	if err := c.ShouldBindJSON(&loginReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Open a session for operations against the database
	session, err := h.Store.OpenSession("")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open a session"})
		return
	}
	defer session.Close()

	var users []*models.User //slice of users for query results

	//query
	log.Printf("Querying for user with email: %v", loginReq.Email)
	q := session.QueryCollection("users")
	q = q.WaitForNonStaleResults(0)
	q = q.WhereEquals("email", loginReq.Email)
	if err := q.GetResults(&users); err != nil {
		log.Printf("Error executing query: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error executing query"})
		return
	}

	//check if any user found
	if len(users) == 0 {
		log.Printf("User not found with email: %v", loginReq.Email)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	//multiple emails, shouldnt be possible
	if len(users) > 1 {
		log.Printf("Multiple users found with email: %v", loginReq.Email)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Multiple users found"})
	}

	user := users[0]
	log.Printf("User: %v", user)

	// Compare the password hash with the provided password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(loginReq.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid password"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":    user.ID,
		"email": user.Email,
		"name":  user.Name,
		"exp":   time.Now().Add(time.Hour * 72).Unix(),
	})

	jwt, err := token.SignedString(jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": jwt})
>>>>>>> 5d1e0f4 (wip auth)
}
