// ========== نظام التبليغات المباشر ==========

let supabase = null;

// بيانات Supabase
const SUPABASE_URL = 'https://pyxeusrxoizjlihyqhac.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt';

// تهيئة Supabase
async function initReportSystem() {
    // تحميل مكتبة Supabase
    if (typeof supabaseClient === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
        script.onload = async () => {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase جاهز');
            await loadReports();
        };
        document.head.appendChild(script);
    } else {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        await loadReports();
    }
}

// تحميل البلاغات
async function loadReports() {
    if (!supabase) return;
    const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
    
    if (!error && data) {
        displayReports(data);
    }
}

// عرض البلاغات
function displayReports(reports) {
    const container = document.getElementById('reportsListContainer');
    if (!container) return;
    
    if (reports.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:20px;">📭 لا توجد بلاغات</div>';
        return;
    }
    
    const typeNames = {
        pothole: '🕳️ حفرة',
        light: '💡 إنارة',
        garbage: '🗑️ نفايات'
    };
    
    container.innerHTML = reports.map(r => `
        <div style="background:#1e293b; border-radius:12px; padding:12px; margin-bottom:8px; border-right:3px solid #ef4444;">
            <div style="display:flex; justify-content:space-between;">
                <span style="color:#ef4444; font-weight:bold;">${typeNames[r.category] || r.category}</span>
                <span style="font-size:11px;">${new Date(r.created_at).toLocaleTimeString()}</span>
            </div>
            <div style="margin-top:5px;">${r.description?.substring(0, 80)}${r.description?.length > 80 ? '...' : ''}</div>
            ${r.image_url ? `<img src="${r.image_url}" style="width:100%; max-height:120px; object-fit:cover; border-radius:8px; margin-top:8px;">` : ''}
        </div>
    `).join('');
}

// فتح نموذج التبليغ
function openReportForm() {
    const modal = document.getElementById('reportFormModal');
    if (modal) modal.style.display = 'flex';
    getLocation();
}

function closeReportForm() {
    const modal = document.getElementById('reportFormModal');
    if (modal) modal.style.display = 'none';
    resetForm();
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                document.getElementById('locationText').innerHTML = `📍 ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
                document.getElementById('locationText').dataset.lat = pos.coords.latitude;
                document.getElementById('locationText').dataset.lng = pos.coords.longitude;
            },
            () => {
                document.getElementById('locationText').innerHTML = '⚠️ لم نتمكن من تحديد الموقع';
            }
        );
    }
}

function previewImage(input) {
    const preview = document.getElementById('previewArea');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" style="width:100%; border-radius:8px;"><button onclick="removeImage()" style="position:absolute; top:5px; right:5px; background:#ef4444; border:none; border-radius:50%; width:25px; height:25px;">✖</button>`;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
        window.currentImageFile = input.files[0];
    }
}

function removeImage() {
    document.getElementById('reportImage').value = '';
    document.getElementById('previewArea').innerHTML = '';
    document.getElementById('previewArea').style.display = 'none';
    window.currentImageFile = null;
}

async function uploadImage(file, id) {
    if (!file || !supabase) return null;
    const ext = file.name.split('.').pop();
    const path = `reports/${id}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('reports-media').upload(path, file);
    if (error) return null;
    const { data } = supabase.storage.from('reports-media').getPublicUrl(path);
    return data.publicUrl;
}

async function submitReport() {
    const name = document.getElementById('reportName').value;
    const phone = document.getElementById('reportPhone').value;
    const type = document.getElementById('reportType').value;
    const title = document.getElementById('reportTitle').value;
    const desc = document.getElementById('reportDesc').value;
    const locationDiv = document.getElementById('locationText');
    
    if (!name || !phone || !title || !desc) {
        alert('❌ الرجاء ملء جميع الحقول المطلوبة');
        return;
    }
    
    const btn = document.querySelector('#reportFormModal .submit-btn');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
        btn.disabled = true;
    }
    
    try {
        const reportData = {
            category: type,
            description: `${title}\n\n${desc}`,
            location_lat: locationDiv?.dataset?.lat || null,
            location_lng: locationDiv?.dataset?.lng || null,
            status: 'pending',
            created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('reports')
            .insert([reportData])
            .select();
        
        if (error) throw error;
        
        if (data && data[0] && window.currentImageFile) {
            const imageUrl = await uploadImage(window.currentImageFile, data[0].id);
            if (imageUrl) {
                await supabase
                    .from('reports')
                    .update({ image_url: imageUrl })
                    .eq('id', data[0].id);
            }
        }
        
        alert('✅ تم إرسال البلاغ بنجاح!');
        closeReportForm();
        await loadReports();
        
    } catch (err) {
        console.error(err);
        alert('❌ حدث خطأ');
    } finally {
        if (btn) {
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال البلاغ';
            btn.disabled = false;
        }
    }
}

function resetForm() {
    document.getElementById('reportName').value = '';
    document.getElementById('reportPhone').value = '';
    document.getElementById('reportTitle').value = '';
    document.getElementById('reportDesc').value = '';
    removeImage();
}

// إضافة العناصر للصفحة
function addReportElements() {
    // الأيقونة
    if (!document.getElementById('reportDirectBtn')) {
        const btn = document.createElement('div');
        btn.id = 'reportDirectBtn';
        btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
        btn.style.cssText = 'position:fixed; bottom:110px; left:20px; width:55px; height:55px; background:linear-gradient(135deg,#ef4444,#dc2626); border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:999; box-shadow:0 4px 15px rgba(239,68,68,0.4);';
        btn.onclick = openReportForm;
        document.body.appendChild(btn);
    }
    
    // النموذج
    if (!document.getElementById('reportFormModal')) {
        const modal = document.createElement('div');
        modal.id = 'reportFormModal';
        modal.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); backdrop-filter:blur(8px); z-index:10000; justify-content:center; align-items:center;';
        modal.innerHTML = `
            <div style="background:linear-gradient(135deg,#1e293b,#0f172a); border-radius:28px; width:90%; max-width:500px; max-height:90vh; overflow-y:auto;">
                <div style="background:linear-gradient(135deg,#ef4444,#dc2626); padding:20px; border-radius:28px 28px 0 0; position:relative;">
                    <h2 style="color:white; margin:0;"><i class="fas fa-exclamation-triangle"></i> تبليغ عن مشكلة</h2>
                    <button onclick="closeReportForm()" style="position:absolute; top:20px; right:20px; background:rgba(255,255,255,0.2); border:none; color:white; width:32px; height:32px; border-radius:50%; cursor:pointer;">✖</button>
                </div>
                <div style="padding:20px;">
                    <input type="text" id="reportName" placeholder="الاسم الكامل *" style="width:100%; padding:12px; margin-bottom:12px; background:#0f172a; border:1px solid #334155; border-radius:16px; color:white;">
                    <input type="tel" id="reportPhone" placeholder="رقم الهاتف *" style="width:100%; padding:12px; margin-bottom:12px; background:#0f172a; border:1px solid #334155; border-radius:16px; color:white;">
                    <select id="reportType" style="width:100%; padding:12px; margin-bottom:12px; background:#0f172a; border:1px solid #334155; border-radius:16px; color:white;">
                        <option value="pothole">🕳️ حفرة في الطريق</option>
                        <option value="light">💡 إنارة معطلة</option>
                        <option value="garbage">🗑️ تراكم نفايات</option>
                    </select>
                    <input type="text" id="reportTitle" placeholder="عنوان البلاغ *" style="width:100%; padding:12px; margin-bottom:12px; background:#0f172a; border:1px solid #334155; border-radius:16px; color:white;">
                    <textarea id="reportDesc" rows="3" placeholder="وصف المشكلة *" style="width:100%; padding:12px; margin-bottom:12px; background:#0f172a; border:1px solid #334155; border-radius:16px; color:white;"></textarea>
                    <div id="locationText" style="padding:10px; background:#0f172a; border-radius:12px; margin-bottom:12px; text-align:center; font-size:12px;">📍 جاري تحديد الموقع...</div>
                    <div onclick="document.getElementById('reportImage').click()" style="border:2px dashed #334155; border-radius:16px; padding:20px; text-align:center; cursor:pointer; margin-bottom:12px;">
                        <i class="fas fa-cloud-upload-alt" style="font-size:28px; color:#64748b;"></i>
                        <p style="margin:5px 0 0; color:#94a3b8;">اضغط لرفع صورة</p>
                    </div>
                    <input type="file" id="reportImage" accept="image/*" style="display:none" onchange="previewImage(this)">
                    <div id="previewArea" style="position:relative; margin-bottom:12px; display:none;"></div>
                    <button class="submit-btn" onclick="submitReport()" style="width:100%; background:linear-gradient(135deg,#ef4444,#dc2626); color:white; border:none; padding:14px; border-radius:24px; font-weight:bold; cursor:pointer;">
                        <i class="fas fa-paper-plane"></i> إرسال البلاغ
                    </button>
                </div>
                <div style="padding:0 20px 20px 20px;">
                    <div style="border-top:1px solid #334155; padding-top:15px;">
                        <div style="font-size:12px; color:#64748b; margin-bottom:10px;">📋 آخر البلاغات</div>
                        <div id="reportsListContainer"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
}

// تهيئة النظام
document.addEventListener('DOMContentLoaded', () => {
    addReportElements();
    initReportSystem();
});
