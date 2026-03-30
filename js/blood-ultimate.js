// ========== نظام التبرع بالدم المتطور ==========
// تم التطوير بواسطة تاوريرت هب

console.log("🚀 بدء تحميل نظام التبرع المتطور");

// بيانات Supabase
const SUPABASE_URL = 'https://pyxeusrxoizjlihyqhac.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt';

let supabase = null;
let donors = [];
let emergencies = [];

// تهيئة Supabase
async function initBloodSystem() {
    try {
        // تحميل مكتبة Supabase
        if (typeof window.supabase === 'undefined') {
            await new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
                script.onload = resolve;
                document.head.appendChild(script);
            });
        }
        
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("✅ Supabase متصل");
        
        // تحميل البيانات
        await loadDonors();
        await loadEmergencies();
        
        // عرض البيانات
        displayDonors();
        displayEmergencies();
        updateBloodCount();
        
    } catch (err) {
        console.error("خطأ في Supabase:", err);
        showMessage("⚠️ مشكلة في الاتصال، جاري استخدام التخزين المحلي", "warning");
        loadFromLocal();
    }
}

// تحميل المتبرعين
async function loadDonors() {
    if (!supabase) return;
    
    const { data, error } = await supabase
        .from('blood_donors')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error("خطأ في تحميل المتبرعين:", error);
        return;
    }
    
    donors = data || [];
    localStorage.setItem('blood_donors_backup', JSON.stringify(donors));
    console.log(`✅ تم تحميل ${donors.length} متبرع`);
}

// تحميل الحالات الطارئة
async function loadEmergencies() {
    if (!supabase) return;
    
    const { data, error } = await supabase
        .from('blood_emergencies')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error("خطأ في تحميل الحالات:", error);
        return;
    }
    
    emergencies = data || [];
    localStorage.setItem('blood_emergencies_backup', JSON.stringify(emergencies));
    console.log(`✅ تم تحميل ${emergencies.length} حالة طارئة`);
}

// تحميل من localStorage
function loadFromLocal() {
    donors = JSON.parse(localStorage.getItem('blood_donors_backup') || '[]');
    emergencies = JSON.parse(localStorage.getItem('blood_emergencies_backup') || '[]');
    console.log(`📦 تم التحميل من localStorage: ${donors.length} متبرع, ${emergencies.length} حالة`);
}

// عرض المتبرعين
function displayDonors() {
    const container = document.getElementById('donorsList');
    if (!container) {
        console.warn("⚠️ عنصر donorsList غير موجود");
        return;
    }
    
    if (donors.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:30px; background:#1e293b; border-radius:16px;">
                <i class="fas fa-hand-holding-heart" style="font-size:40px; color:#64748b;"></i>
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
    
    container.innerHTML = donors.map(d => `
        <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border-radius:16px; padding:15px; margin-bottom:12px; border-right:5px solid ${bloodColors[d.blood_type] || '#10b981'}; transition: all 0.2s;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                        <i class="fas fa-user-circle" style="color: ${bloodColors[d.blood_type] || '#10b981'}; font-size: 20px;"></i>
                        <span style="font-weight: bold; color: white; font-size: 16px;">${escapeHtml(d.name)}</span>
                        <span style="background: ${bloodColors[d.blood_type] || '#10b981'}; color: white; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: bold;">${d.blood_type}</span>
                    </div>
                    <div style="color: #64748b; font-size: 11px;">
                        <i class="fas fa-calendar-alt"></i> ${formatDate(d.created_at)}
                    </div>
                </div>
                <a href="tel:${d.phone}" style="background: #10b981; color: white; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none; transition: transform 0.2s;">
                    <i class="fas fa-phone"></i>
                </a>
            </div>
        </div>
    `).join('');
}

// عرض الحالات الطارئة
function displayEmergencies() {
    const container = document.getElementById('emergList');
    if (!container) return;
    
    if (emergencies.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:30px; background:#1e293b; border-radius:16px;">
                <i class="fas fa-check-circle" style="font-size:40px; color:#10b981;"></i>
                <p style="color:#94a3b8; margin-top:10px;">لا توجد حالات طارئة</p>
            </div>
        `;
        return;
    }
    
    const bloodColors = {
        'A+': '#3b82f6', 'A-': '#60a5fa', 'B+': '#8b5cf6', 'B-': '#a78bfa',
        'AB+': '#ec4899', 'AB-': '#f472b6', 'O+': '#ef4444', 'O-': '#f87171'
    };
    
    container.innerHTML = emergencies.map(e => `
        <div style="background: linear-gradient(135deg, #450a0a, #2c0a0a); border-radius:16px; padding:15px; margin-bottom:12px; border: 1px solid #ef4444; animation: pulseRed 1.5s infinite;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <i class="fas fa-ambulance" style="color: #ef4444; font-size: 20px;"></i>
                        <span style="font-weight: bold; color: white;">🚨 حالة عاجلة</span>
                        <span style="background: ${bloodColors[e.blood_type] || '#ef4444'}; color: white; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: bold;">${e.blood_type}</span>
                    </div>
                    <div style="color: white; font-size: 14px; margin-bottom: 5px;">
                        <i class="fas fa-user-injured"></i> ${escapeHtml(e.patient_name)}
                    </div>
                    <div style="color: #64748b; font-size: 11px;">
                        <i class="fas fa-clock"></i> ${formatDate(e.created_at)}
                    </div>
                </div>
                <a href="tel:${e.contact_phone}" style="background: #ef4444; color: white; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none; box-shadow: 0 0 10px rgba(239,68,68,0.5);">
                    <i class="fas fa-hand-holding-heart"></i>
                </a>
            </div>
        </div>
    `).join('');
}

function updateBloodCount() {
    const countElem = document.getElementById('bloodCount');
    if (countElem) {
        countElem.innerText = donors.length + emergencies.length;
    }
}

function formatDate(dateStr) {
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

function showMessage(msg, type = 'success') {
    const colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b' };
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = `
        position: fixed; bottom: 100px; right: 20px;
        background: ${colors[type]}; color: white;
        padding: 12px 20px; border-radius: 12px;
        z-index: 10000; font-size: 14px;
        animation: fadeIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ========== دوال الأزرار ==========
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
    const name = document.getElementById('donorName')?.value.trim();
    const phone = document.getElementById('donorPhone')?.value.trim();
    const blood = document.getElementById('donorBlood')?.value;
    
    if (!name || !phone || blood === 'فصيلة الدم') {
        showMessage('❌ الرجاء ملء جميع الحقول', 'error');
        return;
    }
    
    const btn = document.querySelector('#bloodReg button');
    if (btn) btn.disabled = true;
    
    try {
        const newDonor = {
            name: name,
            phone: phone,
            blood_type: blood,
            status: 'active',
            created_at: new Date().toISOString()
        };
        
        if (supabase) {
            const { data, error } = await supabase
                .from('blood_donors')
                .insert([newDonor])
                .select();
            
            if (error) throw error;
            if (data) donors.unshift(data[0]);
        } else {
            newDonor.id = Date.now();
            donors.unshift(newDonor);
        }
        
        localStorage.setItem('blood_donors_backup', JSON.stringify(donors));
        
        // تنظيف النموذج
        document.getElementById('donorName').value = '';
        document.getElementById('donorPhone').value = '';
        document.getElementById('donorBlood').value = 'فصيلة الدم';
        document.getElementById('bloodReg').style.display = 'none';
        
        displayDonors();
        updateBloodCount();
        showMessage('✅ تم تسجيلك كمتبرع! شكراً لك.');
        
    } catch (err) {
        console.error(err);
        showMessage('❌ حدث خطأ، حاول مرة أخرى', 'error');
    } finally {
        if (btn) btn.disabled = false;
    }
};

window.addEmergency = async function() {
    const patient = document.getElementById('emergPatient')?.value.trim();
    const blood = document.getElementById('emergBlood')?.value;
    const phone = document.getElementById('emergPhone')?.value.trim();
    
    if (!patient || blood === 'فصيلة الدم' || !phone) {
        showMessage('❌ الرجاء ملء جميع الحقول', 'error');
        return;
    }
    
    const btn = document.querySelector('#bloodEmer button');
    if (btn) btn.disabled = true;
    
    try {
        const newEmergency = {
            patient_name: patient,
            blood_type: blood,
            contact_phone: phone,
            status: 'active',
            created_at: new Date().toISOString()
        };
        
        if (supabase) {
            const { data, error } = await supabase
                .from('blood_emergencies')
                .insert([newEmergency])
                .select();
            
            if (error) throw error;
            if (data) emergencies.unshift(data[0]);
        } else {
            newEmergency.id = Date.now();
            emergencies.unshift(newEmergency);
        }
        
        localStorage.setItem('blood_emergencies_backup', JSON.stringify(emergencies));
        
        // تنظيف النموذج
        document.getElementById('emergPatient').value = '';
        document.getElementById('emergBlood').value = 'فصيلة الدم';
        document.getElementById('emergPhone').value = '';
        document.getElementById('bloodEmer').style.display = 'none';
        
        displayEmergencies();
        updateBloodCount();
        showMessage('🚨 تم نشر الحالة الطارئة!');
        
    } catch (err) {
        console.error(err);
        showMessage('❌ حدث خطأ، حاول مرة أخرى', 'error');
    } finally {
        if (btn) btn.disabled = false;
    }
};

// إضافة أنماط
const style = document.createElement('style');
style.textContent = `
    @keyframes pulseRed {
        0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
        70% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
        100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
    }
`;
document.head.appendChild(style);

// بدء النظام
document.addEventListener('DOMContentLoaded', function() {
    console.log("📢 بدء تشغيل نظام التبرع بالدم");
    initBloodSystem();
});

console.log("✅ تم تحميل نظام التبرع بالدم المتطور");
