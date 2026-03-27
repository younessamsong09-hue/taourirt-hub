// وظائف تاوريرت
const jobs = [
    { title: 'صيدلي', company: 'صيدلية المزينين', location: 'وسط المدينة', salary: '4000', phone: '0536123456' },
    { title: 'ممرض', company: 'المستشفى', location: 'حي المسيرة', salary: '3000', phone: '0536123457' },
    { title: 'بائع', company: 'مركز المنار', location: 'وسط المدينة', salary: '2500', phone: '0536123458' }
];

function toggleJobs() {
    const dropdown = document.getElementById('jobsDropdown');
    const arrow = document.getElementById('jobsArrow');
    if (dropdown.style.display === 'none') {
        dropdown.style.display = 'block';
        arrow.className = 'fas fa-chevron-up';
        showJobsList();
    } else {
        dropdown.style.display = 'none';
        arrow.className = 'fas fa-chevron-down';
    }
}

function showJobsList() {
    const container = document.getElementById('jobsList');
    document.getElementById('jobsCount').innerText = jobs.length;
    container.innerHTML = jobs.map(job => `
        <div class="job-item">
            <div>
                <div class="job-title">${job.title}</div>
                <div class="job-details">${job.company} • ${job.location} • ${job.salary} د</div>
            </div>
            <div class="job-actions">
                <button class="apply-job" onclick="applyJob('${job.phone}', '${job.title}')">تقدم</button>
                <button class="share-job" onclick="shareJob('${job.title}', '${job.company}')">مشاركة</button>
            </div>
        </div>
    `).join('');
}

function applyJob(phone, title) {
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent('أرغب في التقدم لوظيفة ' + title)}`, '_blank');
}

function shareJob(title, company) {
    window.open(`https://wa.me/?text=${encodeURIComponent('فرصة عمل: ' + title + ' في ' + company)}`, '_blank');
}

// تحديث عدد الوظائف
document.getElementById('jobsCount').innerText = jobs.length;
