// ========== الخريطة مع Supabase ==========
let map;
let markers = [];
let supabaseMap = null;

const SUPABASE_URL = 'https://pyxeusrxoizjlihyqhac.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt';

// تهيئة Supabase
async function initMapSupabase() {
    if (typeof supabase === 'undefined') {
        await new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }
    supabaseMap = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase - الخريطة');
    await loadAndDisplayMapData();
}

// تحميل وعرض البيانات من Supabase
async function loadAndDisplayMapData() {
    if (!supabaseMap) return;
    try {
        // تحميل الصيدليات
        const { data: pharmacies, error: phError } = await supabaseMap
            .from('pharmacies')
            .select('*');
        if (phError) throw phError;
        
        // تحميل الأسواق
        const { data: markets, error: mError } = await supabaseMap
            .from('markets')
            .select('*');
        if (mError) throw mError;
        
        // عرض على الخريطة
        updateMapWithData(pharmacies || [], markets || []);
    } catch (err) {
        console.error('خطأ في تحميل بيانات الخريطة:', err);
        // عرض بيانات تجريبية في حالة الخطأ (اختياري)
        updateMapWithDemoData();
    }
}

// تحديث الخريطة بالبيانات الحقيقية
function updateMapWithData(pharmacies, markets) {
    if (!map) initMap();
    clearMarkers();
    
    // إضافة الصيدليات (علامات حمراء)
    pharmacies.forEach(p => {
        if (p.lat && p.lng) {
            addMarker(p, 'pharmacy');
        }
    });
    
    // إضافة الأسواق (علامات خضراء)
    markets.forEach(m => {
        if (m.lat && m.lng) {
            addMarker(m, 'market');
        }
    });
    
    console.log(`✅ تم عرض ${pharmacies.length} صيدلية و ${markets.length} سوق`);
}

// بيانات تجريبية احتياطية (إذا فشل الاتصال بـ Supabase)
function updateMapWithDemoData() {
    const demoPharmacies = [
        { id: 1, name: "صيدلية المزينين", lat: 34.41187, lng: -2.89380, address: "شارع محمد الخامس", phone: "0536661111" },
        { id: 2, name: "صيدلية الأندلس", lat: 34.40566, lng: -2.90749, address: "شارع الأندلس", phone: "0536662222" }
    ];
    const demoMarkets = [
        { id: 1, name: "سوق المركز", lat: 34.41670, lng: -2.88330, address: "وسط المدينة", phone: "0536664444" }
    ];
    updateMapWithData(demoPharmacies, demoMarkets);
    console.warn("⚠️ استخدم البيانات التجريبية (فشل الاتصال بـ Supabase)");
}

// تهيئة الخريطة (Leaflet)
function initMap() {
    if (map) return;
    map = L.map('map').setView([34.4167, -2.8833], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap',
        subdomains: 'abcd'
    }).addTo(map);
    console.log("✅ الخريطة جاهزة");
}

// إضافة علامة (Marker) مع نافذة منبثقة
function addMarker(item, type) {
    const iconColor = type === 'pharmacy' ? '#ef4444' : '#10b981';
    const iconHtml = `<div style="background:${iconColor}; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white;">
        <i class="fas ${type === 'pharmacy' ? 'fa-hospital' : 'fa-store'}" style="color:white; font-size:14px;"></i>
    </div>`;
    const icon = L.divIcon({ html: iconHtml, iconSize: [30, 30], popupAnchor: [0, -15] });
    const marker = L.marker([item.lat, item.lng], { icon }).addTo(map);
    
    // محتوى النافذة المنبثقة
    let popupContent = `<b>${item.name}</b><br>`;
    if (item.address) popupContent += `${item.address}<br>`;
    if (item.phone) popupContent += `<a href="tel:${item.phone}">اتصل</a>`;
    else popupContent += `رقم غير متوفر`;
    marker.bindPopup(popupContent);
    
    markers.push(marker);
}

// مسح جميع العلامات
function clearMarkers() {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
}

// دوال إضافية (تكبير، تصغير، موقع المستخدم)
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

// إضافة أزرار التحكم (إذا لم تكن موجودة)
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

// بدء الخريطة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initMapSupabase();
    addMapControls();
});
