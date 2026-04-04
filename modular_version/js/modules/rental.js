// نظام العقارات (إيجار وبيع)
let rentalsFloat = JSON.parse(localStorage.getItem('rentals')) || [];
let currentRentalType = '';

window.toggleRentalFloat = function() {
    const panel = document.getElementById('rentalFloatPanel');
    if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
};
window.showRentalFloatForm = function(type) {
    currentRentalType = type;
    document.getElementById('rentalFloatForm').style.display = 'block';
    document.querySelector('#rentalFloatPanel .float-buttons').style.display = 'none';
};
window.addRentalFloat = function() {
    const title = document.getElementById('rentalTitle').value;
    const desc = document.getElementById('rentalDesc').value;
    const price = document.getElementById('rentalPrice').value;
    const phone = document.getElementById('rentalPhone').value;
    if (!title || !phone) return alert('❌ الرجاء ملء العنوان والهاتف');
    rentalsFloat.unshift({
        id: Date.now(),
        type: currentRentalType,
        title, desc, price, phone,
        date: new Date().toISOString()
    });
    localStorage.setItem('rentals', JSON.stringify(rentalsFloat));
    alert('✅ تم نشر الإعلان');
    toggleRentalFloat();
    showRentalFloatList();
};
function showRentalFloatList() {
    const container = document.getElementById('rentalFloatList');
    if (!container) return;
    if (rentalsFloat.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:20px;">📭 لا توجد إعلانات</div>';
        return;
    }
    container.innerHTML = rentalsFloat.slice(0, 5).map(r => `
        <div style="background:#1e293b; border-radius:12px; padding:10px; margin-bottom:8px;">
            <b>${r.title}</b><br>
            ${r.desc ? r.desc.substring(0, 50) : ''}<br>
            <span style="color:#10b981;">${r.price ? r.price + ' درهم' : ''}</span><br>
            <a href="tel:${r.phone}" style="color:#3b82f6;">اتصل</a>
        </div>
    `).join('');
}
document.addEventListener('DOMContentLoaded', showRentalFloatList);
