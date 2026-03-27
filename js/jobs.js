// ========== وظائف تاوريرت ==========
let jobs = [
    { id: 1, title: 'صيدلي', company: 'صيدلية المزينين', location: 'وسط المدينة', salary: '4000', phone: '0536123456' },
    { id: 2, title: 'ممرض', company: 'المستشفى الإقليمي', location: 'حي المسيرة', salary: '3000', phone: '0536123457' },
    { id: 3, title: 'بائع', company: 'مركز المنار', location: 'وسط المدينة', salary: '2500', phone: '0536123458' }
];

function showJobs() {
    const container = document.getElementById('jobsContainer');
    if (!container) return;
    container.innerHTML = jobs.map(job => `
        <div class="job-item">
            <div><strong>${job.title}</strong> - ${job.company}</div>
            <div>
                <button onclick="applyJob('${job.phone}', '${job.title}')" style="background:#3b82f6; border:none; padding:4px 10px; border-radius:15px; color:white;">تقدم</button>
                <button onclick="shareJob('${job.title}', '${job.company}')" style="background:#25D366; border:none; padding:4px 10px; border-radius:15px; color:white;">مشاركة</button>
            </div>
        </div>
    `).join('');
    document.getElementById('jobsCount').innerText = jobs.length;
}

function applyJob(phone, title) {
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent('أرغب في التقدم لوظيفة ' + title)}`, '_blank');
}

function shareJob(title, company) {
    window.open(`https://wa.me/?text=${encodeURIComponent('فرصة عمل: ' + title + ' في ' + company)}`, '_blank');
}

function toggleJobs() {
    const dropdown = document.getElementById('jobsDropdown');
    const arrow = document.getElementById('jobsArrow');
    if (dropdown.style.display === 'none') {
        dropdown.style.display = 'block';
        arrow.className = 'fas fa-chevron-up';
        showJobs();
    } else {
        dropdown.style.display = 'none';
        arrow.className = 'fas fa-chevron-down';
    }
}
