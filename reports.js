const supabase = supabase.createClient('https://pyxeusrxoizjlihyqhac.supabase.co', 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt');

function toggleReportFloat() {
    let p = document.getElementById('reportFloatPanel');
    if(p) p.style.display = p.style.display === 'none' ? 'block' : 'none';
}

function startReportFloat(type) {
    let form = document.getElementById('reportFloatForm');
    if(form) form.style.display = 'block';
    // هنا يمكن إضافة كود الموقع لاحقاً
}
