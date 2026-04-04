        list.innerHTML = data.map(r => Modules[r.type] ? Modules[r.type](r) : `<div class="post-card" style="padding:15px;color:white;">⚠️ ${r.description}</div>`).join("") || "📭 لا بلاغات";
                    if (coords && navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((pos) => {
                            const url = `https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}`;
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
            // تحديث الخريطة
            updateMap(filtered);
                container.innerHTML = filtered.map(p => renderPharmacyCard(p)).join('');
function getReportLocationFloat() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
                document.getElementById('reportFloatLocation').innerHTML = `📍 ${userLat.toFixed(4)}, ${userLng.toFixed(4)}`;
            () => { document.getElementById('reportFloatLocation').innerHTML = '⚠️ لم نتمكن'; }
    getReportLocationFloat();
    c.innerHTML = reportsFloat.slice(0, 3).map(r => `
        <div class="float-item"><span>${typeIcon[r.type]} ${r.desc.substring(0, 30)}</span><a href="https://www.google.com/maps?q=${r.lat},${r.lng}" target="_blank">🗺️</a></div>
    c.innerHTML = filtered.slice(0, 5).map(r => `
