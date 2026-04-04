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
