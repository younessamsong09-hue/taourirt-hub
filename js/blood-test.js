// نظام تبرع بالدم - تجريبي

console.log("🧪 تجربة نظام التبرع");

// بيانات تجريبية
let donors = [];
let emergencies = [];

// عرض المتبرعين
function showDonors() {
    const container = document.getElementById('donorsList');
    if (!container) return;
    
    if (donors.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:20px;">🤝 لا يوجد متبرعون</div>';
        return;
    }
    
    container.innerHTML = donors.map(d => `
        <div style="background:#1e293b; border-radius:12px; padding:12px; margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between;">
                <div>
                    <b style="color:white;">${d.name}</b>
                    <div style="color:#10b981;">فصيلة: ${d.blood}</div>
                </div>
                <a href="tel:${d.phone}" style="background:#10b981; color:white; padding:6px 12px; border-radius:20px; text-decoration:none;">اتصل</a>
            </div>
        </div>
    `).join('');
}

// عرض الحالات
function showEmergencies() {
    const container = document.getElementById('emergList');
    if (!container) return;
    
    if (emergencies.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:20px;">✅ لا توجد حالات</div>';
        return;
    }
    
    container.innerHTML = emergencies.map(e => `
        <div style="background:#450a0a; border-radius:12px; padding:12px; margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between;">
                <div>
                    <b style="color:white;">🚨 ${e.patient}</b>
                    <div style="color:#fca5a5;">مطلوب: ${e.blood}</div>
                </div>
                <a href="tel:${e.phone}" style="background:#ef4444; color:white; padding:6px 12px; border-radius:20px; text-decoration:none;">مساعدة</a>
            </div>
        </div>
    `).join('');
}

// دوال الأزرار
window.showBloodReg = function() {
    document.getElementById('bloodReg').style.display = 'block';
    document.getElementById('bloodEmer').style.display = 'none';
    console.log("فتح نموذج متبرع");
};

window.showBloodEmer = function() {
    document.getElementById('bloodEmer').style.display = 'block';
    document.getElementById('bloodReg').style.display = 'none';
    console.log("فتح نموذج حالة");
};

window.addDonor = function() {
    const name = document.getElementById('donorName')?.value;
    const phone = document.getElementById('donorPhone')?.value;
    const blood = document.getElementById('donorBlood')?.value;
    
    if (!name || !phone || blood === 'فصيلة الدم') {
        alert("❌ املأ جميع الحقول");
        return;
    }
    
    donors.unshift({
        id: Date.now(),
        name: name,
        phone: phone,
        blood: blood,
        date: new Date().toISOString()
    });
    
    showDonors();
    
    document.getElementById('donorName').value = '';
    document.getElementById('donorPhone').value = '';
    document.getElementById('donorBlood').value = 'فصيلة الدم';
    document.getElementById('bloodReg').style.display = 'none';
    
    alert("✅ تم التسجيل");
    console.log("تم إضافة متبرع:", name);
};

window.addEmergency = function() {
    const patient = document.getElementById('emergPatient')?.value;
    const blood = document.getElementById('emergBlood')?.value;
    const phone = document.getElementById('emergPhone')?.value;
    
    if (!patient || blood === 'فصيلة الدم' || !phone) {
        alert("❌ املأ جميع الحقول");
        return;
    }
    
    emergencies.unshift({
        id: Date.now(),
        patient: patient,
        blood: blood,
        phone: phone,
        date: new Date().toISOString()
    });
    
    showEmergencies();
    
    document.getElementById('emergPatient').value = '';
    document.getElementById('emergBlood').value = 'فصيلة الدم';
    document.getElementById('emergPhone').value = '';
    document.getElementById('bloodEmer').style.display = 'none';
    
    alert("🚨 تم النشر");
    console.log("تم إضافة حالة:", patient);
};

// تهيئة
document.addEventListener('DOMContentLoaded', function() {
    showDonors();
    showEmergencies();
    alert("🧪 نظام التبرع التجريبي جاهز - جرب إضافة متبرع");
    console.log("نظام التبرع التجريبي جاهز");
});
