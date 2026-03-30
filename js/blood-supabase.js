// ========== نظام التبرع بالدم مع Supabase (نسخة منفصلة) ==========

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
        console.log('✅ Supabase متصل');
        await loadDataFromSupabase();
    } catch (err) {
        console.error('خطأ في Supabase:', err);
    }
}

async function loadDataFromSupabase() {
    if (!supabaseClient) return;
    try {
        const { data: donors } = await supabaseClient.from('blood_donors').select('*').order('created_at', { ascending: false });
        if (donors) localStorage.setItem('donors_supabase', JSON.stringify(donors));
        
        const { data: emergencies } = await supabaseClient.from('blood_emergencies').select('*').eq('status', 'active').order('created_at', { ascending: false });
        if (emergencies) localStorage.setItem('emergencies_supabase', JSON.stringify(emergencies));
        
        if (typeof renderAll === 'function') renderAll();
    } catch (err) { console.error(err); }
}

async function saveDonorToSupabase(donor) {
    if (!supabaseClient) return null;
    const { data, error } = await supabaseClient.from('blood_donors').insert([{
        name: donor.name, phone: donor.phone, blood_type: donor.blood, status: 'active', created_at: new Date().toISOString()
    }]).select();
    if (error) throw error;
    return data[0];
}

async function saveEmergencyToSupabase(emergency) {
    if (!supabaseClient) return null;
    const { data, error } = await supabaseClient.from('blood_emergencies').insert([{
        patient_name: emergency.patient, blood_type: emergency.blood, contact_phone: emergency.phone, status: 'active', created_at: new Date().toISOString()
    }]).select();
    if (error) throw error;
    return data[0];
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
    toast.style.cssText = `position:fixed; bottom:100px; right:20px; background:${colors[type]}; color:white; padding:12px 20px; border-radius:12px; z-index:10000; font-size:14px;`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// الدوال الأساسية (نفس الدوال التي تعمل حالياً)
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
        
        if (!name || !phone || !blood) return alert("خطأ: العناصر غير موجودة");
        
        const nameVal = name.value.trim();
        const phoneVal = phone.value.trim();
        const bloodVal = blood.value;
        
        if (!nameVal || !phoneVal || bloodVal === 'فصيلة الدم') return alert('❌ الرجاء ملء جميع الحقول');
        
        const donor = { name: nameVal, phone: phoneVal, blood: bloodVal };
        
        try {
            let savedDonor = null;
            if (supabaseClient) savedDonor = await saveDonorToSupabase(donor);
            
            let donors = JSON.parse(localStorage.getItem('donors') || '[]');
            donors.unshift(savedDonor || { ...donor, id: Date.now() });
            localStorage.setItem('donors', JSON.stringify(donors));
            
            name.value = ''; phone.value = ''; blood.value = 'فصيلة الدم';
            document.getElementById('bloodReg').style.display = 'none';
            showToast('✅ تم تسجيلك كمتبرع!');
            if (typeof renderAll === 'function') renderAll();
        } catch (err) { showToast('❌ حدث خطأ', 'error'); }
    };
    
    window.addEmergency = async function() {
        const patient = document.getElementById('emergPatient');
        const blood = document.getElementById('emergBlood');
        const phone = document.getElementById('emergPhone');
        
        if (!patient || !blood || !phone) return alert("خطأ: العناصر غير موجودة");
        
        const patientVal = patient.value.trim();
        const bloodVal = blood.value;
        const phoneVal = phone.value.trim();
        
        if (!patientVal || bloodVal === 'فصيلة الدم' || !phoneVal) return alert('❌ الرجاء ملء جميع الحقول');
        
        const emergency = { patient: patientVal, blood: bloodVal, phone: phoneVal };
        
        try {
            let savedEmergency = null;
            if (supabaseClient) savedEmergency = await saveEmergencyToSupabase(emergency);
            
            let emergencies = JSON.parse(localStorage.getItem('emergencies') || '[]');
            emergencies.unshift(savedEmergency || { ...emergency, id: Date.now(), status: 'active' });
            localStorage.setItem('emergencies', JSON.stringify(emergencies));
            
            patient.value = ''; blood.value = 'فصيلة الدم'; phone.value = '';
            document.getElementById('bloodEmer').style.display = 'none';
            showToast('🚨 تم نشر الحالة الطارئة!');
            if (typeof renderAll === 'function') renderAll();
        } catch (err) { showToast('❌ حدث خطأ', 'error'); }
    };
    
    console.log("✅ نظام التبرع بالدم (نسخة Supabase) جاهز");
});
