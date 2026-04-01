import { PotholeModule } from './modules/pothole.js';
import { LightModule } from './modules/light.js';

const supabase = window.supabase.createClient('https://pyxeusrxoizjlihyqhac.supabase.co', 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt');

window.fetchLatestReports = async function() {
    const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
    const list = document.getElementById('reportFloatList');
    if (error || !list) return;

    list.innerHTML = data.map(r => {
        if(r.type === 'pothole') return PotholeModule.render(r);
        if(r.type === 'light') return LightModule.render(r);
        return `<div style="color:white; padding:10px; border:1px solid #333; margin-bottom:10px;">تبليغ عام: ${r.description}</div>`;
    }).join('');
};

window.toggleReportFloat = function() {
    const p = document.getElementById('reportFloatPanel');
    if(p) {
        p.style.display = (p.style.display === 'none' || p.style.display === '') ? 'block' : 'none';
        if (p.style.display === 'block') window.fetchLatestReports();
    }
};
