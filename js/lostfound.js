let lostItems = JSON.parse(localStorage.getItem('lost_items')) || [];
let foundItems = JSON.parse(localStorage.getItem('found_items')) || [];

function showLostForm() {
    document.getElementById('lostForm').style.display = 'block';
    document.getElementById('foundForm').style.display = 'none';
}

function showFoundForm() {
    document.getElementById('foundForm').style.display = 'block';
    document.getElementById('lostForm').style.display = 'none';
}

function previewImage(input, targetId) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById(targetId);
            img.src = e.target.result;
            img.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function addLost() {
    let title = document.getElementById('lostTitle').value;
    let desc = document.getElementById('lostDesc').value;
    let place = document.getElementById('lostPlace').value;
    let phone = document.getElementById('lostPhone').value;
    let imageFile = document.getElementById('lostImage').files[0];
    
    if (!title || !desc || !phone) {
        alert('الرجاء ملء الحقول المطلوبة');
        return;
    }
    
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const newItem = {
                id: Date.now(),
                title, desc, place, phone,
                image: e.target.result,
                date: new Date().toLocaleDateString('ar-MA')
            };
            lostItems.unshift(newItem);
            localStorage.setItem('lost_items', JSON.stringify(lostItems));
            showLostList();
            clearLostForm();
        };
        reader.readAsDataURL(imageFile);
    } else {
        const newItem = {
            id: Date.now(),
            title, desc, place, phone,
            image: null,
            date: new Date().toLocaleDateString('ar-MA')
        };
        lostItems.unshift(newItem);
        localStorage.setItem('lost_items', JSON.stringify(lostItems));
        showLostList();
        clearLostForm();
    }
}

function addFound() {
    let title = document.getElementById('foundTitle').value;
    let desc = document.getElementById('foundDesc').value;
    let place = document.getElementById('foundPlace').value;
    let phone = document.getElementById('foundPhone').value;
    let imageFile = document.getElementById('foundImage').files[0];
    
    if (!title || !desc || !phone) {
        alert('الرجاء ملء الحقول المطلوبة');
        return;
    }
    
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const newItem = {
                id: Date.now(),
                title, desc, place, phone,
                image: e.target.result,
                date: new Date().toLocaleDateString('ar-MA')
            };
            foundItems.unshift(newItem);
            localStorage.setItem('found_items', JSON.stringify(foundItems));
            showFoundList();
            clearFoundForm();
        };
        reader.readAsDataURL(imageFile);
    } else {
        const newItem = {
            id: Date.now(),
            title, desc, place, phone,
            image: null,
            date: new Date().toLocaleDateString('ar-MA')
        };
        foundItems.unshift(newItem);
        localStorage.setItem('found_items', JSON.stringify(foundItems));
        showFoundList();
        clearFoundForm();
    }
}

function clearLostForm() {
    document.getElementById('lostTitle').value = '';
    document.getElementById('lostDesc').value = '';
    document.getElementById('lostPlace').value = '';
    document.getElementById('lostPhone').value = '';
    document.getElementById('lostImage').value = '';
    document.getElementById('lostPreview').style.display = 'none';
    document.getElementById('lostForm').style.display = 'none';
}

function clearFoundForm() {
    document.getElementById('foundTitle').value = '';
    document.getElementById('foundDesc').value = '';
    document.getElementById('foundPlace').value = '';
    document.getElementById('foundPhone').value = '';
    document.getElementById('foundImage').value = '';
    document.getElementById('foundPreview').style.display = 'none';
    document.getElementById('foundForm').style.display = 'none';
}

function showLostList() {
    let c = document.getElementById('lostList');
    if (!c) return;
    if (lostItems.length === 0) {
        c.innerHTML = '<div class="card" style="text-align:center">📭 لا توجد إعلانات مفقودة</div>';
        return;
    }
    c.innerHTML = lostItems.map(i => `
        <div class="lost-card-item">
            ${i.image ? `<img src="${i.image}" class="item-image" alt="${i.title}">` : '<div class="no-image">📷</div>'}
            <div class="item-info">
                <div><strong>📦 ${i.title}</strong> <span class="badge-lost">مفقود</span></div>
                <p>${i.desc}</p>
                <p>📍 ${i.place || 'تاوريرت'}</p>
                <p>📅 ${i.date}</p>
                <div class="item-actions">
                    <a href="tel:${i.phone}" class="call-btn">📞 اتصل</a>
                    <button onclick="removeLost(${i.id})" class="done-btn">✓ تم الحل</button>
                </div>
            </div>
        </div>
    `).join('');
}

function showFoundList() {
    let c = document.getElementById('foundList');
    if (!c) return;
    if (foundItems.length === 0) {
        c.innerHTML = '<div class="card" style="text-align:center">📭 لا توجد إعلانات موجودة</div>';
        return;
    }
    c.innerHTML = foundItems.map(i => `
        <div class="found-card-item">
            ${i.image ? `<img src="${i.image}" class="item-image" alt="${i.title}">` : '<div class="no-image">🎁</div>'}
            <div class="item-info">
                <div><strong>🎁 ${i.title}</strong> <span class="badge-found">موجود</span></div>
                <p>${i.desc}</p>
                <p>📍 ${i.place || 'تاوريرت'}</p>
                <p>📅 ${i.date}</p>
                <div class="item-actions">
                    <a href="tel:${i.phone}" class="call-btn">📞 اتصل</a>
                    <button onclick="removeFound(${i.id})" class="done-btn">✓ تم التسليم</button>
                </div>
            </div>
        </div>
    `).join('');
}

function removeLost(id) {
    lostItems = lostItems.filter(i => i.id !== id);
    localStorage.setItem('lost_items', JSON.stringify(lostItems));
    showLostList();
}

function removeFound(id) {
    foundItems = foundItems.filter(i => i.id !== id);
    localStorage.setItem('found_items', JSON.stringify(foundItems));
    showFoundList();
}

showLostList();
showFoundList();
