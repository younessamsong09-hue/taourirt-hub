const supabaseClient = supabase.createClient('https://pyxeusrxoizjlihyqhac.supabase.co', 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt');

function toggleReportFloat() {
    const p = document.getElementById('reportFloatPanel');
    if(p) p.style.display = p.style.display === 'none' ? 'block' : 'none';
}

function startReportFloat(type) {
    const f = document.getElementById('reportFloatForm');
    if(f) f.style.display = 'block';
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const loc = document.getElementById('reportFloatLocation');
            if(loc) loc.innerHTML = `📍 ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
        });
    }
}
