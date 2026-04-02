import re

def extract_cards():
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            content = f.read()

        # البحث عن كلاسات البطاقات المشهورة (card, post, item)
        patterns = ['class="card"', 'class="post"', 'class="item"', '<div id="']
        
        print("\n🔍 --- فحص هيكل البطاقات في Taourirt Hub --- \n")
        
        lines = content.split('\n')
        # سنعرض أول 100 سطر لنفهم التنسيق الجديد للموقع
        for i in range(min(100, len(lines))):
            print(f"{i+1}: {lines[i]}")
            
    except Exception as e:
        print(f"❌ خطأ: {e}")

if __name__ == "__main__":
    extract_cards()
