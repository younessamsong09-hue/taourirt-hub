function saveRating(id, rating) {
    const ratings = JSON.parse(localStorage.getItem('ratings') || '{}');
    ratings[id] = rating;
    localStorage.setItem('ratings', JSON.stringify(ratings));
}

function getRating(id) {
    const ratings = JSON.parse(localStorage.getItem('ratings') || '{}');
    return ratings[id] || 0;
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#22c55e;color:white;padding:12px 24px;border-radius:50px;z-index:9999;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

function shareOnWhatsApp(name, phone, address) {
    const message = `🏥 *${name}*\n📍 ${address || 'العنوان غير متوفر'}\n📞 ${phone}\n\n📱 تاوريرت هب`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
}

// ========== عداد الزوار ==========
function updateVisitorCount() {
    let today = new Date().toISOString().split('T')[0];
    let visits = localStorage.getItem('visits_' + today);
    
    if (visits) {
        visits = parseInt(visits) + 1;
    } else {
        visits = 1;
        // حذف البيانات القديمة (أكثر من 7 أيام)
        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            if (key && key.startsWith('visits_') && key !== 'visits_' + today) {
                let oldDate = new Date(key.replace('visits_', ''));
                let weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                if (oldDate < weekAgo) {
                    localStorage.removeItem(key);
                }
            }
        }
    }
    localStorage.setItem('visits_' + today, visits);
    return visits;
}

function getTodayVisitors() {
    let today = new Date().toISOString().split('T')[0];
    return parseInt(localStorage.getItem('visits_' + today)) || 0;
}
