function toggleRentalFloat() {
    const p = document.getElementById('rentalFloatPanel');
    if(p) p.style.display = p.style.display === 'none' ? 'block' : 'none';
}
function showRentalFloatForm(type) {
    const f = document.getElementById('rentalFloatForm');
    if(f) f.style.display = 'block';
}
