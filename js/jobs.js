const jobs = [
    { title: 'صيدلي', company: 'صيدلية المزينين', location: 'وسط المدينة', salary: '4000', phone: '0536123456' },
    { title: 'ممرض', company: 'المستشفى', location: 'حي المسيرة', salary: '3000', phone: '0536123457' },
    { title: 'بائع', company: 'مركز المنار', location: 'وسط المدينة', salary: '2500', phone: '0536123458' }
];

function toggleJobs() {
    const dropdown = document.getElementById('jobsDropdown');
    const arrow = document.getElementById('jobsArrow');
    if (!dropdown || !arrow) return;
    
    if (dropdown.style.display === 'none') {
        dropdown.style.display = 'block';
        arrow.className = 'fas fa-chevron-up';
        const jobsList = document.getElementById('jobsList');
        if (jobsList) {
            jobsList.innerHTML = jobs.map(j => `
                <div style="background:#0f172a; border-radius:12px; padding:10px; margin-bottom:8px;">
                    <strong>${j.title}</strong><br>
                    <small>${j.company} • ${j.location} • ${j.salary} د</small>
                    <div style="margin-top:8px;">
                        <button onclick="applyJob('${j.phone}', '${j.title}')" style="background:#3b82f6; border:none; padding:4px 12px; border-radius:20px; color:white;">تقدم</button>
                        <button onclick="shareJob('${j.title}', '${j.company}')" style="background:#25D366; border:none; padding:4px 12px; border-radius:20px; color:white;">مشاركة</button>
                    </div>
                </div>
            `).join('');
        }
    } else {
        dropdown.style.display = 'none';
        arrow.className = 'fas fa-chevron-down';
    }
}

function applyJob(phone, title) {
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent('أرغب في التقدم لوظيفة ' + title)}`, '_blank');
}

function shareJob(title, company) {
    window.open(`https://wa.me/?text=${encodeURIComponent('فرصة عمل: ' + title + ' في ' + company)}`, '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
    const jobsCount = document.getElementById('jobsCount');
    if (jobsCount) jobsCount.innerText = jobs.length;
});
