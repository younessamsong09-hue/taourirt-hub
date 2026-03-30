'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Navigation, ZoomIn, ZoomOut, Locate } from 'lucide-react';
import L from 'leaflet';

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

export interface Pharmacy {
  id: string | number;
  name: string;
  address?: string;
  phone?: string;
  lat: number;
  lng: number;
  type?: string;
  isOpenNow?: boolean;
}

interface TaourirtMapProps {
  pharmacies: Pharmacy[];
  className?: string;
  height?: string;
  onMarkerClick?: (pharmacy: Pharmacy) => void;
}

const TAOURIRT_CENTER: [number, number] = [34.4145, -2.8845];

const TaourirtMap: React.FC<TaourirtMapProps> = ({ pharmacies, className = "", height = "500px", onMarkerClick }) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const mapRef = useRef<any>(null);

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const getUserLocation = () => {
    setIsLoadingLocation(true);
    if (!navigator.geolocation) { alert('متصفحك لا يدعم تحديد الموقع'); setIsLoadingLocation(false); return; }
    navigator.geolocation.getCurrentPosition((position) => {
      const newLocation: [number, number] = [position.coords.latitude, position.coords.longitude];
      setUserLocation(newLocation);
      setIsLoadingLocation(false);
      if (mapRef.current) mapRef.current.flyTo(newLocation, 15, { duration: 1.5 });
    }, () => setIsLoadingLocation(false));
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-zinc-700 shadow-2xl ${className}`} style={{ height }}>
      <MapContainer center={TAOURIRT_CENTER} zoom={13} className="h-full w-full" ref={mapRef} zoomControl={false}>
        <TileLayer attribution='&copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        {pharmacies.map((p) => {
          const dist = userLocation ? calculateDistance(userLocation[0], userLocation[1], p.lat, p.lng) : null;
          return (
            <Marker key={p.id} position={[p.lat, p.lng]} eventHandlers={{ click: () => onMarkerClick?.(p) }}>
              <Popup className="text-right">
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-zinc-400">{p.address}</div>
                {p.phone && <a href={`tel:${p.phone}`} className="block mt-2 text-blue-400">📞 {p.phone}</a>}
                {dist && <div className="mt-1 text-emerald-400 text-xs">📏 {dist.toFixed(1)} كم</div>}
              </Popup>
            </Marker>
          );
        })}
        {userLocation && (
          <Marker position={userLocation} icon={L.divIcon({ className: 'user-location-icon', html: '<div style="background:#3b82f6;width:100%;height:100%;border-radius:50%;border:3px solid white;"></div>' })}>
            <Popup>📍 أنت هنا</Popup>
          </Marker>
        )}
      </MapContainer>
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
        <button onClick={getUserLocation} className="bg-zinc-900 border border-zinc-700 p-3 rounded-2xl shadow-lg text-white"><Locate className="w-5 h-5" /></button>
        <button onClick={() => mapRef.current?.zoomIn()} className="bg-zinc-900 border border-zinc-700 p-3 rounded-2xl shadow-lg text-white"><ZoomIn className="w-5 h-5" /></button>
        <button onClick={() => mapRef.current?.zoomOut()} className="bg-zinc-900 border border-zinc-700 p-3 rounded-2xl shadow-lg text-white"><ZoomOut className="w-5 h-5" /></button>
      </div>
    </div>
  );
};
export default TaourirtMap;
