let jobs = JSON.parse(localStorage.getItem('taourirt_jobs')) || [
    { id: 1, title: 'صيدلي', company: 'صيدلية الجابري', location: 'وسط المدينة', salary: '4000', phone: '0536699222' },
    { id: 2, title: 'ممرض', company: 'المستشفى الإقليمي', location: 'حي المسيرة', salary: '3000', phone: '0536698018' },
    { id: 3, title: 'بائع', company: 'مركز المنار', location: 'وسط المدينة', salary: '2500', phone: '0536123463' }
];

function toggleJobs() {
    const dropdown = document.getElementById('jobsDropdown');
    const arrow = document.getElementById('jobsArrow');
    if (!dropdown || !arrow) return;
    
    if (dropdown.style.display === 'none') {
        dropdown.style.display = 'block';
        arrow.className = 'fas fa-chevron-up';
        showJobs();
    } else {
        dropdown.style.display = 'none';
        arrow.className = 'fas fa-chevron-down';
    }
}

function showJobs() {
    const container = document.getElementById('jobsList');
    if (!container) return;
    
    if (jobs.length === 0) {
        container.innerHTML = '<div class="card" style="text-align:center">📭 لا توجد وظائف</div>';
        updateJobsCount();
        return;
    }
    
    container.innerHTML = jobs.map(job => `
        <div class="job-item">
            <div>
                <div class="job-title">${job.title}</div>
                <div class="job-details">${job.company} • ${job.location || 'تاوريرت'} • ${job.salary} د</div>
            </div>
            <div class="job-actions">
                <button class="apply-job" onclick="applyJob('${job.phone}', '${job.title}')">تقدم</button>
                <button class="share-job" onclick="shareJob('${job.title}', '${job.company}')">مشاركة</button>
            </div>
        </div>
    `).join('');
    updateJobsCount();
}

function updateJobsCount() {
    const countElem = document.getElementById('jobsCount');
    if (countElem) countElem.innerText = jobs.length;
}

function applyJob(phone, title) {
    if (!phone) { alert('رقم الهاتف غير متوفر'); return; }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent('أرغب في التقدم لوظيفة ' + title)}`, '_blank');
}

function shareJob(title, company) {
    window.open(`https://wa.me/?text=${encodeURIComponent('فرصة عمل: ' + title + ' في ' + company)}`, '_blank');
}

updateJobsCount();
