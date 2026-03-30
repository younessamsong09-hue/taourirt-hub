// ========== نظام التبليغات المتطور ==========

let reportsFloat = [];
let supabaseClient = null;
let currentReportType = '';
let userLat = null;
let userLng = null;
let selectedImageFile = null;

// بيانات Supabase
const SUPABASE_URL = 'https://pyxeusrxoizjlihyqhac.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt';

// تهيئة Supabase
async function initSupabaseReports() {
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
        await loadReportsFromSupabase();
    } catch (err) {
        console.error('خطأ:', err);
        loadReportsFromLocal();
    }
}

// تحميل البلاغات من Supabase
async function loadReportsFromSupabase() {
    if (!supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
        if (!error && data) {
            reportsFloat = data;
            saveReportsToLocal();
            showReportFloatList();
        }
    } catch (err) {
        loadReportsFromLocal();
    }
}

// تحميل من localStorage
function loadReportsFromLocal() {
    const saved = localStorage.getItem('city_reports');
    reportsFloat = saved ? JSON.parse(saved) : [];
    showReportFloatList();
}

// حفظ في localStorage
function saveReportsToLocal() {
    localStorage.setItem('city_reports', JSON.stringify(reportsFloat));
}

// تبديل اللوحة
function toggleReportFloat() {
    const panel = document.getElementById('reportFloatPanel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        if (panel.style.display === 'block') {
            getReportLocation();
            showReportFloatList();
        }
    }
}

// الحصول على الموقع
function getReportLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                userLat = pos.coords.latitude;
                userLng = pos.coords.longitude;
                const locationDiv = document.getElementById('reportFloatLocation');
                if (locationDiv) {
                    locationDiv.innerHTML = `📍 ${userLat.toFixed(6)}, ${userLng.toFixed(6)}`;
                    locationDiv.style.color = '#10b981';
                }
            },
            () => {
                const locationDiv = document.getElementById('reportFloatLocation');
                if (locationDiv) {
                    locationDiv.innerHTML = '⚠️ لم نتمكن من تحديد الموقع، يمكنك إدخاله يدوياً';
                    locationDiv.style.color = '#f59e0b';
                }
            }
        );
    }
}

// بدء التبليغ
function startReportFloat(type) {
    currentReportType = type;
    document.getElementById('reportFloatForm').style.display = 'block';
    document.querySelector('#reportFloatPanel .float-buttons').style.display = 'none';
    getReportLocation();
}

// معاينة الصورة
function previewReportImage(input) {
    const previewArea = document.getElementById('imagePreviewArea');
    if (input.files && input.files[0]) {
        selectedImageFile = input.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            previewArea.innerHTML = `
                <img src="${e.target.result}" alt="معاينة">
                <button class="remove-image-btn" onclick="removeSelectedImage()">✖</button>
            `;
            previewArea.style.display = 'block';
        };
        reader.readAsDataURL(selectedImageFile);
    }
}

function removeSelectedImage() {
    selectedImageFile = null;
    document.getElementById('reportFloatImage').value = '';
    document.getElementById('imagePreviewArea').innerHTML = '';
    document.getElementById('imagePreviewArea').style.display = 'none';
}

// رفع الصورة
async function uploadReportImage(file, reportId) {
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
async function addReportFloat() {
    const desc = document.getElementById('reportFloatDesc').value.trim();
    
    if (!desc) {
        alert('❌ الرجاء كتابة وصف للمشكلة');
        return;
    }
    
    const submitBtn = document.querySelector('#reportFloatForm .float-submit');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
        submitBtn.disabled = true;
    }
    
    try {
        let imageUrl = null;
        let reportId = null;
        
        const reportData = {
            category: currentReportType,
            description: desc,
            location_lat: userLat,
            location_lng: userLng,
            status: 'pending',
            created_at: new Date().toISOString()
        };
        
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('reports')
                .insert([reportData])
                .select();
            
            if (!error && data && data[0]) {
                reportId = data[0].id;
                reportData.id = reportId;
                
                if (selectedImageFile) {
                    imageUrl = await uploadReportImage(selectedImageFile, reportId);
                    if (imageUrl) {
                        await supabaseClient
                            .from('reports')
                            .update({ image_url: imageUrl })
                            .eq('id', reportId);
                    }
                }
                reportsFloat.unshift(reportData);
            } else {
                throw error;
            }
        } else {
            reportData.id = Date.now();
            reportsFloat.unshift(reportData);
        }
        
        saveReportsToLocal();
        clearReportFloat();
        showReportFloatList();
        showToast('✅ تم إرسال البلاغ بنجاح! شكراً لك.');
        
    } catch (err) {
        console.error(err);
        showToast('❌ حدث خطأ، حاول مرة أخرى', 'error');
    } finally {
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال البلاغ';
            submitBtn.disabled = false;
        }
    }
}

// عرض قائمة البلاغات
function showReportFloatList() {
    const container = document.getElementById('reportFloatList');
    if (!container) return;
    
    if (reportsFloat.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:20px; color:#64748b;">📭 لا توجد بلاغات حالياً</div>';
        return;
    }
    
    const typeIcon = { 'pothole': '🕳️', 'light': '💡', 'garbage': '🗑️' };
    const typeName = { 'pothole': 'حفرة', 'light': 'إنارة', 'garbage': 'نفايات' };
    
    container.innerHTML = reportsFloat.slice(0, 5).map(r => `
        <div class="report-item" onclick="viewReportDetail(${r.id})">
            <div>
                <span class="report-type ${r.category || r.type}">${typeIcon[r.category || r.type]} ${typeName[r.category || r.type] || r.category || r.type}</span>
                <div class="report-desc">${(r.description || '').substring(0, 60)}${(r.description || '').length > 60 ? '...' : ''}</div>
                <div class="report-footer">
                    <span><i class="far fa-clock"></i> ${new Date(r.created_at).toLocaleTimeString()}</span>
                    ${r.location_lat ? '<span><i class="fas fa-map-marker-alt"></i> موقع</span>' : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function viewReportDetail(id) {
    const report = reportsFloat.find(r => r.id === id);
    if (report) {
        alert(`📋 تفاصيل البلاغ:\n\n${report.description}\n\n${report.location_lat ? `📍 ${report.location_lat}, ${report.location_lng}` : ''}\n📅 ${new Date(report.created_at).toLocaleString('ar-MA')}`);
    }
}

// تنظيف النموذج
function clearReportFloat() {
    document.getElementById('reportFloatDesc').value = '';
    document.getElementById('reportFloatImage').value = '';
    document.getElementById('reportFloatForm').style.display = 'none';
    document.querySelector('#reportFloatPanel .float-buttons').style.display = 'flex';
    document.getElementById('reportFloatPanel').style.display = 'none';
    removeSelectedImage();
    currentReportType = '';
    userLat = null;
    userLng = null;
}

// إظهار رسالة
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 20px;
        background: ${type === 'success' ? '#22c55e' : '#ef4444'};
        color: white;
        padding: 12px 20px;
        border-radius: 50px;
        z-index: 10001;
        animation: slideInRight 0.3s ease;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// تهيئة النظام
document.addEventListener('DOMContentLoaded', () => {
    initSupabaseReports();
    
    // إضافة منطقة معاينة الصورة
    const formDiv = document.getElementById('reportFloatForm');
    if (formDiv && !document.getElementById('imagePreviewArea')) {
        const previewDiv = document.createElement('div');
        previewDiv.id = 'imagePreviewArea';
        previewDiv.className = 'image-preview-area';
        previewDiv.style.display = 'none';
        const imageInput = document.getElementById('reportFloatImage');
        if (imageInput) {
            imageInput.insertAdjacentElement('afterend', previewDiv);
            imageInput.setAttribute('onchange', 'previewReportImage(this)');
        }
    }
});
