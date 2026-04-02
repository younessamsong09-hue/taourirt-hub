import google.generativeai as genai

# إعداد المفتاح الخاص بك
genai.configure(api_key="AIzaSyD56GDHwvGlPmIW-anzefd4Fwc7Eg3lNi8")

def fix():
    try:
        # البحث عن الموديل المتاح تلقائياً
        available_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        if not available_models:
            print("❌ لم يتم العثور على موديلات تدعم التوليد في حسابك.")
            return
        
        target_model = available_models[0] # سيختار أول موديل متاح (مثل gemini-1.5-flash)
        print(f"🚀 تم العثور على الموديل: {target_model} .. جاري العمل.")
        
        model = genai.GenerativeModel(target_model)
        
        with open('index.html', 'r', encoding='utf-8') as f:
            original_code = f.read()

        prompt = f"""
        Act as an expert web developer.
        Analyze this HTML for 'Taourirt Hub'.
        Find the 'Share' (مشاركة) buttons. 
        ADD a 'Comments' (تعليقات) button next to it.
        ADD a hidden comments list below each card.
        DO NOT change or break the existing 'Rent' or 'Report' icons.
        Return the FULL HTML code.
        {original_code}
        """
        
        response = model.generate_content(prompt)
        
        if response.text:
            new_code = response.text.replace('```html', '').replace('```', '').strip()
            with open('index.html', 'w', encoding='utf-8') as f:
                f.write(new_code)
            print(f"✅ تم التحديث بنجاح باستخدام {target_model}!")
        else:
            print("❌ الرد فارغ.")

    except Exception as e:
        print(f"❌ خطأ تقني: {e}")

if __name__ == "__main__":
    fix()
