package main

import (
	"log"
	"swapper/api"
	"swapper/indexing"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/ravendb/ravendb-go-client"
)

func getDocumentStore(databaseName string) (*ravendb.DocumentStore, error) {
	serverNodes := []string{"http://localhost:8080"}
	store := ravendb.NewDocumentStore(serverNodes, databaseName)
	if err := store.Initialize(); err != nil {
		return nil, err
	}

	store.GetConventions().MaxNumberOfRequestsPerSession = 1000 // this is bad practice

	return store, nil
}

func main() {
	r := gin.Default()
	corsConfig := cors.DefaultConfig()

	corsConfig.AllowOrigins = []string{"*"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	corsConfig.AllowCredentials = true
	r.Use(cors.New(corsConfig))

	documentStore, err := getDocumentStore("swapper")
	if err != nil {
		log.Fatalf("Failed to initialize document store: %v", err)
		return
	}
	defer documentStore.Close()

	//setup spatial indexing
	err = documentStore.ExecuteIndex(indexing.NewItemsWithSpatialAndFullTextSearchIndex(), "swapper")
	if err != nil {
		log.Fatalf("Failed to execute index: %v", err)
		return
	}

	// Seed the database
	// seeding.Seed(documentStore)

	setupRoutes(r, documentStore)

	if err := r.Run(":5050"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}

func setupRoutes(r *gin.Engine, store *ravendb.DocumentStore) {
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Hello, world!",
		})
	})

	userHandler := api.NewUserHandler(store)
	userHandler.RegisterUserRoutes(r)

	itemHandler := api.NewItemHandler(store)
	itemHandler.RegisterItemRoutes(r)

	messageHandler := api.NewMessageHandler(store)
	messageHandler.RegisterMessageRoutes(r)

	ratingHandler := api.NewRatingHandler(store)
	ratingHandler.RegisterRatingRoutes(r)
}
