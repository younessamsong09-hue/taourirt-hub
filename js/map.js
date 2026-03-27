let map, markers = [], userMarker = null;
let userLocation = null;

function initMap() {
    if (map) return;
    map = L.map('map').setView([34.4167, -2.8833], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap', subdomains: 'abcd'
    }).addTo(map);
}

function clearMarkers() {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
}

function calculateDistance(point1, point2) {
    const R = 6371;
    const dLat = (point2[0] - point1[0]) * Math.PI / 180;
    const dLon = (point2[1] - point1[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1[0] * Math.PI / 180) * Math.cos(point2[0] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function addMarker(pharmacy, coords) {
    const marker = L.marker(coords).addTo(map);
    const distance = userLocation ? calculateDistance(userLocation, coords) : null;
    const distanceText = distance ? `<br>📏 ${distance.toFixed(1)} كم` : '';
    marker.bindPopup(`<b>${pharmacy.name}</b><br>${pharmacy.address || ''}<br><a href="tel:${pharmacy.phone}">اتصل</a>${distanceText}`);
    markers.push(marker);
}

function updateMap(pharmacies) {
    if (!map) initMap();
    clearMarkers();
    const coordsMap = {
        'صيدلية المزينين': [34.4180, -2.8820],
        'صيدلية الأندلس': [34.4250, -2.8750],
        'صيدلية النور': [34.4100, -2.8900],
        'صيدلية الفتح': [34.4050, -2.8850],
        'صيدلية السلام': [34.4200, -2.8780]
    };
    pharmacies.forEach(p => {
        const coords = coordsMap[p.name] || [34.4167, -2.8833];
        addMarker(p, coords);
    });
}

function getUserLocation(callback) {
    const statusDiv = document.getElementById('locationStatus');
    if (!statusDiv) return;
    statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تحديد موقعك...';
    if (!navigator.geolocation) {
        statusDiv.innerHTML = '⚠️ متصفحك لا يدعم تحديد الموقع';
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (position) => {
            userLocation = [position.coords.latitude, position.coords.longitude];
            statusDiv.innerHTML = `📍 موقعك: ${userLocation[0].toFixed(4)}, ${userLocation[1].toFixed(4)}`;
            if (userMarker) map.removeLayer(userMarker);
            userMarker = L.marker(userLocation, {
                icon: L.divIcon({ html: '<div style="background:#3b82f6;width:16px;height:16px;border-radius:50%;border:2px solid white;"></div>', iconSize: [16, 16] })
            }).addTo(map);
            userMarker.bindPopup('📍 موقعك').openPopup();
            map.setView(userLocation, 14);
            if (callback) callback();
        },
        (error) => {
            let msg = '';
            switch(error.code) {
                case error.PERMISSION_DENIED: msg = 'الرجاء السماح بتحديد الموقع'; break;
                case error.POSITION_UNAVAILABLE: msg = 'تعذر تحديد الموقع'; break;
                case error.TIMEOUT: msg = 'انتهى الوقت'; break;
                default: msg = 'حدث خطأ';
            }
            statusDiv.innerHTML = `⚠️ ${msg}`;
        }
    );
}

function zoomIn() { if (map) map.zoomIn(); }
function zoomOut() { if (map) map.zoomOut(); }
