// ========== نظام الوظائف مع Supabase ==========
let supabaseJobs = null;
let jobs = [];

const SUPABASE_URL = 'https://pyxeusrxoizjlihyqhac.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt';

async function initJobsSupabase() {
    if (typeof supabase === 'undefined') {
        await new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }
    supabaseJobs = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    await loadJobs();
    showJobsList();
}

async function loadJobs() {
    const { data, error } = await supabaseJobs
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
    if (!error && data) jobs = data;
    localStorage.setItem('jobs_backup', JSON.stringify(jobs));
}
async function addJobToSupabase(job) {
    const { data, error } = await supabaseJobs.from('jobs').insert([job]).select();
    if (error) throw error;
    return data[0];
}

window.toggleJobs = function() {
    const content = document.getElementById('jobsContent');
    const arrow = document.getElementById('jobsArrow');
    if (content) {
        const isVisible = content.style.display === 'block';
        content.style.display = isVisible ? 'none' : 'block';
        if (arrow) arrow.className = isVisible ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
        if (!isVisible) showJobsList();
    }
};
window.showJobsList = function() {
    const container = document.getElementById('jobsList');
    if (!container) return;
    if (jobs.length === 0) { container.innerHTML = '<div>لا توجد وظائف</div>'; return; }
    container.innerHTML = jobs.map(j => `
        <div style="background:#1e293b; padding:12px; margin-bottom:8px;">
            <b>${j.title}</b><br>${j.company}<br><a href="tel:${j.phone}">اتصل</a>
            <button onclick="removeJob(${j.id})">حذف</button>
        </div>
    `).join('');
};
window.toggleJobForm = function() {
    const form = document.getElementById('addJobForm');
    if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
};
window.saveNewJob = async function() {
    const title = document.getElementById('newJobTitle').value.trim();
    const company = document.getElementById('newJobCompany').value.trim();
    const phone = document.getElementById('newJobPhone').value.trim();
    if (!title || !phone) return alert('املأ الحقول');
    const newJob = { title, company, phone, created_at: new Date().toISOString() };
    try {
        if (supabaseJobs) {
            const saved = await addJobToSupabase(newJob);
            jobs.unshift(saved);
        } else {
            newJob.id = Date.now();
            jobs.unshift(newJob);
        }
        localStorage.setItem('jobs_backup', JSON.stringify(jobs));
        showJobsList();
        document.getElementById('addJobForm').style.display = 'none';
        document.getElementById('newJobTitle').value = '';
        document.getElementById('newJobCompany').value = '';
        document.getElementById('newJobPhone').value = '';
        alert('✅ تم النشر');
    } catch (err) { alert('❌ خطأ'); }
};
window.applyJob = function(phone, title) {
    window.open(`https://wa.me/${phone}?text=السلام عليكم، تواصلت بخصوص وظيفة ${title}`);
};
window.removeJob = async function(id) {
    if (!confirm('حذف؟')) return;
    if (supabaseJobs) await supabaseJobs.from('jobs').delete().eq('id', id);
    jobs = jobs.filter(j => j.id !== id);
    localStorage.setItem('jobs_backup', JSON.stringify(jobs));
    showJobsList();
};
document.addEventListener('DOMContentLoaded', initJobsSupabase);
