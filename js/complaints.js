// ========== نظام البلاغات مع Supabase ==========

let complaints = [];
let supabaseClient = null;
let currentLocation = null;

// بيانات Supabase
const SUPABASE_URL = 'https://pyxeusrxoizjlihyqhac.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt';

// تهيئة Supabase
async function initComplaintsSupabase() {
    try {
        if (typeof supabase === 'undefined') {
            await new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
                script.onload = resolve;
                document.head.appendChild(script);
            });
        }
        
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase متصل - نظام البلاغات');
        
        await loadComplaintsFromSupabase();
        updateComplaintsCount();
        
    } catch (err) {
        console.error('خطأ في Supabase، استخدام localStorage:', err);
        loadComplaintsFromLocal();
        updateComplaintsCount();
    }
}

// تحميل البلاغات من Supabase
async function loadComplaintsFromSupabase() {
    if (!supabaseClient) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
        
        if (!error && data) {
            complaints = data;
            saveComplaintsToLocal();
        } else {
            loadComplaintsFromLocal();
        }
        
        updateComplaintsCount();
        
    } catch (err) {
        loadComplaintsFromLocal();
    }
}

// تحميل من localStorage
function loadComplaintsFromLocal() {
    const saved = localStorage.getItem('complaints');
    complaints = saved ? JSON.parse(saved) : [];
}

// حفظ في localStorage
function saveComplaintsToLocal() {
    localStorage.setItem('complaints', JSON.stringify(complaints));
}

// تحديث عدد البلاغات
function updateComplaintsCount() {
    const countElem = document.getElementById('complaintsCount');
    if (countElem) countElem.innerText = complaints.length;
}

// الحصول على موقع المستخدم
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                currentLocation = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                };
                const locationInput = document.getElementById('complaintLocation');
                if (locationInput) {
                    locationInput.value = `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`;
                    locationInput.style.borderColor = '#10b981';
                }
                showToast('📍 تم تحديد موقعك تلقائياً', 'info');
            },
            () => {
                showToast('⚠️ لم نتمكن من تحديد موقعك', 'warning');
            }
        );
    }
}

// رفع صورة إلى Supabase
async function uploadComplaintImage(file, complaintId) {
    if (!supabaseClient || !file) return null;
    
    // التأكد من وجود bucket
    const bucketName = 'reports-media';
    const ext = file.name.split('.').pop();
    const fileName = `${complaintId}_${Date.now()}.${ext}`;
    const path = `complaints/${fileName}`;
    
    try {
        const { error } = await supabaseClient.storage
            .from(bucketName)
            .upload(path, file);
        
        if (error) throw error;
        
        const { data: { publicUrl } } = supabaseClient.storage
            .from(bucketName)
            .getPublicUrl(path);
        
        return publicUrl;
    } catch (err) {
        console.error('خطأ في رفع الصورة:', err);
        return null;
    }
}

// معاينة الصورة
function previewComplaintImage(input) {
    const preview = document.getElementById('complaintImagePreview');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `
                <div style="position: relative; margin-top: 10px;">
                    <img src="${e.target.result}" style="width: 100%; border-radius: 12px; max-height: 150px; object-fit: cover;">
                    <button onclick="document.getElementById('complaintImage').value=''; this.parentElement.remove();" style="position: absolute; top: 5px; right: 5px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer;">✖</button>
                </div>
            `;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.innerHTML = '';
        preview.style.display = 'none';
    }
}

// إرسال بلاغ جديد
window.submitComplaint = async () => {
    const name = document.getElementById('complaintName')?.value;
    const phone = document.getElementById('complaintPhone')?.value;
    const type = document.getElementById('complaintType')?.value;
    const location = document.getElementById('complaintLocation')?.value;
    const title = document.getElementById('complaintTitle')?.value;
    const description = document.getElementById('complaintDescription')?.value;
    const imageFile = document.getElementById('complaintImage')?.files[0];
    
    if (!name || !phone || !title || !description) {
        showToast('❌ الرجاء ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    const submitBtn = document.querySelector('#complaintModal button[onclick="submitComplaint()"]');
    if (submitBtn) {
        submitBtn.textContent = 'جاري الإرسال... 📤';
        submitBtn.disabled = true;
    }
    
    try {
        // تحليل الموقع
        let lat = null, lng = null;
        if (location && location.includes(',')) {
            const parts = location.split(',');
            lat = parseFloat(parts[0]);
            lng = parseFloat(parts[1]);
        } else if (currentLocation) {
            lat = currentLocation.lat;
            lng = currentLocation.lng;
        }
        
        // تحضير البيانات للجدول
        const reportData = {
            category: type,
            description: `${title}\n\n${description}`,
            location_lat: lat,
            location_lng: lng,
            status: 'pending',
            created_at: new Date().toISOString()
        };
        
        let reportId = null;
        let imageUrl = null;
        
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('reports')
                .insert([reportData])
                .select();
            
            if (!error && data && data[0]) {
                reportId = data[0].id;
                reportData.id = reportId;
                
                if (imageFile) {
                    imageUrl = await uploadComplaintImage(imageFile, reportId);
                    if (imageUrl) {
                        await supabaseClient
                            .from('reports')
                            .update({ image_url: imageUrl })
                            .eq('id', reportId);
                        reportData.image_url = imageUrl;
                    }
                }
                
                // إضافة بيانات إضافية للمستخدم (يمكن تخزينها في جدول منفصل لاحقاً)
                reportData.user_name = name;
                reportData.user_phone = phone;
                reportData.title = title;
                
                complaints.unshift(reportData);
            } else {
                throw error;
            }
        } else {
            reportData.id = Date.now();
            reportData.user_name = name;
            reportData.user_phone = phone;
            reportData.title = title;
            complaints.unshift(reportData);
        }
        
        saveComplaintsToLocal();
        updateComplaintsCount();
        closeComplaintForm();
        
        showToast('✅ تم إرسال بلاغك بنجاح! شكراً لك.', 'success');
        
        // تنظيف النموذج
        document.getElementById('complaintName').value = '';
        document.getElementById('complaintPhone').value = '';
        document.getElementById('complaintTitle').value = '';
        document.getElementById('complaintDescription').value = '';
        document.getElementById('complaintLocation').value = '';
        document.getElementById('complaintImage').value = '';
        document.getElementById('complaintImagePreview').innerHTML = '';
        document.getElementById('complaintImagePreview').style.display = 'none';
        
    } catch (err) {
        console.error('خطأ في إرسال البلاغ:', err);
        showToast('❌ حدث خطأ في إرسال البلاغ. الرجاء المحاولة مرة أخرى.', 'error');
    } finally {
        if (submitBtn) {
            submitBtn.textContent = 'إرسال البلاغ';
            submitBtn.disabled = false;
        }
    }
};

// عرض نموذج البلاغ
window.showComplaintForm = () => {
    const modal = document.getElementById('complaintModal');
    if (modal) {
        modal.style.display = 'flex';
        getUserLocation();
    }
};

// إغلاق نموذج البلاغ
window.closeComplaintForm = () => {
    const modal = document.getElementById('complaintModal');
    if (modal) modal.style.display = 'none';
};

// عرض جميع البلاغات (للمشرفين)
window.showAllComplaints = () => {
    if (complaints.length === 0) {
        showToast('📭 لا توجد بلاغات حالياً', 'info');
        return;
    }
    
    const statusText = {
        'pending': '⏳ قيد المراجعة',
        'reviewing': '🔍 قيد المعالجة',
        'resolved': '✅ تم الحل'
    };
    
    const complaintsList = complaints.map((c, i) => {
        return `${i+1}. [${statusText[c.status] || c.status}] ${c.title || 'بلاغ'}\n   📝 ${c.description.substring(0, 50)}...\n   📅 ${new Date(c.created_at).toLocaleDateString('ar-MA')}`;
    }).join('\n\n');
    
    alert(`📋 قائمة البلاغات (${complaints.length}):\n\n${complaintsList}`);
};

// إظهار رسالة منبثقة
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const colors = {
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 12px 20px;
        border-radius: 12px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        max-width: 80%;
        text-align: center;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// إضافة أنماط
if (!document.getElementById('complaints-style')) {
    const style = document.createElement('style');
    style.id = 'complaints-style';
    style.innerHTML = `
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    `;
    document.head.appendChild(style);
}

// تهيئة النظام
initComplaintsSupabase();
