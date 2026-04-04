// ========== الخريطة الأساسية (بيانات تجريبية) ==========
let map;
let markers = [];

const demoPharmacies = [
    { id: 1, name: "صيدلية المزينين", lat: 34.41187, lng: -2.89380, address: "شارع محمد الخامس", phone: "0536661111" },
    { id: 2, name: "صيدلية الأندلس", lat: 34.40566, lng: -2.90749, address: "شارع الأندلس", phone: "0536662222" },
    { id: 3, name: "صيدلية النور", lat: 34.41045, lng: -2.89210, address: "شارع النور", phone: "0536663333" }
];
const demoMarkets = [
    { id: 1, name: "سوق المركز", lat: 34.41670, lng: -2.88330, address: "وسط المدينة", phone: "0536664444" }
];

function initMap() {
    if (map) return;
    map = L.map('map').setView([34.4167, -2.8833], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap',
        subdomains: 'abcd'
    }).addTo(map);
    console.log("✅ الخريطة الأساسية جاهزة");
}

function addMarker(item, type) {
    const iconColor = type === 'pharmacy' ? '#ef4444' : '#10b981';
    const iconHtml = `<div style="background:${iconColor}; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white;">
        <i class="fas ${type === 'pharmacy' ? 'fa-hospital' : 'fa-store'}" style="color:white; font-size:14px;"></i>
    </div>`;
    const icon = L.divIcon({ html: iconHtml, iconSize: [30, 30], popupAnchor: [0, -15] });
    const marker = L.marker([item.lat, item.lng], { icon }).addTo(map);
    let popup = `<b>${item.name}</b><br>${item.address || ''}<br>`;
    popup += item.phone ? `<a href="tel:${item.phone}">اتصل</a>` : 'رقم غير متوفر';
    marker.bindPopup(popup);
    markers.push(marker);
}

function clearMarkers() {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
}

function updateMapWithDemo() {
    if (!map) initMap();
    clearMarkers();
    demoPharmacies.forEach(p => addMarker(p, 'pharmacy'));
    demoMarkets.forEach(m => addMarker(m, 'market'));
}

function zoomIn() { if (map) map.zoomIn(); }
function zoomOut() { if (map) map.zoomOut(); }
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const userLoc = [pos.coords.latitude, pos.coords.longitude];
                const userMarker = L.marker(userLoc, {
                    icon: L.divIcon({ html: '<div style="background:#3b82f6;width:16px;height:16px;border-radius:50%;border:2px solid white;"></div>', iconSize: [16,16] })
                }).addTo(map);
                userMarker.bindPopup('📍 موقعك').openPopup();
                map.setView(userLoc, 14);
            },
            () => console.warn("لم نتمكن من تحديد موقعك")
        );
    }
}

function addMapControls() {
    const container = document.getElementById('map-container');
    if (container && !document.querySelector('.map-controls')) {
        const controls = document.createElement('div');
        controls.className = 'map-controls';
        controls.innerHTML = `
            <button onclick="zoomIn()" class="map-btn"><i class="fas fa-plus"></i></button>
            <button onclick="zoomOut()" class="map-btn"><i class="fas fa-minus"></i></button>
            <button onclick="getUserLocation()" class="map-btn"><i class="fas fa-location-dot"></i></button>
        `;
        container.appendChild(controls);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    updateMapWithDemo();
    addMapControls();
});
