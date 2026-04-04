// ========== نظام التبليغ ==========
let currentReportType = '';

window.toggleReportFloat = function() {
    const panel = document.getElementById('reportFloatPanel');
    if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
};
window.startReportFloat = function(type) {
    currentReportType = type;
    document.getElementById('reportFloatForm').style.display = 'block';
    document.querySelector('#reportFloatPanel .float-buttons').style.display = 'none';
};
window.addReportFloat = function() {
    const desc = document.getElementById('reportFloatDesc').value;
    if (!desc) return alert('اكتب الوصف');
    alert(`تم إرسال بلاغ: ${desc} (نوع: ${currentReportType})`);
    // هنا سنضيف ربط Supabase لاحقاً
};
