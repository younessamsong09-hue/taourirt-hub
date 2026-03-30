// ========== نظام التبليغات المتطور ==========

let reportsList = [];
let supabaseClient = null;
let currentReportType = '';
let currentLocation = null;
let selectedImage = null;

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
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ نظام التبليغات جاهز');
        await loadReports();
    } catch (err) {
        console.error('خطأ في Supabase:', err);
        loadLocalReports();
    }
}

// تحميل البلاغات
async function loadReports() {
    if (!supabaseClient) {
        loadLocalReports();
        return;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
        
        if (!error && data) {
            reportsList = data;
            localStorage.setItem('reports_list', JSON.stringify(data));
            showReportFloatList();
        } else {
            loadLocalReports();
        }
    } catch (err) {
        loadLocalReports();
    }
}

function loadLocalReports() {
    const saved = localStorage.getItem('reports_list');
    reportsList = saved ? JSON.parse(saved) : [];
    showReportFloatList();
}

// تبديل اللوحة
function toggleReportFloat() {
    const panel = document.getElementById('reportFloatPanel');
    if (panel) {
        const isVisible = panel.style.display === 'block';
        panel.style.display = isVisible ? 'none' : 'block';
        if (!isVisible) {
            getCurrentLocation();
            showReportFloatList();
        }
    }
}

// الحصول على الموقع
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                currentLocation = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                };
                const locationDiv = document.getElementById('reportFloatLocation');
                if (locationDiv) {
                    locationDiv.innerHTML = `📍 ${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`;
                    locationDiv.style.color = '#10b981';
                }
            },
            () => {
                const locationDiv = document.getElementById('reportFloatLocation');
                if (locationDiv) {
                    locationDiv.innerHTML = '⚠️ لم نتمكن من تحديد الموقع';
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
    getCurrentLocation();
}

// معاينة الصورة
function previewReportImage(input) {
    const preview = document.getElementById('imagePreview');
    if (input.files && input.files[0]) {
        selectedImage = input.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `
                <img src="${e.target.result}">
                <button class="remove-preview-btn" onclick="removeSelectedImage()">✖</button>
            `;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(selectedImage);
    }
}

function removeSelectedImage() {
    selectedImage = null;
    document.getElementById('reportFloatImage').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('imagePreview').style.display = 'none';
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
        console.error('خطأ في رفع الصورة:', err);
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
        const reportData = {
            category: currentReportType,
            description: desc,
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
                        reportData.image_url = imageUrl;
                    }
                }
                reportData.id = data[0].id;
                reportsList.unshift(reportData);
            } else {
                throw error;
            }
        } else {
            reportData.id = Date.now();
            reportsList.unshift(reportData);
        }
        
        localStorage.setItem('reports_list', JSON.stringify(reportsList));
        
        // تنظيف النموذج
        document.getElementById('reportFloatDesc').value = '';
        document.getElementById('reportFloatImage').value = '';
        document.getElementById('reportFloatForm').style.display = 'none';
        document.querySelector('#reportFloatPanel .float-buttons').style.display = 'flex';
        removeSelectedImage();
        currentReportType = '';
        
        showReportFloatList();
        alert('✅ تم إرسال البلاغ بنجاح! شكراً لك.');
        
    } catch (err) {
        console.error(err);
        alert('❌ حدث خطأ، حاول مرة أخرى');
    } finally {
        if (submitBtn) {
            submitBtn.innerHTML = 'إرسال';
            submitBtn.disabled = false;
        }
    }
}

// عرض قائمة البلاغات
function showReportFloatList() {
    const container = document.getElementById('reportFloatList');
    if (!container) return;
    
    if (reportsList.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:20px; color:#64748b;">📭 لا توجد بلاغات</div>';
        return;
    }
    
    const typeIcon = { pothole: '🕳️', light: '💡', garbage: '🗑️' };
    const typeName = { pothole: 'حفرة', light: 'إنارة', garbage: 'نفايات' };
    const typeClass = { pothole: 'pothole', light: 'light', garbage: 'garbage' };
    
    container.innerHTML = reportsList.slice(0, 5).map(r => `
        <div class="report-item" onclick="viewReportDetail(${r.id})">
            <span class="report-type-badge report-type-${typeClass[r.category] || 'other'}">
                ${typeIcon[r.category] || '📌'} ${typeName[r.category] || r.category}
            </span>
            <div class="report-desc-text">${escapeHtml(r.description?.substring(0, 80))}${r.description?.length > 80 ? '...' : ''}</div>
            ${r.image_url ? `<img src="${r.image_url}" class="report-image-thumb" onclick="event.stopPropagation(); window.open('${r.image_url}', '_blank')">` : ''}
            <div class="report-meta">
                <span><i class="far fa-clock"></i> ${new Date(r.created_at).toLocaleTimeString()}</span>
                ${r.location_lat ? `<a href="https://www.google.com/maps?q=${r.location_lat},${r.location_lng}" target="_blank" class="report-location-link" onclick="event.stopPropagation()"><i class="fas fa-map-marker-alt"></i> موقع</a>` : ''}
                <span class="report-status status-${r.status || 'pending'}">${r.status === 'resolved' ? '✅ تم الحل' : '⏳ قيد المراجعة'}</span>
            </div>
        </div>
    `).join('');
}

function viewReportDetail(id) {
    const report = reportsList.find(r => r.id === id);
    if (report) {
        alert(`📋 تفاصيل البلاغ\n\n${report.description}\n\n${report.location_lat ? `📍 الموقع: ${report.location_lat}, ${report.location_lng}` : ''}\n📅 ${new Date(report.created_at).toLocaleString('ar-MA')}`);
    }
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

// إضافة منطقة معاينة الصورة
function addImagePreviewArea() {
    const formDiv = document.getElementById('reportFloatForm');
    if (formDiv && !document.getElementById('imagePreview')) {
        const previewDiv = document.createElement('div');
        previewDiv.id = 'imagePreview';
        previewDiv.className = 'image-preview-area';
        previewDiv.style.display = 'none';
        const imageInput = document.getElementById('reportFloatImage');
        if (imageInput) {
            imageInput.insertAdjacentElement('afterend', previewDiv);
            imageInput.setAttribute('onchange', 'previewReportImage(this)');
        }
    }
}

// تهيئة النظام
document.addEventListener('DOMContentLoaded', () => {
    initReports();
    addImagePreviewArea();
});
