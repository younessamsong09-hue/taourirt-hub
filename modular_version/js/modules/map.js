// ========== الخريطة (نسخة أساسية) ==========
let map;
function initMap() {
    if (map) return;
    map = L.map('map').setView([34.4167, -2.8833], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap', subdomains: 'abcd'
    }).addTo(map);
    // علامات تجريبية
    L.marker([34.41187, -2.89380]).addTo(map).bindPopup('صيدلية المزينين');
    L.marker([34.41670, -2.88330]).addTo(map).bindPopup('سوق المركز');
}
document.addEventListener('DOMContentLoaded', initMap);
