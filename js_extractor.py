def extract_js_functions():
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            content = f.read()

        # البحث عن الدوال التي ترسم البطاقات وتضيف الأزرار
        # سنبحث عن الكلمات المفتاحية التي تظهر في الأزرار
        search_terms = ['share', 'report', 'rent', 'مشاركة', 'تبليغ']
        lines = content.split('\n')
        
        print("\n🔍 --- فحص محرك الأزرار في JavaScript --- \n")
        
        for i, line in enumerate(lines):
            if any(term in line.lower() for term in search_terms) and i > 100:
                start = max(100, i - 5)
                end = min(len(lines), i + 10)
                print(f"📍 سطر {i+1}:")
                for j in range(start, end):
                    print(f"{j+1}: {lines[j]}")
                print("-" * 30)

    except Exception as e:
        print(f"❌ خطأ: {e}")

if __name__ == "__main__":
    extract_js_functions()
