import re

def extract_share_buttons():
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            content = f.read()

        # البحث عن أي سطر يحتوي على كلمة مشاركة أو أيقونة share
        # واستخراج 5 أسطر قبلها و 5 أسطر بعدها لنفهم السياق
        lines = content.split('\n')
        found = False
        
        print("\n🔍 --- استحضار أزرار المشاركة المتاحة في Taourirt Hub --- \n")
        
        for i, line in enumerate(lines):
            if 'fa-share' in line or 'مشاركة' in line:
                found = True
                start = max(0, i - 3)
                end = min(len(lines), i + 4)
                
                print(f"📍 [الموضع في السطر {i+1}]:")
                print("-" * 40)
                for j in range(start, end):
                    prefix = ">>> " if j == i else "    "
                    print(f"{prefix}{lines[j].strip()}")
                print("-" * 40 + "\n")
        
        if not found:
            print("❌ لم يتم العثور على أي أزرار مشاركة في الملف.")

    except Exception as e:
        print(f"❌ خطأ: {e}")

if __name__ == "__main__":
    extract_share_buttons()
