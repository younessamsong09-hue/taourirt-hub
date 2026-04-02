window.rentalsFloat = JSON.parse(localStorage.getItem('rentals')) || [];

window.toggleRentalFloat = function() {
    let p = document.getElementById('rentalFloatPanel');
    if(p) p.style.display = p.style.display === 'none' ? 'block' : 'none';
    showRentalFloatList();
};

window.showRentalFloatList = function() {
    let c = document.getElementById('rentalFloatList');
    if (!c) return;
    if (rentalsFloat.length === 0) { c.innerHTML = '<div class="card">📭 لا عقارات</div>'; return; }
    c.innerHTML = rentalsFloat.map(r => `<div class="float-item"><span>🏠 ${r.desc}</span></div>`).join('');
};
