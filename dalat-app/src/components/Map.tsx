"use client"; // Chạy ở phía client vì Leaflet không hỗ trợ SSR

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FC } from "react";
// import { getUserLocation } from "@/services/utils";

// Fix lỗi icon của Leaflet bị mất
const customIcon = new L.Icon({
  iconUrl: "/imgs/marker-icon.png", // Hoặc dùng đường dẫn của Leaflet mặc định
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface MapProps {
  lat: number;
  lon: number;
  name: string;
}

// Component con để cập nhật center khi props thay đổi
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const Map: FC<MapProps> = ({ lat, lon, name }) => {
  // const showLocation = async () => {
  //   const location = await getUserLocation();
  //   if (location) {
  //     alert(`Latitude: ${location.latitude}, Longitude: ${location.longitude}`);      
  //   } else {
  //     alert("Unable to retrieve location.");
  //   }
  // };

  return (
    <div>
      <MapContainer center={[lat, lon]} zoom={15} style={{ height: "400px", width: "100%" }}>
        {/* Component để cập nhật view */}
        <ChangeView center={[lat, lon]} zoom={15} />
        
        {/* Layer OpenStreetMap */}
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* Đánh dấu vị trí */}
        <Marker position={[lat, lon]} icon={customIcon}>
          <Popup>{name}</Popup>
        </Marker>
      </MapContainer>

      {/* <button className="btn btn-primary mt-2" onClick={showLocation}>
        Click
      </button> */}
    </div>
  );
};

export default Map;