import re

def perform_upgrade():
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. تحديث دالة عرض التبليغات لتشمل الوصف الكامل، الحذف، والتعليقات
        new_render_logic = """
function showReportFloatList() {
    let c = document.getElementById('reportFloatList');
    if (!c) return;
    if (!reportsFloat || reportsFloat.length === 0) { c.innerHTML = '<div class="card">📭 لا بلاغات حالياً</div>'; return; }
    let typeIcon = { 'pothole': '🕳️', 'light': '💡', 'garbage': '🗑️' };
    
    c.innerHTML = reportsFloat.map(r => `
        <div class="float-item" style="border-bottom: 1px solid #eee; padding: 12px; display: block; background: #fff; margin-bottom: 8px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                    <span style="font-weight: bold; color: #333; display: block; margin-bottom: 5px;">${typeIcon[r.type] || '⚠️'} ${r.desc}</span>
                    <small style="color: #888; font-size: 10px;">${r.date || ''}</small>
                </div>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <a href="https://www.google.com/maps?q=${r.lat},${r.lng}" target="_blank" style="font-size: 18px; text-decoration: none;">📍</a>
                    <button onclick="deleteReport(${r.id})" style="background:none; border:none; color:#e74c3c; cursor:pointer; font-size: 16px;"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
            <div style="margin-top: 10px; background: #fdfdfd; border: 1px solid #f0f0f0; padding: 8px; border-radius: 6px;">
                <div id="comments-list-${r.id}" style="font-size: 12px; color: #444; max-height: 100px; overflow-y: auto; margin-bottom: 8px;">
                    ${(r.comments || []).map(com => `<div style="padding: 4px 0; border-bottom: 1px dotted #eee;"><strong>👤</strong> ${com.text} <small style="color:#999; font-size:9px;">${com.date}</small></div>`).join('')}
                </div>
                <div style="display: flex; gap: 5px;">
                    <input type="text" id="comment-input-${r.id}" placeholder="اكتب تعليقاً..." style="flex: 1; font-size: 12px; border: 1px solid #ddd; border-radius: 20px; padding: 5px 12px; outline: none;">
                    <button onclick="addReportComment(${r.id})" style="background: #27ae60; color: white; border: none; font-size: 12px; border-radius: 20px; padding: 5px 15px; cursor: pointer;">نشر</button>
                </div>
            </div>
        </div>
    `).join('');
}
"""
        # 2. إضافة الدوال الجديدة في نهاية السكربت
        new_functions = """
function deleteReport(id) {
    if (confirm('هل تريد حذف هذا البلاغ نهائياً؟')) {
        reportsFloat = reportsFloat.filter(r => r.id !== id);
        localStorage.setItem('city_reports', JSON.stringify(reportsFloat));
        showReportFloatList();
    }
}

function addReportComment(id) {
    let input = document.getElementById(`comment-input-${id}`);
    if(!input) return;
    let commentText = input.value.trim();
    if (!commentText) return;
    
    let reportIndex = reportsFloat.findIndex(r => r.id === id);
    if (reportIndex === -1) return;
    
    if (!reportsFloat[reportIndex].comments) reportsFloat[reportIndex].comments = [];
    reportsFloat[reportIndex].comments.push({
        text: commentText,
        date: new Date().toLocaleTimeString('ar-MA', {hour: '2-digit', minute:'2-digit'})
    });
    
    localStorage.setItem('city_reports', JSON.stringify(reportsFloat));
    input.value = '';
    showReportFloatList();
}
"""
        # استبدال الدالة القديمة
        content = re.sub(r"function showReportFloatList\(\) \{[\s\S]*?\}", new_render_logic, content)
        
        # حقن الدوال الجديدة قبل نهاية السكربت
        if '</script>' in content:
            parts = content.rsplit('</script>', 1)
            content = parts[0] + new_functions + '</script>' + parts[1]

        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print("✅ تم التحديث الجراحي بنجاح! جرب الرفع الآن.")

    except Exception as e:
        print(f"❌ خطأ: {e}")

if __name__ == "__main__":
    perform_upgrade()
