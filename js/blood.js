// ========== منصة التبرع بالدم - تاوريرت ==========
let donors = JSON.parse(localStorage.getItem('blood_donors')) || [];
let emergencies = JSON.parse(localStorage.getItem('blood_emergencies')) || [];

// فصائل الدم
const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// تسجيل متبرع جديد
function registerDonor() {
    const name = document.getElementById('donorName').value;
    const phone = document.getElementById('donorPhone').value;
    const bloodType = document.getElementById('donorBloodType').value;
    const location = document.getElementById('donorLocation').value;
    
    if (!name || !phone || !bloodType) {
        alert('الرجاء ملء جميع الحقول المطلوبة');
        return;
    }
    
    const newDonor = {
        id: Date.now(),
        name, phone, bloodType, location,
        lastDonation: null,
        registeredAt: new Date().toISOString()
    };
    
    donors.push(newDonor);
    localStorage.setItem('blood_donors', JSON.stringify(donors));
    
    // تنظيف النموذج
    document.getElementById('donorName').value = '';
    document.getElementById('donorPhone').value = '';
    document.getElementById('donorLocation').value = '';
    
    alert('تم تسجيلك كمتبرع بالدم بنجاح! شكراً لك 🩸');
    showDonorsList();
}

// عرض قائمة المتبرعين
function showDonorsList() {
    const container = document.getElementById('donorsList');
    if (!container) return;
    
    if (donors.length === 0) {
        container.innerHTML = '<div class="card">📭 لا يوجد متبرعون مسجلون حالياً</div>';
        return;
    }
    
    container.innerHTML = `
        <div class="data-table">
            <table>
                <thead>
                    <tr><th>الاسم</th><th>فصيلة الدم</th><th>الموقع</th><th>الهاتف</th></tr>
                </thead>
                <tbody>
                    ${donors.map(d => `
                        <tr>
                            <td>${d.name}</td>
                            <td><span class="blood-type">${d.bloodType}</span></td>
                            <td>${d.location || 'تاوريرت'}</td>
                            <td><a href="tel:${d.phone}" class="phone-link">${d.phone}</a></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// طلب متبرع (حالة استعجالية)
function requestEmergency() {
    const patientName = document.getElementById('emergencyPatient').value;
    const bloodType = document.getElementById('emergencyBloodType').value;
    const hospital = document.getElementById('emergencyHospital').value;
    const contact = document.getElementById('emergencyContact').value;
    
    if (!patientName || !bloodType || !contact) {
        alert('الرجاء ملء جميع الحقول المطلوبة');
        return;
    }
    
    const emergency = {
        id: Date.now(),
        patientName, bloodType, hospital, contact,
        status: 'active',
        createdAt: new Date().toISOString()
    };
    
    emergencies.unshift(emergency);
    localStorage.setItem('blood_emergencies', JSON.stringify(emergencies));
    
    // البحث عن متبرعين بنفس الفصيلة
    const matchingDonors = donors.filter(d => d.bloodType === bloodType);
    
    let message = `تم نشر حالة الاستعجالية! 🚨\nالمريض: ${patientName}\nفصيلة الدم: ${bloodType}\nالمستشفى: ${hospital || 'المستشفى الإقليمي تاوريرت'}\n`;
    
    if (matchingDonors.length > 0) {
        message += `\n📢 تم إرسال تنبيه إلى ${matchingDonors.length} متبرع من نفس الفصيلة.`;
        
        // إشعار للمتبرعين (محاكاة)
        matchingDonors.forEach(d => {
            console.log(`تنبيه للمتبرع ${d.name}: حالة استعجالية تحتاج ${bloodType}`);
        });
        
        // تنبيه صوتي إذا كان المتصفح يدعم
        if ('Notification' in window && Notification.permission === 'granted') {
            matchingDonors.forEach(d => {
                new Notification(`🚨 حالة استعجالية في تاوريرت`, {
                    body: `المريض ${patientName} يحتاج متبرع بفصيلة ${bloodType}`,
                    icon: '/icons/icon-192x192.png'
                });
            });
        }
    } else {
        message += `\n⚠️ لا يوجد متبرعون مسجلون بفصيلة ${bloodType} حالياً. الرجاء نشر الحالة.`;
    }
    
    alert(message);
    
    // تنظيف النموذج
    document.getElementById('emergencyPatient').value = '';
    document.getElementById('emergencyContact').value = '';
    
    showEmergenciesList();
    
    // طلب إذن الإشعارات
    if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
}

// عرض حالات الاستعجالية
function showEmergenciesList() {
    const container = document.getElementById('emergenciesList');
    if (!container) return;
    
    const activeEmergencies = emergencies.filter(e => e.status === 'active');
    
    if (activeEmergencies.length === 0) {
        container.innerHTML = '<div class="card">✅ لا توجد حالات استعجالية حالياً</div>';
        return;
    }
    
    container.innerHTML = `
        <div class="data-table">
            <table>
                <thead>
                    <tr><th>المريض</th><th>فصيلة الدم</th><th>المستشفى</th><th>جهة الاتصال</th><th>الحالة</th></tr>
                </thead>
                <tbody>
                    ${activeEmergencies.map(e => `
                        <tr class="emergency-row">
                            <td>${e.patientName}</td>
                            <td><span class="blood-type urgent">${e.bloodType}</span></td>
                            <td>${e.hospital || 'المستشفى الإقليمي'}</td>
                            <td><a href="tel:${e.contact}" class="phone-link">${e.contact}</a></td>
                            <td><button onclick="resolveEmergency(${e.id})" class="resolve-btn">تم الحل</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// إنهاء حالة استعجالية
function resolveEmergency(id) {
    emergencies = emergencies.map(e => e.id === id ? { ...e, status: 'resolved' } : e);
    localStorage.setItem('blood_emergencies', JSON.stringify(emergencies));
    showEmergenciesList();
    alert('تم تحديث الحالة');
}

// إحصائيات المتبرعين
function getBloodStats() {
    const stats = {};
    bloodTypes.forEach(bt => stats[bt] = donors.filter(d => d.bloodType === bt).length);
    return stats;
}

// عرض الإحصائيات
function showBloodStats() {
    const stats = getBloodStats();
    const container = document.getElementById('bloodStats');
    if (!container) return;
    
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-number">${donors.length}</div><div class="stat-label">متبرع مسجل</div></div>
            <div class="stat-card"><div class="stat-number">${emergencies.filter(e => e.status === 'active').length}</div><div class="stat-label">حالة نشطة</div></div>
            <div class="stat-card"><div class="stat-number">${emergencies.length}</div><div class="stat-label">حالة سابقة</div></div>
        </div>
        <div class="stats-grid blood-types-stats">
            ${Object.entries(stats).map(([type, count]) => `
                <div class="stat-card small"><div class="stat-number">${count}</div><div class="stat-label">${type}</div></div>
            `).join('')}
        </div>
    `;
}

// طلب إذن الإشعارات عند تحميل الصفحة
if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    setTimeout(() => {
        if (confirm('هل تريد تفعيل الإشعارات للتنبيه بحالات التبرع بالدم؟')) {
            Notification.requestPermission();
        }
    }, 3000);
}
