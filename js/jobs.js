let jobs = JSON.parse(localStorage.getItem('taourirt_jobs')) || [
    { id: 1, title: 'صيدلي', company: 'صيدلية الجابري', location: 'وسط المدينة', salary: '4000', phone: '0536699222', tag: '🔥 مطلوب' },
    { id: 2, title: 'ممرض', company: 'المستشفى الإقليمي', location: 'حي المسيرة', salary: '3000', phone: '0536698018', tag: '' },
    { id: 3, title: 'بائع', company: 'مركز المنار', location: 'وسط المدينة', salary: '2500', phone: '0536123463', tag: '✨ جديد' }
];

function toggleJobs() {
    const content = document.getElementById('jobsContent');
    const arrow = document.getElementById('jobsArrow');
    if (!content || !arrow) return;
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        arrow.className = 'fas fa-chevron-up';
        showJobsList();
    } else {
        content.style.display = 'none';
        arrow.className = 'fas fa-chevron-down';
    }
}

function showJobsList() {
    const container = document.getElementById('jobsList');
    if (!container) return;
    if (jobs.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:20px; color:#94a3b8;">📭 لا توجد وظائف حالياً</div>';
        return;
    }
    container.innerHTML = jobs.map(job => `
        <div class="job-item" style="background:#1e293b; border:1px solid #334155; border-radius:12px; padding:15px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
            <div style="flex:1;">
                <div style="color:#3b82f6; font-weight:bold; font-size:1.1rem; display:flex; align-items:center;">
                    ${job.title} ${job.tag ? `<span style="background:#ef4444; font-size:10px; padding:2px 6px; border-radius:10px; color:white; margin-right:8px;">${job.tag}</span>` : ''}
                </div>
                <div style="font-size:13px; color:#94a3b8; margin-top:4px;">${job.company} • ${job.location || 'تاوريرت'}</div>
            </div>
            <div class="job-actions">
                <button class="apply-job" onclick="applyJob('${job.phone}', '${job.title}')" style="background:#22c55e; color:white; border:none; padding:8px 15px; border-radius:8px; cursor:pointer;">واتساب</button>
            </div>
        </div>
    `).join('');
    updateJobsCount();
}

function toggleJobForm() {
    const form = document.getElementById('addJobForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function saveNewJob() {
    const title = document.getElementById('newJobTitle').value;
    const company = document.getElementById('newJobCompany').value;
    const phone = document.getElementById('newJobPhone').value;

    if (!title || !phone) { alert('المرجو ملء العنوان ورقم الهاتف'); return; }

    const newJob = { id: Date.now(), title, company: company || 'محل تجاري', phone, tag: '✨ جديد' };
    jobs.unshift(newJob);
    localStorage.setItem('taourirt_jobs', JSON.stringify(jobs));
    
    // إفراغ الحقول وإغلاق الفورم
    document.getElementById('newJobTitle').value = '';
    document.getElementById('newJobCompany').value = '';
    document.getElementById('newJobPhone').value = '';
    toggleJobForm();
    showJobsList();
}

function applyJob(phone, title) {
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent('السلام عليكم، تواصلت معك بخصوص وظيفة ' + title + ' المنشورة على تطبيق تاوريرت هب')}`, '_blank');
}

function updateJobsCount() {
    const countElem = document.getElementById('jobsCount');
    if (countElem) countElem.innerText = jobs.length;
}

document.addEventListener('DOMContentLoaded', updateJobsCount);
