// إعدادات Supabase
const supabaseClient = supabase.createClient('https://pyxeusrxoizjlihyqhac.supabase.co', 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt');

let userLat = null, userLng = null;
let currentReportType = '';

function toggleReportFloat() {
    const p = document.getElementById('reportFloatPanel');
    if (p) {
        p.style.display = (p.style.display === 'none' || p.style.display === '') ? 'block' : 'none';
        if (p.style.display === 'block') fetchReportsFromSupabase();
    }
}

function getReportLocationFloat() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            userLat = pos.coords.latitude;
            userLng = pos.coords.longitude;
            const locDiv = document.getElementById('reportFloatLocation');
            if (locDiv) locDiv.innerHTML = `📍 ${userLat.toFixed(4)}, ${userLng.toFixed(4)}`;
        }, () => {
            const locDiv = document.getElementById('reportFloatLocation');
            if (locDiv) locDiv.innerHTML = '⚠️ فشل تحديد الموقع';
        });
    }
}

function startReportFloat(type) {
    currentReportType = type;
    const form = document.getElementById('reportFloatForm');
    if (form) form.style.display = 'block';
    getReportLocationFloat();
}

async function addReportFloat() {
    const descField = document.getElementById('reportFloatDesc');
    const fileField = document.getElementById('reportFloatImage');
    const desc = descField ? descField.value.trim() : "";
    const file = fileField ? fileField.files[0] : null;

    if (!desc) return alert('يرجى كتابة وصف البلاغ');

    try {
        let imgUrl = null;
        if (file) {
            const fName = `report_${Date.now()}.jpg`;
            const { data, error: uploadError } = await supabaseClient.storage.from('report-images').upload(fName, file);
            if (!uploadError) {
                imgUrl = supabaseClient.storage.from('report-images').getPublicUrl(fName).data.publicUrl;
            }
        }

        const { error: dbError } = await supabaseClient.from('reports').insert([{
            category: currentReportType,
            description: desc,
            image_url: imgUrl,
            location_lat: userLat,
            location_lng: userLng,
            status: 'pending'
        }]);

        if (dbError) throw dbError;
        alert('✅ تم الإرسال بنجاح إلى Taourirt Hub');
        if (descField) descField.value = '';
        const form = document.getElementById('reportFloatForm');
        if (form) form.style.display = 'none';
        fetchReportsFromSupabase();
    } catch (e) {
        alert('❌ خطأ: ' + e.message);
    }
}

async function fetchReportsFromSupabase() {
    const { data, error } = await supabaseClient.from('reports').select('*').order('created_at', { ascending: false }).limit(3);
    const container = document.getElementById('reportFloatList');
    if (!error && data && container) {
        const icons = { 'pothole': '🕳️', 'light': '💡', 'garbage': '🗑️' };
        container.innerHTML = data.map(r => `
            <div class="float-item">
                <span>${icons[r.category] || '⚠️'} ${r.description.substring(0, 15)}...</span>
                <span style="font-size: 0.8em; color: #888;">${r.status === 'resolved' ? '✅' : '⏳'}</span>
            </div>
        `).join('');
    }
}
