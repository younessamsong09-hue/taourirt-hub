window.donors = JSON.parse(localStorage.getItem('donors')) || [];
window.emergencies = JSON.parse(localStorage.getItem('emergencies')) || [];

const bloodColors = {
    'A+': '#3b82f6', 'A-': '#60a5fa', 'B+': '#8b5cf6', 'B-': '#a78bfa',
    'AB+': '#ec4899', 'AB-': '#f472b6', 'O+': '#ef4444', 'O-': '#f87171'
};

// --- الدوال الأساسية ---
window.showBloodReg = () => { document.getElementById('bloodReg').style.display = 'block'; document.getElementById('bloodEmer').style.display = 'none'; };
window.showBloodEmer = () => { document.getElementById('bloodEmer').style.display = 'block'; document.getElementById('bloodReg').style.display = 'none'; };

window.addDonor = () => {
    const name = document.getElementById('donorName').value;
    const phone = document.getElementById('donorPhone').value;
    const blood = document.getElementById('donorBlood').value;
    if (!name || !phone || blood === 'فصيلة الدم') return alert('المرجو ملء الحقول');
    window.donors.unshift({ id: Date.now(), name, phone, blood });
    localStorage.setItem('donors', JSON.stringify(window.donors));
    window.renderAll();
    document.getElementById('bloodReg').style.display = 'none';
};

window.addEmergency = () => {
    const patient = document.getElementById('emergPatient').value;
    const blood = document.getElementById('emergBlood').value;
    const phone = document.getElementById('emergPhone').value;
    if (!patient || blood === 'فصيلة الدم' || !phone) return alert('المرجو ملء الحقول');
    window.emergencies.unshift({ id: Date.now(), patient, blood, phone, status: 'active' });
    localStorage.setItem('emergencies', JSON.stringify(window.emergencies));
    window.renderAll();
    document.getElementById('bloodEmer').style.display = 'none';
};

// --- دالة الحذف المبهرة ---
window.deleteBloodItem = (id, type) => {
    const element = document.getElementById(`item-${id}`);
    element.style.transform = "translateX(100px)";
    element.style.opacity = "0";
    
    setTimeout(() => {
        if(type === 'donor') {
            window.donors = window.donors.filter(d => d.id !== id);
            localStorage.setItem('donors', JSON.stringify(window.donors));
        } else {
            window.emergencies = window.emergencies.filter(e => e.id !== id);
            localStorage.setItem('emergencies', JSON.stringify(window.emergencies));
        }
        window.renderAll();
    }, 300);
};

// --- الرندر المطور مع أزرار الحذف ---
window.renderAll = () => {
    const dList = document.getElementById('donorsList');
    const eList = document.getElementById('emergList');

    dList.innerHTML = window.donors.map(d => `
        <div id="item-${d.id}" style="background:#1e293b; border-radius:15px; padding:12px; margin-bottom:10px; border-right:5px solid ${bloodColors[d.blood] || '#ccc'}; display:flex; align-items:center; justify-content:space-between; transition: all 0.3s ease;">
            <div>
                <b style="color:white; font-size:14px;">${d.name}</b>
                <div style="color:${bloodColors[d.blood]}; font-weight:bold; font-size:12px;">فصيلة: ${d.blood}</div>
            </div>
            <div style="display:flex; gap:8px;">
                <a href="tel:${d.phone}" style="background:#10b981; color:white; width:35px; height:35px; border-radius:10px; display:flex; align-items:center; justify-content:center; text-decoration:none;"><i class="fas fa-phone"></i></a>
                <button onclick="deleteBloodItem(${d.id}, 'donor')" style="background:#334155; color:#94a3b8; border:none; width:35px; height:35px; border-radius:10px; cursor:pointer;"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('') || '<div style="color:#64748b; text-align:center; padding:10px;">لا يوجد متبرعون</div>';

    eList.innerHTML = window.emergencies.map(e => `
        <div id="item-${e.id}" style="background:#450a0a; border:1px solid #ef4444; border-radius:15px; padding:12px; margin-bottom:10px; display:flex; align-items:center; justify-content:space-between; animation: pulse 2s infinite; transition: all 0.3s ease;">
            <div>
                <b style="color:white; font-size:14px;">🚨 مريض: ${e.patient}</b>
                <div style="color:#fca5a5; font-size:12px;">مطلوب فصيلة: ${e.blood}</div>
            </div>
            <div style="display:flex; gap:8px;">
                <a href="tel:${e.phone}" style="background:#ef4444; color:white; width:35px; height:35px; border-radius:10px; display:flex; align-items:center; justify-content:center; text-decoration:none;"><i class="fas fa-hand-holding-heart"></i></a>
                <button onclick="deleteBloodItem(${e.id}, 'emerg')" style="background:#7f1d1d; color:#fca5a5; border:none; width:35px; height:35px; border-radius:10px; cursor:pointer;"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('') || '<div style="color:#64748b; text-align:center; padding:10px;">لا توجد حالات عاجلة ✅</div>';
};

// ستايل النبض
if(!document.getElementById('blood-style')) {
    const s = document.createElement('style');
    s.id = 'blood-style';
    s.innerHTML = '@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }';
    document.head.appendChild(s);
}

window.renderAll();
