// ========== خريطة تاوريرت المتطورة مع Supabase ==========

let map, markers = [], userMarker = null, userLocation = null;
let supabaseClient = null;
let pharmaciesData = [];
let marketsData = [];

// بيانات Supabase
const SUPABASE_URL = 'https://pyxeusrxoizjlihyqhac.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt';

// تهيئة Supabase
async function initMapSupabase() {
    try {
        if (typeof supabase === 'undefined') {
            await new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
                script.onload = resolve;
                document.head.appendChild(script);
            });
        }
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase متصل - الخريطة');
        await loadMapData();
    } catch (err) {
        console.error('خطأ في Supabase:', err);
    }
}

// تحميل بيانات الصيدليات والأسواق
async function loadMapData() {
    if (!supabaseClient) return;
    
    try {
        // تحميل الصيدليات
        const { data: pharmacies, error: phError } = await supabaseClient
            .from('pharmacies')
            .select('*')
            .order('name');
        
        if (!phError && pharmacies) {
            pharmaciesData = pharmacies;
            console.log(`✅ تم تحميل ${pharmacies.length} صيدلية`);
        }
        
        // تحميل الأسواق
        const { data: markets, error: mError } = await supabaseClient
            .from('markets')
            .select('*')
            .order('name');
        
        if (!mError && markets) {
            marketsData = markets;
            console.log(`✅ تم تحميل ${markets.length} سوق`);
        }
        
        // تحديث الخريطة
        updateMapWithData();
        
    } catch (err) {
        console.error('خطأ في تحميل البيانات:', err);
    }
}

// تهيئة الخريطة
function initMap() {
    if (map) return;
    
    map = L.map('map').setView([34.4167, -2.8833], 13);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap',
        subdomains: 'abcd'
    }).addTo(map);
    
    // إضافة أزرار التحكم
    addMapControls();
}

// إضافة أزرار تحكم
function addMapControls() {
    const controlDiv = document.createElement('div');
    controlDiv.className = 'map-controls';
    controlDiv.innerHTML = `
        <button onclick="zoomIn()" class="map-btn"><i class="fas fa-plus"></i></button>
        <button onclick="zoomOut()" class="map-btn"><i class="fas fa-minus"></i></button>
        <button onclick="getUserLocation()" class="map-btn"><i class="fas fa-location-dot"></i></button>
    `;
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) mapContainer.appendChild(controlDiv);
}

// عرض جميع البيانات على الخريطة
function updateMapWithData() {
    if (!map) initMap();
    clearMarkers();
    
    // عرض الصيدليات (أيقونة حمراء)
    pharmaciesData.forEach(pharmacy => {
        if (pharmacy.lat && pharmacy.lng) {
            addMarker(pharmacy, [pharmacy.lat, pharmacy.lng], 'pharmacy');
        }
    });
    
    // عرض الأسواق (أيقونة خضراء)
    marketsData.forEach(market => {
        if (market.lat && market.lng) {
            addMarker(market, [market.lat, market.lng], 'market');
        }
    });
    
    // عرض موقع المستخدم
    if (userLocation) {
        showUserLocation();
    }
}

// إضافة علامة جديدة
function addMarker(item, coords, type) {
    const isPharmacy = type === 'pharmacy';
    const iconColor = isPharmacy ? '#ef4444' : '#10b981';
    const iconIcon = isPharmacy ? 'fa-hospital' : 'fa-store';
    
    const customIcon = L.divIcon({
        html: `<div style="background: ${iconColor}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
            <i class="fas ${iconIcon}" style="color: white; font-size: 14px;"></i>
        </div>`,
        iconSize: [32, 32],
        popupAnchor: [0, -16]
    });
    
    const marker = L.marker(coords, { icon: customIcon }).addTo(map);
    
    const distance = userLocation ? calculateDistance(userLocation, coords) : null;
    const distanceText = distance ? `<br><i class="fas fa-road"></i> ${distance.toFixed(1)} كم` : '';
    
    const directionsLink = `https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}`;
    
    marker.bindPopup(`
        <div style="min-width: 180px; text-align: right;">
            <b><i class="fas ${iconIcon}"></i> ${item.name}</b><br>
            <small><i class="fas fa-location-dot"></i> ${item.address || 'العنوان غير متوفر'}</small><br>
            ${item.phone ? `<a href="tel:${item.phone}" style="color: #3b82f6;"><i class="fas fa-phone"></i> ${item.phone}</a><br>` : ''}
            ${distanceText}
            <hr style="margin: 5px 0;">
            <a href="${directionsLink}" target="_blank" style="color: #10b981; font-size: 12px; text-decoration: none;">
                <i class="fas fa-directions"></i> اتجاهات القيادة
            </a>
        </div>
    `);
    
    markers.push(marker);
}

// مسح العلامات
function clearMarkers() {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
}

// حساب المسافة
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

// الحصول على موقع المستخدم
function getUserLocation() {
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
            showUserLocation();
            updateMapWithData(); // تحديث العلامات مع المسافات
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

// عرض موقع المستخدم
function showUserLocation() {
    if (!userLocation || !map) return;
    
    if (userMarker) map.removeLayer(userMarker);
    
    userMarker = L.marker(userLocation, {
        icon: L.divIcon({
            html: '<div style="background:#3b82f6;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(59,130,246,0.5);"></div>',
            iconSize: [20, 20]
        })
    }).addTo(map);
    
    userMarker.bindPopup('📍 موقعك').openPopup();
    map.setView(userLocation, 14);
}

// تكبير
function zoomIn() { if (map) map.zoomIn(); }

// تصغير
function zoomOut() { if (map) map.zoomOut(); }

// دالة متوافقة مع الكود القديم (للتحديث من main.js)
function updateMap(pharmacies) {
    updateMapWithData();
}

// تهيئة النظام
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initMapSupabase();
});
