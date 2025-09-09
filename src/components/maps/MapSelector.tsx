import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapSelectorProps {
  coordinates: { lat: number; lng: number };
  onCoordinatesChange: (coords: { lat: number; lng: number }) => void;
  height?: string;
}

function LocationMarker({ coordinates, onCoordinatesChange }: MapSelectorProps) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      console.log('📍 ผู้ใช้คลิกที่พิกัด:', { lat, lng });
      onCoordinatesChange({ lat, lng });
    },
  });

  React.useEffect(() => {
    if (coordinates.lat !== 0 && coordinates.lng !== 0) {
      map.flyTo([coordinates.lat, coordinates.lng], map.getZoom());
    }
  }, [coordinates, map]);

  return coordinates.lat !== 0 && coordinates.lng !== 0 ? (
    <Marker position={[coordinates.lat, coordinates.lng]} />
  ) : null;
}

export default function MapSelector({ 
  coordinates, 
  onCoordinatesChange, 
  height = "300px" 
}: MapSelectorProps) {
  // Default center เป็นกรุงเทพฯ
  const center: [number, number] = coordinates.lat !== 0 && coordinates.lng !== 0 
    ? [coordinates.lat, coordinates.lng] 
    : [13.7563, 100.5018]; // พิกัดกรุงเทพฯ

  console.log('🗺️ MapSelector ใช้พิกัดปัจจุบัน:', coordinates);

  return (
    <div className="space-y-3">
      <div className="rounded-lg overflow-hidden border relative">
        <MapContainer
          center={center}
          zoom={12}
          style={{ height, width: '100%', zIndex: 1 }}
          scrollWheelZoom={true}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            coordinates={coordinates} 
            onCoordinatesChange={onCoordinatesChange} 
          />
        </MapContainer>
      </div>
      
      <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg border">
        <p className="font-medium mb-2 flex items-center">
          <span className="mr-2">💡</span>
          <span>วิธีใช้งาน:</span>
        </p>
        <ul className="space-y-1 ml-6">
          <li>• คลิกบนแผนที่เพื่อเลือกตำแหน่ง</li>
          <li>• ลากแผนที่เพื่อค้นหาตำแหน่งที่ต้องการ</li>
          <li>• ใช้ Scroll เพื่อ Zoom แผนที่</li>
        </ul>
        {coordinates.lat !== 0 && coordinates.lng !== 0 && (
          <div className="mt-3 p-3 bg-primary/10 rounded-md border border-primary/20">
            <p className="text-sm font-medium text-primary mb-1">
              📍 พิกัดที่เลือก:
            </p>
            <p className="font-mono text-xs bg-background px-2 py-1 rounded border">
              {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}