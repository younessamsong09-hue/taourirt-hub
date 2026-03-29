// استخدام الـ Global Scope لضمان استجابة الأزرار
window.donors = JSON.parse(localStorage.getItem('donors')) || [];
window.emergencies = JSON.parse(localStorage.getItem('emergencies')) || [];

const bloodColors = {
    'A+': '#3b82f6', 'A-': '#60a5fa', 'B+': '#8b5cf6', 'B-': '#a78bfa',
    'AB+': '#ec4899', 'AB-': '#f472b6', 'O+': '#ef4444', 'O-': '#f87171'
};

window.showBloodReg = function() {
    document.getElementById('bloodReg').style.display = 'block';
    document.getElementById('bloodEmer').style.display = 'none';
};

window.showBloodEmer = function() {
    document.getElementById('bloodEmer').style.display = 'block';
    document.getElementById('bloodReg').style.display = 'none';
};

window.addDonor = function() {
    const name = document.getElementById('donorName').value;
    const phone = document.getElementById('donorPhone').value;
    const blood = document.getElementById('donorBlood').value;
    if (!name || !phone || blood === 'فصيلة الدم') return alert('المرجو ملء الحقول');
    
    window.donors.unshift({ id: Date.now(), name, phone, blood });
    localStorage.setItem('donors', JSON.stringify(window.donors));
    window.renderAll();
    document.getElementById('bloodReg').style.display = 'none';
};

window.addEmergency = function() {
    const patient = document.getElementById('emergPatient').value;
    const blood = document.getElementById('emergBlood').value;
    const phone = document.getElementById('emergPhone').value;
    if (!patient || blood === 'فصيلة الدم' || !phone) return alert('المرجو ملء الحقول');
    
    window.emergencies.unshift({ id: Date.now(), patient, blood, phone, status: 'active' });
    localStorage.setItem('emergencies', JSON.stringify(window.emergencies));
    window.renderAll();
    document.getElementById('bloodEmer').style.display = 'none';
};

window.renderAll = function() {
    const dList = document.getElementById('donorsList');
    const eList = document.getElementById('emergList');
    
    // رندر المتبرعين
    dList.innerHTML = window.donors.map(d => `
        <div style="background:#1e293b; border-radius:15px; padding:12px; margin-bottom:10px; border-right:5px solid ${bloodColors[d.blood] || '#ccc'}; display:flex; align-items:center; justify-content:space-between;">
            <div>
                <b style="color:white; font-size:14px;">${d.name}</b>
                <div style="color:${bloodColors[d.blood]}; font-weight:bold; font-size:12px;">فصيلة: ${d.blood}</div>
            </div>
            <a href="tel:${d.phone}" style="background:#10b981; color:white; padding:8px 15px; border-radius:10px; text-decoration:none; font-size:12px;"><i class="fas fa-phone"></i> اتصل</a>
        </div>
    `).join('') || '<div style="color:#64748b; text-align:center; padding:10px;">لا يوجد متبرعون</div>';

    // رندر الحالات المستعجلة
    const active = window.emergencies.filter(e => e.status === 'active');
    eList.innerHTML = active.map(e => `
        <div style="background:#450a0a; border:1px solid #ef4444; border-radius:15px; padding:12px; margin-bottom:10px; display:flex; align-items:center; justify-content:space-between; animation: pulse 2s infinite;">
            <div>
                <b style="color:white; font-size:14px;">🚨 مريض: ${e.patient}</b>
                <div style="color:#fca5a5; font-size:12px;">مطلوب فصيلة: ${e.blood}</div>
            </div>
            <a href="tel:${e.phone}" style="background:#ef4444; color:white; padding:8px 15px; border-radius:10px; text-decoration:none; font-size:12px;">مساعدة</a>
        </div>
    `).join('') || '<div style="color:#64748b; text-align:center; padding:10px;">لا توجد حالات عاجلة ✅</div>';
};

// إضافة تأثير النبض (CSS) برمجياً
const style = document.createElement('style');
style.innerHTML = '@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }';
document.head.appendChild(style);

window.renderAll();
