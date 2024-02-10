package db

import (
	"log"
	"strings"

	ravendb "github.com/ravendb/ravendb-go-client"
)

var documentStore *ravendb.DocumentStore

func InitDocumentStore(urls []string, databaseName string) (*ravendb.DocumentStore, error) {
	if documentStore == nil {
		store := ravendb.NewDocumentStore(urls, databaseName)
		if err := store.Initialize(); err != nil {
			return nil, err
		}
		documentStore = store
	}
	dbRecord := &ravendb.DatabaseRecord{
		DatabaseName: databaseName,
	}

	createDBOp := ravendb.NewCreateDatabaseOperation(dbRecord, 1)
	err := documentStore.Maintenance().Server().Send(createDBOp)
	if err != nil {
		if strings.Contains(err.Error(), "DatabaseExists") || strings.Contains(err.Error(), "already exists") {
			log.Printf("Database %s already exists. Continuing.", databaseName)
		} else {
			log.Fatalf("Failed to create database: %s", err)
		}
	}
	return documentStore, nil
}

func GetDocumentStore() *ravendb.DocumentStore {
	return documentStore
}
