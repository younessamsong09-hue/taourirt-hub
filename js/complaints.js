// ========== منصة شكاوى واقتراحات تاوريرت ==========
let complaints = JSON.parse(localStorage.getItem('complaints') || '[]');

function showComplaintForm() {
    const modal = document.getElementById('complaintModal');
    if (modal) modal.style.display = 'flex';
}

function closeComplaintForm() {
    const modal = document.getElementById('complaintModal');
    if (modal) modal.style.display = 'none';
}

function submitComplaint() {
    const name = document.getElementById('complaintName').value;
    const phone = document.getElementById('complaintPhone').value;
    const type = document.getElementById('complaintType').value;
    const location = document.getElementById('complaintLocation').value;
    const title = document.getElementById('complaintTitle').value;
    const description = document.getElementById('complaintDescription').value;
    
    if (!name || !phone || !title || !description) {
        alert('الرجاء ملء جميع الحقول المطلوبة');
        return;
    }
    
    const newComplaint = {
        id: Date.now(),
        name, phone, type, location, title, description,
        status: 'pending',
        date: new Date().toISOString(),
        views: 0
    };
    
    complaints.unshift(newComplaint);
    localStorage.setItem('complaints', JSON.stringify(complaints));
    
    closeComplaintForm();
    showToast('تم إرسال شكواك بنجاح، سيتم الرد عليها قريباً');
    
    // تنظيف النموذج
    document.getElementById('complaintName').value = '';
    document.getElementById('complaintPhone').value = '';
    document.getElementById('complaintTitle').value = '';
    document.getElementById('complaintDescription').value = '';
    
    if (document.getElementById('adminComplaints')) {
        showAdminComplaints();
    }
}

function showAdminComplaints() {
    const container = document.getElementById('adminComplaints');
    if (!container) return;
    
    if (complaints.length === 0) {
        container.innerHTML = '<div class="card" style="text-align:center">📭 لا توجد شكاوى أو اقتراحات</div>';
        return;
    }
    
    const statusText = { pending: '⏳ قيد المعالجة', processing: '🔄 قيد الدراسة', completed: '✅ تم الحل' };
    const statusColor = { pending: '#f59e0b', processing: '#3b82f6', completed: '#22c55e' };
    
    container.innerHTML = complaints.map(c => `
        <div class="complaint-card">
            <div class="complaint-header">
                <div class="complaint-title">${c.title}</div>
                <div class="complaint-status" style="background:${statusColor[c.status]}; padding:3px 10px; border-radius:20px; font-size:11px;">${statusText[c.status]}</div>
            </div>
            <div class="complaint-details">
                <span><i class="fas fa-user"></i> ${c.name}</span>
                <span><i class="fas fa-phone"></i> ${c.phone}</span>
                <span><i class="fas fa-tag"></i> ${c.type === 'complaint' ? 'شكوى' : 'اقتراح'}</span>
                <span><i class="fas fa-map-marker-alt"></i> ${c.location || 'تاوريرت'}</span>
            </div>
            <div class="complaint-description">${c.description}</div>
            <div class="complaint-footer">
                <span><i class="fas fa-calendar"></i> ${new Date(c.date).toLocaleDateString('ar-MA')}</span>
                <div>
                    <button class="resolve-btn" onclick="updateComplaintStatus(${c.id}, 'processing')">قيد الدراسة</button>
                    <button class="resolve-btn" onclick="updateComplaintStatus(${c.id}, 'completed')">تم الحل</button>
                </div>
            </div>
        </div>
    `).join('');
}

function updateComplaintStatus(id, status) {
    const index = complaints.findIndex(c => c.id === id);
    if (index !== -1) {
        complaints[index].status = status;
        localStorage.setItem('complaints', JSON.stringify(complaints));
        showAdminComplaints();
        showToast('تم تحديث حالة الشكوى');
    }
}

function getComplaintsStats() {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const processing = complaints.filter(c => c.status === 'processing').length;
    const completed = complaints.filter(c => c.status === 'completed').length;
    return { total, pending, processing, completed };
}

function updateComplaintsWidget() {
    const container = document.getElementById('complaintsWidget');
    if (!container) return;
    const stats = getComplaintsStats();
    container.innerHTML = `
        <div class="complaints-widget" onclick="window.location.href='?admin=complaints'">
            <div class="widget-icon"><i class="fas fa-comment-dots"></i></div>
            <div class="widget-info">
                <div class="widget-title">شكاوى واقتراحات</div>
                <div class="widget-stats">
                    <span class="pending-stat">${stats.pending} معلقة</span>
                    <span class="completed-stat">${stats.completed} منجزة</span>
                </div>
            </div>
            <div class="widget-arrow"><i class="fas fa-chevron-left"></i></div>
        </div>
    `;
}
