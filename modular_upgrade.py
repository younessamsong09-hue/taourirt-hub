import re

def upgrade_reports_only():
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. الدوال الجديدة (مستقلة تماماً بأسماء فريدة لعدم التداخل)
        new_logic = """
function deleteSpecificReport(id) {
    if (confirm('هل تريد حذف هذا البلاغ؟')) {
        reportsFloat = reportsFloat.filter(r => r.id !== id);
        localStorage.setItem('city_reports', JSON.stringify(reportsFloat));
        showReportFloatList();
    }
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
    if (reportsFloat.length === 0) { 
        container.innerHTML = '<div class="card">📭 لا بلاغات حالياً</div>'; 
        return; 
    }
    
    const icons = { 'pothole': '🕳️', 'light': '💡', 'garbage': '🗑️' };
    
    container.innerHTML = reportsFloat.map(r => `
        <div class="report-item" style="border-bottom:1px solid #eee; padding:10px; margin-bottom:10px; background:#fff; border-radius:8px;">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <span style="font-size:14px; font-weight:bold;">${icons[r.type] || '⚠️'} ${r.desc}</span>
                <div style="display:flex; gap:8px;">
                    <a href="https://www.google.com/maps?q=${r.lat},${r.lng}" target="_blank">📍</a>
                    <button onclick="deleteSpecificReport(${r.id})" style="border:none; background:none; color:red; cursor:pointer;"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div style="margin-top:8px; background:#f9f9f9; padding:5px; border-radius:4px;">
                <div id="rep-comm-list-${r.id}" style="font-size:11px; color:#666; max-height:50px; overflow-y:auto;">
                    ${(r.comments || []).map(c => `<div style="margin-bottom:2px;">💬 ${c.text} <small>(${c.time})</small></div>`).join('')}
                </div>
                <div style="display:flex; margin-top:5px; gap:4px;">
                    <input type="text" id="rep-comm-input-${r.id}" placeholder="تعليق..." style="flex:1; font-size:11px; border:1px solid #ddd; border-radius:4px; padding:2px;">
                    <button onclick="submitReportComment(${r.id})" style="font-size:10px; background:#28a745; color:white; border:none; border-radius:4px; padding:2px 6px;">نشر</button>
                </div>
            </div>
        </div>
    `).join('');
}
"""
        # 2. استبدال دالة التبليغات القديمة (الأسطر 812-820) بالمنطق الجديد بالكامل
        pattern = r"function showReportFloatList\(\) \{[\s\S]*?\}"
        content = re.sub(pattern, new_logic, content)

        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print("✅ تم تفكيك الأكواد بنجاح. قسم التبليغات الآن مستقل ومطور.")

    except Exception as e:
        print(f"❌ حدث خطأ أثناء التفكيك: {e}")

if __name__ == "__main__":
    upgrade_reports_only()
