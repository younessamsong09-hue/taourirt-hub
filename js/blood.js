// ========== نظام التبرع بالدم المتطور مع Supabase ==========

let donors = [];
let emergencies = [];
let supabaseClient = null;

// ألوان فصائل الدم
const bloodColors = {
    'A+': '#3b82f6', 'A-': '#60a5fa', 'B+': '#8b5cf6', 'B-': '#a78bfa',
    'AB+': '#ec4899', 'AB-': '#f472b6', 'O+': '#ef4444', 'O-': '#f87171'
};

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
        
        const SUPABASE_URL = 'https://pyxeusrxoizjlihyqhac.supabase.co';
        const SUPABASE_ANON_KEY = 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt';
        
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase متصل - نظام التبرع بالدم');
        
        // تحميل البيانات من Supabase
        await loadDonorsFromSupabase();
        await loadEmergenciesFromSupabase();
        
        renderAll();
        updateBloodCounts();
        
    } catch (err) {
        console.error('خطأ في Supabase، استخدام localStorage:', err);
        loadFromLocal();
        renderAll();
        updateBloodCounts();
    }
}

// تحميل المتبرعين من Supabase
async function loadDonorsFromSupabase() {
    if (!supabaseClient) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('blood_donors')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (!error && data) {
            donors = data;
            saveDonorsToLocal();
        } else {
            loadDonorsFromLocal();
        }
    } catch (err) {
        loadDonorsFromLocal();
    }
}

// تحميل الحالات الطارئة من Supabase
async function loadEmergenciesFromSupabase() {
    if (!supabaseClient) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('blood_emergencies')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });
        
        if (!error && data) {
            emergencies = data;
            saveEmergenciesToLocal();
        } else {
            loadEmergenciesFromLocal();
        }
    } catch (err) {
        loadEmergenciesFromLocal();
    }
}

// تحميل من localStorage
function loadFromLocal() {
    loadDonorsFromLocal();
    loadEmergenciesFromLocal();
}

function loadDonorsFromLocal() {
    const saved = localStorage.getItem('blood_donors');
    donors = saved ? JSON.parse(saved) : [];
}

function loadEmergenciesFromLocal() {
    const saved = localStorage.getItem('blood_emergencies');
    emergencies = saved ? JSON.parse(saved) : [];
}

// حفظ في localStorage
function saveDonorsToLocal() {
    localStorage.setItem('blood_donors', JSON.stringify(donors));
}

function saveEmergenciesToLocal() {
    localStorage.setItem('blood_emergencies', JSON.stringify(emergencies));
}

// تحديث الأعداد
function updateBloodCounts() {
    const donorCount = document.getElementById('bloodCount');
    if (donorCount) donorCount.innerText = donors.length + emergencies.length;
}

// عرض نموذج المتبرع
window.showBloodReg = function() {
    const regForm = document.getElementById('bloodReg');
    const emerForm = document.getElementById('bloodEmer');
    if (regForm) regForm.style.display = 'block';
    if (emerForm) emerForm.style.display = 'none';
};

// عرض نموذج الحالة الطارئة
window.showBloodEmer = function() {
    const regForm = document.getElementById('bloodReg');
    const emerForm = document.getElementById('bloodEmer');
    if (emerForm) emerForm.style.display = 'block';
    if (regForm) regForm.style.display = 'none';
};

// إضافة متبرع جديد
window.addDonor = async function() {
    const name = document.getElementById('donorName')?.value;
    const phone = document.getElementById('donorPhone')?.value;
    const blood = document.getElementById('donorBlood')?.value;
    
    if (!name || !phone || blood === 'فصيلة الدم') {
        alert('❌ الرجاء ملء جميع الحقول');
        return;
    }
    
    const submitBtn = document.querySelector('#bloodReg button');
    if (submitBtn) {
        submitBtn.textContent = 'جاري التسجيل...';
        submitBtn.disabled = true;
    }
    
    try {
        const newDonor = {
            name: name,
            phone: phone,
            blood_type: blood,
            status: 'active',
            created_at: new Date().toISOString()
        };
        
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('blood_donors')
                .insert([newDonor])
                .select();
            
            if (!error && data && data[0]) {
                donors.unshift(data[0]);
            } else {
                throw error;
            }
        } else {
            newDonor.id = Date.now();
            donors.unshift(newDonor);
        }
        
        saveDonorsToLocal();
        renderAll();
        updateBloodCounts();
        
        // تنظيف النموذج
        document.getElementById('donorName').value = '';
        document.getElementById('donorPhone').value = '';
        document.getElementById('donorBlood').value = 'فصيلة الدم';
        document.getElementById('bloodReg').style.display = 'none';
        
        showToast('✅ تم تسجيلك كمتبرع! شكراً لك.');
        
    } catch (err) {
        console.error(err);
        showToast('❌ حدث خطأ، حاول مرة أخرى', 'error');
    } finally {
        if (submitBtn) {
            submitBtn.textContent = 'تسجيل';
            submitBtn.disabled = false;
        }
    }
};

// إضافة حالة طارئة
window.addEmergency = async function() {
    const patient = document.getElementById('emergPatient')?.value;
    const blood = document.getElementById('emergBlood')?.value;
    const phone = document.getElementById('emergPhone')?.value;
    
    if (!patient || blood === 'فصيلة الدم' || !phone) {
        alert('❌ الرجاء ملء جميع الحقول');
        return;
    }
    
    const submitBtn = document.querySelector('#bloodEmer button');
    if (submitBtn) {
        submitBtn.textContent = 'جاري النشر...';
        submitBtn.disabled = true;
    }
    
    try {
        const newEmergency = {
            patient_name: patient,
            blood_type: blood,
            contact_phone: phone,
            status: 'active',
            created_at: new Date().toISOString()
        };
        
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('blood_emergencies')
                .insert([newEmergency])
                .select();
            
            if (!error && data && data[0]) {
                emergencies.unshift(data[0]);
            } else {
                throw error;
            }
        } else {
            newEmergency.id = Date.now();
            emergencies.unshift(newEmergency);
        }
        
        saveEmergenciesToLocal();
        renderAll();
        updateBloodCounts();
        
        // تنظيف النموذج
        document.getElementById('emergPatient').value = '';
        document.getElementById('emergBlood').value = 'فصيلة الدم';
        document.getElementById('emergPhone').value = '';
        document.getElementById('bloodEmer').style.display = 'none';
        
        showToast('🚨 تم نشر الحالة الطارئة! سيتم إشعار المتبرعين');
        
        // محاولة إشعار المتبرعين المتوافقين
        notifyMatchingDonors(blood);
        
    } catch (err) {
        console.error(err);
        showToast('❌ حدث خطأ، حاول مرة أخرى', 'error');
    } finally {
        if (submitBtn) {
            submitBtn.textContent = 'نشر 🚨';
            submitBtn.disabled = false;
        }
    }
};

// إشعار المتبرعين المتوافقين
async function notifyMatchingDonors(bloodType) {
    const matchingDonors = donors.filter(d => d.blood_type === bloodType);
    if (matchingDonors.length > 0 && supabaseClient) {
        console.log(`📢 يوجد ${matchingDonors.length} متبرع متوافق مع فصيلة ${bloodType}`);
        // يمكن إضافة إشعارات WhatsApp أو SMS هنا لاحقاً
    }
}

// حذف عنصر
window.deleteBloodItem = async (id, type) => {
    const element = document.getElementById(`item-${id}`);
    if (element) {
        element.style.transform = "translateX(100px)";
        element.style.opacity = "0";
    }
    
    setTimeout(async () => {
        try {
            if (type === 'donor') {
                if (supabaseClient) {
                    await supabaseClient
                        .from('blood_donors')
                        .delete()
                        .eq('id', id);
                }
                donors = donors.filter(d => d.id !== id);
                saveDonorsToLocal();
            } else {
                if (supabaseClient) {
                    await supabaseClient
                        .from('blood_emergencies')
                        .update({ status: 'resolved' })
                        .eq('id', id);
                }
                emergencies = emergencies.filter(e => e.id !== id);
                saveEmergenciesToLocal();
            }
            renderAll();
            updateBloodCounts();
            showToast('✅ تم الحذف بنجاح');
        } catch (err) {
            console.error(err);
            showToast('❌ حدث خطأ', 'error');
        }
    }, 300);
};

// عرض القوائم
window.renderAll = () => {
    const dList = document.getElementById('donorsList');
    const eList = document.getElementById('emergList');
    
    if (dList) {
        dList.innerHTML = donors.map(d => `
            <div id="item-${d.id}" style="background:#1e293b; border-radius:15px; padding:12px; margin-bottom:10px; border-right:5px solid ${bloodColors[d.blood_type] || '#ccc'}; display:flex; align-items:center; justify-content:space-between; transition: all 0.3s ease;">
                <div>
                    <b style="color:white; font-size:14px;">${escapeHtml(d.name)}</b>
                    <div style="color:${bloodColors[d.blood_type]}; font-weight:bold; font-size:12px;">فصيلة: ${d.blood_type}</div>
                    <div style="color:#64748b; font-size:10px;">${new Date(d.created_at).toLocaleDateString('ar-MA')}</div>
                </div>
                <div style="display:flex; gap:8px;">
                    <a href="tel:${d.phone}" style="background:#10b981; color:white; width:35px; height:35px; border-radius:10px; display:flex; align-items:center; justify-content:center; text-decoration:none;"><i class="fas fa-phone"></i></a>
                    <button onclick="deleteBloodItem(${d.id}, 'donor')" style="background:#334155; color:#94a3b8; border:none; width:35px; height:35px; border-radius:10px; cursor:pointer;"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('') || '<div style="color:#64748b; text-align:center; padding:10px;">🤝 لا يوجد متبرعون</div>';
    }
    
    if (eList) {
        eList.innerHTML = emergencies.map(e => `
            <div id="item-${e.id}" style="background:#450a0a; border:1px solid #ef4444; border-radius:15px; padding:12px; margin-bottom:10px; display:flex; align-items:center; justify-content:space-between; animation: pulse 2s infinite; transition: all 0.3s ease;">
                <div>
                    <b style="color:white; font-size:14px;">🚨 مريض: ${escapeHtml(e.patient_name)}</b>
                    <div style="color:#fca5a5; font-size:12px;">مطلوب فصيلة: ${e.blood_type}</div>
                    <div style="color:#64748b; font-size:10px;">${new Date(e.created_at).toLocaleDateString('ar-MA')}</div>
                </div>
                <div style="display:flex; gap:8px;">
                    <a href="tel:${e.contact_phone}" style="background:#ef4444; color:white; width:35px; height:35px; border-radius:10px; display:flex; align-items:center; justify-content:center; text-decoration:none;"><i class="fas fa-hand-holding-heart"></i></a>
                    <button onclick="deleteBloodItem(${e.id}, 'emerg')" style="background:#7f1d1d; color:#fca5a5; border:none; width:35px; height:35px; border-radius:10px; cursor:pointer;"><i class="fas fa-check"></i></button>
                </div>
            </div>
        `).join('') || '<div style="color:#64748b; text-align:center; padding:10px;">✅ لا توجد حالات عاجلة</div>';
    }
};

// دالة مساعدة للتنبيهات
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6'
    };
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 12px 20px;
        border-radius: 12px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
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

// إضافة أنماط النبض
if (!document.getElementById('blood-style')) {
    const s = document.createElement('style');
    s.id = 'blood-style';
    s.innerHTML = `
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    `;
    document.head.appendChild(s);
}

// تهيئة النظام
initBloodSupabase();

// ========== دوال التبرع الأساسية ==========

function showBloodReg() {
    console.log("فتح نموذج المتبرع");
    const regForm = document.getElementById('bloodReg');
    const emerForm = document.getElementById('bloodEmer');
    if (regForm) regForm.style.display = 'block';
    if (emerForm) emerForm.style.display = 'none';
}

function showBloodEmer() {
    console.log("فتح نموذج الحالة الطارئة");
    const regForm = document.getElementById('bloodReg');
    const emerForm = document.getElementById('bloodEmer');
    if (emerForm) emerForm.style.display = 'block';
    if (regForm) regForm.style.display = 'none';
}

function addDonor() {
    console.log("إضافة متبرع");
    const name = document.getElementById('donorName')?.value;
    const phone = document.getElementById('donorPhone')?.value;
    const blood = document.getElementById('donorBlood')?.value;
    
    if (!name || !phone || blood === 'فصيلة الدم') {
        alert('❌ الرجاء ملء جميع الحقول');
        return;
    }
    
    let donors = JSON.parse(localStorage.getItem('donors') || '[]');
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
    
    alert('✅ تم تسجيلك كمتبرع!');
    
    if (typeof renderAll === 'function') renderAll();
}

function addEmergency() {
    console.log("إضافة حالة طارئة");
    const patient = document.getElementById('emergPatient')?.value;
    const blood = document.getElementById('emergBlood')?.value;
    const phone = document.getElementById('emergPhone')?.value;
    
    if (!patient || blood === 'فصيلة الدم' || !phone) {
        alert('❌ الرجاء ملء جميع الحقول');
        return;
    }
    
    let emergencies = JSON.parse(localStorage.getItem('emergencies') || '[]');
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
    
    alert('🚨 تم نشر الحالة الطارئة!');
    
    if (typeof renderAll === 'function') renderAll();
}

// تأكيد وجود الدوال في النطاق العام
window.showBloodReg = showBloodReg;
window.showBloodEmer = showBloodEmer;
window.addDonor = addDonor;
window.addEmergency = addEmergency;

console.log("✅ دوال التبرع جاهزة:", {
    showBloodReg: typeof showBloodReg,
    showBloodEmer: typeof showBloodEmer,
    addDonor: typeof addDonor,
    addEmergency: typeof addEmergency
});
