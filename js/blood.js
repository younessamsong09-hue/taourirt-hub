// ========== التبرع بالدم ==========
let donors = JSON.parse(localStorage.getItem('donors')) || [];
let emergencies = JSON.parse(localStorage.getItem('emergencies')) || [];

function showBloodReg() {
    document.getElementById('bloodReg').style.display = 'block';
    document.getElementById('bloodEmer').style.display = 'none';
}

function showBloodEmer() {
    document.getElementById('bloodEmer').style.display = 'block';
    document.getElementById('bloodReg').style.display = 'none';
}

function addDonor() {
    let name = document.getElementById('donorName').value;
    let phone = document.getElementById('donorPhone').value;
    let blood = document.getElementById('donorBlood').value;
    if (!name || !phone || blood === 'فصيلة الدم') { alert('املأ الحقول'); return; }
    donors.push({ id: Date.now(), name, phone, blood });
    localStorage.setItem('donors', JSON.stringify(donors));
    showDonorsList();
    document.getElementById('donorName').value = '';
    document.getElementById('donorPhone').value = '';
    document.getElementById('donorBlood').value = 'فصيلة الدم';
    document.getElementById('bloodReg').style.display = 'none';
    alert('تم التسجيل كمتبرع');
}

function addEmergency() {
    let patient = document.getElementById('emergPatient').value;
    let blood = document.getElementById('emergBlood').value;
    let phone = document.getElementById('emergPhone').value;
    if (!patient || blood === 'فصيلة الدم' || !phone) { alert('املأ الحقول'); return; }
    emergencies.push({ id: Date.now(), patient, blood, phone, status: 'active' });
    localStorage.setItem('emergencies', JSON.stringify(emergencies));
    showEmergenciesList();
    document.getElementById('emergPatient').value = '';
    document.getElementById('emergBlood').value = 'فصيلة الدم';
    document.getElementById('emergPhone').value = '';
    document.getElementById('bloodEmer').style.display = 'none';
    alert('تم نشر الحالة');
}

function showDonorsList() {
    let c = document.getElementById('donorsList');
    if (!c) return;
    if (donors.length === 0) { c.innerHTML = '<div class="card">📭 لا متبرعين</div>'; return; }
    c.innerHTML = donors.map(d => `<div class="donor-card"><span>🩸 ${d.name} (${d.blood})</span><a href="tel:${d.phone}" class="call-btn">اتصل</a></div>`).join('');
}

function showEmergenciesList() {
    let c = document.getElementById('emergList');
    if (!c) return;
    let active = emergencies.filter(e => e.status === 'active');
    if (active.length === 0) { c.innerHTML = '<div class="card">✅ لا حالات نشطة</div>'; return; }
    c.innerHTML = active.map(e => `<div class="emergency-card"><span>🚨 ${e.patient} (${e.blood})</span><a href="tel:${e.phone}" class="call-btn">اتصل</a></div>`).join('');
}

// تحميل القوائم
showDonorsList();
showEmergenciesList();
