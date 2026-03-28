const ADMIN_PASSWORD = 'taourirt2026';
let pharmacies = [], markets = [], jobs = [], complaints = [];
let currentView = 'pharmacies';

function loadData() {
    pharmacies = JSON.parse(localStorage.getItem('taourirt_pharmacies')) || [
        { id: 1, name: 'صيدلية الجابري', address: '77 شارع مولاي عبد الله', phone: '0536699222', is_on_duty: true },
        { id: 2, name: 'صيدلية تاوريرت', address: '578 شارع سمراء', phone: '0536698018', is_on_duty: false }
    ];
    markets = JSON.parse(localStorage.getItem('taourirt_markets')) || [
        { id: 1, name: 'سوق تاوريرت المركزي', address: 'شارع الحسن الثاني', phone: '0536123464' }
    ];
    jobs = JSON.parse(localStorage.getItem('taourirt_jobs')) || [
        { id: 1, title: 'صيدلي', company: 'صيدلية الجابري', location: 'وسط المدينة', salary: '4000', phone: '0536699222' }
    ];
    complaints = JSON.parse(localStorage.getItem('complaints')) || [];
}

function saveData() {
    localStorage.setItem('taourirt_pharmacies', JSON.stringify(pharmacies));
    localStorage.setItem('taourirt_markets', JSON.stringify(markets));
    localStorage.setItem('taourirt_jobs', JSON.stringify(jobs));
    localStorage.setItem('complaints', JSON.stringify(complaints));
}

function setDuty(id) {
    pharmacies = pharmacies.map(p => ({ ...p, is_on_duty: p.id === id }));
    saveData();
    renderCurrentView();
    alert('تم تعيين صيدلية الحراسة');
}

function deleteItem(type, id) {
    if (!confirm('هل أنت متأكد؟')) return;
    if (type === 'pharmacy') pharmacies = pharmacies.filter(p => p.id !== id);
    if (type === 'market') markets = markets.filter(m => m.id !== id);
    if (type === 'job') jobs = jobs.filter(j => j.id !== id);
    if (type === 'complaint') complaints = complaints.filter(c => c.id !== id);
    saveData();
    renderCurrentView();
}

function updateComplaintStatus(id, status) {
    complaints = complaints.map(c => c.id === id ? { ...c, status } : c);
    saveData();
    renderCurrentView();
}

function addItem(type) {
    if (type === 'pharmacy') {
        let name = prompt('اسم الصيدلية:'); if (!name) return;
        let address = prompt('العنوان:');
        let phone = prompt('الهاتف:');
        let newId = Math.max(0, ...pharmacies.map(p => p.id)) + 1;
        pharmacies.push({ id: newId, name, address, phone, is_on_duty: false });
    }
    if (type === 'market') {
        let name = prompt('اسم السوق:'); if (!name) return;
        let address = prompt('العنوان:');
        let phone = prompt('الهاتف:');
        let newId = Math.max(0, ...markets.map(m => m.id)) + 1;
        markets.push({ id: newId, name, address, phone });
    }
    if (type === 'job') {
        let title = prompt('المسمى الوظيفي:'); if (!title) return;
        let company = prompt('اسم المؤسسة:');
        let phone = prompt('رقم الهاتف:');
        let newId = Math.max(0, ...jobs.map(j => j.id)) + 1;
        jobs.push({ id: newId, title, company, phone });
    }
    saveData();
    renderCurrentView();
}

function editItem(type, id) {
    if (type === 'pharmacy') {
        let p = pharmacies.find(p => p.id === id);
        let newName = prompt('الاسم الجديد:', p.name); if (newName) p.name = newName;
        let newAddress = prompt('العنوان الجديد:', p.address); if (newAddress) p.address = newAddress;
        let newPhone = prompt('الهاتف الجديد:', p.phone); if (newPhone) p.phone = newPhone;
    }
    if (type === 'market') {
        let m = markets.find(m => m.id === id);
        let newName = prompt('الاسم الجديد:', m.name); if (newName) m.name = newName;
        let newAddress = prompt('العنوان الجديد:', m.address); if (newAddress) m.address = newAddress;
        let newPhone = prompt('الهاتف الجديد:', m.phone); if (newPhone) m.phone = newPhone;
    }
    if (type === 'job') {
        let j = jobs.find(j => j.id === id);
        let newTitle = prompt('المسمى الجديد:', j.title); if (newTitle) j.title = newTitle;
        let newCompany = prompt('المؤسسة الجديدة:', j.company); if (newCompany) j.company = newCompany;
        let newPhone = prompt('الهاتف الجديد:', j.phone); if (newPhone) j.phone = newPhone;
    }
    saveData();
    renderCurrentView();
}

function renderPharmacies() {
    return `
        <button class="btn-add" onclick="addItem('pharmacy')"><i class="fas fa-plus"></i> إضافة صيدلية</button>
        <div class="data-table"><table>
            <thead><tr><th>الاسم</th><th>العنوان</th><th>الهاتف</th><th>حراسة</th><th>إجراءات</th></tr></thead>
            <tbody>${pharmacies.map(p => `
                <tr>
                    <td>${p.name}</td><td>${p.address || ''}</td><td>${p.phone || ''}</td>
                    <td>${p.is_on_duty ? '🟢 نعم' : '⚪ لا'}</td>
                    <td>
                        <button class="btn-duty" onclick="setDuty(${p.id})">حراسة</button>
                        <button class="btn-edit" onclick="editItem('pharmacy', ${p.id})">تعديل</button>
                        <button class="btn-delete" onclick="deleteItem('pharmacy', ${p.id})">حذف</button>
                    </td>
                </tr>
            `).join('')}</tbody>
        </table></div>
    `;
}

function renderMarkets() {
    return `
        <button class="btn-add" onclick="addItem('market')"><i class="fas fa-plus"></i> إضافة سوق</button>
        <div class="data-table"><table>
            <thead><tr><th>الاسم</th><th>العنوان</th><th>الهاتف</th><th>إجراءات</th></tr></thead>
            <tbody>${markets.map(m => `
                <tr>
                    <td>${m.name}</td><td>${m.address || ''}</td><td>${m.phone || ''}</td>
                    <td>
                        <button class="btn-edit" onclick="editItem('market', ${m.id})">تعديل</button>
                        <button class="btn-delete" onclick="deleteItem('market', ${m.id})">حذف</button>
                    </td>
                </tr>
            `).join('')}</tbody>
        </table></div>
    `;
}

function renderJobs() {
    return `
        <button class="btn-add" onclick="addItem('job')"><i class="fas fa-plus"></i> إضافة وظيفة</button>
        <div class="data-table"><table>
            <thead><tr><th>المسمى</th><th>المؤسسة</th><th>الهاتف</th><th>إجراءات</th></tr></thead>
            <tbody>${jobs.map(j => `
                <tr>
                    <td>${j.title}</td><td>${j.company}</td><td>${j.phone || ''}</td>
                    <td>
                        <button class="btn-edit" onclick="editItem('job', ${j.id})">تعديل</button>
                        <button class="btn-delete" onclick="deleteItem('job', ${j.id})">حذف</button>
                    </td>
                </tr>
            `).join('')}</tbody>
        </table></div>
    `;
}

function renderComplaints() {
    const statusText = { pending: '⏳ قيد المعالجة', processing: '🔄 قيد الدراسة', completed: '✅ تم الحل' };
    return `
        <div class="data-table"><table>
            <thead><tr><th>العنوان</th><th>الاسم</th><th>النوع</th><th>الحالة</th><th>إجراءات</th></tr></thead>
            <tbody>${complaints.map(c => `
                <tr>
                    <td>${c.title}</td><td>${c.name}</td><td>${c.type === 'complaint' ? 'شكوى' : 'اقتراح'}</td>
                    <td>${statusText[c.status] || 'قيد المعالجة'}</td>
                    <td>
                        <button class="btn-duty" onclick="updateComplaintStatus(${c.id}, 'processing')">دراسة</button>
                        <button class="btn-edit" onclick="updateComplaintStatus(${c.id}, 'completed')">حل</button>
                        <button class="btn-delete" onclick="deleteItem('complaint', ${c.id})">حذف</button>
                    </td>
                </tr>
            `).join('')}</tbody>
        </table></div>
    `;
}

function renderStats() {
    return `
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-number">${pharmacies.length}</div><div class="stat-label">صيدليات</div></div>
            <div class="stat-card"><div class="stat-number">${markets.length}</div><div class="stat-label">أسواق</div></div>
            <div class="stat-card"><div class="stat-number">${jobs.length}</div><div class="stat-label">وظائف</div></div>
            <div class="stat-card"><div class="stat-number">${complaints.length}</div><div class="stat-label">شكاوى</div></div>
            <div class="stat-card"><div class="stat-number">${pharmacies.filter(p => p.is_on_duty).length}</div><div class="stat-label">حراسة اليوم</div></div>
        </div>
    `;
}

function renderCurrentView() {
    let html = '';
    if (currentView === 'pharmacies') html = renderPharmacies();
    if (currentView === 'markets') html = renderMarkets();
    if (currentView === 'jobs') html = renderJobs();
    if (currentView === 'complaints') html = renderComplaints();
    if (currentView === 'stats') html = renderStats();
    document.getElementById('mainContent').innerHTML = html;
}

function setView(view) {
    currentView = view;
    renderCurrentView();
    document.querySelectorAll('.admin-sidebar a').forEach(a => a.classList.remove('active'));
    event.target.closest('a').classList.add('active');
}

function checkLogin() {
    let pass = document.getElementById('adminPass').value;
    if (pass === ADMIN_PASSWORD) showAdminPanel();
    else document.getElementById('loginError').innerText = 'كلمة المرور غير صحيحة';
}

function showAdminPanel() {
    loadData();
    document.getElementById('app').innerHTML = `
        <div class="admin-sidebar">
            <h2><i class="fas fa-map-marker-alt"></i> <span>تاوريرت هب</span></h2>
            <ul>
                <li><a href="#" onclick="setView('pharmacies')" class="active"><i class="fas fa-hospital-user"></i> <span>الصيدليات</span></a></li>
                <li><a href="#" onclick="setView('markets')"><i class="fas fa-store"></i> <span>الأسواق</span></a></li>
                <li><a href="#" onclick="setView('jobs')"><i class="fas fa-briefcase"></i> <span>الوظائف</span></a></li>
                <li><a href="#" onclick="setView('complaints')"><i class="fas fa-comment-dots"></i> <span>الشكاوى</span></a></li>
                <li><a href="#" onclick="setView('stats')"><i class="fas fa-chart-line"></i> <span>الإحصائيات</span></a></li>
            </ul>
        </div>
        <div class="admin-content">
            <div class="admin-header">
                <h1><i class="fas fa-tachometer-alt"></i> لوحة التحكم</h1>
                <button class="logout-btn" onclick="showLogin()"><i class="fas fa-sign-out-alt"></i> خروج</button>
            </div>
            <div id="mainContent"></div>
        </div>
    `;
    renderCurrentView();
}

function showLogin() {
    document.getElementById('app').innerHTML = `
        <div class="login-container">
            <div class="login-box">
                <h2><i class="fas fa-cog"></i> تاوريرت هب</h2>
                <p>لوحة التحكم</p>
                <input type="password" id="adminPass" placeholder="كلمة المرور">
                <button onclick="checkLogin()">دخول</button>
                <div id="loginError" class="error-msg"></div>
            </div>
        </div>
    `;
}

showLogin();
