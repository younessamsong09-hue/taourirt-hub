// ========== المفقودات والموجودات (تعتمد على جدول reports) ==========
let supabaseLF = null;
let lostItems = [];
let foundItems = [];

const SUPABASE_URL = 'https://pyxeusrxoizjlihyqhac.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt';

async function initLostFound() {
    if (typeof supabase === 'undefined') {
        await new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }
    supabaseLF = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    await loadLostFound();
    renderLostFound();
}
async function loadLostFound() {
    const { data, error } = await supabaseLF
        .from('reports')
        .select('*')
        .in('category', ['lost', 'found'])
        .order('created_at', { ascending: false });
    if (!error && data) {
        lostItems = data.filter(r => r.category === 'lost');
        foundItems = data.filter(r => r.category === 'found');
        localStorage.setItem('lost_backup', JSON.stringify(lostItems));
        localStorage.setItem('found_backup', JSON.stringify(foundItems));
    }
}
function renderLostFound() {
    const lostDiv = document.getElementById('lostList');
    const foundDiv = document.getElementById('foundList');
    if (lostDiv) lostDiv.innerHTML = lostItems.map(l => `<div>🔴 ${l.title} - ${l.description}</div>`).join('');
    if (foundDiv) foundDiv.innerHTML = foundItems.map(f => `<div>🟢 ${f.title} - ${f.description}</div>`).join('');
}
window.toggleLostFound = function() { /* مثل السابق */ };
window.showLostForm = function() { /* إظهار نموذج المفقود */ };
window.showFoundForm = function() { /* إظهار نموذج الموجود */ };
window.addLost = async function() { /* إضافة إلى reports مع category='lost' */ };
window.addFound = async function() { /* إضافة إلى reports مع category='found' */ };
// ... سنكملها لاحقاً إذا أردت
document.addEventListener('DOMContentLoaded', initLostFound);
