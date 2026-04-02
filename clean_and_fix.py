import re

def clean():
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. إزالة كل النسخ القديمة والمكررة من الدوال الثلاث
        # سنبحث عن الدوال ونحذفها تماماً لنعيد كتابتها مرة واحدة فقط
        content = re.sub(r"function deleteSpecificReport\(id\) \{[\s\S]*?\}", "", content)
        content = re.sub(r"function submitReportComment\(id\) \{[\s\S]*?\}", "", content)
        content = re.sub(r"function showReportFloatList\(\) \{[\s\S]*?\}", "", content)

        # 2. تعريف النسخة النهائية والوحيدة (النسخة العالمية Safe Version)
        final_logic = """
function deleteSpecificReport(id) {
    if (!confirm('هل تريد حذف هذا البلاغ؟')) return;
    reportsFloat = reportsFloat.filter(r => r.id !== id);
    localStorage.setItem('city_reports', JSON.stringify(reportsFloat));
    showReportFloatList();
}

function submitReportComment(id) {
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
}

function showReportFloatList() {
    const container = document.getElementById('reportFloatList');
    if (!container) return;
    if (!reportsFloat || reportsFloat.length === 0) {
        container.innerHTML = '<div style="padding:15px; text-align:center; color:#888;">📭 لا بلاغات حالياً</div>';
        return;
    }
    const icons = { 'pothole': '🕳️', 'light': '💡', 'garbage': '🗑️' };
    container.innerHTML = reportsFloat.map(r => `
        <div style="border:1px solid #eee; margin-bottom:12px; padding:12px; border-radius:10px; background:#fff; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <strong style="font-size:14px;">${icons[r.type] || '⚠️'} ${r.desc}</strong>
                <div style="display:flex; gap:12px;">
                    <a href="https://www.google.com/maps?q=${r.lat},${r.lng}" target="_blank" style="text-decoration:none;">📍</a>
                    <button onclick="deleteSpecificReport(${r.id})" style="color:#ff4d4d; border:none; background:none; cursor:pointer; font-size:16px;">🗑️</button>
                </div>
            </div>
            <div style="background:#f8f9fa; padding:8px; border-radius:6px; border:1px solid #f0f0f0;">
                <div id="rep-comm-list-${r.id}" style="font-size:12px; color:#555; max-height:80px; overflow-y:auto; margin-bottom:8px;">
                    ${(r.comments || []).map(c => `<div style="border-bottom:1px dashed #eee; padding:3px 0;">💬 ${c.text} <small style="float:left; color:#aaa;">${c.time}</small></div>`).join('')}
                </div>
                <div style="display:flex; gap:6px;">
                    <input type="text" id="rep-comm-input-${r.id}" placeholder="اكتب رداً..." style="flex:1; border:1px solid #ddd; border-radius:15px; padding:4px 12px; font-size:12px; outline:none;">
                    <button onclick="submitReportComment(${r.id})" style="background:#2ecc71; color:white; border:none; border-radius:15px; padding:4px 12px; font-size:12px; cursor:pointer;">نشر</button>
                </div>
            </div>
        </div>
    `).join('');
}
"""
        # 3. حقن الكود النظيف في نهاية السكربت
        if '</script>' in content:
            parts = content.rsplit('</script>', 1)
            content = parts[0] + final_logic + '</script>' + parts[1]
            
        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print("✅ تم تنظيف التكرارات وحقن النسخة النهائية بنجاح!")

    except Exception as e:
        print(f"❌ خطأ: {e}")

if __name__ == "__main__":
    clean()
