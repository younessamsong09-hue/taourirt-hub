// تأكد من أن المصفوفة عالمية
if (!window.reportsFloat) {
    window.reportsFloat = JSON.parse(localStorage.getItem('city_reports')) || [];
}

// دالة الحذف العالمية
window.deleteSpecificReport = function(id) {
    if (!confirm('هل تريد حذف هذا البلاغ؟')) return;
    window.reportsFloat = window.reportsFloat.filter(r => r.id !== id);
    localStorage.setItem('city_reports', JSON.stringify(window.reportsFloat));
    window.showReportFloatList();
};

// دالة التعليق العالمية
window.submitReportComment = function(id) {
    const input = document.getElementById(`rep-comm-input-${id}`);
    if (!input || !input.value.trim()) return;
    
    const report = window.reportsFloat.find(r => r.id === id);
    if (!report) return;
    
    if (!report.comments) report.comments = [];
    report.comments.push({
        text: input.value.trim(),
        time: new Date().toLocaleTimeString('ar-MA', {hour: '2-digit', minute:'2-digit'})
    });
    
    localStorage.setItem('city_reports', JSON.stringify(window.reportsFloat));
    input.value = '';
    window.showReportFloatList();
};

// دالة العرض العالمية
window.showReportFloatList = function() {
    const container = document.getElementById('reportFloatList');
    if (!container) return;
    
    if (!window.reportsFloat || window.reportsFloat.length === 0) {
        container.innerHTML = '<div style="padding:15px; text-align:center; color:#999;">📭 لا يوجد بلاغات حالياً</div>';
        return;
    }
    
    const icons = { 'pothole': '🕳️', 'light': '💡', 'garbage': '🗑️' };
    
    container.innerHTML = window.reportsFloat.map(r => `
        <div style="border:1px solid #eee; margin-bottom:10px; padding:12px; border-radius:10px; background:#fff; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="font-size:14px;">${icons[r.type] || '⚠️'} ${r.desc}</strong>
                <div style="display:flex; gap:12px;">
                    <a href="https://www.google.com/maps?q=${r.lat},${r.lng}" target="_blank" style="text-decoration:none;">📍</a>
                    <button onclick="window.deleteSpecificReport(${r.id})" style="border:none; background:none; color:#e74c3c; cursor:pointer; font-size:16px;">🗑️</button>
                </div>
            </div>
            <div style="margin-top:10px; background:#f9f9f9; padding:8px; border-radius:6px; border:1px solid #f0f0f0;">
                <div id="rep-comm-list-${r.id}" style="font-size:12px; color:#666; max-height:80px; overflow-y:auto; margin-bottom:8px;">
                    ${(r.comments || []).map(c => `<div style="border-bottom:1px dashed #ddd; padding:4px 0;">💬 ${c.text} <small style="float:left; color:#bbb;">${c.time}</small></div>`).join('')}
                </div>
                <div style="display:flex; gap:6px;">
                    <input type="text" id="rep-comm-input-${r.id}" placeholder="اكتب تعليقاً..." style="flex:1; border:1px solid #ddd; border-radius:15px; padding:4px 10px; font-size:11px; outline:none;">
                    <button onclick="window.submitReportComment(${r.id})" style="background:#2ecc71; color:white; border:none; border-radius:15px; padding:4px 10px; font-size:11px; cursor:pointer;">نشر</button>
                </div>
            </div>
        </div>
    `).join('');
};

// تشغيل القائمة تلقائياً عند تحميل الملف لضمان ظهور البيانات
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.showReportFloatList === 'function') {
        window.showReportFloatList();
    }
});

window.toggleReportFloat = function() {
    let p = document.getElementById('reportFloatPanel');
    if(p) {
        p.style.display = p.style.display === 'none' ? 'block' : 'none';
        if(p.style.display === 'block') window.showReportFloatList();
    }
};
