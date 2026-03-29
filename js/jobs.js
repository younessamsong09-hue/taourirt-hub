let jobs = JSON.parse(localStorage.getItem('taourirt_jobs')) || [
    { id: 1, title: 'صيدلي', company: 'صيدلية الجابري', phone: '0536699222', tag: '🔥' },
    { id: 2, title: 'ممرض', company: 'المستشفى الإقليمي', phone: '0536698018', tag: '' }
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
    container.innerHTML = jobs.map(job => `
        <div class="job-item" style="background:#2f3542; border-radius:15px; padding:15px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; border-left: 5px solid ${job.tag ? '#ff4757' : '#3b82f6'};">
            <div>
                <div style="font-weight:bold; color:white;">${job.tag} ${job.title}</div>
                <div style="font-size:12px; color:#a4b0be;">${job.company}</div>
            </div>
            <button onclick="window.open('https://wa.me/${job.phone}')" style="background:#2ed573; border:none; padding:5px 12px; border-radius:10px; color:white;">اتصال</button>
        </div>
    `).join('');
    if (document.getElementById('jobsCount')) document.getElementById('jobsCount').innerText = jobs.length;
}

function toggleJobForm() {
    const form = document.getElementById('addJobForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function saveNewJob() {
    const title = document.getElementById('newJobTitle').value;
    const phone = document.getElementById('newJobPhone').value;
    if (!title || !phone) { alert('عمر المعلومات أ رفيقي!'); return; }
    
    jobs.unshift({ id: Date.now(), title, company: document.getElementById('newJobCompany').value || 'تاوريرت', phone, tag: '✨' });
    localStorage.setItem('taourirt_jobs', JSON.stringify(jobs));
    toggleJobForm();
    showJobsList();
}
