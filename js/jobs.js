let jobs = JSON.parse(localStorage.getItem('taourirt_jobs')) || [
    { id: 1, title: 'بائع ملابس', company: 'قيسارية المغرب العربي', phone: '0600000000', tag: '✨ جديد', time: 'منذ قليل' }
];

function toggleJobs() {
    const content = document.getElementById('jobsContent');
    const arrow = document.getElementById('jobsArrow');
    if (!content) return;
    const isVisible = content.style.display === 'block';
    content.style.display = isVisible ? 'none' : 'block';
    if (arrow) arrow.className = isVisible ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
    if (!isVisible) showJobsList();
}

function showJobsList() {
    const container = document.getElementById('jobsList');
    if (!container) return;
    container.innerHTML = jobs.map(job => `
        <div class="job-item" style="background:#1e293b; border-radius:18px; padding:18px; border-right:6px solid #6366f1; transition:0.3s; position:relative;">
            <span style="position:absolute; left:15px; top:15px; font-size:10px; color:#64748b;">${job.time || 'اليوم'}</span>
            <div style="margin-bottom:15px;">
                <div style="font-weight:bold; color:white; font-size:1.1rem; display:flex; align-items:center; gap:8px;">
                    ${job.title} ${job.tag ? `<span style="background:#ef4444; font-size:9px; padding:3px 8px; border-radius:12px; color:white;">${job.tag}</span>` : ''}
                </div>
                <div style="font-size:13px; color:#94a3b8; margin-top:5px;"><i class="fas fa-map-marker-alt"></i> ${job.company} • تاوريرت</div>
            </div>
            <div style="display:flex; gap:10px;">
                <button onclick="applyJob('${job.phone}', '${job.title}')" style="flex:2; background:#22c55e; color:white; border:none; padding:10px; border-radius:10px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px;">
                    <i class="fab fa-whatsapp"></i> تقديم الطلب
                </button>
                <button onclick="removeJob(${job.id})" style="flex:1; background:transparent; border:1px solid #334155; color:#64748b; padding:10px; border-radius:10px; font-size:12px;">حذف</button>
            </div>
        </div>
    `).join('');
    if (document.getElementById('jobsCount')) document.getElementById('jobsCount').innerText = jobs.length;
}

function toggleJobForm() {
    const form = document.getElementById('addJobForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function saveNewJob() {
    const t = document.getElementById('newJobTitle').value;
    const p = document.getElementById('newJobPhone').value;
    const c = document.getElementById('newJobCompany').value;
    if (!t || !p) { alert('المرجو ملء العنوان والهاتف!'); return; }
    
    jobs.unshift({ id: Date.now(), title: t, company: c || 'تاوريرت', phone: p, tag: '✨ جديد', time: 'الآن' });
    localStorage.setItem('taourirt_jobs', JSON.stringify(jobs));
    toggleJobForm();
    showJobsList();
}

function applyJob(phone, title) {
    const msg = encodeURIComponent(`السلام عليكم، تواصلت معك بخصوص عرض العمل (${title}) الذي رأيته في تطبيق "تاوريرت هب". هل العرض متاح؟`);
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
}

function removeJob(id) {
    if (confirm('هل ترغب في حذف هذا الإعلان؟')) {
        jobs = jobs.filter(j => j.id !== id);
        localStorage.setItem('taourirt_jobs', JSON.stringify(jobs));
        showJobsList();
    }
}
