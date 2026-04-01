let userLat = null, userLng = null;
let currentReportType = '';

function toggleReportFloat() {
    const p = document.getElementById('reportFloatPanel');
    if(p) p.style.display = (p.style.display === 'none' || p.style.display === '') ? 'block' : 'none';
}

function startReportFloat(type) {
    currentReportType = type;
    const form = document.getElementById('reportFloatForm');
    if(form) form.style.display = 'block';
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            userLat = pos.coords.latitude; userLng = pos.coords.longitude;
            const loc = document.getElementById('reportFloatLocation');
            if(loc) loc.innerHTML = `📍 ${userLat.toFixed(4)}, ${userLng.toFixed(4)}`;
        });
    }
}

async function addReportFloat() {
    const desc = document.getElementById('reportFloatDesc').value.trim();
    if (!desc) return alert('اكتب الوصف');
    try {
        const { error } = await supabase.from('reports').insert([{
            category: currentReportType, description: desc,
            location_lat: userLat, location_lng: userLng
        }]);
        if (error) throw error;
        alert('✅ تم الإرسال بنجاح');
        toggleReportFloat();
    } catch (e) { alert('❌ خطأ: ' + e.message); }
}
