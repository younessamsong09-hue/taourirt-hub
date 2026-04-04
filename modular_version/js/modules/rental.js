// ========== العقارات ==========
window.toggleRentalFloat = function() {
    const p = document.getElementById('rentalFloatPanel');
    if (p) p.style.display = p.style.display === 'none' ? 'block' : 'none';
};
window.showRentalFloatForm = function(type) {
    document.getElementById('rentalFloatForm').style.display = 'block';
    document.querySelector('#rentalFloatPanel .float-buttons').style.display = 'none';
};
window.addRentalFloat = function() {
    alert('تم نشر الإعلان (ربط Supabase لاحقاً)');
};
