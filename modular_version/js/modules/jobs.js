// ========== الوظائف ==========
window.toggleJobs = function() {
    const c = document.getElementById('jobsContent');
    const a = document.getElementById('jobsArrow');
    if (c) {
        const isVis = c.style.display === 'block';
        c.style.display = isVis ? 'none' : 'block';
        if (a) a.className = isVis ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
        if (!isVis) showJobsList();
    }
};
window.showJobsList = function() {
    const container = document.getElementById('jobsList');
    if (container) container.innerHTML = '<div>وظائف تجريبية</div>';
};
window.toggleJobForm = function() {
    const f = document.getElementById('addJobForm');
    if (f) f.style.display = f.style.display === 'none' ? 'block' : 'none';
};
window.saveNewJob = function() {
    alert('إضافة وظيفة (ربط Supabase لاحقاً)');
};
