// ========== نظام التبرع بالدم مع Supabase ==========
let supabaseBlood = null;
let donors = [];
let emergencies = [];

const SUPABASE_URL = 'https://pyxeusrxoizjlihyqhac.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt';

async function initBloodSupabase() {
    if (typeof supabase === 'undefined') {
        await new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }
    supabaseBlood = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase - الدم');
    await loadDonors();
    await loadEmergencies();
    renderAll();
    updateBloodCounts();
}

async function loadDonors() {
    const { data, error } = await supabaseBlood
        .from('blood_donors')
        .select('*')
        .order('created_at', { ascending: false });
    if (!error && data) donors = data;
    localStorage.setItem('blood_donors_backup', JSON.stringify(donors));
}
async function loadEmergencies() {
    const { data, error } = await supabaseBlood
        .from('blood_emergencies')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
    if (!error && data) emergencies = data;
    localStorage.setItem('blood_emergencies_backup', JSON.stringify(emergencies));
}

async function addDonorToSupabase(donor) {
    const { data, error } = await supabaseBlood
        .from('blood_donors')
        .insert([donor])
        .select();
    if (error) throw error;
    return data[0];
}
async function addEmergencyToSupabase(emergency) {
    const { data, error } = await supabaseBlood
        .from('blood_emergencies')
        .insert([emergency])
        .select();
    if (error) throw error;
    return data[0];
}

// الدوال الأساسية (showBloodReg, showBloodEmer, addDonor, addEmergency, renderAll, updateBloodCounts, toggleBlood)
// نضيفها هنا مع استخدام Supabase
window.showBloodReg = function() {
    document.getElementById('bloodReg').style.display = 'block';
    document.getElementById('bloodEmer').style.display = 'none';
};
window.showBloodEmer = function() {
    document.getElementById('bloodEmer').style.display = 'block';
    document.getElementById('bloodReg').style.display = 'none';
};
window.addDonor = async function() {
    const name = document.getElementById('donorName').value.trim();
    const phone = document.getElementById('donorPhone').value.trim();
    const blood = document.getElementById('donorBlood').value;
    if (!name || !phone || blood === 'فصيلة الدم') return alert('❌ املأ الحقول');
    const newDonor = { name, phone, blood_type: blood, status: 'active', created_at: new Date().toISOString() };
    try {
        if (supabaseBlood) {
            const saved = await addDonorToSupabase(newDonor);
            donors.unshift(saved);
        } else {
            newDonor.id = Date.now();
            donors.unshift(newDonor);
        }
        localStorage.setItem('blood_donors_backup', JSON.stringify(donors));
        renderAll();
        updateBloodCounts();
        document.getElementById('donorName').value = '';
        document.getElementById('donorPhone').value = '';
        document.getElementById('donorBlood').value = 'فصيلة الدم';
        document.getElementById('bloodReg').style.display = 'none';
        alert('✅ تم التسجيل');
    } catch (err) { alert('❌ خطأ'); }
};
window.addEmergency = async function() {
    const patient = document.getElementById('emergPatient').value.trim();
    const blood = document.getElementById('emergBlood').value;
    const phone = document.getElementById('emergPhone').value.trim();
    if (!patient || blood === 'فصيلة الدم' || !phone) return alert('❌ املأ الحقول');
    const newEmergency = { patient_name: patient, blood_type: blood, contact_phone: phone, status: 'active', created_at: new Date().toISOString() };
    try {
        if (supabaseBlood) {
            const saved = await addEmergencyToSupabase(newEmergency);
            emergencies.unshift(saved);
        } else {
            newEmergency.id = Date.now();
            emergencies.unshift(newEmergency);
        }
        localStorage.setItem('blood_emergencies_backup', JSON.stringify(emergencies));
        renderAll();
        updateBloodCounts();
        document.getElementById('emergPatient').value = '';
        document.getElementById('emergBlood').value = 'فصيلة الدم';
        document.getElementById('emergPhone').value = '';
        document.getElementById('bloodEmer').style.display = 'none';
        alert('🚨 تم النشر');
    } catch (err) { alert('❌ خطأ'); }
};
window.renderAll = function() {
    const donorsListDiv = document.getElementById('donorsList');
    const emergListDiv = document.getElementById('emergList');
    if (donorsListDiv) {
        if (donors.length === 0) donorsListDiv.innerHTML = '<div>🤝 لا يوجد متبرعون</div>';
        else donorsListDiv.innerHTML = donors.map(d => `<div style="background:#1e293b; padding:10px; margin-bottom:5px;"><b>${d.name}</b> (${d.blood_type}) <a href="tel:${d.phone}">اتصل</a></div>`).join('');
    }
    if (emergListDiv) {
        if (emergencies.length === 0) emergListDiv.innerHTML = '<div>✅ لا توجد حالات</div>';
        else emergListDiv.innerHTML = emergencies.map(e => `<div style="background:#450a0a; padding:10px; margin-bottom:5px;">🚨 ${e.patient_name} (${e.blood_type}) <a href="tel:${e.contact_phone}">مساعدة</a></div>`).join('');
    }
};
window.updateBloodCounts = function() {
    const countSpan = document.getElementById('bloodCount');
    if (countSpan) countSpan.innerText = donors.length + emergencies.length;
};
function toggleBlood() {
    const content = document.getElementById('bloodContent');
    const arrow = document.getElementById('bloodArrow');
    if (content) {
        const isVisible = content.style.display === 'block';
        content.style.display = isVisible ? 'none' : 'block';
        if (arrow) arrow.className = isVisible ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
    }
}
document.addEventListener('DOMContentLoaded', () => {
    initBloodSupabase();
});
