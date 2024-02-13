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

func CreateItemLocationIndex() *ravendb.IndexCreationTask {
	indexTask := ravendb.NewIndexCreationTask("items/ByLocation")

	indexTask.Map = `
        from item in docs.items
        select new {
            Coordinates = CreateSpatialField(item.Location.Latitude, item.Location.Longitude)
        }
    `
	indexTask.Spatial("Coordinates", geographySpatialOptions)

	return indexTask
}
