import re

def repair():
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            lines = f.readlines()

        # الكود الجديد للدالة مع إعادة الأيقونات والوظائف الأصلية
        new_function = """
function showRentalFloatList() {
    let c = document.getElementById('rentalFloatList');
    if (!c) return;
    let filter = document.getElementById('filterFloatType').value;
    let filtered = rentalsFloat.filter(r => filter === 'all' || r.type === filter);
    if (filtered.length === 0) { c.innerHTML = '<div class="card">📭 لا إعلانات</div>'; return; }
    let typeName = { 'rent': '🏠', 'sale': '💰', 'land': '🌾' };

    c.innerHTML = filtered.slice(0, 15).map(r => `
        <div class="float-item" style="border-bottom:1px solid #eee; padding:10px; margin-bottom:5px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:bold;">${typeName[r.type]} ${r.title}</span>
                <div class="actions">
                    <a href="tel:${r.phone}" style="color:green; margin-left:10px;"><i class="fas fa-phone"></i></a>
                    <button onclick="shareRental('${r.title}', '${r.phone}')" style="background:none; border:none; color:#007bff; cursor:pointer; margin-left:10px;"><i class="fas fa-share-alt"></i></button>
                    <button onclick="toggleComments(${r.id})" style="background:none; border:none; color:#6c757d; cursor:pointer;"><i class="fas fa-comment-dots"></i></button>
                </div>
            </div>
            <div id="comments-section-${r.id}" style="display:none; margin-top:10px; background:#f9f9f9; padding:5px; border-radius:5px;">
                <input type="text" id="input-${r.id}" placeholder="اكتب تعليقاً..." style="width:70%; font-size:12px;">
                <button onclick="addComment(${r.id})" style="font-size:12px;">نشر</button>
                <div id="list-${r.id}" style="font-size:11px; margin-top:5px; color:#555;"></div>
            </div>
        </div>
    `).join('');
}

function toggleComments(id) {
    let div = document.getElementById(`comments-section-${id}`);
    div.style.display = div.style.display === 'none' ? 'block' : 'none';
}
"""
        # استبدال المنطقة المحطمة (من سطر 876 إلى 894 تقريباً)
        content = "".join(lines)
        pattern = r"function showRentalFloatList\(\) \{.*?\}\n"
        # سنستخدم البحث عن الدالة القديمة واستبدالها بالجديدة
        fixed_content = re.sub(r"function showRentalFloatList\(\) \{[\s\S]*?\}", new_function, content)

        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        print("✅ تم استرجاع الأيقونات وإضافة نظام التعليقات بنجاح!")

    except Exception as e:
        print(f"❌ خطأ: {e}")

if __name__ == "__main__":
    repair()
