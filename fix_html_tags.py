import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# تصحيح أزرار التبليغ الثلاثة
content = content.replace("showReportFloatForm('pothole')", "window.showReportFloatForm('pothole')")
content = content.replace("showReportFloatForm('light')", "window.showReportFloatForm('light')")
content = content.replace("showReportFloatForm('garbage')", "window.showReportFloatForm('garbage')")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ تم تحديث روابط الأزرار في HTML!")
