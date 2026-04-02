window.reportsFloat = JSON.parse(localStorage.getItem('city_reports')) || [];

window.deleteSpecificReport = function(id) {
    if (!confirm('هل تريد حذف هذا البلاغ؟')) return;
    reportsFloat = reportsFloat.filter(r => r.id !== id);
    localStorage.setItem('city_reports', JSON.stringify(reportsFloat));
    showReportFloatList();
};

window.submitReportComment = function(id) {
    const input = document.getElementById(`rep-comm-input-${id}`);
    if (!input || !input.value.trim()) return;
    const report = reportsFloat.find(r => r.id === id);
    if (!report) return;
    if (!report.comments) report.comments = [];
    report.comments.push({
        text: input.value.trim(),
        time: new Date().toLocaleTimeString('ar-MA', {hour: '2-digit', minute:'2-digit'})
    });
    localStorage.setItem('city_reports', JSON.stringify(reportsFloat));
    input.value = '';
    showReportFloatList();
};

window.showReportFloatList = function() {
    const container = document.getElementById('reportFloatList');
    if (!container) return;
    if (reportsFloat.length === 0) {
        container.innerHTML = '<div style="padding:15px; text-align:center;">📭 لا بلاغات</div>';
        return;
    }
    const icons = { 'pothole': '🕳️', 'light': '💡', 'garbage': '🗑️' };
    container.innerHTML = reportsFloat.map(r => `
        <div style="border:1px solid #eee; margin-bottom:10px; padding:10px; border-radius:8px; background:#fff;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong>${icons[r.type] || '⚠️'} ${r.desc}</strong>
                <div style="display:flex; gap:10px;">
                    <a href="https://www.google.com/maps?q=${r.lat},${r.lng}" target="_blank">📍</a>
                    <button onclick="deleteSpecificReport(${r.id})" style="border:none; background:none; color:red;">🗑️</button>
                </div>
            </div>
            <div style="margin-top:10px; background:#f9f9f9; padding:8px; border-radius:6px;">
                <div id="rep-comm-list-${r.id}" style="font-size:12px; max-height:60px; overflow-y:auto;">
                    ${(r.comments || []).map(c => `<div style="border-bottom:1px dashed #ddd;">💬 ${c.text}</div>`).join('')}
                </div>
                <div style="display:flex; margin-top:5px; gap:5px;">
                    <input type="text" id="rep-comm-input-${r.id}" placeholder="تعليق..." style="flex:1; border:1px solid #ddd; border-radius:4px;">
                    <button onclick="submitReportComment(${r.id})" style="background:#28a745; color:white; border:none; border-radius:4px; padding:2px 8px;">نشر</button>
                </div>
            </div>
        </div>
    `).join('');
};
