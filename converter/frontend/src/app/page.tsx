

"use client";
import React, { useState } from "react";;
import Converter from '@/components/converter';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>("geojson"); // Default format


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file!");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("format", outputFormat); // Send format selection to backend

    try {
      const response = await fetch("http://localhost:3001/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Conversion failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `converted.${outputFormat}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Error converting file.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="p-6 max-w-md mx-auto">
        <h1 className="text-xl font-bold">Geo File Converter (Gdal)</h1>

        {/* ------------ File Upload ------------ */}
        <input type="file" onChange={handleFileChange} className="my-3 border" />

        {/* --------- Format Selection Dropdown ---- */}
        <select
          value={outputFormat}
          onChange={(e) => setOutputFormat(e.target.value)}
          className="border border-gray-300 p-2 my-3"
        >
          <option value="geojson">GeoJSON</option>
          <option value="wkt">WKT</option>
          <option value="shp">Shapefile (.shp)</option>
          <option value="kml">KML</option>
          <option value="csv">CSV</option>
        </select>

        {/* --------- Convert Button ---------- */}
        <button className="border border-green-500 px-2 my-3" onClick={handleUpload}>
          Convert & Download
        </button>
      </div>


      <div className="p-6 max-w-md mx-auto">
        <h1 className="text-xl font-bold underline">Geo File Converter Code</h1>
        <Converter />
      </div>
    </div>

  );
}
