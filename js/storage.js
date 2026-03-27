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
