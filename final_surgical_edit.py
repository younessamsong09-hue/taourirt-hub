import google.generativeai as genai

# إعداد المفتاح الخاص بك
genai.configure(api_key="AIzaSyD56GDHwvGlPmIW-anzefd4Fwc7Eg3lNi8")

def surgical_edit():
    try:
        # 1. البحث التلقائي عن الموديل المتاح
        available_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        if not available_models:
            print("❌ لم يتم العثور على موديلات تدعم التوليد.")
            return
        
        target_model = available_models[0]
        print(f"🚀 تم اختيار الموديل: {target_model}")
        model = genai.GenerativeModel(target_model)

        # 2. قراءة الملف
        with open('index.html', 'r', encoding='utf-8') as f:
            lines = f.readlines()

        # نأخذ الكود من بداية السكربت (السطر 586 تقريباً)
        script_content = "".join(lines[585:]) 
        
        print("🔍 جاري تحليل وحقن نظام التعليقات في الـ JavaScript...")

        prompt = f"""
        Act as an expert Full-stack Developer.
        Task: Add a comment system to the following JS code.
        Instructions:
        1. Find where the 'Rental' or 'Market' cards are rendered (innerHTML).
        2. Add a 'Comment' button (icon: fa-comment) next to the 'Share' or 'Call' buttons.
        3. Add a CSS style for .comment-section and a JS function toggleComments(id).
        4. Integrate with Supabase or a simple local array for now.
        5. DO NOT break any existing 'Rent' or 'Report' logic.
        Return ONLY the updated JavaScript code.
        
        Code to modify:
        {script_content}
        """

        response = model.generate_content(prompt)
        
        if response.text:
            # تنظيف الكود من أي علامات Markdown
            cleaned_js = response.text.replace('```javascript', '').replace('```html', '').replace('```', '').strip()
            
            # إعادة دمج الملف
            final_content = "".join(lines[:585]) + "\n" + cleaned_js
            with open('index.html', 'w', encoding='utf-8') as f:
                f.write(final_content)
            print(f"✅ تم التحديث الجراحي بنجاح باستخدام {target_model}!")
        else:
            print("❌ رد الذكاء فارغ.")

    except Exception as e:
        print(f"❌ خطأ تقني: {e}")

if __name__ == "__main__":
    surgical_edit()
