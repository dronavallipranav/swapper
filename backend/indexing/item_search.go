package indexing

import (
	"github.com/ravendb/ravendb-go-client"
)

func NewItemsFullTextSearchIndex() *ravendb.IndexCreationTask {
	indexName := "Items/ByFullTextAndAttributes"
	res := ravendb.NewIndexCreationTask(indexName)

	// Mapping fields from the Item model including nested Attributes for full-text search
	res.Map = `
from item in docs.Items
select new {
    Query = new object[] {
        item.title,
        item.description,
        item.attributes.condition,
        item.attributes.size,
        item.attributes.color,
        item.attributes.shippingOptions,
        item.attributes.listingType,
        item.attributes.itemCategory,
        item.attributes.ownershipHistory,
        item.attributes.authenticity,
        item.categories
    },
    item.location,
}`

	// Configure the index field options for full-text search
	res.Index("Query", ravendb.FieldIndexingSearch)
	res.Analyze("Query", "StandardAnalyzer") // Use an appropriate analyzer for your needs

	// Store fields for retrieval
	res.Store("title", ravendb.FieldStorageYes)
	res.Store("description", ravendb.FieldStorageYes)

	return res
}
