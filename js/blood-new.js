// ========== نظام التبرع بالدم - نسخة جديدة كلياً ==========
// تم إنشاؤها من الصفر

console.log("🚀 بدء تشغيل نظام التبرع بالدم الجديد");

// بيانات Supabase
const SUPABASE_URL = 'https://pyxeusrxoizjlihyqhac.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt';

let supabase = null;
let donorsList = [];
let emergenciesList = [];

// تهيئة النظام
async function initBloodSystem() {
    try {
        // تحميل مكتبة Supabase
        if (typeof supabase === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
            await new Promise((resolve) => {
                script.onload = resolve;
                document.head.appendChild(script);
            });
        }
        
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("✅ Supabase متصل");
        
        // تحميل البيانات
        await loadData();
        
        // عرض البيانات
        renderData();
        
        // تحديث العداد
        updateCounter();
        
        // تنبيه نجاح
        showNotification("✅ نظام التبرع بالدم جاهز", "success");
        
    } catch (error) {
        console.error("خطأ:", error);
        showNotification("⚠️ مشكلة في الاتصال، جاري استخدام التخزين المحلي", "warning");
        loadLocalData();
        renderData();
        updateCounter();
    }
}

// تحميل البيانات من Supabase
async function loadData() {
    if (!supabase) return;
    
    // تحميل المتبرعين
    const { data: donors, error: dError } = await supabase
        .from('blood_donors')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (!dError && donors) {
        donorsList = donors;
        localStorage.setItem('blood_donors_data', JSON.stringify(donors));
        console.log(`✅ تم تحميل ${donors.length} متبرع`);
    } else {
        loadLocalDonors();
    }
    
    // تحميل الحالات الطارئة
    const { data: emergencies, error: eError } = await supabase
        .from('blood_emergencies')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
    
    if (!eError && emergencies) {
        emergenciesList = emergencies;
        localStorage.setItem('blood_emergencies_data', JSON.stringify(emergencies));
        console.log(`✅ تم تحميل ${emergencies.length} حالة طارئة`);
    } else {
        loadLocalEmergencies();
    }
}

function loadLocalData() {
    loadLocalDonors();
    loadLocalEmergencies();
}

function loadLocalDonors() {
    const saved = localStorage.getItem('blood_donors_data');
    donorsList = saved ? JSON.parse(saved) : [];
}

function loadLocalEmergencies() {
    const saved = localStorage.getItem('blood_emergencies_data');
    emergenciesList = saved ? JSON.parse(saved) : [];
}

// عرض البيانات
function renderData() {
    renderDonors();
    renderEmergencies();
}

function renderDonors() {
    const container = document.getElementById('donorsList');
    if (!container) {
        console.warn("⚠️ عنصر donorsList غير موجود");
        return;
    }
    
    if (!donorsList || donorsList.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:30px; background:#1e293b; border-radius:16px;">
                <i class="fas fa-hand-holding-heart" style="font-size:48px; color:#64748b;"></i>
                <p style="color:#94a3b8; margin-top:10px;">لا يوجد متبرعون حالياً</p>
                <button onclick="showBloodReg()" style="margin-top:10px; background:#10b981; border:none; padding:8px 20px; border-radius:20px; color:white; cursor:pointer;">
                    <i class="fas fa-plus"></i> كن أول متبرع
                </button>
            </div>
        `;
        return;
    }
    
    const bloodColors = {
        'A+': '#3b82f6', 'A-': '#60a5fa', 'B+': '#8b5cf6', 'B-': '#a78bfa',
        'AB+': '#ec4899', 'AB-': '#f472b6', 'O+': '#ef4444', 'O-': '#f87171'
    };
    
    container.innerHTML = donorsList.map(donor => `
        <div style="background:#1e293b; border-radius:12px; padding:15px; margin-bottom:10px; border-right:5px solid ${bloodColors[donor.blood_type] || '#10b981'};">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:5px;">
                        <i class="fas fa-user-circle" style="color:${bloodColors[donor.blood_type] || '#10b981'}; font-size:20px;"></i>
                        <span style="font-weight:bold; color:white; font-size:16px;">${escapeHtml(donor.name)}</span>
                        <span style="background:${bloodColors[donor.blood_type] || '#10b981'}; color:white; padding:2px 10px; border-radius:20px; font-size:11px;">${donor.blood_type}</span>
                    </div>
                    <div style="color:#64748b; font-size:11px; margin-top:5px;">
                        <i class="far fa-calendar-alt"></i> ${formatDate(donor.created_at)}
                    </div>
                </div>
                <a href="tel:${donor.phone}" style="background:#10b981; color:white; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; text-decoration:none;">
                    <i class="fas fa-phone"></i>
                </a>
            </div>
        </div>
    `).join('');
}

function renderEmergencies() {
    const container = document.getElementById('emergList');
    if (!container) return;
    
    if (!emergenciesList || emergenciesList.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:30px; background:#1e293b; border-radius:16px;">
                <i class="fas fa-check-circle" style="font-size:48px; color:#10b981;"></i>
                <p style="color:#94a3b8; margin-top:10px;">لا توجد حالات طارئة</p>
            </div>
        `;
        return;
    }
    
    const bloodColors = {
        'A+': '#3b82f6', 'A-': '#60a5fa', 'B+': '#8b5cf6', 'B-': '#a78bfa',
        'AB+': '#ec4899', 'AB-': '#f472b6', 'O+': '#ef4444', 'O-': '#f87171'
    };
    
    container.innerHTML = emergenciesList.map(emergency => `
        <div style="background:linear-gradient(135deg,#450a0a,#2c0a0a); border-radius:12px; padding:15px; margin-bottom:10px; border:1px solid #ef4444; animation:pulseRed 1s infinite;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                        <i class="fas fa-ambulance" style="color:#ef4444; font-size:20px;"></i>
                        <span style="font-weight:bold; color:white;">🚨 حالة عاجلة</span>
                        <span style="background:${bloodColors[emergency.blood_type] || '#ef4444'}; color:white; padding:2px 10px; border-radius:20px; font-size:11px;">${emergency.blood_type}</span>
                    </div>
                    <div style="color:white; font-size:14px; margin-bottom:5px;">
                        <i class="fas fa-user-injured"></i> ${escapeHtml(emergency.patient_name)}
                    </div>
                    <div style="color:#64748b; font-size:11px;">
                        <i class="far fa-clock"></i> ${formatDate(emergency.created_at)}
                    </div>
                </div>
                <a href="tel:${emergency.contact_phone}" style="background:#ef4444; color:white; width:45px; height:45px; border-radius:50%; display:flex; align-items:center; justify-content:center; text-decoration:none; box-shadow:0 0 10px rgba(239,68,68,0.5);">
                    <i class="fas fa-hand-holding-heart"></i>
                </a>
            </div>
        </div>
    `).join('');
}

function updateCounter() {
    const counter = document.getElementById('bloodCount');
    if (counter) {
        const total = (donorsList?.length || 0) + (emergenciesList?.length || 0);
        counter.innerText = total;
    }
}

function formatDate(dateStr) {
    if (!dateStr) return 'الآن';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60);
    
    if (diff < 1) return 'الآن';
    if (diff < 60) return `منذ ${diff} دقيقة`;
    if (diff < 1440) return `منذ ${Math.floor(diff / 60)} ساعة`;
    return date.toLocaleDateString('ar-MA');
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

function showNotification(msg, type = 'success') {
    const colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b' };
    const toast = document.createElement('div');
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${msg}`;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 12px 20px;
        border-radius: 12px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========== دوال الأزرار ==========
window.showBloodReg = function() {
    const reg = document.getElementById('bloodReg');
    const emer = document.getElementById('bloodEmer');
    if (reg) reg.style.display = 'block';
    if (emer) emer.style.display = 'none';
    showNotification("📝 أضف معلوماتك", "info");
};

window.showBloodEmer = function() {
    const reg = document.getElementById('bloodReg');
    const emer = document.getElementById('bloodEmer');
    if (emer) emer.style.display = 'block';
    if (reg) reg.style.display = 'none';
    showNotification("🚨 أضف تفاصيل الحالة", "warning");
};

window.addDonor = async function() {
    const name = document.getElementById('donorName')?.value.trim();
    const phone = document.getElementById('donorPhone')?.value.trim();
    const blood = document.getElementById('donorBlood')?.value;
    
    if (!name || !phone || blood === 'فصيلة الدم') {
        showNotification("❌ الرجاء ملء جميع الحقول", "error");
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
        if (supabase) {
            const { data, error } = await supabase
                .from('blood_donors')
                .insert([newDonor])
                .select();
            
            if (error) throw error;
            if (data) donorsList.unshift(data[0]);
        } else {
            newDonor.id = Date.now();
            donorsList.unshift(newDonor);
        }
        
        localStorage.setItem('blood_donors_data', JSON.stringify(donorsList));
        
        document.getElementById('donorName').value = '';
        document.getElementById('donorPhone').value = '';
        document.getElementById('donorBlood').value = 'فصيلة الدم';
        document.getElementById('bloodReg').style.display = 'none';
        
        renderDonors();
        updateCounter();
        showNotification("✅ تم تسجيلك كمتبرع! شكراً لك.", "success");
        
    } catch (error) {
        console.error(error);
        showNotification("❌ حدث خطأ، حاول مرة أخرى", "error");
    }
};

window.addEmergency = async function() {
    const patient = document.getElementById('emergPatient')?.value.trim();
    const blood = document.getElementById('emergBlood')?.value;
    const phone = document.getElementById('emergPhone')?.value.trim();
    
    if (!patient || blood === 'فصيلة الدم' || !phone) {
        showNotification("❌ الرجاء ملء جميع الحقول", "error");
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
        if (supabase) {
            const { data, error } = await supabase
                .from('blood_emergencies')
                .insert([newEmergency])
                .select();
            
            if (error) throw error;
            if (data) emergenciesList.unshift(data[0]);
        } else {
            newEmergency.id = Date.now();
            emergenciesList.unshift(newEmergency);
        }
        
        localStorage.setItem('blood_emergencies_data', JSON.stringify(emergenciesList));
        
        document.getElementById('emergPatient').value = '';
        document.getElementById('emergBlood').value = 'فصيلة الدم';
        document.getElementById('emergPhone').value = '';
        document.getElementById('bloodEmer').style.display = 'none';
        
        renderEmergencies();
        updateCounter();
        showNotification("🚨 تم نشر الحالة الطارئة!", "success");
        
        // إشعار المتبرعين المتوافقين
        const matchingDonors = donorsList.filter(d => d.blood_type === blood);
        if (matchingDonors.length > 0) {
            showNotification(`📢 يوجد ${matchingDonors.length} متبرع متوافق مع فصيلة ${blood}`, "info");
        }
        
    } catch (error) {
        console.error(error);
        showNotification("❌ حدث خطأ، حاول مرة أخرى", "error");
    }
};

// إضافة الأنماط
const style = document.createElement('style');
style.textContent = `
    @keyframes pulseRed {
        0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
        70% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
        100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
    }
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// بدء النظام
document.addEventListener('DOMContentLoaded', function() {
    initBloodSystem();
});

console.log("✅ نظام التبرع بالدم الجديد جاهز");
