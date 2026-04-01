function toggleRentalFloat() {
    const p = document.getElementById('rentalFloatPanel');
    if(p) p.style.display = (p.style.display === 'none' || p.style.display === '') ? 'block' : 'none';
}

function showRentalFloatForm(type) {
    const f = document.getElementById('rentalFloatForm');
    if(f) f.style.display = 'block';
}
