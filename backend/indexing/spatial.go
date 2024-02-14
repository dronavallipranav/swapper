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

func NewMyIndex() *ravendb.IndexCreationTask {
	res := ravendb.NewIndexCreationTask("items/ByLocation")
	res.Map = "docs.items.Select(item => new {\n" +
		"    item = item\n" +
		"}).Select(this0 => new {\n" +
		"    this0 = this0,\n" +
		"    lat = ((double)(this0.item.location.latitude ?? 0))\n" +
		"}).Select(this1 => new {\n" +
		"    this1 = this1,\n" +
		"    lng = ((double)(this1.this0.item.location.longitude ?? 0))\n" +
		"}).Select(this2 => new {\n" +
		"    latitude = this2.this1.lat,\n" +
		"    longitude = this2.lng,\n" +
		"    coordinates = this.CreateSpatialField(((double ? ) this2.this1.lat), ((double ? ) this2.lng))\n" +
		"})"
	res.Store("id", ravendb.FieldStorageYes)

	res.Store("latitude", ravendb.FieldStorageYes)
	res.Store("longitude", ravendb.FieldStorageYes)
	res.Spatial("Coordinates", geographySpatialOptions)

	return res
}
