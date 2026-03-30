// ========== نظام التبرع بالدم المتطور مع Supabase ==========

let supabaseClient = null;
const SUPABASE_URL = 'https://pyxeusrxoizjlihyqhac.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt';

// تهيئة Supabase
async function initBloodSupabase() {
    try {
        if (typeof supabase === 'undefined') {
            await new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
                script.onload = resolve;
                document.head.appendChild(script);
            });
        }
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase متصل - نظام التبرع');
        await loadDataFromSupabase();
    } catch (err) {
        console.error('خطأ في Supabase، استخدام localStorage:', err);
    }
}

// تحميل البيانات من Supabase
async function loadDataFromSupabase() {
    if (!supabaseClient) return;
    
    try {
        // تحميل المتبرعين
        const { data: donors, error: dError } = await supabaseClient
            .from('blood_donors')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (!dError && donors) {
            localStorage.setItem('donors', JSON.stringify(donors));
            if (typeof renderAll === 'function') renderAll();
        }
        
        // تحميل الحالات الطارئة
        const { data: emergencies, error: eError } = await supabaseClient
            .from('blood_emergencies')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });
        
        if (!eError && emergencies) {
            localStorage.setItem('emergencies', JSON.stringify(emergencies));
            if (typeof renderAll === 'function') renderAll();
        }
    } catch (err) {
        console.error('خطأ في تحميل البيانات:', err);
    }
}

// حفظ متبرع في Supabase
async function saveDonorToSupabase(donor) {
    if (!supabaseClient) return null;
    
    const { data, error } = await supabaseClient
        .from('blood_donors')
        .insert([{
            name: donor.name,
            phone: donor.phone,
            blood_type: donor.blood,
            status: 'active',
            created_at: new Date().toISOString()
        }])
        .select();
    
    if (error) throw error;
    return data[0];
}

// حفظ حالة طارئة في Supabase
async function saveEmergencyToSupabase(emergency) {
    if (!supabaseClient) return null;
    
    const { data, error } = await supabaseClient
        .from('blood_emergencies')
        .insert([{
            patient_name: emergency.patient,
            blood_type: emergency.blood,
            contact_phone: emergency.phone,
            status: 'active',
            created_at: new Date().toISOString()
        }])
        .select();
    
    if (error) throw error;
    return data[0];
}

// إشعار المتبرعين المتوافقين
async function notifyMatchingDonors(bloodType) {
    const donors = JSON.parse(localStorage.getItem('donors') || '[]');
    const matchingDonors = donors.filter(d => d.blood_type === bloodType);
    
    if (matchingDonors.length > 0) {
        console.log(`📢 يوجد ${matchingDonors.length} متبرع متوافق مع فصيلة ${bloodType}`);
        // يمكن إضافة إشعارات WhatsApp هنا لاحقاً
        showToast(`📢 يوجد ${matchingDonors.length} متبرع متوافق مع فصيلة ${bloodType}`, 'info');
    }
}

// عرض رسالة منبثقة
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
    toast.style.cssText = `
        position: fixed; bottom: 100px; right: 20px;
        background: ${colors[type]}; color: white;
        padding: 12px 20px; border-radius: 12px;
        z-index: 10000; animation: fadeIn 0.3s ease;
        font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// تسجيل الدوال في النطاق العام
document.addEventListener('DOMContentLoaded', function() {
    initBloodSupabase();
    
    window.showBloodReg = function() {
        const reg = document.getElementById('bloodReg');
        const emer = document.getElementById('bloodEmer');
        if (reg) reg.style.display = 'block';
        if (emer) emer.style.display = 'none';
    };
    
    window.showBloodEmer = function() {
        const reg = document.getElementById('bloodReg');
        const emer = document.getElementById('bloodEmer');
        if (emer) emer.style.display = 'block';
        if (reg) reg.style.display = 'none';
    };
    
    window.addDonor = async function() {
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
        
        const donor = { name: nameVal, phone: phoneVal, blood: bloodVal };
        
        try {
            // حفظ في Supabase
            const savedDonor = await saveDonorToSupabase(donor);
            
            // حفظ في localStorage
            let donors = JSON.parse(localStorage.getItem('donors') || '[]');
            donors.unshift(savedDonor || { ...donor, id: Date.now() });
            localStorage.setItem('donors', JSON.stringify(donors));
            
            // تنظيف النموذج
            name.value = '';
            phone.value = '';
            blood.value = 'فصيلة الدم';
            document.getElementById('bloodReg').style.display = 'none';
            
            showToast('✅ تم تسجيلك كمتبرع! شكراً لك.');
            if (typeof renderAll === 'function') renderAll();
            
        } catch (err) {
            console.error(err);
            showToast('❌ حدث خطأ، حاول مرة أخرى', 'error');
        }
    };
    
    window.addEmergency = async function() {
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
        
        const emergency = { patient: patientVal, blood: bloodVal, phone: phoneVal };
        
        try {
            // حفظ في Supabase
            const savedEmergency = await saveEmergencyToSupabase(emergency);
            
            // حفظ في localStorage
            let emergencies = JSON.parse(localStorage.getItem('emergencies') || '[]');
            emergencies.unshift(savedEmergency || { ...emergency, id: Date.now(), status: 'active' });
            localStorage.setItem('emergencies', JSON.stringify(emergencies));
            
            // تنظيف النموذج
            patient.value = '';
            blood.value = 'فصيلة الدم';
            phone.value = '';
            document.getElementById('bloodEmer').style.display = 'none';
            
            showToast('🚨 تم نشر الحالة الطارئة!');
            
            // إشعار المتبرعين المتوافقين
            await notifyMatchingDonors(bloodVal);
            
            if (typeof renderAll === 'function') renderAll();
            
        } catch (err) {
            console.error(err);
            showToast('❌ حدث خطأ، حاول مرة أخرى', 'error');
        }
    };
    
    console.log("✅ نظام التبرع بالدم المتطور جاهز");
});
