// ========== نظام التبرع بالدم مع Supabase ==========

let donors = [];
let emergencies = [];
let supabaseClient = null;

const SUPABASE_URL = 'https://pyxeusrxoizjlihyqhac.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt';

// تهيئة Supabase
async function initSupabase() {
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
        await loadData();
    } catch (err) {
        console.error('خطأ:', err);
        loadLocalData();
    }
}

// تحميل البيانات من Supabase
async function loadData() {
    if (!supabaseClient) return;
    
    try {
        // تحميل المتبرعين
        const { data: donorsData, error: dError } = await supabaseClient
            .from('blood_donors')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (!dError && donorsData) {
            donors = donorsData;
            localStorage.setItem('donors_supabase', JSON.stringify(donors));
        } else {
            loadLocalDonors();
        }
        
        // تحميل الحالات الطارئة
        const { data: emergenciesData, error: eError } = await supabaseClient
            .from('blood_emergencies')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });
        
        if (!eError && emergenciesData) {
            emergencies = emergenciesData;
            localStorage.setItem('emergencies_supabase', JSON.stringify(emergencies));
        } else {
            loadLocalEmergencies();
        }
        
        renderAll();
        updateCounts();
        
    } catch (err) {
        console.error('خطأ في تحميل البيانات:', err);
        loadLocalData();
        renderAll();
        updateCounts();
    }
}

function loadLocalData() {
    loadLocalDonors();
    loadLocalEmergencies();
}

function loadLocalDonors() {
    const saved = localStorage.getItem('donors_supabase');
    donors = saved ? JSON.parse(saved) : [];
}

function loadLocalEmergencies() {
    const saved = localStorage.getItem('emergencies_supabase');
    emergencies = saved ? JSON.parse(saved) : [];
}

// عرض المتبرعين
function renderDonors() {
    const container = document.getElementById('donorsList');
    if (!container) return;
    
    if (donors.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:20px; color:#64748b;">🤝 لا يوجد متبرعون</div>';
        return;
    }
    
    const bloodColors = {
        'A+': '#3b82f6', 'A-': '#60a5fa', 'B+': '#8b5cf6', 'B-': '#a78bfa',
        'AB+': '#ec4899', 'AB-': '#f472b6', 'O+': '#ef4444', 'O-': '#f87171'
    };
    
    container.innerHTML = donors.map(d => `
        <div style="background:#1e293b; border-radius:12px; padding:12px; margin-bottom:8px; border-right:4px solid ${bloodColors[d.blood_type] || '#10b981'};">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <b style="color:white;">${escapeHtml(d.name)}</b>
                    <div style="color:${bloodColors[d.blood_type] || '#10b981'}; font-size:12px; font-weight:bold;">فصيلة: ${d.blood_type}</div>
                    <div style="color:#64748b; font-size:10px;">${new Date(d.created_at).toLocaleDateString('ar-MA')}</div>
                </div>
                <a href="tel:${d.phone}" style="background:#10b981; color:white; padding:8px 12px; border-radius:20px; text-decoration:none; font-size:12px;">
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
    
    const bloodColors = {
        'A+': '#3b82f6', 'A-': '#60a5fa', 'B+': '#8b5cf6', 'B-': '#a78bfa',
        'AB+': '#ec4899', 'AB-': '#f472b6', 'O+': '#ef4444', 'O-': '#f87171'
    };
    
    container.innerHTML = emergencies.map(e => `
        <div style="background:#450a0a; border-radius:12px; padding:12px; margin-bottom:8px; border:1px solid #ef4444; animation:pulseRed 1.5s infinite;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <b style="color:white;">🚨 ${escapeHtml(e.patient_name)}</b>
                    <div style="color:${bloodColors[e.blood_type] || '#fca5a5'}; font-size:12px; font-weight:bold;">مطلوب فصيلة: ${e.blood_type}</div>
                    <div style="color:#64748b; font-size:10px;">${new Date(e.created_at).toLocaleDateString('ar-MA')}</div>
                </div>
                <a href="tel:${e.contact_phone}" style="background:#ef4444; color:white; padding:8px 12px; border-radius:20px; text-decoration:none; font-size:12px;">
                    <i class="fas fa-hand-holding-heart"></i> مساعدة
                </a>
            </div>
        </div>
    `).join('');
}

function renderAll() {
    renderDonors();
    renderEmergencies();
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

// إضافة متبرع
window.addDonor = async function() {
    const name = document.getElementById('donorName')?.value.trim();
    const phone = document.getElementById('donorPhone')?.value.trim();
    const blood = document.getElementById('donorBlood')?.value;
    
    if (!name || !phone || blood === 'فصيلة الدم') {
        alert('❌ الرجاء ملء جميع الحقول');
        return;
    }
    
    const newDonor = {
        name: name,
        phone: phone,
        blood_type: blood,
        status: 'active',
        created_at: new Date().toISOString()
    };
    
    try {
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('blood_donors')
                .insert([newDonor])
                .select();
            
            if (!error && data) {
                donors.unshift(data[0]);
            } else {
                throw error;
            }
        } else {
            newDonor.id = Date.now();
            donors.unshift(newDonor);
        }
        
        localStorage.setItem('donors_supabase', JSON.stringify(donors));
        
        document.getElementById('donorName').value = '';
        document.getElementById('donorPhone').value = '';
        document.getElementById('donorBlood').value = 'فصيلة الدم';
        document.getElementById('bloodReg').style.display = 'none';
        
        renderDonors();
        updateCounts();
        alert('✅ تم تسجيلك كمتبرع!');
        
    } catch (err) {
        console.error(err);
        alert('❌ حدث خطأ، حاول مرة أخرى');
    }
};

// إضافة حالة طارئة
window.addEmergency = async function() {
    const patient = document.getElementById('emergPatient')?.value.trim();
    const blood = document.getElementById('emergBlood')?.value;
    const phone = document.getElementById('emergPhone')?.value.trim();
    
    if (!patient || blood === 'فصيلة الدم' || !phone) {
        alert('❌ الرجاء ملء جميع الحقول');
        return;
    }
    
    const newEmergency = {
        patient_name: patient,
        blood_type: blood,
        contact_phone: phone,
        status: 'active',
        created_at: new Date().toISOString()
    };
    
    try {
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('blood_emergencies')
                .insert([newEmergency])
                .select();
            
            if (!error && data) {
                emergencies.unshift(data[0]);
            } else {
                throw error;
            }
        } else {
            newEmergency.id = Date.now();
            emergencies.unshift(newEmergency);
        }
        
        localStorage.setItem('emergencies_supabase', JSON.stringify(emergencies));
        
        document.getElementById('emergPatient').value = '';
        document.getElementById('emergBlood').value = 'فصيلة الدم';
        document.getElementById('emergPhone').value = '';
        document.getElementById('bloodEmer').style.display = 'none';
        
        renderEmergencies();
        updateCounts();
        alert('🚨 تم نشر الحالة الطارئة!');
        
    } catch (err) {
        console.error(err);
        alert('❌ حدث خطأ، حاول مرة أخرى');
    }
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

// إضافة أنماط
const style = document.createElement('style');
style.textContent = `
    @keyframes pulseRed {
        0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
        70% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
        100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
    }
`;
document.head.appendChild(style);

// تهيئة النظام
document.addEventListener('DOMContentLoaded', function() {
    initSupabase();
});
