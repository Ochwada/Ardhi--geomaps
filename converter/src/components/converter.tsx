"use client";
import { useState } from "react";
import { stringify as geojsonToWkt, parse as wktToGeojson } from "wellknown";
import proj4 from "proj4";
import { featureCollection } from "@turf/helpers";

const IndexPage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [convertedData, setConvertedData] = useState<string | null>(null);
    const [outputFormat, setOutputFormat] = useState<"GeoJSON" | "WKT">("GeoJSON");

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
        }
    };

    const handleConvert = async () => {
        if (!file) return;

        const arrayBuffer = await file.arrayBuffer();
        const text = new TextDecoder().decode(arrayBuffer);

        let geojson;
        try {
            geojson = JSON.parse(text);
            console.log("Original GeoJSON:", geojson);
        } catch (error) {
            alert("Invalid GeoJSON");
            console.error("Parsing error:", error);
            return;
        }

        // ✅ Ensure input is a valid Feature or Geometry
        let validGeojson: GeoJSON.Geometry | GeoJSON.Feature;
        if (geojson.type === "FeatureCollection") {
            if (geojson.features.length === 0) {
                alert("FeatureCollection is empty.");
                return;
            }
            validGeojson = geojson.features[0].geometry; // Extract first feature's geometry
        } else if (geojson.type === "Feature") {
            validGeojson = geojson.geometry;
        } else if ("coordinates" in geojson) {
            validGeojson = geojson;
        } else {
            alert("Invalid GeoJSON format.");
            return;
        }

        // ✅ Convert to WKT (only Geometry or Feature allowed)
        let convertedText: string;
        if (outputFormat === "WKT") {
            convertedText = geojsonToWkt(validGeojson);
        } else {
            const wkt = geojsonToWkt(validGeojson);
            const newGeojson = wktToGeojson(wkt);

            // ✅ Ensure newGeojson is a FeatureCollection
            let featureCollectionData: GeoJSON.FeatureCollection;
            if (newGeojson.type === "FeatureCollection") {
                featureCollectionData = newGeojson;
            } else if (newGeojson.type === "Feature") {
                featureCollectionData = { type: "FeatureCollection", features: [newGeojson] };
            } else if ("coordinates" in newGeojson) {
                featureCollectionData = {
                    type: "FeatureCollection",
                    features: [{ type: "Feature", geometry: newGeojson, properties: {} }],
                };
            } else {
                alert("Invalid GeoJSON format.");
                return;
            }

            proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");
            proj4.defs(
                "EPSG:3857",
                "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs"
            );

            const transformedFeatures = featureCollectionData.features.map((feature: GeoJSON.Feature) => {
                if (!feature.geometry) return feature;
                let transformedCoords;
                if (!("coordinates" in feature.geometry)) {
                    console.warn("Geometry does not have coordinates");
                    return feature;
                }
                const { type, coordinates } = feature.geometry;

                if (type === "Point") {
                    transformedCoords = proj4("EPSG:4326", "EPSG:3857", coordinates as GeoJSON.Position);
                } else if (type === "LineString" || type === "MultiPoint") {
                    transformedCoords = (coordinates as GeoJSON.Position[]).map((coord) =>
                        proj4("EPSG:4326", "EPSG:3857", coord)
                    );
                } else if (type === "Polygon" || type === "MultiLineString") {
                    transformedCoords = (coordinates as GeoJSON.Position[][]).map((ring) =>
                        ring.map((coord) => proj4("EPSG:4326", "EPSG:3857", coord))
                    );
                } else if (type === "MultiPolygon") {
                    transformedCoords = (coordinates as GeoJSON.Position[][][]).map((polygon) =>
                        polygon.map((ring) => ring.map((coord) => proj4("EPSG:4326", "EPSG:3857", coord)))
                    );
                } else {
                    console.warn(`Unsupported geometry type: ${type}`);
                    return feature;
                }

                return {
                    ...feature,
                    geometry: { ...feature.geometry, coordinates: transformedCoords },
                };
            });

            const transformedGeojson = featureCollection(transformedFeatures as GeoJSON.Feature[]);
            console.log("Transformed GeoJSON:", transformedGeojson);
            convertedText = JSON.stringify(transformedGeojson, null, 2);
        }

        setConvertedData(convertedText);
    };

    const handleDownload = () => {
        if (!convertedData) return;

        const blob = new Blob([convertedData], {
            type: outputFormat === "GeoJSON" ? "application/json" : "text/plain",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = outputFormat === "GeoJSON" ? "converted.geojson" : "converted.wkt";
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <h1>Geo File Converter</h1>
            <input type="file" onChange={handleFileChange} />
            <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value as "GeoJSON" | "WKT")}>
                <option value="GeoJSON">GeoJSON</option>
                <option value="WKT">WKT</option>
            </select>
            <button className="border border-green-500 px-2 my-3" onClick={handleConvert}>Convert</button>
            {convertedData && (
                <div>
                   {/*  <pre>{convertedData}</pre> */}
                    <button  className="border border-blue-500 px-2" onClick={handleDownload}>Download {outputFormat} File</button>
                </div>
            )}
        </div>
    );
};

export default IndexPage;
