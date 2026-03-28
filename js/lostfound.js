// ========== المفقودات والموجودات ==========
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

function addLost() {
    let title = document.getElementById('lostTitle').value;
    let desc = document.getElementById('lostDesc').value;
    let place = document.getElementById('lostPlace').value;
    let phone = document.getElementById('lostPhone').value;
    if (!title || !desc || !phone) { alert('املأ الحقول'); return; }
    lostItems.unshift({ id: Date.now(), title, desc, place, phone, date: new Date().toLocaleDateString('ar-MA') });
    localStorage.setItem('lost_items', JSON.stringify(lostItems));
    showLostList();
    document.getElementById('lostTitle').value = '';
    document.getElementById('lostDesc').value = '';
    document.getElementById('lostPlace').value = '';
    document.getElementById('lostPhone').value = '';
    document.getElementById('lostForm').style.display = 'none';
    alert('تم الإضافة');
}

function addFound() {
    let title = document.getElementById('foundTitle').value;
    let desc = document.getElementById('foundDesc').value;
    let place = document.getElementById('foundPlace').value;
    let phone = document.getElementById('foundPhone').value;
    if (!title || !desc || !phone) { alert('املأ الحقول'); return; }
    foundItems.unshift({ id: Date.now(), title, desc, place, phone, date: new Date().toLocaleDateString('ar-MA') });
    localStorage.setItem('found_items', JSON.stringify(foundItems));
    showFoundList();
    document.getElementById('foundTitle').value = '';
    document.getElementById('foundDesc').value = '';
    document.getElementById('foundPlace').value = '';
    document.getElementById('foundPhone').value = '';
    document.getElementById('foundForm').style.display = 'none';
    alert('تم الإضافة');
}

function showLostList() {
    let c = document.getElementById('lostList');
    if (!c) return;
    if (lostItems.length === 0) { c.innerHTML = '<div class="card">📭 لا توجد إعلانات مفقودة</div>'; return; }
    c.innerHTML = lostItems.map(i => `
        <div class="lost-card">
            <div><strong>📦 ${i.title}</strong> <span class="badge-lost">مفقود</span></div>
            <p>${i.desc}</p>
            <p>📍 ${i.place || 'تاوريرت'}</p>
            <p>📅 ${i.date}</p>
            <div><a href="tel:${i.phone}" class="call-btn">📞 اتصل</a><button onclick="removeLost(${i.id})" class="done-btn">✓ تم</button></div>
        </div>
    `).join('');
}

function showFoundList() {
    let c = document.getElementById('foundList');
    if (!c) return;
    if (foundItems.length === 0) { c.innerHTML = '<div class="card">📭 لا توجد إعلانات موجودة</div>'; return; }
    c.innerHTML = foundItems.map(i => `
        <div class="found-card">
            <div><strong>🎁 ${i.title}</strong> <span class="badge-found">موجود</span></div>
            <p>${i.desc}</p>
            <p>📍 ${i.place || 'تاوريرت'}</p>
            <p>📅 ${i.date}</p>
            <div><a href="tel:${i.phone}" class="call-btn">📞 اتصل</a><button onclick="removeFound(${i.id})" class="done-btn">✓ تم</button></div>
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

// تحميل القوائم
showLostList();
showFoundList();
