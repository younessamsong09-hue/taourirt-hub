// ========== نظام التبرع بالدم - نسخة نظيفة ==========

// تحميل البيانات من localStorage
let donors = JSON.parse(localStorage.getItem('donors') || '[]');
let emergencies = JSON.parse(localStorage.getItem('emergencies') || '[]');

// عرض البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    renderDonors();
    renderEmergencies();
    updateCounts();
});

// عرض المتبرعين
function renderDonors() {
    const container = document.getElementById('donorsList');
    if (!container) return;
    
    if (donors.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:20px; color:#64748b;">🤝 لا يوجد متبرعون</div>';
        return;
    }
    
    container.innerHTML = donors.map(d => `
        <div style="background:#1e293b; border-radius:12px; padding:12px; margin-bottom:8px; border-right:4px solid #10b981;">
            <div style="display:flex; justify-content:space-between;">
                <div>
                    <b style="color:white;">${escapeHtml(d.name)}</b>
                    <div style="color:#10b981; font-size:12px;">فصيلة: ${d.blood}</div>
                </div>
                <a href="tel:${d.phone}" style="background:#10b981; color:white; padding:6px 12px; border-radius:20px; text-decoration:none; font-size:12px;">
                    <i class="fas fa-phone"></i> اتصل
                </a>
            </div>
        </div>
    `).join('');
}

// عرض الحالات الطارئة
function renderEmergencies() {
    const container = document.getElementById('emergList');
    if (!container) return;
    
    if (emergencies.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:20px; color:#64748b;">✅ لا توجد حالات طارئة</div>';
        return;
    }
    
    container.innerHTML = emergencies.map(e => `
        <div style="background:#450a0a; border-radius:12px; padding:12px; margin-bottom:8px; border:1px solid #ef4444;">
            <div style="display:flex; justify-content:space-between;">
                <div>
                    <b style="color:white;">🚨 ${escapeHtml(e.patient)}</b>
                    <div style="color:#fca5a5; font-size:12px;">مطلوب: ${e.blood}</div>
                </div>
                <a href="tel:${e.phone}" style="background:#ef4444; color:white; padding:6px 12px; border-radius:20px; text-decoration:none; font-size:12px;">
                    <i class="fas fa-hand-holding-heart"></i> مساعدة
                </a>
            </div>
        </div>
    `).join('');
}

function updateCounts() {
    const countSpan = document.getElementById('bloodCount');
    if (countSpan) countSpan.innerText = donors.length + emergencies.length;
}

// دوال الأزرار
window.showBloodReg = function() {
    document.getElementById('bloodReg').style.display = 'block';
    document.getElementById('bloodEmer').style.display = 'none';
};

window.showBloodEmer = function() {
    document.getElementById('bloodEmer').style.display = 'block';
    document.getElementById('bloodReg').style.display = 'none';
};

window.addDonor = function() {
    const name = document.getElementById('donorName')?.value.trim();
    const phone = document.getElementById('donorPhone')?.value.trim();
    const blood = document.getElementById('donorBlood')?.value;
    
    if (!name || !phone || blood === 'فصيلة الدم') {
        alert('❌ الرجاء ملء جميع الحقول');
        return;
    }
    
    donors.unshift({
        id: Date.now(),
        name: name,
        phone: phone,
        blood: blood,
        date: new Date().toISOString()
    });
    
    localStorage.setItem('donors', JSON.stringify(donors));
    
    document.getElementById('donorName').value = '';
    document.getElementById('donorPhone').value = '';
    document.getElementById('donorBlood').value = 'فصيلة الدم';
    document.getElementById('bloodReg').style.display = 'none';
    
    renderDonors();
    updateCounts();
    alert('✅ تم تسجيلك كمتبرع!');
};

window.addEmergency = function() {
    const patient = document.getElementById('emergPatient')?.value.trim();
    const blood = document.getElementById('emergBlood')?.value;
    const phone = document.getElementById('emergPhone')?.value.trim();
    
    if (!patient || blood === 'فصيلة الدم' || !phone) {
        alert('❌ الرجاء ملء جميع الحقول');
        return;
    }
    
    emergencies.unshift({
        id: Date.now(),
        patient: patient,
        blood: blood,
        phone: phone,
        status: 'active',
        date: new Date().toISOString()
    });
    
    localStorage.setItem('emergencies', JSON.stringify(emergencies));
    
    document.getElementById('emergPatient').value = '';
    document.getElementById('emergBlood').value = 'فصيلة الدم';
    document.getElementById('emergPhone').value = '';
    document.getElementById('bloodEmer').style.display = 'none';
    
    renderEmergencies();
    updateCounts();
    alert('🚨 تم نشر الحالة الطارئة!');
};

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}
