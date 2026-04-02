import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. البحث عن دالة فتح لوحة التبليغات وتصحيحها
# سنقوم بحقن دالة التبديل (Toggle) للتبليغات لكي يفتح الزر ويغلق
toggle_logic = """
window.toggleReportFloat = function() {
    let p = document.getElementById('reportFloatPanel');
    if(p) {
        p.style.display = p.style.display === 'none' ? 'block' : 'none';
        if(p.style.display === 'block') window.showReportFloatList();
    }
};
"""

# 2. إضافة الدالة لملف الجافا سكربت
with open('js/reports.js', 'a', encoding='utf-8') as f:
    f.write(toggle_logic)

# 3. التأكد من أن الزر في HTML ينادي الدالة الصحيحة
# سنبحث عن أي زر يحتوي على كلمة report ونتاكد من الـ onclick
content = content.replace('onclick="showReportFloatList()"', 'onclick="toggleReportFloat()"')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ تم ربط زر الفتح والإغلاق بالدالة الجديدة بنجاح!")
