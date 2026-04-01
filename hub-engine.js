// 1. إعدادات سوبابيس
const supabase = window.supabase.createClient('https://pyxeusrxoizjlihyqhac.supabase.co', 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt');

let userLat = null, userLng = null;
let currentReportType = '';

// 2. دوال التبليغ
window.toggleReportFloat = function() {
    const p = document.getElementById('reportFloatPanel');
    if(p) p.style.display = (p.style.display === 'none' || p.style.display === '') ? 'block' : 'none';
};

window.startReportFloat = function(type) {
    currentReportType = type;
    document.getElementById('reportFloatForm').style.display = 'block';
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            userLat = pos.coords.latitude; userLng = pos.coords.longitude;
            document.getElementById('reportFloatLocation').innerHTML = `📍 ${userLat.toFixed(4)}, ${userLng.toFixed(4)}`;
        });
    }
};

window.addReportFloat = async function() {
    const desc = document.getElementById('reportFloatDesc').value.trim();
    if (!desc) return alert('اكتب الوصف');
    const { error } = await supabase.from('reports').insert([{
        category: currentReportType, description: desc,
        location_lat: userLat, location_lng: userLng
    }]);
    if (!error) { alert('✅ تم الإرسال'); window.toggleReportFloat(); }
};

// 3. دوال الكراء
window.toggleRentalFloat = function() {
    const p = document.getElementById('rentalFloatPanel');
    if(p) p.style.display = (p.style.display === 'none' || p.style.display === '') ? 'block' : 'none';
};
