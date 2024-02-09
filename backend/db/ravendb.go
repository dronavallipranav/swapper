package db

import (
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
	return documentStore, nil
}

func GetDocumentStore() *ravendb.DocumentStore {
	return documentStore
}
