// ========== أيقونة التبليغ ==========
let reportsFloat = JSON.parse(localStorage.getItem('city_reports')) || [];
let currentReportType = '';
let userLat = null, userLng = null;

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

function addReportFloat() {
    let desc = document.getElementById('reportFloatDesc').value.trim();
    if (!desc) { alert('اكتب الوصف'); return; }
    let newReport = { id: Date.now(), type: currentReportType, desc: desc, lat: userLat, lng: userLng, date: new Date().toLocaleString('ar-MA'), status: 'pending' };
    let img = document.getElementById('reportFloatImage').files[0];
    if (img) {
        let reader = new FileReader();
        reader.onload = function(e) {
            newReport.image = e.target.result;
            reportsFloat.unshift(newReport);
            localStorage.setItem('city_reports', JSON.stringify(reportsFloat));
            showReportFloatList();
            clearReportFloat();
            alert('تم الإرسال');
        };
        reader.readAsDataURL(img);
    } else {
        reportsFloat.unshift(newReport);
        localStorage.setItem('city_reports', JSON.stringify(reportsFloat));
        showReportFloatList();
        clearReportFloat();
        alert('تم الإرسال');
    }
}

function clearReportFloat() {
    document.getElementById('reportFloatDesc').value = '';
    document.getElementById('reportFloatImage').value = '';
    document.getElementById('reportFloatForm').style.display = 'none';
}

function showReportFloatList() {
    let c = document.getElementById('reportFloatList');
    if (!c) return;
    if (reportsFloat.length === 0) { c.innerHTML = '<div class="card">📭 لا بلاغات</div>'; return; }
    let typeIcon = { 'pothole': '🕳️', 'light': '💡', 'garbage': '🗑️' };
    c.innerHTML = reportsFloat.slice(0, 3).map(r => `
        <div class="float-item"><span>${typeIcon[r.type]} ${r.desc.substring(0, 30)}</span><a href="https://www.google.com/maps?q=${r.lat},${r.lng}" target="_blank">🗺️</a></div>
    `).join('');
}

