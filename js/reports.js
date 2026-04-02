// 1. مصفوفة التبليغات المعزولة
window.reportsFloat = JSON.parse(localStorage.getItem('city_reports')) || [];

// 2. دالة التبديل (فتح/إغلاق اللوحة)
window.toggleReportFloat = function() {
    const p = document.getElementById('reportFloatPanel');
    if(p) {
        p.style.display = p.style.display === 'none' ? 'block' : 'none';
        if(p.style.display === 'block') window.showReportFloatList();
    }
};

// 3. دالة حذف بلاغ محدد (بواسطة الـ ID)
window.deleteSpecificReport = function(id) {
    if (!confirm('🗑️ هل تريد حذف هذا البلاغ نهائياً؟')) return;
    window.reportsFloat = window.reportsFloat.filter(r => r.id !== id);
    localStorage.setItem('city_reports', JSON.stringify(window.reportsFloat));
    window.showReportFloatList();
};

// 4. دالة إضافة تعليق/رد على البلاغ
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

// 5. دالة العرض المطور (التصميم التفاعلي)
window.showReportFloatList = function() {
    const container = document.getElementById('reportFloatList');
    if (!container) return;
    
    if (!window.reportsFloat || window.reportsFloat.length === 0) {
        container.innerHTML = '<div style="padding:20px; text-align:center; color:#888;">📭 لا بلاغات حالياً في تاوريرت</div>';
        return;
    }
    
    const icons = { 'pothole': '🕳️', 'light': '💡', 'garbage': '🗑️' };
    
    container.innerHTML = window.reportsFloat.map(r => `
        <div class="report-card" style="border:1px solid #ddd; margin-bottom:12px; padding:12px; border-radius:12px; background:#fff; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <div style="flex:1;">
                    <strong style="font-size:14px; color:#2c3e50;">${icons[r.type] || '⚠️'} ${r.desc}</strong>
                    <div style="font-size:10px; color:#aaa; margin-top:4px;">📅 ${new Date(r.id).toLocaleDateString('ar-MA')}</div>
                </div>
                <div style="display:flex; gap:10px;">
                    <a href="https://www.google.com/maps?q=${r.lat},${r.lng}" target="_blank" style="font-size:18px; text-decoration:none;">📍</a>
                    <button onclick="window.deleteSpecificReport(${r.id})" style="border:none; background:none; color:#e74c3c; cursor:pointer; font-size:18px;">🗑️</button>
                </div>
            </div>
            
            <div style="margin-top:12px; border-top:1px solid #eee; padding-top:10px;">
                <div id="rep-comm-list-${r.id}" style="font-size:12px; color:#555; max-height:100px; overflow-y:auto; margin-bottom:10px;">
                    ${(r.comments || []).map(c => `
                        <div style="background:#f1f2f6; padding:6px; border-radius:8px; margin-bottom:5px;">
                            <span style="display:block;">💬 ${c.text}</span>
                            <small style="color:#999; font-size:9px;">🕒 ${c.time}</small>
                        </div>
                    `).join('')}
                </div>
                
                <div style="display:flex; gap:8px;">
                    <input type="text" id="rep-comm-input-${r.id}" placeholder="أضف رداً أو تحديثاً..." 
                           style="flex:1; border:1px solid #dfe4ea; border-radius:20px; padding:6px 12px; font-size:12px; outline:none;">
                    <button onclick="window.submitReportComment(${r.id})" 
                            style="background:#2ecc71; color:white; border:none; border-radius:20px; padding:6px 15px; font-size:12px; font-weight:bold; cursor:pointer;">إرسال</button>
                </div>
            </div>
        </div>
    `).reverse().join(''); // عرض الأحدث أولاً
};
