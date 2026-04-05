    `).join('');
<!--
}
-->

// ========== أيقونة الكراء ==========
let rentalsFloat = JSON.parse(localStorage.getItem('rentals')) || [];
let currentRentalType = '';

function toggleRentalFloat() {
    let p = document.getElementById('rentalFloatPanel');
    p.style.display = p.style.display === 'none' ? 'block' : 'none';
    showRentalFloatList();
}

function showRentalFloatForm(type) {
    currentRentalType = type;
    document.getElementById('rentalFloatForm').style.display = 'block';
}

function addRentalFloat() {
    let title = document.getElementById('rentalFloatTitle').value.trim();
    let desc = document.getElementById('rentalFloatDesc').value.trim();
    let price = document.getElementById('rentalFloatPrice').value.trim();
    let neighborhood = document.getElementById('rentalFloatNeighborhood').value;
    let phone = document.getElementById('rentalFloatPhone').value.trim();
    if (!title || !desc || !price || !neighborhood || !phone) { alert('املأ الحقول'); return; }
    let newRental = { id: Date.now(), type: currentRentalType, title: title, desc: desc, price: price, neighborhood: neighborhood, phone: phone, date: new Date().toLocaleDateString('ar-MA') };
    let img = document.getElementById('rentalFloatImage').files[0];
    if (img) {
        let reader = new FileReader();
        reader.onload = function(e) {
            newRental.image = e.target.result;
            rentalsFloat.unshift(newRental);
            localStorage.setItem('rentals', JSON.stringify(rentalsFloat));
            showRentalFloatList();
            clearRentalFloat();
            alert('تم النشر');
        };
        reader.readAsDataURL(img);
    } else {
        rentalsFloat.unshift(newRental);
        localStorage.setItem('rentals', JSON.stringify(rentalsFloat));
        showRentalFloatList();
        clearRentalFloat();
        alert('تم النشر');
    }
}

function clearRentalFloat() {
    document.getElementById('rentalFloatTitle').value = '';
    document.getElementById('rentalFloatDesc').value = '';
    document.getElementById('rentalFloatPrice').value = '';
    document.getElementById('rentalFloatNeighborhood').value = '';
    document.getElementById('rentalFloatPhone').value = '';
    document.getElementById('rentalFloatImage').value = '';
    document.getElementById('rentalFloatForm').style.display = 'none';
}

function showRentalFloatList() {
    let c = document.getElementById('rentalFloatList');
    if (!c) return;
    let filter = document.getElementById('filterFloatType').value;
    let filtered = rentalsFloat.filter(r => filter === 'all' || r.type === filter);
    if (filtered.length === 0) { c.innerHTML = '<div class="card">📭 لا إعلانات</div>'; return; }
    let typeName = { 'rent': '🏠', 'sale': '💰', 'land': '🌾' };
    
    // --- START OF MODIFIED SECTION FOR COMMENTS ---
    c.innerHTML = filtered.slice(0, 5).map(r => `
        <div class="float-item">
            <span>${typeName[r.type]} ${r.title}</span>
            <a href="tel:${r.phone}">📞</a>
            <button class="icon-button" onclick="toggleComments(${r.id})">💬</button> 
            <div id="comments-section-${r.id}" class="comment-section" style="display:none;"></div>
        </div>
    `).join('');
    // --- END OF MODIFIED SECTION FOR COMMENTS ---
