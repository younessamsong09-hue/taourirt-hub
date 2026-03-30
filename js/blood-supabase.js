// ========== نظام التبرع بالدم العام والمبهر ==========

alert("✅ نظام التبرع يعمل - تم التحميل");

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
        await loadAndDisplayData();
    } catch (err) {
        console.error('خطأ:', err);
        loadLocalAndDisplay();
    }
}

// تحميل وعرض البيانات
async function loadAndDisplayData() {
    if (!supabaseClient) return;
    try {
        const { data: donors } = await supabaseClient
            .from('blood_donors')
            .select('*')
            .order('created_at', { ascending: false });
        
        const { data: emergencies } = await supabaseClient
            .from('blood_emergencies')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });
        
        displayDonors(donors || []);
        displayEmergencies(emergencies || []);
        
        // حفظ في localStorage للنسخ الاحتياطي
        localStorage.setItem('donors_public', JSON.stringify(donors || []));
        localStorage.setItem('emergencies_public', JSON.stringify(emergencies || []));
    } catch (err) {
        loadLocalAndDisplay();
    }
}

function loadLocalAndDisplay() {
    const donors = JSON.parse(localStorage.getItem('donors_public') || '[]');
    const emergencies = JSON.parse(localStorage.getItem('emergencies_public') || '[]');
    displayDonors(donors);
    displayEmergencies(emergencies);
}

// عرض المتبرعين بشكل مبهر
function displayDonors(donors) {
    const container = document.getElementById('donorsList');
    if (!container) return;
    
    if (donors.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px; background:#1e293b; border-radius:20px;">
                <i class="fas fa-hand-holding-heart" style="font-size:48px; color:#64748b;"></i>
                <p style="color:#94a3b8; margin-top:10px;">لا يوجد متبرعون حالياً</p>
                <p style="color:#64748b; font-size:12px;">كن أول من يتبرع! 🩸</p>
            </div>
        `;
        return;
    }
    
    const bloodColors = {
        'A+': '#3b82f6', 'A-': '#60a5fa', 'B+': '#8b5cf6', 'B-': '#a78bfa',
        'AB+': '#ec4899', 'AB-': '#f472b6', 'O+': '#ef4444', 'O-': '#f87171'
    };
    
    container.innerHTML = donors.map(donor => `
        <div class="donor-card" style="background: linear-gradient(135deg, #1e293b, #0f172a); border-radius:20px; padding:16px; margin-bottom:12px; border-right:5px solid ${bloodColors[donor.blood_type] || '#6366f1'}; transition: all 0.3s; cursor: pointer;" onclick="viewDonorDetails('${donor.id}')">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                        <i class="fas fa-user-circle" style="color: ${bloodColors[donor.blood_type] || '#6366f1'}; font-size: 20px;"></i>
                        <span style="font-weight: bold; color: white; font-size: 16px;">${escapeHtml(donor.name)}</span>
                        <span style="background: ${bloodColors[donor.blood_type] || '#6366f1'}; color: white; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">${donor.blood_type}</span>
                    </div>
                    <div style="color: #94a3b8; font-size: 12px; margin-top: 5px;">
                        <i class="fas fa-calendar-alt"></i> ${new Date(donor.created_at).toLocaleDateString('ar-MA')}
                    </div>
                </div>
                <a href="tel:${donor.phone}" onclick="event.stopPropagation()" style="background: #10b981; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none; transition: transform 0.2s;">
                    <i class="fas fa-phone"></i>
                </a>
            </div>
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #334155;">
                <span style="color: #64748b; font-size: 11px;">
                    <i class="fas fa-map-marker-alt"></i> تاوريرت
                </span>
            </div>
        </div>
    `).join('');
}

// عرض الحالات الطارئة بشكل مبهر
function displayEmergencies(emergencies) {
    const container = document.getElementById('emergList');
    if (!container) return;
    
    if (emergencies.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px; background:#1e293b; border-radius:20px;">
                <i class="fas fa-check-circle" style="font-size:48px; color:#10b981;"></i>
                <p style="color:#94a3b8; margin-top:10px;">لا توجد حالات طارئة</p>
                <p style="color:#64748b; font-size:12px;">جميع الحالات تم حلها ✅</p>
            </div>
        `;
        return;
    }
    
    const bloodColors = {
        'A+': '#3b82f6', 'A-': '#60a5fa', 'B+': '#8b5cf6', 'B-': '#a78bfa',
        'AB+': '#ec4899', 'AB-': '#f472b6', 'O+': '#ef4444', 'O-': '#f87171'
    };
    
    container.innerHTML = emergencies.map(emerg => `
        <div class="emergency-card" style="background: linear-gradient(135deg, #450a0a, #2c0a0a); border-radius:20px; padding:16px; margin-bottom:12px; border: 1px solid #ef4444; animation: pulseRed 1.5s infinite; transition: all 0.3s;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <i class="fas fa-ambulance" style="color: #ef4444; font-size: 20px; animation: shake 0.5s infinite;"></i>
                        <span style="font-weight: bold; color: white; font-size: 16px;">🚨 حالة عاجلة</span>
                        <span style="background: ${bloodColors[emerg.blood_type] || '#ef4444'}; color: white; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">${emerg.blood_type}</span>
                    </div>
                    <div style="color: white; font-size: 14px; margin-bottom: 5px;">
                        <i class="fas fa-user-injured"></i> المريض: ${escapeHtml(emerg.patient_name)}
                    </div>
                    <div style="color: #94a3b8; font-size: 11px;">
                        <i class="fas fa-clock"></i> ${new Date(emerg.created_at).toLocaleDateString('ar-MA')}
                    </div>
                </div>
                <a href="tel:${emerg.contact_phone}" style="background: #ef4444; color: white; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none; transition: transform 0.2s; box-shadow: 0 0 10px rgba(239,68,68,0.5);">
                    <i class="fas fa-hand-holding-heart" style="font-size: 18px;"></i>
                </a>
            </div>
            <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #7f1d1d;">
                <span style="color: #fca5a5; font-size: 11px;">
                    <i class="fas fa-tint"></i> متبرعون متوافقون متاحون
                </span>
            </div>
        </div>
    `).join('');
}

function viewDonorDetails(id) {
    // يمكن إضافة نافذة منبثقة بتفاصيل المتبرع
    alert("📞 اتصل على الرقم الظاهر للتواصل مع المتبرع");
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

// إضافة أنماط متحركة
const style = document.createElement('style');
style.textContent = `
    @keyframes pulseRed {
        0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
        70% { box-shadow: 0 0 0 10px rgba(239,68,68,0); }
        100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
    }
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-2px); }
        75% { transform: translateX(2px); }
    }
    .donor-card:hover, .emergency-card:hover {
        transform: translateX(-5px);
        cursor: pointer;
    }
    a:hover {
        transform: scale(1.05);
    }
`;
document.head.appendChild(style);

// ========== دوال الإضافة (كما هي) ==========
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
        
        try {
            if (supabaseClient) {
                await supabaseClient.from('blood_donors').insert([{
                    name, phone, blood_type: blood, status: 'active', created_at: new Date().toISOString()
                }]);
            }
            await loadAndDisplayData();
            document.getElementById('donorName').value = '';
            document.getElementById('donorPhone').value = '';
            document.getElementById('donorBlood').value = 'فصيلة الدم';
            document.getElementById('bloodReg').style.display = 'none';
            alert('✅ تم تسجيلك كمتبرع! شكراً لك.');
        } catch (err) {
            alert('❌ حدث خطأ');
        }
    };
    
    window.addEmergency = async function() {
        const patient = document.getElementById('emergPatient')?.value.trim();
        const blood = document.getElementById('emergBlood')?.value;
        const phone = document.getElementById('emergPhone')?.value.trim();
        
        if (!patient || blood === 'فصيلة الدم' || !phone) {
            alert('❌ الرجاء ملء جميع الحقول');
            return;
        }
        
        try {
            if (supabaseClient) {
                await supabaseClient.from('blood_emergencies').insert([{
                    patient_name: patient, blood_type: blood, contact_phone: phone, status: 'active', created_at: new Date().toISOString()
                }]);
            }
            await loadAndDisplayData();
            document.getElementById('emergPatient').value = '';
            document.getElementById('emergBlood').value = 'فصيلة الدم';
            document.getElementById('emergPhone').value = '';
            document.getElementById('bloodEmer').style.display = 'none';
            alert('🚨 تم نشر الحالة الطارئة!');
        } catch (err) {
            alert('❌ حدث خطأ');
        }
    };
});
