import re

def rescue():
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. تعريف الكود "المثالي" الذي يجمع التبليغات والعقارات بدون تداخل
        perfect_logic = """
// ==========================================
// 🚨 نظام التبليغات المطور (Taourirt Hub)
// ==========================================
let reportsFloat = JSON.parse(localStorage.getItem('city_reports')) || [];

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
        container.innerHTML = '<div style="padding:15px; text-align:center;">📭 لا بلاغات</div>';
        return;
    }
    const icons = { 'pothole': '🕳️', 'light': '💡', 'garbage': '🗑️' };
    container.innerHTML = reportsFloat.map(r => `
        <div class="report-card" style="border:1px solid #eee; margin-bottom:10px; padding:10px; border-radius:8px; background:#fff;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong>${icons[r.type] || '⚠️'} ${r.desc}</strong>
                <div style="display:flex; gap:10px;">
                    <a href="https://www.google.com/maps?q=${r.lat},${r.lng}" target="_blank">📍</a>
                    <button onclick="deleteSpecificReport(${r.id})" style="border:none; background:none; color:red; cursor:pointer;">🗑️</button>
                </div>
            </div>
            <div style="margin-top:10px; background:#f8f9fa; padding:8px; border-radius:6px;">
                <div id="rep-comm-list-${r.id}" style="font-size:12px; max-height:60px; overflow-y:auto;">
                    ${(r.comments || []).map(c => `<div style="border-bottom:1px dashed #ddd;">💬 ${c.text}</div>`).join('')}
                </div>
                <div style="display:flex; margin-top:5px; gap:5px;">
                    <input type="text" id="rep-comm-input-${r.id}" placeholder="تعليق..." style="flex:1; border:1px solid #ddd; border-radius:4px; padding:2px;">
                    <button onclick="submitReportComment(${r.id})" style="background:#28a745; color:white; border:none; border-radius:4px; padding:2px 8px;">نشر</button>
                </div>
            </div>
        </div>
    `).join('');
}

// ==========================================
// 🏠 نظام العقارات (Rentals) - يبقى كما هو
// ==========================================
let rentalsFloat = JSON.parse(localStorage.getItem('rentals')) || [];
function toggleRentalFloat() {
    let p = document.getElementById('rentalFloatPanel');
    if(p) p.style.display = p.style.display === 'none' ? 'block' : 'none';
    showRentalFloatList();
}
function showRentalFloatList() {
    let c = document.getElementById('rentalFloatList');
    if (!c) return;
    if (rentalsFloat.length === 0) { c.innerHTML = '<div class="card">📭 لا عقارات</div>'; return; }
    c.innerHTML = rentalsFloat.map(r => `<div class="float-item"><span>🏠 ${r.desc}</span></div>`).join('');
}
"""
        # مسح كل شيء بين البداية القديمة والنهاية
        # سنقوم بحذف المنطقة من "let reportsFloat" إلى نهاية "showRentalFloatList"
        # ونضع مكانها الكود المثالي أعلاه.
        
        start_marker = "let reportsFloat ="
        end_marker = "function showRentalFloatForm" # نقطة التوقف قبل الدوال الأخرى
        
        if start_marker in content and end_marker in content:
            before = content.split(start_marker)[0]
            after = content.split(end_marker)[1]
            new_content = before + perfect_logic + "\nfunction showRentalFloatForm" + after
            
            with open('index.html', 'w', encoding='utf-8') as f:
                f.write(new_content)
            print("🚀 تم تنظيف وإعادة بناء المحرك بنجاح!")
        else:
            print("❌ لم أستطع تحديد المنطقة بدقة، نحتاج فحصاً يدوياً.")

    except Exception as e:
        print(f"❌ خطأ: {e}")

if __name__ == "__main__":
    rescue()
