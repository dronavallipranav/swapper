package indexing

import (
	"github.com/ravendb/ravendb-go-client"
)

func geographySpatialOptions() *ravendb.SpatialOptions {
	return &ravendb.SpatialOptions{
		Type:         ravendb.SpatialFieldGeography,
		Strategy:     ravendb.SpatialSearchStrategyGeohashPrefixTree,
		MaxTreeLevel: 9,
		Units:        ravendb.SpatialUnitsMiles,
		MinX:         -180,
		MaxX:         180,
		MinY:         -90,
		MaxY:         90,
	}
}

func NewItemsWithSpatialAndFullTextSearchIndex() *ravendb.IndexCreationTask {
	indexName := "Items/ByLocationAndAttributes"
	res := ravendb.NewIndexCreationTask(indexName)

	res.Map = `
from item in docs.Items
select new {
    Query = new object[] {
        item.title,
        item.description,
        item.attributes.condition,
        item.attributes.size,
        item.attributes.color,
        item.attributes.listingType,
        item.attributes.itemCategory,
        item.attributes.ownershipHistory,
        item.attributes.authenticity,
        item.categories
    },
    item.location,
    Coordinates = this.CreateSpatialField(item.location.latitude, item.location.longitude),
	Attributes_Color = item.attributes.color,
	Attributes_Condition = item.attributes.condition,
	Attributes_ItemCategory = item.attributes.itemCategory,
	Attributes_ListingType = item.attributes.listingType,
	Attributes_Size = item.attributes.size,
	Attributes_OwnershipHistory = item.attributes.ownershipHistory,
	Attributes_Authenticity = item.attributes.authenticity,
	Categories = item.categories,
	CreatedAt = item.createdAt
}`
	// Configure index options
	res.Index("Query", ravendb.FieldIndexingSearch)
	res.Analyze("Query", "StandardAnalyzer")
	res.Spatial("Coordinates", geographySpatialOptions)

	// Store fields for retrieval
	res.Store("title", ravendb.FieldStorageYes)
	res.Store("description", ravendb.FieldStorageYes)
	res.Store("location", ravendb.FieldStorageYes)

	// attr fields
	res.Store("Attributes_Color", ravendb.FieldStorageYes)
	res.Store("Attributes_Condition", ravendb.FieldStorageYes)
	res.Store("Attributes_ItemCategory", ravendb.FieldStorageYes)
	res.Store("Attributes_ListingType", ravendb.FieldStorageYes)
	res.Store("Attributes_Size", ravendb.FieldStorageYes)
	res.Store("Attributes_OwnershipHistory", ravendb.FieldStorageYes)
	res.Store("Attributes_Authenticity", ravendb.FieldStorageYes)
	res.Store("Categories", ravendb.FieldStorageYes)
	res.Store("CreatedAt", ravendb.FieldStorageYes)

	return res
}
