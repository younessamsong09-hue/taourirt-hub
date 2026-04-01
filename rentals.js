function toggleRentalFloat() {
    let p = document.getElementById('rentalFloatPanel');
    if(p) p.style.display = p.style.display === 'none' ? 'block' : 'none';
}

function showRentalFloatForm(type) {
    let form = document.getElementById('rentalFloatForm');
    if(form) form.style.display = 'block';
}
