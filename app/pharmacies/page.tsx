'use client';
import TaourirtMap, { Pharmacy } from '@/components/TaourirtMap';
import { useState } from 'react';

const samplePharmacies: Pharmacy[] = [
  { id: 1, name: "صيدلية المزينين", address: "وسط المدينة", phone: "0536-123456", lat: 34.4180, lng: -2.8820, isOpenNow: true },
  { id: 2, name: "صيدلية الأندلس", address: "حي السلام", phone: "0536-654321", lat: 34.4250, lng: -2.8750 },
  { id: 3, name: "صيدلية النور", address: "حي النور", phone: "0536-000000", lat: 34.4100, lng: -2.8900 },
  { id: 4, name: "صيدلية الفتح", address: "حي الفتح", phone: "0536-111111", lat: 34.4050, lng: -2.8850 },
  { id: 5, name: "صيدلية السلام", address: "حي السلام المرتفع", phone: "0536-222222", lat: 34.4200, lng: -2.8780 }
];

export default function PharmaciesPage() {
  const [selected, setSelected] = useState<Pharmacy | null>(null);
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-right">💊 صيدليات تاوريرت</h1>
      <TaourirtMap pharmacies={samplePharmacies} height="600px" onMarkerClick={(p) => setSelected(p)} />
      {selected && (
        <div className="mt-6 p-6 bg-zinc-900 rounded-3xl border border-zinc-800 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-xl font-bold">{selected.name}</h2>
          <p className="text-zinc-400 mt-2">📍 {selected.address}</p>
          <a href={`tel:${selected.phone}`} className="inline-block mt-4 bg-blue-600 px-6 py-2 rounded-xl font-bold text-white">اتصال هاتفي</a>
        </div>
      )}
    </div>
  );
}
