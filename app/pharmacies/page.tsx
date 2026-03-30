'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import FilterBar from '@/components/FilterBar';

// استدعاء الخريطة بشكل ديناميكي لتجنب مشاكل السيرفر في بيئة أندرويد
const TaourirtMap = dynamic(() => import('@/components/TaourirtMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full bg-zinc-900 animate-pulse rounded-3xl flex items-center justify-center text-zinc-500 border border-zinc-800">
      جاري تجهيز خريطة تاوريرت...
    </div>
  )
});

export default function PharmaciesPage() {
  const [type, setType] = useState('all');
  const [neighborhood, setNeighborhood] = useState('');

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10 font-sans" dir="rtl">
      {/* الهيدر الاحترافي */}
      <header className="mb-8 flex justify-between items-center px-2">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-l from-blue-400 to-emerald-400 bg-clip-text text-transparent italic">
            TAOURIRT HUB
          </h1>
          <p className="text-zinc-500 mt-1 text-xs tracking-widest uppercase">Smart City Guide 2026</p>
        </div>
        <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 shadow-xl">📍</div>
      </header>

      {/* شريط الفلاتر الذي أنشأناه */}
      <FilterBar 
        currentType={type} 
        currentNeighborhood={neighborhood}
        onTypeChange={setType}
        onNeighborhoodChange={setNeighborhood}
      />

      {/* حاوية الخريطة مع تأثير زجاجي بسيط */}
      <div className="relative rounded-[2.5rem] overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900">
        <TaourirtMap 
          filterType={type} 
          neighborhood={neighborhood} 
          height="600px" 
        />
      </div>

      {/* تذييل الصفحة */}
      <footer className="mt-12 text-center text-zinc-800 text-[10px] tracking-[0.2em] uppercase pb-6">
        Designed & Coded by Youssef Azahrai
      </footer>
    </div>
  );
}
