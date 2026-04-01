// 1. الربط
const supabase = window.supabase.createClient('https://pyxeusrxoizjlihyqhac.supabase.co', 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt');

// 2. دوال التبليغ (إعادة تعريف لتطغى على القديم)
window.toggleReportFloat = function() {
    const p = document.getElementById('reportFloatPanel');
    if(p) p.style.display = (p.style.display === 'none' || p.style.display === '') ? 'block' : 'none';
};

window.startReportFloat = function(type) {
    window.currentReportType = type;
    document.getElementById('reportFloatForm').style.display = 'block';
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            window.userLat = pos.coords.latitude; window.userLng = pos.coords.longitude;
            document.getElementById('reportFloatLocation').innerHTML = `📍 ${window.userLat.toFixed(4)}, ${window.userLng.toFixed(4)}`;
        });
    }
};

window.addReportFloat = async function() {
    const desc = document.getElementById('reportFloatDesc').value.trim();
    if (!desc) return alert('اكتب الوصف');
    const { error } = await supabase.from('reports').insert([{
        category: window.currentReportType, description: desc,
        location_lat: window.userLat, location_lng: window.userLng
    }]);
    if (!error) { alert('✅ تم الإرسال لـ Taourirt Hub'); window.toggleReportFloat(); }
    else { alert('خطأ: ' + error.message); }
};

// 3. دوال الكراء (نحافظ على عملها القديم مؤقتاً لضمان الثبات)
window.toggleRentalFloat = function() {
    const p = document.getElementById('rentalFloatPanel');
    if(p) p.style.display = (p.style.display === 'none' || p.style.display === '') ? 'block' : 'none';
};
