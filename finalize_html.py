import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# حذف منطقة السكربتات القديمة (بين let reportsFloat و أخر دالة للعقارات)
# سنستبدلها بروابط الملفات الجديدة
scripts = '<script src="js/reports.js"></script>\n<script src="js/rentals.js"></script>\n'

if '</body>' in content:
    content = content.replace('</body>', f'{scripts}</body>')
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("✅ تم ربط الملفات الجديدة بـ index.html بنجاح!")
