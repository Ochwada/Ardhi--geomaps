import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoJsonObject } from 'geojson';
import { useEffect } from 'react';
import * as L from 'leaflet';

interface MapProps {
  geoJSONDataList?: GeoJsonObject[]; // ✅ Make it optional with `?`
}

const Map: React.FC<MapProps> = ({ geoJSONDataList = [] }) => { // ✅ Default to empty array
  const MapBounds: React.FC = () => {
    const map = useMap();

    useEffect(() => {
      if (!geoJSONDataList.length || !map) return; // Ensure there is data

      const allBounds = geoJSONDataList
        .map((geoJSON) => {
          const layer = L.geoJSON(geoJSON as GeoJsonObject);
          return layer.getBounds();
        })
        .filter((bounds) => bounds.isValid());

      if (allBounds.length === 0) return;

      const mergedBounds = allBounds.reduce((acc, bounds) => acc.extend(bounds), allBounds[0]);

      if (mergedBounds.isValid()) {
        map.fitBounds(mergedBounds);
      }
    }, [geoJSONDataList, map]);

    return null;
  };

  return (
    <MapContainer
      center={[52.520008, 13.404954]} // Default center (Berlin)
      zoom={13}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {/* ✅ Prevents error by ensuring geoJSONDataList is always an array */}
      {geoJSONDataList.map((geoJSONData, index) => (
        <GeoJSON key={index} data={geoJSONData} />
      ))}
      <MapBounds />
    </MapContainer>
  );
};

export default Map;

