// ========== نظام التبليغات المتطور مع Supabase ==========

let advancedReports = []
let supabaseClient = null

// بيانات Supabase
const SUPABASE_URL = 'https://pyxeusrxoizjlihyqhac.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt'

// تهيئة Supabase
async function initSupabaseAdvanced() {
  try {
    // تحميل مكتبة Supabase إذا لم تكن موجودة
    if (typeof supabase === 'undefined') {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js'
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    }
    
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    console.log('✅ Supabase متصل بنجاح')
    
    // تحميل البلاغات من Supabase
    await loadReportsFromSupabase()
  } catch (err) {
    console.error('❌ فشل تحميل Supabase:', err)
    // استخدام localStorage كنسخة احتياطية
    loadReportsFromLocal()
  }
}

// تحميل البلاغات من Supabase
async function loadReportsFromSupabase() {
  if (!supabaseClient) return
  
  try {
    const { data, error } = await supabaseClient
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (error) throw error
    
    if (data && data.length > 0) {
      advancedReports = data
      saveToLocal()
    } else {
      loadReportsFromLocal()
    }
    
    updateAdvancedBadge()
    showAdvancedReportsList()
  } catch (err) {
    console.error('خطأ في تحميل البلاغات:', err)
    loadReportsFromLocal()
  }
}

// تحميل من localStorage
function loadReportsFromLocal() {
  const saved = localStorage.getItem('advanced_reports')
  if (saved) {
    advancedReports = JSON.parse(saved)
  } else {
    advancedReports = []
  }
  updateAdvancedBadge()
  showAdvancedReportsList()
}

// حفظ في localStorage
function saveToLocal() {
  localStorage.setItem('advanced_reports', JSON.stringify(advancedReports))
}

// تحديث العداد
function updateAdvancedBadge() {
  const badge = document.getElementById('advancedReportBadge')
  if (badge) {
    const count = advancedReports.length
    if (count > 0) {
      badge.style.display = 'flex'
      badge.textContent = count > 99 ? '99+' : count
    } else {
      badge.style.display = 'none'
    }
  }
}

// تبديل اللوحة
function toggleAdvancedReport() {
  const panel = document.getElementById('advancedReportPanel')
  if (panel) {
    if (panel.style.display === 'none' || !panel.style.display) {
      panel.style.display = 'block'
      getAdvancedLocation()
      showAdvancedReportsList()
    } else {
      panel.style.display = 'none'
    }
  }
}

// الحصول على الموقع
function getAdvancedLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const locationDiv = document.getElementById('advancedLocation')
        if (locationDiv) {
          locationDiv.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${lat.toFixed(6)}, ${lng.toFixed(6)}`
          locationDiv.dataset.lat = lat
          locationDiv.dataset.lng = lng
          locationDiv.style.color = '#10b981'
        }
      },
      () => {
        const locationDiv = document.getElementById('advancedLocation')
        if (locationDiv) {
          locationDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> لم نتمكن من تحديد الموقع'
          locationDiv.style.color = '#f59e0b'
        }
      }
    )
  }
}

// معاينة الصورة
function previewAdvancedImage(input) {
  const preview = document.getElementById('advancedImagePreview')
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      preview.innerHTML = `
        <div style="position: relative;">
          <img src="${e.target.result}" style="width:100%; border-radius:12px; max-height:150px; object-fit:cover;">
          <button onclick="document.getElementById('advancedImage').value=''; this.parentElement.parentElement.innerHTML='';" style="position:absolute; top:5px; right:5px; background:#ef4444; color:white; border:none; border-radius:50%; width:25px; height:25px; cursor:pointer;">✖</button>
        </div>
      `
      preview.style.display = 'block'
    }
    reader.readAsDataURL(input.files[0])
  } else {
    preview.innerHTML = ''
    preview.style.display = 'none'
  }
}

// رفع الصورة إلى Supabase
async function uploadImageToSupabase(file, reportId) {
  if (!supabaseClient || !file) return null
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${reportId}_${Date.now()}.${fileExt}`
  
  try {
    const { data, error } = await supabaseClient.storage
      .from('reports-media')
      .upload(`reports/${fileName}`, file)
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabaseClient.storage
      .from('reports-media')
      .getPublicUrl(`reports/${fileName}`)
    
    return publicUrl
  } catch (err) {
    console.error('خطأ في رفع الصورة:', err)
    return null
  }
}

// إرسال بلاغ
async function submitAdvancedReport() {
  const type = document.getElementById('advancedType')?.value
  const desc = document.getElementById('advancedDesc')?.value.trim()
  const locationDiv = document.getElementById('advancedLocation')
  const imageFile = document.getElementById('advancedImage')?.files[0]
  
  if (!desc) {
    alert('❌ الرجاء كتابة وصف للمشكلة')
    return
  }
  
  // تعطيل الزر أثناء الإرسال
  const submitBtn = document.querySelector('#advancedReportPanel .advanced-submit')
  if (submitBtn) {
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...'
    submitBtn.disabled = true
  }
  
  try {
    let imageUrl = null
    
    // إنشاء البلاغ أولاً للحصول على ID
    const reportData = {
      type: type,
      description: desc,
      location_lat: locationDiv?.dataset?.lat || null,
      location_lng: locationDiv?.dataset?.lng || null,
      location_text: locationDiv?.innerHTML || null,
      status: 'pending',
      created_at: new Date().toISOString()
    }
    
    let reportId = null
    
    if (supabaseClient) {
      // حفظ في Supabase
      const { data, error } = await supabaseClient
        .from('reports')
        .insert([reportData])
        .select()
      
      if (error) throw error
      
      if (data && data[0]) {
        reportId = data[0].id
        reportData.id = reportId
        reportData.supabase_id = reportId
        
        // رفع الصورة بعد الحصول على ID
        if (imageFile) {
          imageUrl = await uploadImageToSupabase(imageFile, reportId)
          if (imageUrl) {
            // تحديث البلاغ برابط الصورة
            await supabaseClient
              .from('reports')
              .update({ image_url: imageUrl })
              .eq('id', reportId)
            reportData.image_url = imageUrl
          }
        }
      }
    }
    
    // إضافة للقائمة المحلية
    if (!reportId) {
      reportData.id = Date.now()
    }
    if (imageUrl) reportData.image_url = imageUrl
    
    advancedReports.unshift(reportData)
    saveToLocal()
    
    // تحديث العرض
    showAdvancedReportsList()
    resetAdvancedForm()
    
    alert('✅ تم إرسال البلاغ بنجاح! شكراً لك على المساهمة في تحسين المدينة.')
    
  } catch (err) {
    console.error('خطأ في إرسال البلاغ:', err)
    alert('❌ حدث خطأ في إرسال البلاغ. الرجاء المحاولة مرة أخرى.')
  } finally {
    if (submitBtn) {
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال البلاغ'
      submitBtn.disabled = false
    }
  }
}

function resetAdvancedForm() {
  const panel = document.getElementById('advancedReportPanel')
  if (panel) panel.style.display = 'none'
  document.getElementById('advancedDesc').value = ''
  document.getElementById('advancedImage').value = ''
  document.getElementById('advancedImagePreview').innerHTML = ''
  document.getElementById('advancedImagePreview').style.display = 'none'
  
  const locationDiv = document.getElementById('advancedLocation')
  if (locationDiv) {
    locationDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تحديد الموقع...'
    locationDiv.style.color = '#94a3b8'
  }
}

// عرض قائمة البلاغات
function showAdvancedReportsList() {
  const container = document.getElementById('advancedReportsList')
  if (!container) return
  
  if (advancedReports.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:30px 20px;">
        <i class="fas fa-check-circle" style="font-size: 40px; color: #10b981; margin-bottom: 10px; display: block;"></i>
        <p style="color: #94a3b8;">لا توجد بلاغات حالياً</p>
        <p style="color: #64748b; font-size: 12px;">ساعد في تحسين مدينتك</p>
      </div>
    `
    return
  }
  
  const typeIcons = {
    'pothole': '🕳️',
    'light': '💡',
    'garbage': '🗑️',
    'other': '📌'
  }
  
  const typeNames = {
    'pothole': 'حفرة',
    'light': 'إنارة',
    'garbage': 'نفايات',
    'other': 'أخرى'
  }
  
  container.innerHTML = advancedReports.slice(0, 5).map(r => `
    <div class="report-item-v2" onclick="viewReportDetail(${r.id})">
      <div class="report-header-v2">
        <span class="report-type-v2 ${r.type}">
          ${typeIcons[r.type] || '📌'} ${typeNames[r.type] || 'بلاغ'}
        </span>
        <span class="report-status-v2 ${r.status}">
          ${r.status === 'resolved' ? '✅ تم الحل' : '⏳ قيد المراجعة'}
        </span>
      </div>
      <div class="report-desc-v2">
        ${r.description.length > 80 ? r.description.substring(0, 80) + '...' : r.description}
      </div>
      <div class="report-footer-v2">
        <span><i class="far fa-clock"></i> ${formatTime(r.created_at)}</span>
        ${r.location_lat ? `<span><i class="fas fa-map-marker-alt"></i> موقع</span>` : ''}
      </div>
    </div>
  `).join('')
  
  if (advancedReports.length > 5) {
    container.innerHTML += `
      <div style="text-align: center; padding: 12px;">
        <button onclick="showAllReports()" style="background: transparent; border: 1px solid #3b82f6; color: #3b82f6; padding: 8px 16px; border-radius: 20px; cursor: pointer;">
          عرض الكل (${advancedReports.length})
        </button>
      </div>
    `
  }
}

function formatTime(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000 / 60)
  
  if (diff < 1) return 'الآن'
  if (diff < 60) return `منذ ${diff} دقيقة`
  if (diff < 1440) return `منذ ${Math.floor(diff / 60)} ساعة`
  return date.toLocaleDateString('ar-MA')
}

function viewReportDetail(id) {
  const report = advancedReports.find(r => r.id === id)
  if (report) {
    alert(`📋 تفاصيل البلاغ:\n\n${report.description}\n\n${report.location_lat ? `📍 الموقع: ${report.location_lat}, ${report.location_lng}` : ''}\n📅 ${new Date(report.created_at).toLocaleString('ar-MA')}`)
  }
}

function showAllReports() {
  const reportsText = advancedReports.map((r, i) => 
    `${i+1}. ${r.type_name || r.type} - ${r.description.substring(0, 50)}...`
  ).join('\n')
  alert(`📋 قائمة البلاغات (${advancedReports.length}):\n\n${reportsText}`)
}

// تهيئة النظام
document.addEventListener('DOMContentLoaded', () => {
  initSupabaseAdvanced()
})
