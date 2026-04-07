import { supabaseConfig } from '../core/config.js';

export async function fetchPharmacies() {
  try {
    const res = await fetch(`${supabaseConfig.url}/rest/v1/pharmacies?select=*`, {
      headers: { apikey: supabaseConfig.anonKey, Authorization: `Bearer ${supabaseConfig.anonKey}` }
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getNeighborhoods(pharmacies) {
  const hoods = [...new Set(pharmacies.map(p => p.neighborhood).filter(Boolean))];
  return hoods.sort();
}

export function filterByNeighborhood(pharmacies, hood) {
  if (!hood || hood === 'الكل') return pharmacies;
  return pharmacies.filter(p => p.neighborhood === hood);
}

export function filterBySearch(pharmacies, term) {
  if (!term) return pharmacies;
  return pharmacies.filter(p => p.name?.includes(term) || p.address?.includes(term));
}

export function getOpenCount(pharmacies) {
  return pharmacies.filter(p => p.is_on_duty).length;
}

export function renderPharmaciesList(pharmacies, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (pharmacies.length === 0) {
    container.innerHTML = '<div class="empty">لا توجد صيدليات</div>';
    return;
  }
  container.innerHTML = pharmacies.map(p => `
    <div class="pharmacy-card ${p.is_on_duty ? 'on-duty' : ''}">
      <div class="pharmacy-name">
        <span>${p.name || 'بدون اسم'}</span>
        <span class="pharmacy-neighborhood">${p.neighborhood || ''}</span>
      </div>
      <div class="pharmacy-address"><i class="fas fa-location-dot"></i> ${p.address || ''}</div>
      <div class="pharmacy-phone"><i class="fas fa-phone"></i> ${p.phone || ''}</div>
      ${p.phone ? `<a href="tel:${p.phone}" class="call-btn">اتصل</a>` : ''}
    </div>
  `).join('');
}

export function initMap(pharmacies, mapElementId) {
  const map = L.map(mapElementId).setView([34.416, -2.89], 13);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);
  pharmacies.forEach(p => {
    if (p.lat && p.lng) {
      L.marker([p.lat, p.lng])
        .bindPopup(`<b>${p.name}</b><br>${p.address}<br>${p.is_on_duty ? '🟢 مفتوحة' : ''}`)
        .addTo(map);
    }
  });
  return map;
}
