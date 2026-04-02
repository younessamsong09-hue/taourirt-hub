def extract_reports():
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            content = f.read()
        
        lines = content.split('\n')
        print("\n🔍 --- تحليل نظام التبليغات الحالي --- \n")
        
        # البحث عن الدالة المسؤولة عن عرض التبليغات (غالباً فيها كلمة report)
        for i, line in enumerate(lines):
            if 'function showReports' in line or 'function renderReports' in line or 'displayReports' in line:
                for j in range(i, min(i + 60, len(lines))):
                    print(f"{j+1}: {lines[j]}")
                break
    except Exception as e:
        print(f"❌ خطأ: {e}")

if __name__ == "__main__":
    extract_reports()
