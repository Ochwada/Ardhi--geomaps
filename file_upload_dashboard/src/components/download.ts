import { saveAs } from "file-saver";
import mapshaper from "mapshaper"; // Ensure mapshaper is installed
import { GeoJsonObject } from "geojson";

// 📥 Download all datasets as a single GeoJSON file
export const downloadAsGeoJSON = (geoJSONDataList: GeoJsonObject[]) => {
  if (!geoJSONDataList.length) return;

  const mergedGeoJSON = {
    type: "FeatureCollection",
    features: geoJSONDataList.flatMap((data: GeoJsonObject) => (data as GeoJSON.FeatureCollection).features || [])
  };

  const blob = new Blob([JSON.stringify(mergedGeoJSON, null, 2)], { type: "application/json" });
  saveAs(blob, "datasets.geojson");
};

// 📥 Convert and download as Shapefile
export const downloadAsShapefile = async (geoJSONDataList: GeoJsonObject[]) => {
  if (!geoJSONDataList.length) return;

  const geoJSONString = JSON.stringify({
    type: "FeatureCollection",
    features: geoJSONDataList.flatMap((data: GeoJsonObject) => (data as GeoJSON.FeatureCollection).features || [])
  });

  try {
    const shapefileData = await mapshaper.applyCommands("-i input.geojson -o format=shapefile", {
      "input.geojson": geoJSONString
    });

    const zipBlob = new Blob([shapefileData["input.zip"]], { type: "application/zip" });
    saveAs(zipBlob, "datasets.zip");
  } catch (error) {
    console.error("Error converting to Shapefile:", error);
  }
};
