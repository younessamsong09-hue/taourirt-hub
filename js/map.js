let map, markers = [], userMarker = null;
let userLocation = null;

// إضافة الستايل الخاص بالنبض برمجياً
const style = document.createElement('style');
style.innerHTML = `
    @keyframes mapPulse {
        0% { transform: scale(0.5); opacity: 1; box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
        70% { transform: scale(1); opacity: 0; box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
        100% { transform: scale(0.5); opacity: 0; box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
    }
    .user-pulse {
        background: #3b82f6;
        width: 14px; height: 14px;
        border-radius: 50%;
        border: 2px solid white;
        position: relative;
    }
    .user-pulse::after {
        content: "";
        position: absolute;
        top: -2px; left: -2px;
        width: 14px; height: 14px;
        border-radius: 50%;
        border: 2px solid #3b82f6;
        animation: mapPulse 2s infinite;
    }
`;
document.head.appendChild(style);

function initMap() {
    if (map) return;
    // استخدام الثيم الليلي الفاخر (Dark Matter) ليتناسب مع تصميمك الأزرق
    map = L.map('map', { zoomControl: false }).setView([34.4167, -2.8833], 13);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap | Taourirt Hub',
        subdomains: 'abcd'
    }).addTo(map);
}

function getUserLocation(callback) {
    const statusDiv = document.getElementById('locationStatus');
    if (!statusDiv) return;
    
    statusDiv.innerHTML = '<i class="fas fa-satellite-dish fa-spin"></i> جاري رصد إحداثياتك...';

    if (!navigator.geolocation) {
        statusDiv.innerHTML = '⚠️ رادارك معطل!';
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            userLocation = [position.coords.latitude, position.coords.longitude];
            statusDiv.innerHTML = `📍 رادارك نشط: ${userLocation[0].toFixed(3)}, ${userLocation[1].toFixed(3)}`;
            
            if (userMarker) map.removeLayer(userMarker);

            // إضافة النقطة النابضة (Pulse Effect)
            userMarker = L.marker(userLocation, {
                icon: L.divIcon({ 
                    className: '', 
                    html: '<div class="user-pulse"></div>', 
                    iconSize: [14, 14] 
                })
            }).addTo(map);

            // تأثير الطيران السلس (FlyTo) بدلاً من القفز
            map.flyTo(userLocation, 16, { animate: true, duration: 2 });
            
            if (callback) callback();
        },
        (error) => {
            statusDiv.innerHTML = '⚠️ فشل الاتصال بالأقمار الصناعية';
        },
        { enableHighAccuracy: true }
    );
}

// الدوال الأصلية الأخرى مع الحفاظ على استقرارها
function clearMarkers() {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
}

function addMarker(pharmacy, coords) {
    const isOpen = pharmacy.status === "open" || pharmacy.isDuty; 
    const markerClass = isOpen ? "pulse-pharmacy" : ""; 
    const customIcon = L.divIcon({
        html: `<div class="${markerClass}" style="color:${isOpen ? "#10b981" : "#64748b"}; font-size:22px; filter: drop-shadow(0 0 5px ${isOpen ? "#10b981" : "transparent"});">
                <i class="fas fa-plus-square"></i>
               </div>`,
        className: "custom-pin",
        iconSize: [22, 22]
    });
    const marker = L.marker(coords, { icon: customIcon }).addTo(map);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}`;
    marker.bindPopup(`
        <div style="direction:rtl; text-align:right; font-family:inherit; padding:5px;">
            <b style="color:#1e293b; font-size:14px;">${pharmacy.name}</b><br>
            <div style="margin-top:8px;">
                <a href="tel:${pharmacy.phone}" style="background:#10b981; color:white; padding:4px 8px; border-radius:5px; text-decoration:none; font-size:11px; margin-left:5px;">📞 اتصل</a>
                <a href="${googleMapsUrl}" target="_blank" style="background:#3b82f6; color:white; padding:4px 8px; border-radius:5px; text-decoration:none; font-size:11px;">📍 الاتجاهات</a>
            </div>
        </div>`);
    markers.push(marker);
}
    const marker = L.marker(coords, { icon: customIcon }).addTo(map);
    marker.bindPopup(`<div style="direction:rtl; text-align:right;"><b>${pharmacy.name}</b><br>📞 <a href="tel:${pharmacy.phone}">${pharmacy.phone}</a></div>`);
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

function zoomIn() { if (map) map.zoomIn(); }
function zoomOut() { if (map) map.zoomOut(); }
