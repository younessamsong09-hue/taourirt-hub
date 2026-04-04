// ========== المفقودات والموجودات ==========
window.toggleLostFound = function() {
    const c = document.getElementById('lostFoundContent');
    const a = document.getElementById('lostArrow');
    if (c) {
        const isVis = c.style.display === 'block';
        c.style.display = isVis ? 'none' : 'block';
        if (a) a.className = isVis ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
    }
};
window.showLostForm = function() {
    document.getElementById('lostForm').style.display = 'block';
    document.getElementById('foundForm').style.display = 'none';
};
window.showFoundForm = function() {
    document.getElementById('foundForm').style.display = 'block';
    document.getElementById('lostForm').style.display = 'none';
};
window.addLost = function() { alert('إضافة مفقود (قريباً)'); };
window.addFound = function() { alert('إضافة موجود (قريباً)'); };
