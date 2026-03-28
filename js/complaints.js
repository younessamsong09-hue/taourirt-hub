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
        date: new Date().toISOString()
    };
    
    complaints.unshift(newComplaint);
    localStorage.setItem('complaints', JSON.stringify(complaints));
    
    closeComplaintForm();
    alert('تم إرسال شكواك بنجاح');
    
    document.getElementById('complaintName').value = '';
    document.getElementById('complaintPhone').value = '';
    document.getElementById('complaintTitle').value = '';
    document.getElementById('complaintDescription').value = '';
    
    updateComplaintsCount();
}

function updateComplaintsCount() {
    const count = complaints.length;
    const countElem = document.getElementById('complaintsCount');
    if (countElem) countElem.innerText = count;
}

document.addEventListener('DOMContentLoaded', () => {
    updateComplaintsCount();
});
