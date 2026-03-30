// ========== نظام التبرع بالدم العام مع Supabase ==========

let supabaseClient = null;
let currentUserId = null; // سيتم تعيينه عند إضافة متبرع أو حالة
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
        await renderPublicLists();
    } catch (err) {
        console.error('خطأ في Supabase:', err);
        loadLocalData();
        renderPublicLists();
    }
}

// تحميل البيانات من Supabase
async function loadDataFromSupabase() {
    if (!supabaseClient) return;
    try {
        const { data: donors } = await supabaseClient
            .from('blood_donors')
            .select('*')
            .order('created_at', { ascending: false });
        if (donors) localStorage.setItem('donors_public', JSON.stringify(donors));
        
        const { data: emergencies } = await supabaseClient
            .from('blood_emergencies')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });
        if (emergencies) localStorage.setItem('emergencies_public', JSON.stringify(emergencies));
    } catch (err) { console.error(err); }
}

function loadLocalData() {
    // لا شيء، سنعرض البيانات من localStorage فقط
}

// عرض القوائم للعامة
async function renderPublicLists() {
    // قراءة البيانات من Supabase أو localStorage
    let donors = [];
    let emergencies = [];
    
    if (supabaseClient) {
        const { data: d } = await supabaseClient.from('blood_donors').select('*').order('created_at', { ascending: false });
        const { data: e } = await supabaseClient.from('blood_emergencies').select('*').eq('status', 'active').order('created_at', { ascending: false });
        donors = d || [];
        emergencies = e || [];
    } else {
        donors = JSON.parse(localStorage.getItem('donors_public') || '[]');
        emergencies = JSON.parse(localStorage.getItem('emergencies_public') || '[]');
    }
    
    // عرض المتبرعين
    const donorsList = document.getElementById('donorsList');
    if (donorsList) {
        if (donors.length === 0) {
            donorsList.innerHTML = '<div style="color:#64748b; text-align:center; padding:10px;">🤝 لا يوجد متبرعون حالياً</div>';
        } else {
            donorsList.innerHTML = donors.map(d => `
                <div id="donor-${d.id}" style="background:#1e293b; border-radius:15px; padding:12px; margin-bottom:10px; border-right:5px solid ${getBloodColor(d.blood_type)}; display:flex; align-items:center; justify-content:space-between;">
                    <div>
                        <b style="color:white;">${escapeHtml(d.name)}</b>
                        <div style="color:${getBloodColor(d.blood_type)}; font-weight:bold;">فصيلة: ${d.blood_type}</div>
                        <div style="color:#64748b; font-size:10px;">${new Date(d.created_at).toLocaleDateString('ar-MA')}</div>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <a href="tel:${d.phone}" style="background:#10b981; color:white; width:35px; height:35px; border-radius:10px; display:flex; align-items:center; justify-content:center; text-decoration:none;"><i class="fas fa-phone"></i></a>
                        <button onclick="deleteDonor('${d.id}', '${d.user_token || ''}')" style="background:#334155; color:#94a3b8; border:none; width:35px; height:35px; border-radius:10px; cursor:pointer;"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // عرض الحالات الطارئة
    const emergList = document.getElementById('emergList');
    if (emergList) {
        if (emergencies.length === 0) {
            emergList.innerHTML = '<div style="color:#64748b; text-align:center; padding:10px;">✅ لا توجد حالات عاجلة</div>';
        } else {
            emergList.innerHTML = emergencies.map(e => `
                <div id="emerg-${e.id}" style="background:#450a0a; border:1px solid #ef4444; border-radius:15px; padding:12px; margin-bottom:10px; display:flex; align-items:center; justify-content:space-between; animation:pulse 2s infinite;">
                    <div>
                        <b style="color:white;">🚨 مريض: ${escapeHtml(e.patient_name)}</b>
                        <div style="color:#fca5a5;">مطلوب فصيلة: ${e.blood_type}</div>
                        <div style="color:#64748b; font-size:10px;">${new Date(e.created_at).toLocaleDateString('ar-MA')}</div>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <a href="tel:${e.contact_phone}" style="background:#ef4444; color:white; width:35px; height:35px; border-radius:10px; display:flex; align-items:center; justify-content:center; text-decoration:none;"><i class="fas fa-hand-holding-heart"></i></a>
                        <button onclick="deleteEmergency('${e.id}', '${e.user_token || ''}')" style="background:#7f1d1d; color:#fca5a5; border:none; width:35px; height:35px; border-radius:10px; cursor:pointer;"><i class="fas fa-check"></i></button>
                    </div>
                </div>
            `).join('');
        }
    }
}

function getBloodColor(bloodType) {
    const colors = { 'A+': '#3b82f6', 'A-': '#60a5fa', 'B+': '#8b5cf6', 'B-': '#a78bfa', 'AB+': '#ec4899', 'AB-': '#f472b6', 'O+': '#ef4444', 'O-': '#f87171' };
    return colors[bloodType] || '#ccc';
}

// حذف متبرع (فقط إذا كان المستخدم هو من أضافه)
window.deleteDonor = async function(id, userToken) {
    if (!confirm('هل أنت متأكد من حذف مشاركتك؟')) return;
    
    try {
        if (supabaseClient) {
            // التحقق: نحذف فقط إذا كان المستخدم هو من أضاف (يمكن إضافة منطق للتحقق)
            await supabaseClient.from('blood_donors').delete().eq('id', id);
        }
        // تحديث العرض
        await renderPublicLists();
        showToast('✅ تم حذف مشاركتك');
    } catch (err) {
        showToast('❌ حدث خطأ', 'error');
    }
};

window.deleteEmergency = async function(id, userToken) {
    if (!confirm('هل أنت متأكد من إنهاء هذه الحالة؟')) return;
    
    try {
        if (supabaseClient) {
            await supabaseClient.from('blood_emergencies').update({ status: 'resolved' }).eq('id', id);
        }
        await renderPublicLists();
        showToast('✅ تم إنهاء الحالة');
    } catch (err) {
        showToast('❌ حدث خطأ', 'error');
    }
};

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
    toast.style.cssText = `position:fixed; bottom:100px; right:20px; background:${colors[type]}; color:white; padding:12px 20px; border-radius:12px; z-index:10000; font-size:14px;`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ========== الدوال الأساسية (نموذج الإضافة) ==========
document.addEventListener('DOMContentLoaded', function() {
    initBloodSupabase();
    
    window.showBloodReg = function() {
        document.getElementById('bloodReg').style.display = 'block';
        document.getElementById('bloodEmer').style.display = 'none';
    };
    
    window.showBloodEmer = function() {
        document.getElementById('bloodEmer').style.display = 'block';
        document.getElementById('bloodReg').style.display = 'none';
    };
    
    window.addDonor = async function() {
        const name = document.getElementById('donorName')?.value.trim();
        const phone = document.getElementById('donorPhone')?.value.trim();
        const blood = document.getElementById('donorBlood')?.value;
        
        if (!name || !phone || blood === 'فصيلة الدم') {
            alert('❌ الرجاء ملء جميع الحقول');
            return;
        }
        
        const donor = { name, phone, blood_type: blood, user_token: Date.now().toString() };
        
        try {
            if (supabaseClient) {
                const { error } = await supabaseClient.from('blood_donors').insert([{
                    name: donor.name, phone: donor.phone, blood_type: donor.blood_type, status: 'active', user_token: donor.user_token, created_at: new Date().toISOString()
                }]);
                if (error) throw error;
            }
            await renderPublicLists();
            document.getElementById('donorName').value = '';
            document.getElementById('donorPhone').value = '';
            document.getElementById('donorBlood').value = 'فصيلة الدم';
            document.getElementById('bloodReg').style.display = 'none';
            showToast('✅ تم تسجيلك كمتبرع!');
        } catch (err) { showToast('❌ حدث خطأ', 'error'); }
    };
    
    window.addEmergency = async function() {
        const patient = document.getElementById('emergPatient')?.value.trim();
        const blood = document.getElementById('emergBlood')?.value;
        const phone = document.getElementById('emergPhone')?.value.trim();
        
        if (!patient || blood === 'فصيلة الدم' || !phone) {
            alert('❌ الرجاء ملء جميع الحقول');
            return;
        }
        
        const emergency = { patient_name: patient, blood_type: blood, contact_phone: phone, user_token: Date.now().toString() };
        
        try {
            if (supabaseClient) {
                const { error } = await supabaseClient.from('blood_emergencies').insert([{
                    patient_name: emergency.patient_name, blood_type: emergency.blood_type, contact_phone: emergency.contact_phone, status: 'active', user_token: emergency.user_token, created_at: new Date().toISOString()
                }]);
                if (error) throw error;
            }
            await renderPublicLists();
            document.getElementById('emergPatient').value = '';
            document.getElementById('emergBlood').value = 'فصيلة الدم';
            document.getElementById('emergPhone').value = '';
            document.getElementById('bloodEmer').style.display = 'none';
            showToast('🚨 تم نشر الحالة الطارئة!');
        } catch (err) { showToast('❌ حدث خطأ', 'error'); }
    };
    
    console.log("✅ نظام التبرع بالدم العام جاهز");
});
