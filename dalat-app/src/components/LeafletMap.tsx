'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Khắc phục vấn đề icon
const fixLeafletIcon = () => {
  if (typeof window !== 'undefined') {
    L.Icon.Default.prototype.options.iconUrl = undefined;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }
};

// Component để cập nhật view khi center thay đổi
function ChangeView({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

interface Location {
  lat: number;
  lng: number;
  title: string;
  id?: number;
}

interface MapProps {
  locations: Location[];
  center: { lat: number; lng: number };
  zoom?: number;
  showRoute?: boolean;
  dayNumber?: number;
}

const LeafletMap: React.FC<MapProps> = ({ 
  locations = [], 
  center = { lat: 11.9438, lng: 108.4453 },
  zoom = 12,
  showRoute = true,
  dayNumber = 1
}) => {
  // Fix Leaflet icon issue
  useEffect(() => {
    fixLeafletIcon();
  }, []);
  
  // Filter out any locations with invalid coordinates
  const validLocations = locations.filter(
    loc => typeof loc.lat === 'number' && 
           typeof loc.lng === 'number' && 
           !isNaN(loc.lat) && 
           !isNaN(loc.lng)
  );
  
  // Create a polyline to connect all locations in sequence
  const polylinePositions = validLocations.map(loc => [loc.lat, loc.lng]);
  
  useEffect(() => {
    console.log(`Map for Day ${dayNumber} with ${validLocations.length} locations`);
  }, [validLocations.length, dayNumber]);
  
  return (
    <MapContainer 
      center={[center.lat, center.lng]} 
      zoom={zoom} 
      style={{ height: '100%', width: '100%' }}
      whenCreated={(map) => {
        if (validLocations.length > 0) {
          // Fit the map to show all markers
          const bounds = L.latLngBounds(validLocations.map(loc => [loc.lat, loc.lng]));
          map.fitBounds(bounds, { padding: [30, 30] });
        }
      }}
    >
      <ChangeView center={[center.lat, center.lng]} zoom={zoom} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Hiển thị tiêu đề ngày */}
      {validLocations.length === 0 && (
        <div 
          style={{ 
            position: 'absolute',
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            background: 'white',
            padding: '10px',
            borderRadius: '4px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            zIndex: 1000
          }}
        >
          <p>Không có địa điểm cho ngày {dayNumber}</p>
        </div>
      )}
      
      {validLocations.map((location, index) => (
        <Marker 
          key={`${location.id || ''}-${index}`} 
          position={[location.lat, location.lng]}
        >
          <Popup>
            <div>
              <strong>{location.title}</strong>
              <div>Điểm dừng #{index + 1}</div>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {/* Vẽ đường kết nối các điểm nếu showRoute=true */}
      {showRoute && validLocations.length > 1 && (
        <Polyline
          positions={polylinePositions}
          color="#f59e0b"
          weight={3}
          opacity={0.7}
          dashArray="5, 10"
        />
      )}
    </MapContainer>
  );
};

export default React.memo(LeafletMap);