// Use CommonJS (require Instead of import)
const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Multer for file uploads
const upload = multer({ dest: "uploads/" });

app.post("/convert", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded.");

    const inputFile = req.file.path;
    const outputFormat = req.body.format || "geojson"; // Default to GeoJSON

    // Mapping file formats to GDAL format names
    const formatMap = {
        geojson: "GeoJSON",
        wkt: "CSV", // WKT requires a CSV workaround
        shp: "ESRI Shapefile",
        kml: "KML",
        csv: "CSV"
    };


    if (!formatMap[outputFormat]) {
        return res.status(400).send("Invalid format selected.");
    }

    const outputFile = path.join(__dirname, "uploads", `converted.${outputFormat}`);

    // Command to convert file using GDAL
    let gdalCommand = `ogr2ogr -f "${formatMap[outputFormat]}" ${outputFile} ${inputFile}`;

    if (outputFormat === "wkt") {
        gdalCommand = `ogr2ogr -f "CSV" ${outputFile} ${inputFile} -lco GEOMETRY=AS_WKT`;
    }

    exec(gdalCommand, (error, stderr) => {
        if (error) {
            console.error("Conversion error:", stderr);
            return res.status(500).send("Conversion failed.");
        }

        res.download(outputFile, `converted.${outputFormat}`, () => {
            // Cleanup temp files
            fs.unlinkSync(inputFile);
            fs.unlinkSync(outputFile);
        });
    });
});

app.listen(PORT, () => console.log(` Server running at http://localhost:${PORT}`));
