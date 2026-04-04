// ========== المدخل الرئيسي ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 TAOURIRT HUB - Version modulaire');

    // تهيئة نظام التبليغ (report.js)
    if (typeof initReports === 'function') initReports();

    // تهيئة الخريطة (map.js)
    if (typeof initMap === 'function') initMap();

    // تهيئة التبرع بالدم (blood.js)
    if (typeof initBloodSupabase === 'function') initBloodSupabase();
    else if (typeof loadDonorsFromSupabase === 'function') loadDonorsFromSupabase();

    // تحديث قوائم الوظائف والمفقودات والعقارات
    if (typeof showJobsList === 'function') showJobsList();
    if (typeof showRentalFloatList === 'function') showRentalFloatList();
    if (typeof loadLostFound === 'function') loadLostFound();

    // تحديث الإحصائيات
    if (typeof updatePharmacyCount === 'function') updatePharmacyCount(20); // مثال
    if (typeof updateMarketCount === 'function') updateMarketCount(4);
});

// ========== دوال فتح وإغلاق اللوحات (toggle) ==========
window.toggleBlood = function() {
    const content = document.getElementById('bloodContent');
    const arrow = document.getElementById('bloodArrow');
    if (content) {
        const isVisible = content.style.display === 'block';
        content.style.display = isVisible ? 'none' : 'block';
        if (arrow) arrow.className = isVisible ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
    }
};

window.toggleJobs = function() {
    const content = document.getElementById('jobsContent');
    const arrow = document.getElementById('jobsArrow');
    if (content) {
        const isVisible = content.style.display === 'block';
        content.style.display = isVisible ? 'none' : 'block';
        if (arrow) arrow.className = isVisible ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
        if (!isVisible && typeof showJobsList === 'function') showJobsList();
    }
};

window.toggleLostFound = function() {
    const content = document.getElementById('lostFoundContent');
    const arrow = document.getElementById('lostArrow');
    if (content) {
        const isVisible = content.style.display === 'block';
        content.style.display = isVisible ? 'none' : 'block';
        if (arrow) arrow.className = isVisible ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
    }
};

// دوال أخرى ضرورية (لن نميتها)
window.showBloodReg = window.showBloodReg || function() {
    document.getElementById('bloodReg').style.display = 'block';
    document.getElementById('bloodEmer').style.display = 'none';
};
window.showBloodEmer = window.showBloodEmer || function() {
    document.getElementById('bloodEmer').style.display = 'block';
    document.getElementById('bloodReg').style.display = 'none';
};
window.showLostForm = window.showLostForm || function() {
    document.getElementById('lostForm').style.display = 'block';
    document.getElementById('foundForm').style.display = 'none';
};
window.showFoundForm = window.showFoundForm || function() {
    document.getElementById('foundForm').style.display = 'block';
    document.getElementById('lostForm').style.display = 'none';
};
window.toggleJobForm = window.toggleJobForm || function() {
    const form = document.getElementById('addJobForm');
    if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
};

console.log('✅ دوال toggle والإضافات الأساسية تم تحميلها');
