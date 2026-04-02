import re

def upgrade():
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. إضافة دالة الحذف والتعليق
        extra_functions = """
function deleteReport(id) {
    if (confirm('هل تريد حذف هذا البلاغ؟')) {
        reportsFloat = reportsFloat.filter(r => r.id !== id);
        localStorage.setItem('city_reports', JSON.stringify(reportsFloat));
        showReportFloatList();
    }
}

function addReportComment(id) {
    let input = document.getElementById(`comment-input-${id}`);
    let comment = input.value.trim();
    if (!comment) return;
    
    let report = reportsFloat.find(r => r.id === id);
    if (!report.comments) report.comments = [];
    report.comments.push({ text: comment, date: new Date().toLocaleTimeString('ar-MA') });
    
    localStorage.setItem('city_reports', JSON.stringify(reportsFloat));
    input.value = '';
    showReportFloatList();
}
"""

        # 2. تحديث دالة العرض (showReportFloatList)
        new_render_logic = """
function showReportFloatList() {
    let c = document.getElementById('reportFloatList');
    if (!c) return;
    if (reportsFloat.length === 0) { c.innerHTML = '<div class="card">📭 لا بلاغات</div>'; return; }
    let typeIcon = { 'pothole': '🕳️', 'light': '💡', 'garbage': '🗑️' };
    
    c.innerHTML = reportsFloat.map(r => `
        <div class="float-item" style="border-bottom: 1px solid #eee; padding: 10px; flex-direction: column; align-items: flex-start;">
            <div style="display: flex; justify-content: space-between; width: 100%;">
                <span style="font-weight: bold;">${typeIcon[r.type]} ${r.desc}</span>
                <div>
                    <a href="https://www.google.com/maps?q=${r.lat},${r.lng}" target="_blank" style="margin-left: 10px;">🗺️</a>
                    <button onclick="deleteReport(${r.id})" style="background:none; border:none; color:red; cursor:pointer;"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div class="comments-area" style="width: 100%; margin-top: 8px; font-size: 0.85em;">
                <div id="comments-list-${r.id}" style="color: #666; max-height: 60px; overflow-y: auto;">
                    ${(r.comments || []).map(com => `<div>💬 ${com.text} <small>(${com.date})</small></div>`).join('')}
                </div>
                <div style="display: flex; margin-top: 5px;">
                    <input type="text" id="comment-input-${r.id}" placeholder="أضف تعليقاً..." style="flex: 1; border: 1px solid #ddd; border-radius: 4px; padding: 2px 5px;">
                    <button onclick="addReportComment(${r.id})" style="background: #6366f1; color: white; border: none; border-radius: 4px; margin-right: 5px; padding: 2px 8px;">إرسال</button>
                </div>
            </div>
        </div>
    `).join('');
}
"""
        # استبدال الدالة القديمة وإضافة الدوال الجديدة
        content = re.sub(r"function showReportFloatList\(\) \{[\s\S]*?\}", new_render_logic + extra_functions, content)

        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print("✅ تم ترقية قسم التبليغات بنجاح يا رفيقي!")

    except Exception as e:
        print(f"❌ خطأ: {e}")

if __name__ == "__main__":
    upgrade()
