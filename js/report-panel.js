// ========== نظام التبليغ المتطور (Supabase) ==========
let reportsFloat = [];
let currentReportType = '';
let userLat = null, userLng = null;
let supabaseReports = null;
let selectedImageFile = null;

const SUPABASE_URL = 'https://pyxeusrxoizjlihyqhac.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt';

// تهيئة Supabase
async function initReports() {
    try {
        if (typeof supabase === 'undefined') {
            await new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
                script.onload = resolve;
                document.head.appendChild(script);
            });
        }
        supabaseReports = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase للتبليغات جاهز');
        await loadReports();
    } catch (err) {
        console.error('فشل اتصال Supabase، استخدام localStorage:', err);
        loadLocalReports();
    }
}

// تحميل البلاغات من Supabase
async function loadReports() {
    if (!supabaseReports) return;
    const { data, error } = await supabaseReports
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
    if (!error && data) {
        reportsFloat = data;
        localStorage.setItem('city_reports', JSON.stringify(reportsFloat));
        showReportFloatList();
    } else {
        loadLocalReports();
    }
}

function loadLocalReports() {
    const saved = localStorage.getItem('city_reports');
    reportsFloat = saved ? JSON.parse(saved) : [];
    showReportFloatList();
}

// حفظ بلاغ في Supabase
async function saveReportToSupabase(report) {
    if (!supabaseReports) return null;
    const { data, error } = await supabaseReports
        .from('reports')
        .insert([{
            category: report.type,
            description: report.desc,
            location_lat: report.lat,
            location_lng: report.lng,
            status: 'pending',
            created_at: new Date().toISOString()
        }])
        .select();
    if (error) throw error;
    return data[0];
}

// رفع الصورة إلى Storage
async function uploadReportImage(file, reportId) {
    if (!supabaseReports || !file) return null;
    const ext = file.name.split('.').pop();
    const fileName = `${reportId}_${Date.now()}.${ext}`;
    const { error } = await supabaseReports.storage
        .from('reports-media')
        .upload(`reports/${fileName}`, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabaseReports.storage
        .from('reports-media')
        .getPublicUrl(`reports/${fileName}`);
    return publicUrl;
}

// الدوال الأساسية (واجهة)
window.toggleReportFloat = function() {
    const panel = document.getElementById('reportFloatPanel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        if (panel.style.display === 'block') {
            getReportLocationFloat();
            showReportFloatList();
        }
    }
};

window.getReportLocationFloat = function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                userLat = pos.coords.latitude;
                userLng = pos.coords.longitude;
                const locDiv = document.getElementById('reportFloatLocation');
                if (locDiv) locDiv.innerHTML = `📍 ${userLat.toFixed(4)}, ${userLng.toFixed(4)}`;
            },
            () => {
                const locDiv = document.getElementById('reportFloatLocation');
                if (locDiv) locDiv.innerHTML = '⚠️ لم نتمكن من تحديد الموقع';
            }
        );
    }
};

window.startReportFloat = function(type) {
    currentReportType = type;
    document.getElementById('reportFloatForm').style.display = 'block';
    document.querySelector('#reportFloatPanel .float-buttons').style.display = 'none';
    getReportLocationFloat();
};

// معاينة الصورة
function previewImage(input) {
    const previewArea = document.getElementById('imagePreviewArea');
    if (input.files && input.files[0]) {
        selectedImageFile = input.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            previewArea.innerHTML = `
                <div class="image-preview-area">
                    <img src="${e.target.result}">
                    <button class="remove-preview" onclick="removeSelectedImage()">✖</button>
                </div>
            `;
            previewArea.style.display = 'block';
        };
        reader.readAsDataURL(selectedImageFile);
    }
}

window.removeSelectedImage = function() {
    selectedImageFile = null;
    document.getElementById('reportFloatImage').value = '';
    const previewArea = document.getElementById('imagePreviewArea');
    previewArea.innerHTML = '';
    previewArea.style.display = 'none';
};

window.addReportFloat = async function() {
    const desc = document.getElementById('reportFloatDesc').value.trim();
    if (!desc) {
        alert('❌ الرجاء كتابة الوصف');
        return;
    }
    const submitBtn = document.querySelector('#reportFloatForm .float-submit');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
        submitBtn.disabled = true;
    }
    try {
        let newReport = {
            type: currentReportType,
            desc: desc,
            lat: userLat,
            lng: userLng,
            created_at: new Date().toISOString()
        };
        let savedReport = null;
        let imageUrl = null;

        if (supabaseReports) {
            savedReport = await saveReportToSupabase(newReport);
            if (savedReport && selectedImageFile) {
                imageUrl = await uploadReportImage(selectedImageFile, savedReport.id);
                if (imageUrl) {
                    await supabaseReports
                        .from('reports')
                        .update({ image_url: imageUrl })
                        .eq('id', savedReport.id);
                }
            }
            if (savedReport) {
                newReport.id = savedReport.id;
                newReport.image_url = imageUrl;
                reportsFloat.unshift(newReport);
            }
        } else {
            // وضع عدم الاتصال
            newReport.id = Date.now();
            if (selectedImageFile) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    newReport.image = e.target.result;
                    reportsFloat.unshift(newReport);
                    localStorage.setItem('city_reports', JSON.stringify(reportsFloat));
                    showReportFloatList();
                    clearReportFloat();
                    alert('✅ تم الإرسال (محلياً)');
                };
                reader.readAsDataURL(selectedImageFile);
                if (submitBtn) {
                    submitBtn.innerHTML = 'إرسال';
                    submitBtn.disabled = false;
                }
                return;
            } else {
                reportsFloat.unshift(newReport);
            }
        }
        localStorage.setItem('city_reports', JSON.stringify(reportsFloat));
        showReportFloatList();
        clearReportFloat();
        alert('✅ تم إرسال البلاغ بنجاح!');
    } catch (err) {
        console.error(err);
        alert('❌ حدث خطأ أثناء الإرسال');
    } finally {
        if (submitBtn) {
            submitBtn.innerHTML = 'إرسال';
            submitBtn.disabled = false;
        }
    }
};

window.clearReportFloat = function() {
    document.getElementById('reportFloatDesc').value = '';
    document.getElementById('reportFloatImage').value = '';
    document.getElementById('reportFloatForm').style.display = 'none';
    document.querySelector('#reportFloatPanel .float-buttons').style.display = 'flex';
    document.getElementById('reportFloatPanel').style.display = 'none';
    removeSelectedImage();
    currentReportType = '';
    userLat = null;
    userLng = null;
};

window.showReportFloatList = function() {
    const container = document.getElementById('reportFloatList');
    if (!container) return;
    if (reportsFloat.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:20px;">📭 لا توجد بلاغات</div>';
        return;
    }
    const typeIcon = { pothole: '🕳️', light: '💡', garbage: '🗑️' };
    const typeName = { pothole: 'حفرة', light: 'إنارة', garbage: 'نفايات' };
    container.innerHTML = reportsFloat.slice(0, 5).map(r => `
        <div class="report-item">
            <div style="display:flex; justify-content:space-between;">
                <strong style="color:#ef4444;">${typeIcon[r.category] || '📌'} ${typeName[r.category] || r.category}</strong>
                <small>${new Date(r.created_at).toLocaleTimeString()}</small>
            </div>
            <p>${(r.description || r.desc).substring(0, 80)}${(r.description || r.desc).length > 80 ? '...' : ''}</p>
            ${r.image_url ? `<img src="${r.image_url}" alt="صورة البلاغ" onclick="window.open('${r.image_url}')">` : ''}
            <div class="report-meta">
                <span class="report-status status-${r.status || 'pending'}">${r.status === 'resolved' ? '✅ تم الحل' : '⏳ قيد المراجعة'}</span>
                ${r.location_lat ? `<a href="https://www.google.com/maps?q=${r.location_lat},${r.location_lng}" target="_blank">📍 موقع</a>` : ''}
            </div>
        </div>
    `).join('');
};

// إضافة منطقة معاينة الصورة
function addImagePreviewArea() {
    const formDiv = document.getElementById('reportFloatForm');
    if (formDiv && !document.getElementById('imagePreviewArea')) {
        const previewDiv = document.createElement('div');
        previewDiv.id = 'imagePreviewArea';
        previewDiv.style.display = 'none';
        const fileInput = document.getElementById('reportFloatImage');
        if (fileInput) {
            fileInput.setAttribute('onchange', 'previewImage(this)');
            fileInput.insertAdjacentElement('afterend', previewDiv);
        }
    }
}

// بدء النظام
document.addEventListener('DOMContentLoaded', () => {
    initReports();
    addImagePreviewArea();
});
