const supabase = window.supabase.createClient('https://pyxeusrxoizjlihyqhac.supabase.co', 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt');

let userLat = null, userLng = null;
let currentReportType = '';

// --- جلب التبليغات (تعديل category إلى type) ---
window.fetchLatestReports = async function() {
    const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    const container = document.getElementById('reportFloatList');
    if (error || !container) return;

    const icons = { 'pothole': '🕳️', 'light': '💡', 'garbage': '🗑️' };
    
    container.innerHTML = data.map(r => `
        <div class="float-item" style="border-bottom: 1px solid #eee; padding: 8px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${icons[r.type] || '⚠️'} ${r.description.substring(0, 25)}...</span>
                <span style="font-size: 0.7em; background: #f0f0f0; padding: 2px 6px; border-radius: 10px;">
                    ${new Date(r.created_at).toLocaleDateString('ar-MA')}
                </span>
            </div>
        </div>
    `).join('') || '<div class="float-item">لا توجد تبليغات حالياً</div>';
};

window.toggleReportFloat = function() {
    const p = document.getElementById('reportFloatPanel');
    if(p) {
        const isOpening = (p.style.display === 'none' || p.style.display === '');
        p.style.display = isOpening ? 'block' : 'none';
        if (isOpening) window.fetchLatestReports();
    }
};

window.startReportFloat = function(type) {
    currentReportType = type;
    document.getElementById('reportFloatForm').style.display = 'block';
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            userLat = pos.coords.latitude; userLng = pos.coords.longitude;
            const loc = document.getElementById('reportFloatLocation');
            if(loc) loc.innerHTML = `📍 ${userLat.toFixed(4)}, ${userLng.toFixed(4)}`;
        });
    }
};

// --- الإرسال (تعديل category إلى type ليتطابق مع SQL) ---
window.addReportFloat = async function() {
    const desc = document.getElementById('reportFloatDesc').value.trim();
    if (!desc) return alert('يرجى وصف المشكلة');
    
    const { error } = await supabase.from('reports').insert([{
        type: currentReportType, // قمنا بتغييرها من category إلى type
        description: desc,
        location_lat: userLat,
        location_lng: userLng,
        status: 'pending'
    }]);

    if (!error) {
        alert('✅ تم الإرسال بنجاح لـ Taourirt Hub');
        document.getElementById('reportFloatDesc').value = '';
        document.getElementById('reportFloatForm').style.display = 'none';
        window.fetchLatestReports();
    } else {
        alert('❌ خطأ في القاعدة: ' + error.message);
    }
};

window.toggleRentalFloat = function() {
    const p = document.getElementById('rentalFloatPanel');
    if(p) p.style.display = (p.style.display === 'none' || p.style.display === '') ? 'block' : 'none';
};
