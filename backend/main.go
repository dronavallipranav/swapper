package main

import (
	"log"
	"swapper/api"

	"github.com/gin-gonic/gin"
	"github.com/ravendb/ravendb-go-client"
)

func getDocumentStore(databaseName string) (*ravendb.DocumentStore, error) {
	serverNodes := []string{"http://localhost:8080"}
	store := ravendb.NewDocumentStore(serverNodes, databaseName)
	if err := store.Initialize(); err != nil {
		return nil, err
	}
	return store, nil
}

func main() {
	documentStore, err := getDocumentStore("swapper")
	if err != nil {
		log.Fatalf("Failed to initialize document store: %v", err)
		return
	}
	defer documentStore.Close()

	r := gin.Default()

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

}
