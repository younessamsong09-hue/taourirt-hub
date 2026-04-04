// ========== نظام التبليغات (منقول من script.js + تطوير Supabase) ==========
let reportsFloat = JSON.parse(localStorage.getItem('city_reports')) || [];
let currentReportType = '';
let userLat = null, userLng = null;
let supabaseReports = null;

const SUPABASE_URL = 'https://pyxeusrxoizjlihyqhac.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt';

// تهيئة Supabase
async function initReportsSupabase() {
    if (typeof supabase === 'undefined') {
        await new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }
    supabaseReports = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    await loadReportsFromSupabase();
}

async function loadReportsFromSupabase() {
    if (!supabaseReports) return;
    const { data, error } = await supabaseReports
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
    if (!error && data) {
        reportsFloat = data;
        localStorage.setItem('city_reports', JSON.stringify(reportsFloat));
        showReportFloatList();
    }
}

// الدوال الأصلية (من script.js) – تم تعديل addReportFloat لاستخدام Supabase
function toggleReportFloat() {
    let p = document.getElementById('reportFloatPanel');
    p.style.display = p.style.display === 'none' ? 'block' : 'none';
    showReportFloatList();
}

function getReportLocationFloat() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                userLat = pos.coords.latitude;
                userLng = pos.coords.longitude;
                document.getElementById('reportFloatLocation').innerHTML = `📍 ${userLat.toFixed(4)}, ${userLng.toFixed(4)}`;
            },
            () => { document.getElementById('reportFloatLocation').innerHTML = '⚠️ لم نتمكن'; }
        );
    }
}

function startReportFloat(type) {
    currentReportType = type;
    document.getElementById('reportFloatForm').style.display = 'block';
    getReportLocationFloat();
}

async function addReportFloat() {
    let desc = document.getElementById('reportFloatDesc').value.trim();
    if (!desc) { alert('اكتب الوصف'); return; }
    let img = document.getElementById('reportFloatImage').files[0];
    let submitBtn = document.querySelector('#reportFloatForm .float-submit');
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

        if (supabaseReports) {
            const { data, error } = await supabaseReports
                .from('reports')
                .insert([reportData])
                .select();
            if (!error && data && data[0]) {
                reportId = data[0].id;
                if (img) {
                    // رفع الصورة إلى Storage
                    const ext = img.name.split('.').pop();
                    const fileName = `${reportId}_${Date.now()}.${ext}`;
                    const { error: upError } = await supabaseReports.storage
                        .from('reports-media')
                        .upload(`reports/${fileName}`, img);
                    if (!upError) {
                        const { data: { publicUrl } } = supabaseReports.storage
                            .from('reports-media')
                            .getPublicUrl(`reports/${fileName}`);
                        imageUrl = publicUrl;
                        await supabaseReports
                            .from('reports')
                            .update({ image_url: imageUrl })
                            .eq('id', reportId);
                    }
                }
                reportsFloat.unshift({ ...reportData, id: reportId, image_url: imageUrl });
                localStorage.setItem('city_reports', JSON.stringify(reportsFloat));
            } else {
                throw error;
            }
        } else {
            // وضع عدم الاتصال: حفظ محلياً
            let newReport = { id: Date.now(), type: currentReportType, desc: desc, lat: userLat, lng: userLng, date: new Date().toLocaleString('ar-MA'), status: 'pending' };
            if (img) {
                let reader = new FileReader();
                reader.onload = function(e) {
                    newReport.image = e.target.result;
                    reportsFloat.unshift(newReport);
                    localStorage.setItem('city_reports', JSON.stringify(reportsFloat));
                    showReportFloatList();
                    clearReportFloat();
                    alert('تم الإرسال (محلياً)');
                };
                reader.readAsDataURL(img);
                if (submitBtn) { submitBtn.innerHTML = 'إرسال'; submitBtn.disabled = false; }
                return;
            } else {
                reportsFloat.unshift(newReport);
                localStorage.setItem('city_reports', JSON.stringify(reportsFloat));
            }
        }
        showReportFloatList();
        clearReportFloat();
        alert('✅ تم الإرسال بنجاح!');
    } catch (err) {
        console.error(err);
        alert('❌ حدث خطأ');
    } finally {
        if (submitBtn) { submitBtn.innerHTML = 'إرسال'; submitBtn.disabled = false; }
    }
}

function clearReportFloat() {
    document.getElementById('reportFloatDesc').value = '';
    document.getElementById('reportFloatImage').value = '';
    document.getElementById('reportFloatForm').style.display = 'none';
    document.getElementById('reportFloatPanel').style.display = 'none';
}

function showReportFloatList() {
    let c = document.getElementById('reportFloatList');
    if (!c) return;
    if (reportsFloat.length === 0) { c.innerHTML = '<div class="card">📭 لا بلاغات</div>'; return; }
    let typeIcon = { 'pothole': '🕳️', 'light': '💡', 'garbage': '🗑️' };
    c.innerHTML = reportsFloat.slice(0, 3).map(r => `
        <div class="float-item">
            <span>${typeIcon[r.category] || '📌'} ${(r.description || r.desc).substring(0, 30)}</span>
            ${r.image_url ? `<img src="${r.image_url}" style="width:50px; height:50px; border-radius:8px;">` : ''}
            <a href="https://www.google.com/maps?q=${r.location_lat || r.lat},${r.location_lng || r.lng}" target="_blank">🗺️</a>
        </div>
    `).join('');
}

// بدء التهيئة
document.addEventListener('DOMContentLoaded', () => {
    initReportsSupabase();
});
