// ========== نظام التبليغات المنفصل ==========

let reportsData = [];
let supabaseClient = null;
let currentLocation = null;
let selectedImage = null;

// Supabase config
const SUPABASE_URL = 'https://pyxeusrxoizjlihyqhac.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt';

// تهيئة Supabase
async function initReportsSystem() {
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
        console.log('✅ نظام التبليغات جاهز');
        await loadReports();
    } catch (err) {
        console.error('خطأ:', err);
        loadLocalReports();
    }
}

// تحميل البلاغات
async function loadReports() {
    if (!supabaseClient) return loadLocalReports();
    try {
        const { data, error } = await supabaseClient
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
        if (!error && data) {
            reportsData = data;
            saveLocalReports();
            updateReportsDisplay();
        }
    } catch (err) {
        loadLocalReports();
    }
}

function loadLocalReports() {
    const saved = localStorage.getItem('reports_system');
    reportsData = saved ? JSON.parse(saved) : [];
    updateReportsDisplay();
}

function saveLocalReports() {
    localStorage.setItem('reports_system', JSON.stringify(reportsData));
}

// فتح نموذج التبليغ
function openReportForm() {
    const modal = document.getElementById('reportModalSystem');
    if (modal) {
        modal.style.display = 'flex';
        getCurrentLocation();
    }
}

function closeReportForm() {
    const modal = document.getElementById('reportModalSystem');
    if (modal) {
        modal.style.display = 'none';
        resetForm();
    }
}

// الحصول على الموقع
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                currentLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                const locSpan = document.getElementById('reportLocationSpan');
                if (locSpan) {
                    locSpan.innerHTML = `📍 ${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`;
                    locSpan.style.color = '#10b981';
                }
            },
            () => {
                const locSpan = document.getElementById('reportLocationSpan');
                if (locSpan) {
                    locSpan.innerHTML = '⚠️ لم نتمكن من تحديد الموقع';
                    locSpan.style.color = '#f59e0b';
                }
            }
        );
    }
}

// معاينة الصورة
function previewReportImage(input) {
    const preview = document.getElementById('reportImagePreview');
    if (input.files && input.files[0]) {
        selectedImage = input.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" style="width:100%; border-radius:12px;">`;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(selectedImage);
    }
}

function removeImage() {
    selectedImage = null;
    document.getElementById('reportImageInput').value = '';
    document.getElementById('reportImagePreview').innerHTML = '';
    document.getElementById('reportImagePreview').style.display = 'none';
}

// رفع الصورة
async function uploadImage(file, reportId) {
    if (!supabaseClient || !file) return null;
    const ext = file.name.split('.').pop();
    const fileName = `${reportId}_${Date.now()}.${ext}`;
    try {
        const { error } = await supabaseClient.storage
            .from('reports-media')
            .upload(`reports/${fileName}`, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabaseClient.storage
            .from('reports-media')
            .getPublicUrl(`reports/${fileName}`);
        return publicUrl;
    } catch (err) {
        return null;
    }
}

// إرسال البلاغ
async function submitReport() {
    const name = document.getElementById('reportName')?.value;
    const phone = document.getElementById('reportPhone')?.value;
    const type = document.getElementById('reportType')?.value;
    const title = document.getElementById('reportTitle')?.value;
    const desc = document.getElementById('reportDesc')?.value;
    
    if (!name || !phone || !title || !desc) {
        alert('❌ الرجاء ملء جميع الحقول المطلوبة');
        return;
    }
    
    const btn = document.querySelector('#reportModalSystem .submit-btn');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
        btn.disabled = true;
    }
    
    try {
        const reportData = {
            category: type,
            description: `${title}\n\n${desc}`,
            location_lat: currentLocation?.lat || null,
            location_lng: currentLocation?.lng || null,
            status: 'pending',
            created_at: new Date().toISOString()
        };
        
        let imageUrl = null;
        
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('reports')
                .insert([reportData])
                .select();
            
            if (!error && data && data[0]) {
                if (selectedImage) {
                    imageUrl = await uploadImage(selectedImage, data[0].id);
                    if (imageUrl) {
                        await supabaseClient
                            .from('reports')
                            .update({ image_url: imageUrl })
                            .eq('id', data[0].id);
                    }
                }
                reportsData.unshift(data[0]);
            }
        } else {
            reportData.id = Date.now();
            reportsData.unshift(reportData);
        }
        
        saveLocalReports();
        updateReportsDisplay();
        closeReportForm();
        alert('✅ تم إرسال البلاغ بنجاح!');
        
    } catch (err) {
        console.error(err);
        alert('❌ حدث خطأ، حاول مرة أخرى');
    } finally {
        if (btn) {
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال البلاغ';
            btn.disabled = false;
        }
    }
}

// عرض البلاغات
function updateReportsDisplay() {
    const container = document.getElementById('reportsListSystem');
    if (!container) return;
    
    if (reportsData.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:20px;">📭 لا توجد بلاغات</div>';
        return;
    }
    
    const typeIcons = { roads: '🕳️', lights: '💡', garbage: '🗑️', water: '💧', other: '📌' };
    
    container.innerHTML = reportsData.slice(0, 5).map(r => `
        <div style="background:#1e293b; border-radius:12px; padding:12px; margin-bottom:8px; border-right:3px solid #ef4444;">
            <div style="display:flex; justify-content:space-between;">
                <span style="color:#ef4444;">${typeIcons[r.category] || '📌'} ${r.category}</span>
                <span style="font-size:11px;">${new Date(r.created_at).toLocaleTimeString()}</span>
            </div>
            <div style="font-size:13px; margin-top:5px;">${(r.description || '').substring(0, 60)}...</div>
        </div>
    `).join('');
}

function resetForm() {
    document.getElementById('reportName').value = '';
    document.getElementById('reportPhone').value = '';
    document.getElementById('reportTitle').value = '';
    document.getElementById('reportDesc').value = '';
    removeImage();
    currentLocation = null;
}

// إضافة اللوحة للصفحة
function addReportModalToPage() {
    if (document.getElementById('reportModalSystem')) return;
    
    const modalHTML = `
        <div id="reportModalSystem" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); backdrop-filter:blur(8px); z-index:10000; justify-content:center; align-items:center;">
            <div style="background:linear-gradient(135deg,#1e293b,#0f172a); border-radius:28px; width:90%; max-width:500px; max-height:90vh; overflow-y:auto; border:1px solid #ef4444;">
                <div style="background:linear-gradient(135deg,#ef4444,#dc2626); padding:20px; border-radius:28px 28px 0 0; position:relative;">
                    <h2 style="color:white; margin:0;"><i class="fas fa-exclamation-triangle"></i> تبليغ عن مشكلة</h2>
                    <button onclick="closeReportForm()" style="position:absolute; top:20px; right:20px; background:rgba(255,255,255,0.2); border:none; color:white; width:32px; height:32px; border-radius:50%; cursor:pointer;">✖</button>
                </div>
                <div style="padding:24px;">
                    <input type="text" id="reportName" placeholder="الاسم الكامل *" style="width:100%; padding:12px; margin-bottom:12px; background:#0f172a; border:1px solid #334155; border-radius:16px; color:white;">
                    <input type="tel" id="reportPhone" placeholder="رقم الهاتف *" style="width:100%; padding:12px; margin-bottom:12px; background:#0f172a; border:1px solid #334155; border-radius:16px; color:white;">
                    <select id="reportType" style="width:100%; padding:12px; margin-bottom:12px; background:#0f172a; border:1px solid #334155; border-radius:16px; color:white;">
                        <option value="roads">🕳️ حفرة / طريق متضرر</option>
                        <option value="lights">💡 إنارة معطلة</option>
                        <option value="garbage">🗑️ تراكم نفايات</option>
                        <option value="water">💧 تسرب مياه</option>
                        <option value="other">📌 مشكلة أخرى</option>
                    </select>
                    <input type="text" id="reportTitle" placeholder="عنوان البلاغ *" style="width:100%; padding:12px; margin-bottom:12px; background:#0f172a; border:1px solid #334155; border-radius:16px; color:white;">
                    <textarea id="reportDesc" rows="3" placeholder="وصف المشكلة *" style="width:100%; padding:12px; margin-bottom:12px; background:#0f172a; border:1px solid #334155; border-radius:16px; color:white;"></textarea>
                    <div style="margin-bottom:12px;">
                        <div id="reportLocationSpan" style="padding:10px; background:#0f172a; border-radius:12px; font-size:12px; color:#10b981;">📍 جاري تحديد الموقع...</div>
                    </div>
                    <div style="margin-bottom:12px;">
                        <div onclick="document.getElementById('reportImageInput').click()" style="border:2px dashed #334155; border-radius:16px; padding:20px; text-align:center; cursor:pointer;">
                            <i class="fas fa-cloud-upload-alt" style="font-size:32px; color:#64748b;"></i>
                            <p style="margin:5px 0 0; color:#94a3b8;">اضغط لرفع صورة (اختياري)</p>
                        </div>
                        <input type="file" id="reportImageInput" accept="image/*" style="display:none;" onchange="previewReportImage(this)">
                        <div id="reportImagePreview" style="margin-top:10px; display:none; position:relative;"></div>
                    </div>
                    <button onclick="submitReport()" class="submit-btn" style="width:100%; background:linear-gradient(135deg,#ef4444,#dc2626); color:white; border:none; padding:14px; border-radius:24px; font-weight:bold; cursor:pointer;">
                        <i class="fas fa-paper-plane"></i> إرسال البلاغ
                    </button>
                </div>
                <div style="padding:0 24px 24px 24px;">
                    <div style="border-top:1px solid #334155; padding-top:15px; margin-top:5px;">
                        <div style="font-size:12px; color:#64748b; margin-bottom:10px;">📋 آخر البلاغات</div>
                        <div id="reportsListSystem"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// إضافة زر التبليغ
function addReportButton() {
    if (document.getElementById('reportFloatingBtn')) return;
    
    const btnHTML = `
        <button id="reportFloatingBtn" onclick="openReportForm()" style="position:fixed; bottom:20px; left:20px; background:linear-gradient(135deg,#ef4444,#dc2626); color:white; border:none; width:60px; height:60px; border-radius:50%; cursor:pointer; z-index:9999; box-shadow:0 4px 15px rgba(239,68,68,0.4); display:flex; align-items:center; justify-content:center;">
            <i class="fas fa-exclamation-triangle" style="font-size:24px;"></i>
        </button>
    `;
    document.body.insertAdjacentHTML('beforeend', btnHTML);
}

// تهيئة النظام
document.addEventListener('DOMContentLoaded', () => {
    addReportModalToPage();
    addReportButton();
    initReportsSystem();
});
