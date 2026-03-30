// ========== نظام التبرع بالدم البسيط ==========

// تأكد من وجود العناصر
document.addEventListener('DOMContentLoaded', function() {
    console.log("نظام التبرع بالدم جاهز");
    
    // تسجيل الدوال في النطاق العام
    window.showBloodReg = function() {
        console.log("فتح نموذج متبرع");
        const reg = document.getElementById('bloodReg');
        const emer = document.getElementById('bloodEmer');
        if (reg) reg.style.display = 'block';
        if (emer) emer.style.display = 'none';
    };
    
    window.showBloodEmer = function() {
        console.log("فتح نموذج حالة طارئة");
        const reg = document.getElementById('bloodReg');
        const emer = document.getElementById('bloodEmer');
        if (emer) emer.style.display = 'block';
        if (reg) reg.style.display = 'none';
    };
    
    window.addDonor = function() {
        console.log("إضافة متبرع");
        const name = document.getElementById('donorName');
        const phone = document.getElementById('donorPhone');
        const blood = document.getElementById('donorBlood');
        
        if (!name || !phone || !blood) {
            alert("خطأ: العناصر غير موجودة");
            return;
        }
        
        const nameVal = name.value.trim();
        const phoneVal = phone.value.trim();
        const bloodVal = blood.value;
        
        if (!nameVal || !phoneVal || bloodVal === 'فصيلة الدم') {
            alert('❌ الرجاء ملء جميع الحقول');
            return;
        }
        
        // حفظ في localStorage
        let donors = JSON.parse(localStorage.getItem('donors') || '[]');
        donors.unshift({
            id: Date.now(),
            name: nameVal,
            phone: phoneVal,
            blood: bloodVal,
            date: new Date().toISOString()
        });
        localStorage.setItem('donors', JSON.stringify(donors));
        
        // تنظيف النموذج
        name.value = '';
        phone.value = '';
        blood.value = 'فصيلة الدم';
        
        const bloodReg = document.getElementById('bloodReg');
        if (bloodReg) bloodReg.style.display = 'none';
        
        alert('✅ تم تسجيلك كمتبرع!');
        
        // تحديث العرض إذا كانت الدالة موجودة
        if (typeof renderAll === 'function') renderAll();
    };
    
    window.addEmergency = function() {
        console.log("إضافة حالة طارئة");
        const patient = document.getElementById('emergPatient');
        const blood = document.getElementById('emergBlood');
        const phone = document.getElementById('emergPhone');
        
        if (!patient || !blood || !phone) {
            alert("خطأ: العناصر غير موجودة");
            return;
        }
        
        const patientVal = patient.value.trim();
        const bloodVal = blood.value;
        const phoneVal = phone.value.trim();
        
        if (!patientVal || bloodVal === 'فصيلة الدم' || !phoneVal) {
            alert('❌ الرجاء ملء جميع الحقول');
            return;
        }
        
        // حفظ في localStorage
        let emergencies = JSON.parse(localStorage.getItem('emergencies') || '[]');
        emergencies.unshift({
            id: Date.now(),
            patient: patientVal,
            blood: bloodVal,
            phone: phoneVal,
            status: 'active',
            date: new Date().toISOString()
        });
        localStorage.setItem('emergencies', JSON.stringify(emergencies));
        
        // تنظيف النموذج
        patient.value = '';
        blood.value = 'فصيلة الدم';
        phone.value = '';
        
        const bloodEmer = document.getElementById('bloodEmer');
        if (bloodEmer) bloodEmer.style.display = 'none';
        
        alert('🚨 تم نشر الحالة الطارئة!');
        
        // تحديث العرض إذا كانت الدالة موجودة
        if (typeof renderAll === 'function') renderAll();
    };
    
    // عرض تنبيه تأكيد
    alert("✅ نظام التبرع بالدم يعمل");
});
