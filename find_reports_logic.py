def find_logic():
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            content = f.read()
        
        lines = content.split('\n')
        print("\n🔍 --- البحث عن منطق عرض التبليغات (Reports) --- \n")
        
        # البحث عن الدوال التي تتعامل مع مصفوفة التبليغات
        keywords = ['reportsFloat', 'reportList', 'showReport', 'renderReport']
        
        for i, line in enumerate(lines):
            if any(key in line for key in keywords) and i > 580:
                # طباعة 10 أسطر قبل و 30 بعد لفهم السياق
                start = max(580, i - 5)
                end = min(len(lines), i + 35)
                print(f"📍 موضع محتمل في السطر {i+1}:")
                for j in range(start, end):
                    print(f"{j+1}: {lines[j]}")
                print("-" * 50)
                # نكتفي بأول نتيجة قوية نجدها لتجنب الإطالة
                if 'innerHTML' in line: break

    except Exception as e:
        print(f"❌ خطأ: {e}")

if __name__ == "__main__":
    find_logic()
