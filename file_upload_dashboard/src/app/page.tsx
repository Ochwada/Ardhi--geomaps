'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import FileUpload from '@/components/FileUpload';
import { GeoJsonObject } from 'geojson';
//import { downloadAsGeoJSON, downloadAsShapefile } from '@/components/download'; // 


// Dynamically import the Map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/Map'), { ssr: false });

const Home: React.FC = () => {
  const [geoJSONDataList, setGeoJSONDataList] = useState<GeoJsonObject[]>([]);
  const [url, setUrl] = useState<string>('');

  // Handle file uploads (supports multiple files)
  const handleFileUpload = async (uploadedFile: File) => {
    if (uploadedFile.name.endsWith('.geojson')) {
      try {
        const fileText = await uploadedFile.text();
        const geoJSON = JSON.parse(fileText) as GeoJsonObject;
        setGeoJSONDataList((prevData) => [...prevData, geoJSON]); // Append new dataset
        console.log('Uploaded GeoJSON:', geoJSON);
      } catch (error) {
        console.error('Error parsing GeoJSON:', error);
      }
    } else {
      console.log('Unsupported file format');
    }
  };

  // Handle loading data from a URL
  const handleUrlLoad = async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch GeoJSON from URL');
      }
      const geoJSON = (await response.json()) as GeoJsonObject;
      setGeoJSONDataList((prevData) => [...prevData, geoJSON]); // Append new dataset
      console.log('Loaded GeoJSON from URL:', geoJSON);
    } catch (error) {
      console.error('Error loading GeoJSON from URL:', error);
    }
  };

  // Remove a specific dataset
  const handleRemoveDataset = (index: number) => {
    setGeoJSONDataList((prevData) => prevData.filter((_, i) => i !== index));
  };

  return (
    <div>
      <header className='bg-gray-800 text-white p-4'>
        <div className='container mx-auto'>
          <h1 className='text-4xl'>WebGIS - Load Multiple Datasets</h1>
        </div>
      </header>
      <div className='container mx-auto p-4 flex flex-row'>
        <FileUpload onFileUpload={handleFileUpload} />
        <div className='p-2 flex-1'>
          <input
            type='text'
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder='Enter GeoJSON URL'
            className='border p-2 w-full'
          />
          <button
            onClick={handleUrlLoad}
            className='bg-blue-500 text-white px-4 py-2 mt-2 rounded hover:bg-blue-600'
          >
            Load GeoJSON from URL
          </button>
        </div>
      </div>

      {/*  List of uploaded datasets with Remove button */}
      <div className="container mx-auto p-4">
        <h2 className="text-xl font-bold">Uploaded Datasets</h2>
        {geoJSONDataList.length === 0 && <p>No datasets uploaded yet.</p>}
        <ul className="mt-2">
          {geoJSONDataList.map((_, index) => (
            <li key={index} className="flex justify-between items-center bg-gray-200 p-2 mb-2">
              <span>Dataset {index + 1}</span>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                onClick={() => handleRemoveDataset(index)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

        {/*  Download Buttons */}
       {/* 
       <div className="container mx-auto p-4 flex gap-4">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={() => downloadAsGeoJSON(geoJSONDataList)} // ✅ Call from utils
        >
          Download as GeoJSON
        </button>
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          onClick={() => downloadAsShapefile(geoJSONDataList)} // ✅ Call from utils
        >
          Download as Shapefile
        </button>
      </div>
 */}
      <Map geoJSONDataList={geoJSONDataList} />
    </div>
  );
};

export default Home;
