// ========== نظام التبليغات المتكامل ==========
let supabaseReports = null;
let currentReportType = '';
let userLocation = null;
let selectedImageFile = null;

const SUPABASE_URL = 'https://pyxeusrxoizjlihyqhac.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt';

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
        console.log('✅ Supabase - التبليغات جاهز');
        await loadReports();
    } catch (err) {
        console.error('Supabase error:', err);
        loadLocalReports();
    }
}

async function loadReports() {
    if (!supabaseReports) return;
    const { data, error } = await supabaseReports
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
    if (!error && data) {
        localStorage.setItem('city_reports', JSON.stringify(data));
        window.reportsFloat = data;
        showReportFloatList();
    } else {
        loadLocalReports();
    }
}
function loadLocalReports() {
    const saved = localStorage.getItem('city_reports');
    window.reportsFloat = saved ? JSON.parse(saved) : [];
    showReportFloatList();
}

window.toggleReportFloat = function() {
    const panel = document.getElementById('reportFloatPanel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        if (panel.style.display === 'block') {
            getReportLocation();
            showReportFloatList();
        }
    }
};
function getReportLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                const locDiv = document.getElementById('reportFloatLocation');
                if (locDiv) locDiv.innerHTML = `📍 ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
            },
            () => {
                const locDiv = document.getElementById('reportFloatLocation');
                if (locDiv) locDiv.innerHTML = '⚠️ لم نتمكن من تحديد الموقع';
            }
        );
    }
}
window.startReportFloat = function(type) {
    currentReportType = type;
    document.getElementById('reportFloatForm').style.display = 'block';
    document.querySelector('#reportFloatPanel .float-buttons').style.display = 'none';
    getReportLocation();
};
function previewReportImage(input) {
    const previewArea = document.getElementById('imagePreviewArea');
    if (input.files && input.files[0]) {
        selectedImageFile = input.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            previewArea.innerHTML = `<img src="${e.target.result}" style="width:100%; border-radius:12px;"><button onclick="removeSelectedImage()" style="position:absolute; top:5px; right:5px; background:#ef4444; border:none; border-radius:50%; width:25px; height:25px; cursor:pointer;">✖</button>`;
            previewArea.style.display = 'block';
        };
        reader.readAsDataURL(selectedImageFile);
    }
}
function removeSelectedImage() {
    selectedImageFile = null;
    document.getElementById('reportFloatImage').value = '';
    const previewArea = document.getElementById('imagePreviewArea');
    previewArea.innerHTML = '';
    previewArea.style.display = 'none';
}
async function uploadReportImage(file, reportId) {
    if (!supabaseReports || !file) return null;
    const ext = file.name.split('.').pop();
    const fileName = `${reportId}_${Date.now()}.${ext}`;
    try {
        const { error } = await supabaseReports.storage
            .from('reports-media')
            .upload(`reports/${fileName}`, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabaseReports.storage
            .from('reports-media')
            .getPublicUrl(`reports/${fileName}`);
        return publicUrl;
    } catch (err) { return null; }
}
window.addReportFloat = async function() {
    const desc = document.getElementById('reportFloatDesc').value.trim();
    if (!desc) { alert('❌ الرجاء كتابة الوصف'); return; }
    const btn = document.querySelector('#reportFloatForm .float-submit');
    if (btn) { btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...'; btn.disabled = true; }
    try {
        let imageUrl = null;
        let reportId = null;
        const reportData = {
            category: currentReportType,
            description: desc,
            location_lat: userLocation?.lat || null,
            location_lng: userLocation?.lng || null,
            status: 'pending',
            created_at: new Date().toISOString()
        };
        if (supabaseReports) {
            const { data, error } = await supabaseReports
                .from('reports')
                .insert([reportData])
                .select();
            if (error) throw error;
            if (data && data[0]) {
                reportId = data[0].id;
                if (selectedImageFile) {
                    imageUrl = await uploadReportImage(selectedImageFile, reportId);
                    if (imageUrl) {
                        await supabaseReports
                            .from('reports')
                            .update({ image_url: imageUrl })
                            .eq('id', reportId);
                    }
                }
                reportData.id = reportId;
                reportData.image_url = imageUrl;
                window.reportsFloat = window.reportsFloat || [];
                window.reportsFloat.unshift(reportData);
                localStorage.setItem('city_reports', JSON.stringify(window.reportsFloat));
            }
        } else {
            reportData.id = Date.now();
            window.reportsFloat = window.reportsFloat || [];
            window.reportsFloat.unshift(reportData);
            localStorage.setItem('city_reports', JSON.stringify(window.reportsFloat));
        }
        showReportFloatList();
        clearReportFloat();
        alert('✅ تم إرسال البلاغ بنجاح!');
    } catch (err) { alert('❌ حدث خطأ'); }
    finally { if (btn) { btn.innerHTML = 'إرسال'; btn.disabled = false; } }
};
function showReportFloatList() {
    const container = document.getElementById('reportFloatList');
    if (!container) return;
    const reports = window.reportsFloat || [];
    if (reports.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:20px;">📭 لا توجد بلاغات</div>';
        return;
    }
    const typeIcon = { pothole: '🕳️', light: '💡', garbage: '🗑️' };
    const typeName = { pothole: 'حفرة', light: 'إنارة', garbage: 'نفايات' };
    container.innerHTML = reports.slice(0, 5).map(r => `
        <div style="background:#1e293b; border-radius:12px; padding:12px; margin-bottom:8px; border-right:3px solid #ef4444;">
            <div><b>${typeIcon[r.category] || '📌'} ${typeName[r.category] || r.category}</b> <span style="float:left;">${new Date(r.created_at).toLocaleTimeString()}</span></div>
            <div style="font-size:12px;">${r.description.substring(0, 50)}${r.description.length>50?'...':''}</div>
            ${r.image_url ? `<img src="${r.image_url}" style="width:100%; max-height:100px; object-fit:cover; border-radius:8px; margin-top:5px;">` : ''}
        </div>
    `).join('');
}
function clearReportFloat() {
    document.getElementById('reportFloatDesc').value = '';
    document.getElementById('reportFloatImage').value = '';
    document.getElementById('reportFloatForm').style.display = 'none';
    document.querySelector('#reportFloatPanel .float-buttons').style.display = 'flex';
    document.getElementById('reportFloatPanel').style.display = 'none';
    removeSelectedImage();
    currentReportType = '';
    userLocation = null;
}
function addImagePreviewArea() {
    const formDiv = document.getElementById('reportFloatForm');
    if (formDiv && !document.getElementById('imagePreviewArea')) {
        const previewDiv = document.createElement('div');
        previewDiv.id = 'imagePreviewArea';
        previewDiv.style.cssText = 'position:relative; margin-top:8px; display:none;';
        const fileInput = document.getElementById('reportFloatImage');
        if (fileInput) {
            fileInput.setAttribute('onchange', 'previewReportImage(this)');
            fileInput.insertAdjacentElement('afterend', previewDiv);
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    initReports();
    addImagePreviewArea();
});
