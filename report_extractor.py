def extract_report_logic():
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            content = f.read()

        lines = content.split('\n')
        print("\n🔍 --- تحليل دالة عرض التبليغات في Taourirt Hub --- \n")
        
        # البحث عن بداية دالة عرض التبليغات
        start_line = 0
        for i, line in enumerate(lines):
            if 'function showRentalFloatList' in line or 'function renderReports' in line or 'displayReports' in line:
                start_line = i
                # طباعة 40 سطر من بداية الدالة لفهم كيف تبنى البطاقة
                for j in range(start_line, min(start_line + 50, len(lines))):
                    print(f"{j+1}: {lines[j]}")
                print("-" * 50)
                break
                
        if start_line == 0:
            print("❌ لم أجد دالة العرض بالأسماء المعتادة، سأبحث عن innerHTML في السكربت...")
            for i, line in enumerate(lines):
                if 'innerHTML' in line and i > 585:
                    print(f"{i+1}: {line.strip()}")

    except Exception as e:
        print(f"❌ خطأ: {e}")

if __name__ == "__main__":
    extract_report_logic()
