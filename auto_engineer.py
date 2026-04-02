import re
import os

def rewrite_project():
    # 1. قراءة الملف الأصلي
    if not os.path.exists('index.html'):
        print("❌ ملف index.html غير موجود!")
        return

    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    print("🔍 جاري تحليل الكود وإعادة الربط الذكي...")

    # 2. مصفوفة الإصلاحات الذكية (Regex)
    # تبديل أي onclick قديم بالصيغة العالمية window.function
    replacements = {
        r'onclick="showReportFloatForm\(': r'onclick="window.showReportFloatForm(',
        r'onclick="toggleReportFloat\(': r'onclick="window.toggleReportFloat(',
        r'onclick="showRentalFloatForm\(': r'onclick="window.showRentalFloatForm(',
        r'onclick="toggleRentalFloat\(': r'onclick="window.toggleRentalFloat(',
        r'onclick="deleteSpecificReport\(': r'onclick="window.deleteSpecificReport(',
        r'onclick="submitReportComment\(': r'onclick="window.submitReportComment('
    }

    for old, new in replacements.items():
        content = re.sub(old, new, content)

    # 3. التأكد من وجود روابط الملفات في نهاية body
    scripts_needed = [
        '<script src="js/reports.js"></script>',
        '<script src="js/rentals.js"></script>'
    ]
    
    for script in scripts_needed:
        if script not in content:
            content = content.replace('</body>', f'    {script}\n</body>')

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)

    print("✅ تم إصلاح index.html بالكامل!")

    # 4. تحديث الملفات البرمجية لتكون "مستعدة للعمل"
    # سنقوم بدمج دالة التشغيل التلقائي في ملف التبليغات
    if os.path.exists('js/reports.js'):
        with open('js/reports.js', 'a', encoding='utf-8') as f:
            f.write("\n// تشغيل تلقائي\nwindow.showReportFloatList();\n")
            
    print("🚀 المشروع الآن جاهز بنسبة 100% للعمل.")

if __name__ == "__main__":
    rewrite_project()
