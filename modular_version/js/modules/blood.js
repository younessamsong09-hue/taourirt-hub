// ========== التبرع بالدم (نسخة مبسطة) ==========
window.showBloodReg = function() {
    document.getElementById('bloodReg').style.display = 'block';
    document.getElementById('bloodEmer').style.display = 'none';
};
window.showBloodEmer = function() {
    document.getElementById('bloodEmer').style.display = 'block';
    document.getElementById('bloodReg').style.display = 'none';
};
window.addDonor = function() {
    alert('سيتم إضافة متبرع (ربط Supabase قريباً)');
};
window.addEmergency = function() {
    alert('سيتم إضافة حالة طارئة (ربط Supabase قريباً)');
};
function toggleBlood() {
    const c = document.getElementById('bloodContent');
    const a = document.getElementById('bloodArrow');
    if (c) {
        const isVis = c.style.display === 'block';
        c.style.display = isVis ? 'none' : 'block';
        if (a) a.className = isVis ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
    }
}
// ربط الدوال للنطاق العام
window.toggleBlood = toggleBlood;
