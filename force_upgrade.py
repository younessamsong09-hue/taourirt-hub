import sys

def inject():
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            content = f.read()

        # الكود الجديد بالكامل (الدوال ونظام العرض المطور)
        new_logic = """
// --- نظام التبليغات المطور (يوسف & Gemini) ---
function deleteReport(id) {
    if (confirm('هل تريد حذف هذا البلاغ يا ابن تاوريرت؟')) {
        reportsFloat = reportsFloat.filter(r => r.id !== id);
        localStorage.setItem('city_reports', JSON.stringify(reportsFloat));
        showReportFloatList();
    }
}

function addReportComment(id) {
    let input = document.getElementById(`comment-input-${id}`);
    if(!input) return;
    let comment = input.value.trim();
    if (!comment) return;
    let report = reportsFloat.find(r => r.id === id);
    if (!report.comments) report.comments = [];
    report.comments.push({ text: comment, date: new Date().toLocaleTimeString('ar-MA') });
    localStorage.setItem('city_reports', JSON.stringify(reportsFloat));
    input.value = '';
    showReportFloatList();
}

function showReportFloatList() {
    let c = document.getElementById('reportFloatList');
    if (!c) return;
    if (!reportsFloat || reportsFloat.length === 0) { c.innerHTML = '<div class="card">📭 لا بلاغات حالياً</div>'; return; }
    let typeIcon = { 'pothole': '🕳️', 'light': '💡', 'garbage': '🗑️' };
    
    c.innerHTML = reportsFloat.map(r => `
        <div class="float-item" style="border-bottom: 1px solid #eee; padding: 10px; display: block; background: #fff; margin-bottom: 5px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: bold; font-size: 14px;">${typeIcon[r.type] || '⚠️'} ${r.desc}</span>
                <div style="display: flex; gap: 10px;">
                    <a href="https://www.google.com/maps?q=${r.lat},${r.lng}" target="_blank">📍</a>
                    <button onclick="deleteReport(${r.id})" style="background:none; border:none; color:#ff4d4d; cursor:pointer;"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
            <div style="margin-top: 10px; background: #f8f9fa; padding: 5px; border-radius: 5px;">
                <div id="comments-list-${r.id}" style="font-size: 12px; color: #555; max-height: 80px; overflow-y: auto;">
                    ${(r.comments || []).map(com => `<div style="border-bottom: 1px dashed #ddd; padding: 2px;">💬 ${com.text}</div>`).join('')}
                </div>
                <div style="display: flex; margin-top: 5px; gap: 5px;">
                    <input type="text" id="comment-input-${r.id}" placeholder="اكتب تعليقاً..." style="flex: 1; font-size: 11px; border: 1px solid #ccc; border-radius: 4px; padding: 3px;">
                    <button onclick="addReportComment(${r.id})" style="background: #28a745; color: white; border: none; font-size: 11px; border-radius: 4px; padding: 3px 8px;">نشر</button>
                </div>
            </div>
        </div>
    `).join('');
}
// --- نهاية الترقية ---
"""
        # سنقوم بوضع الكود الجديد قبل إغلاق وسم السكربت الأخير مباشرة
        if '</script>' in content:
            parts = content.rsplit('</script>', 1)
            updated_content = parts[0] + new_logic + '</script>' + parts[1]
            
            with open('index.html', 'w', encoding='utf-8') as f:
                f.write(updated_content)
            print("🚀 تم حقن الكود الجديد بنجاح في نهاية ملف السكربت!")
        else:
            print("❌ لم أجد وسم </script> في الملف!")

    except Exception as e:
        print(f"❌ خطأ فني: {e}")

if __name__ == "__main__":
    inject()
