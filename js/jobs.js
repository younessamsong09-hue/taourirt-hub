// ========== نظام الوظائف المتطور مع Supabase ==========

let jobs = [];
let supabaseClient = null;

// تهيئة Supabase
async function initJobsSupabase() {
    try {
        if (typeof supabase === 'undefined') {
            await new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
                script.onload = resolve;
                document.head.appendChild(script);
            });
        }
        
        const SUPABASE_URL = 'https://pyxeusrxoizjlihyqhac.supabase.co';
        const SUPABASE_ANON_KEY = 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt';
        
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase متصل - نظام الوظائف');
        
        await loadJobsFromSupabase();
        showJobsList();
        
    } catch (err) {
        console.error('خطأ في Supabase، استخدام localStorage:', err);
        loadJobsFromLocal();
        showJobsList();
    }
}

// تحميل الوظائف من Supabase
async function loadJobsFromSupabase() {
    if (!supabaseClient) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('jobs')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(50);
        
        if (!error && data && data.length > 0) {
            jobs = data;
            saveJobsToLocal();
        } else {
            loadJobsFromLocal();
        }
        
        updateJobsCount();
        
    } catch (err) {
        loadJobsFromLocal();
    }
}

// تحميل من localStorage
function loadJobsFromLocal() {
    const saved = localStorage.getItem('taourirt_jobs');
    if (saved) {
        jobs = JSON.parse(saved);
    } else {
        // بيانات افتراضية
        jobs = [
            { id: 1, title: 'بائع ملابس', company: 'قيسارية المغرب العربي', phone: '0600000000', tag: '✨ جديد', created_at: new Date().toISOString() }
        ];
    }
}

// حفظ في localStorage
function saveJobsToLocal() {
    localStorage.setItem('taourirt_jobs', JSON.stringify(jobs));
}

// تحديث العداد
function updateJobsCount() {
    const countElem = document.getElementById('jobsCount');
    if (countElem) countElem.innerText = jobs.length;
}

// تبديل قسم الوظائف
window.toggleJobs = () => {
    const content = document.getElementById('jobsContent');
    const arrow = document.getElementById('jobsArrow');
    if (!content) return;
    const isVisible = content.style.display === 'block';
    content.style.display = isVisible ? 'none' : 'block';
    if (arrow) arrow.className = isVisible ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
    if (!isVisible) showJobsList();
};

// عرض قائمة الوظائف
window.showJobsList = () => {
    const container = document.getElementById('jobsList');
    if (!container) return;
    
    if (jobs.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px; background:#1e293b; border-radius:20px;">
                <i class="fas fa-briefcase" style="font-size:48px; color:#64748b; margin-bottom:15px;"></i>
                <p style="color:#94a3b8;">لا توجد وظائف حالياً</p>
                <button onclick="toggleJobForm()" style="margin-top:15px; background:#3b82f6; color:white; border:none; padding:10px 20px; border-radius:25px; cursor:pointer;">
                    <i class="fas fa-plus"></i> أضف وظيفة
                </button>
            </div>
        `;
        return;
    }
    
    const getTimeAgo = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000 / 60);
        if (diff < 1) return 'الآن';
        if (diff < 60) return `منذ ${diff} دقيقة`;
        if (diff < 1440) return `منذ ${Math.floor(diff / 60)} ساعة`;
        return date.toLocaleDateString('ar-MA');
    };
    
    container.innerHTML = jobs.map(job => `
        <div class="job-item" style="background:#1e293b; border-radius:18px; padding:18px; margin-bottom:12px; border-right:6px solid #22c55e; transition:0.3s; position:relative; cursor:pointer;" onclick="viewJobDetails(${job.id})">
            <span style="position:absolute; left:15px; top:15px; font-size:10px; color:#64748b;">
                <i class="far fa-clock"></i> ${getTimeAgo(job.created_at)}
            </span>
            <div style="margin-bottom:15px;">
                <div style="font-weight:bold; color:white; font-size:1.1rem; display:flex; align-items:center; gap:8px;">
                    <i class="fas fa-briefcase" style="color:#22c55e; font-size:14px;"></i>
                    ${escapeHtml(job.title)}
                    ${job.tag ? `<span style="background:#ef4444; font-size:9px; padding:3px 8px; border-radius:12px; color:white;">${escapeHtml(job.tag)}</span>` : ''}
                </div>
                <div style="font-size:13px; color:#94a3b8; margin-top:5px;">
                    <i class="fas fa-building"></i> ${escapeHtml(job.company)}
                    <span style="margin:0 5px">•</span>
                    <i class="fas fa-map-marker-alt"></i> ${escapeHtml(job.location || 'تاوريرت')}
                </div>
                ${job.salary ? `<div style="font-size:12px; color:#f59e0b; margin-top:5px;"><i class="fas fa-money-bill-wave"></i> ${escapeHtml(job.salary)}</div>` : ''}
            </div>
            <div style="display:flex; gap:10px;">
                <button onclick="event.stopPropagation(); applyJob('${job.phone}', '${job.title}')" style="flex:2; background:#25D366; color:white; border:none; padding:10px; border-radius:10px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px;">
                    <i class="fab fa-whatsapp"></i> تقديم الطلب
                </button>
                <button onclick="event.stopPropagation(); removeJob(${job.id})" style="flex:1; background:transparent; border:1px solid #334155; color:#64748b; padding:10px; border-radius:10px; cursor:pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    updateJobsCount();
};

// عرض تفاصيل الوظيفة
window.viewJobDetails = (id) => {
    const job = jobs.find(j => j.id === id);
    if (!job) return;
    
    alert(`📋 تفاصيل الوظيفة:\n\n📌 ${job.title}\n🏢 ${job.company}\n📍 ${job.location || 'تاوريرت'}\n📞 ${job.phone}\n${job.salary ? `💰 ${job.salary}` : ''}\n\n${job.description ? `📝 ${job.description}` : ''}`);
};

// تبديل نموذج الإضافة
window.toggleJobForm = () => {
    const form = document.getElementById('addJobForm');
    if (form) {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
};

// حفظ وظيفة جديدة
window.saveNewJob = async () => {
    const title = document.getElementById('newJobTitle')?.value;
    const phone = document.getElementById('newJobPhone')?.value;
    const company = document.getElementById('newJobCompany')?.value;
    
    if (!title || !phone) {
        alert('❌ الرجاء ملء العنوان والهاتف!');
        return;
    }
    
    const submitBtn = document.querySelector('#addJobForm button[onclick="saveNewJob()"]');
    if (submitBtn) {
        submitBtn.textContent = 'جاري النشر...';
        submitBtn.disabled = true;
    }
    
    try {
        const newJob = {
            title: title,
            company: company || 'تاوريرت',
            phone: phone,
            location: 'تاوريرت',
            tag: '✨ جديد',
            status: 'active',
            created_at: new Date().toISOString()
        };
        
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('jobs')
                .insert([newJob])
                .select();
            
            if (!error && data && data[0]) {
                jobs.unshift(data[0]);
            } else {
                throw error;
            }
        } else {
            newJob.id = Date.now();
            jobs.unshift(newJob);
        }
        
        saveJobsToLocal();
        showJobsList();
        toggleJobForm();
        
        // تنظيف النموذج
        document.getElementById('newJobTitle').value = '';
        document.getElementById('newJobPhone').value = '';
        document.getElementById('newJobCompany').value = '';
        
        showToast('✅ تم نشر الوظيفة بنجاح!');
        
    } catch (err) {
        console.error(err);
        showToast('❌ حدث خطأ، حاول مرة أخرى', 'error');
    } finally {
        if (submitBtn) {
            submitBtn.textContent = 'نشر العرض ✅';
            submitBtn.disabled = false;
        }
    }
};

// التقديم على وظيفة
window.applyJob = (phone, title) => {
    const msg = encodeURIComponent(`السلام عليكم، تواصلت معك بخصوص عرض العمل (${title}) الذي رأيته في تطبيق "تاوريرت هب". هل العرض متاح؟`);
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
};

// حذف وظيفة
window.removeJob = async (id) => {
    if (!confirm('هل ترغب في حذف هذا الإعلان؟')) return;
    
    try {
        if (supabaseClient) {
            await supabaseClient
                .from('jobs')
                .update({ status: 'deleted' })
                .eq('id', id);
        }
        
        jobs = jobs.filter(j => j.id !== id);
        saveJobsToLocal();
        showJobsList();
        showToast('✅ تم حذف الإعلان');
        
    } catch (err) {
        console.error(err);
        showToast('❌ حدث خطأ', 'error');
    }
};

// إظهار رسالة منبثقة
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const colors = {
        success: '#22c55e',
        error: '#ef4444',
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
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// إضافة أنماط
if (!document.getElementById('jobs-style')) {
    const style = document.createElement('style');
    style.id = 'jobs-style';
    style.innerHTML = `
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        .job-item:hover { transform: translateX(-5px); background: #2d3a4e !important; }
    `;
    document.head.appendChild(style);
}

// تهيئة النظام
initJobsSupabase();
