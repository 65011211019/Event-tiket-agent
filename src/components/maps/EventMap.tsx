import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '@/contexts/AppContext';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface EventMapProps {
  coordinates: {
    lat: number;
    lng: number;
  };
  venue?: string;
  address?: string;
  zoom?: number;
  height?: string;
}

export default function EventMap({
  coordinates,
  venue,
  address,
  zoom = 15,
  height = "400px"
}: EventMapProps) {
  const { t } = useLanguage();

  // ตรวจสอบว่ามีพิกัดที่ถูกต้องหรือไม่
  if (!coordinates || coordinates.lat === 0 || coordinates.lng === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-lg border"
        style={{ height }}
      >
        <p className="text-gray-500">{t('mapsComponents.eventMap.noLocationData')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border relative">
      <MapContainer
        center={[coordinates.lat, coordinates.lng]}
        zoom={zoom}
        style={{ height, width: '100%', zIndex: 1 }}
        scrollWheelZoom={false}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[coordinates.lat, coordinates.lng]}>
          <Popup>
            <div className="space-y-2 min-w-[200px]">
              {venue && <div className="font-semibold text-base">{venue}</div>}
              {address && <div className="text-sm text-gray-600">{address}</div>}
              <div className="text-xs text-gray-500 pt-2 border-t">
                {t('mapsComponents.eventMap.coordinates')}: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
