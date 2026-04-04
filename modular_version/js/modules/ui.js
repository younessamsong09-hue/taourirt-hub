// ========== واجهة المستخدم (إحصائيات, بحث, فلاتر) ==========
function updateVisitorCount() {
    let count = localStorage.getItem('visitorCount') || Math.floor(Math.random() * 50) + 20;
    localStorage.setItem('visitorCount', count);
    const el = document.getElementById('visitorCount');
    if (el) el.innerText = count;
}
document.addEventListener('DOMContentLoaded', updateVisitorCount);
