const supabase = window.supabase.createClient('https://pyxeusrxoizjlihyqhac.supabase.co', 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt');

// --- دالة العرض الاحترافي للتبليغات ---
window.fetchLatestReports = async function() {
    const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

    const container = document.getElementById('reportFloatList');
    if (error || !container) return;

    const icons = { 'pothole': '🕳️', 'light': '💡', 'garbage': '🗑️' };
    const statusLabels = { 'pending': '⏳ قيد الانتظار', 'resolved': '✅ تم الإصلاح' };

    container.innerHTML = data.map(r => `
        <div class="report-card" style="background: #fff; border-radius: 8px; padding: 12px; margin-bottom: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-right: 4px solid #e74c3c;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <span style="font-weight: bold; font-size: 1.1em;">${icons[r.type] || '⚠️'} ${r.type === 'pothole' ? 'حفرة' : r.type === 'light' ? 'إنارة' : 'نفايات'}</span>
                <span style="font-size: 0.8em; color: #666;">${new Date(r.created_at).toLocaleDateString('ar-MA')}</span>
            </div>
            <p style="margin: 5px 0; color: #444; font-size: 0.95em; line-height: 1.4;">${r.description || 'لا يوجد وصف متاح'}</p>
            <div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.85em; color: #2ecc71; font-weight: 500;">${statusLabels[r.status] || '⏳ جاري المعالجة'}</span>
                ${r.location_lat ? `<a href="https://www.google.com/maps?q=${r.location_lat},${r.location_lng}" target="_blank" style="text-decoration: none; font-size: 0.8em; color: #3498db;">📍 الموقع</a>` : ''}
            </div>
        </div>
    `).join('') || '<div style="text-align:center; padding:20px; color:#999;">📭 لا توجد بلاغات مسجلة حالياً</div>';
};

// --- باقي الدوال (الإرسال والفتح) ---
window.toggleReportFloat = function() {
    const p = document.getElementById('reportFloatPanel');
    if(p) {
        const isOpening = (p.style.display === 'none' || p.style.display === '');
        p.style.display = isOpening ? 'block' : 'none';
        if (isOpening) window.fetchLatestReports();
    }
};

window.addReportFloat = async function() {
    const desc = document.getElementById('reportFloatDesc').value.trim();
    if (!desc) return alert('يرجى وصف المشكلة');
    
    const { error } = await supabase.from('reports').insert([{
        type: window.currentReportType,
        description: desc,
        location_lat: window.userLat,
        location_lng: window.userLng,
        status: 'pending'
    }]);

    if (!error) {
        alert('✅ تم تسجيل بلاغك بنجاح');
        document.getElementById('reportFloatDesc').value = '';
        document.getElementById('reportFloatForm').style.display = 'none';
        window.fetchLatestReports();
    }
};

window.toggleRentalFloat = function() {
    const p = document.getElementById('rentalFloatPanel');
    if(p) p.style.display = (p.style.display === 'none' || p.style.display === '') ? 'block' : 'none';
};
