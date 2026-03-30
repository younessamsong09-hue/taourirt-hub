// ========== نظام التبليغات المتطور مع Supabase ==========

let reportsFloat = []
let currentReportType = ''
let userLat = null
let userLng = null
let supabaseClient = null

// تهيئة النظام
async function initComplaintsSystem() {
  if (window.SupabaseAPI) {
    supabaseClient = await window.SupabaseAPI.init()
  }
  
  // تحميل البلاغات
  await loadReports()
}

// تحميل البلاغات من Supabase
async function loadReports() {
  if (!supabaseClient) {
    // استخدام localStorage كنسخة احتياطية
    const saved = localStorage.getItem('city_reports')
    reportsFloat = saved ? JSON.parse(saved) : []
    showReportFloatList()
    return
  }
  
  try {
    const { data, error } = await supabaseClient
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (error) throw error
    
    reportsFloat = data || []
    showReportFloatList()
  } catch (err) {
    console.error('خطأ في تحميل البلاغات:', err)
    // استخدام localStorage كنسخة احتياطية
    const saved = localStorage.getItem('city_reports')
    reportsFloat = saved ? JSON.parse(saved) : []
    showReportFloatList()
  }
}

// تبديل لوحة التبليغ
function toggleReportFloat() {
  const panel = document.getElementById('reportFloatPanel')
  if (!panel) return
  
  if (panel.style.display === 'none' || !panel.style.display) {
    panel.style.display = 'block'
    showReportFloatList()
  } else {
    panel.style.display = 'none'
    clearReportFloat()
  }
}

// الحصول على الموقع الجغرافي
function getReportLocationFloat() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userLat = pos.coords.latitude
        userLng = pos.coords.longitude
        const locationDiv = document.getElementById('reportFloatLocation')
        if (locationDiv) {
          locationDiv.innerHTML = `📍 ${userLat.toFixed(4)}, ${userLng.toFixed(4)}`
          locationDiv.style.color = '#10b981'
          locationDiv.style.fontSize = '11px'
        }
      },
      () => {
        const locationDiv = document.getElementById('reportFloatLocation')
        if (locationDiv) {
          locationDiv.innerHTML = '⚠️ لم نتمكن من تحديد الموقع'
          locationDiv.style.color = '#ef4444'
        }
      }
    )
  }
}

// بدء التبليغ بنوع محدد
function startReportFloat(type) {
  currentReportType = type
  
  const buttonsDiv = document.querySelector('#reportFloatPanel .float-buttons')
  const formDiv = document.getElementById('reportFloatForm')
  
  if (buttonsDiv) buttonsDiv.style.display = 'none'
  if (formDiv) formDiv.style.display = 'block'
  
  const typeNames = { 'pothole': '🕳️ حفرة', 'light': '💡 إنارة', 'garbage': '🗑️ نفايات' }
  const headerSpan = document.querySelector('#reportFloatPanel .float-header span:first-child')
  if (headerSpan) headerSpan.innerHTML = `تبليغ: ${typeNames[type] || type}`
  
  getReportLocationFloat()
}

// إضافة بلاغ جديد
async function addReportFloat() {
  const desc = document.getElementById('reportFloatDesc')?.value.trim()
  const imageFile = document.getElementById('reportFloatImage')?.files[0]
  
  if (!desc) {
    alert('❌ الرجاء كتابة وصف للمشكلة')
    return
  }
  
  // تعطيل الزر أثناء الإرسال
  const submitBtn = document.querySelector('#reportFloatForm button[onclick="addReportFloat()"]')
  if (submitBtn) {
    submitBtn.textContent = 'جاري الإرسال... 📤'
    submitBtn.disabled = true
  }
  
  try {
    let imageUrl = null
    
    // رفع الصورة إذا وجدت
    if (imageFile && window.SupabaseAPI) {
      imageUrl = await window.SupabaseAPI.uploadImage(imageFile, Date.now())
    }
    
    // إنشاء كائن البلاغ
    const reportData = {
      type: currentReportType,
      description: desc,
      location_lat: userLat,
      location_lng: userLng,
      image_url: imageUrl,
      status: 'pending',
      created_at: new Date().toISOString()
    }
    
    // حفظ في Supabase
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('reports')
        .insert([reportData])
        .select()
      
      if (error) throw error
      
      if (data && data[0]) {
        reportData.id = data[0].id
      }
    }
    
    // إضافة للقائمة المحلية
    reportData.id = reportData.id || Date.now()
    reportsFloat.unshift(reportData)
    
    // حفظ في localStorage كنسخة احتياطية
    localStorage.setItem('city_reports', JSON.stringify(reportsFloat))
    
    // تحديث العرض
    showReportFloatList()
    clearReportFloat()
    
    alert('✅ تم إرسال البلاغ بنجاح! شكراً لك على المساهمة في تحسين المدينة.')
    
  } catch (err) {
    console.error('خطأ في إرسال البلاغ:', err)
    alert('❌ حدث خطأ في إرسال البلاغ. الرجاء المحاولة مرة أخرى.')
  } finally {
    if (submitBtn) {
      submitBtn.textContent = 'إرسال البلاغ'
      submitBtn.disabled = false
    }
  }
}

// عرض قائمة البلاغات
function showReportFloatList() {
  const container = document.getElementById('reportFloatList')
  if (!container) return
  
  if (reportsFloat.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding:12px; color:#64748b;">📭 لا توجد بلاغات حالياً</div>'
    return
  }
  
  const typeIcon = { 'pothole': '🕳️', 'light': '💡', 'garbage': '🗑️' }
  
  container.innerHTML = reportsFloat.slice(0, 5).map(r => `
    <div style="border-bottom:1px solid #334155; padding:8px 0;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span>
          <span style="font-weight:bold;">${typeIcon[r.type] || '📌'}</span>
          ${r.description && r.description.length > 40 ? r.description.substring(0, 40) + '...' : (r.description || r.desc)}
        </span>
        ${r.location_lat && r.location_lng ? `
          <a href="https://www.google.com/maps?q=${r.location_lat},${r.location_lng}" target="_blank" style="color:#3b82f6; text-decoration:none;">
            🗺️
          </a>
        ` : ''}
      </div>
      <div style="font-size:10px; color:#64748b; margin-top:4px;">
        ${new Date(r.created_at).toLocaleString('ar-MA')}
        ${r.status === 'pending' ? '⏳ قيد المراجعة' : '✅ تم الحل'}
      </div>
    </div>
  `).join('')
}

// إعادة تعيين النموذج
function clearReportFloat() {
  const descInput = document.getElementById('reportFloatDesc')
  const imageInput = document.getElementById('reportFloatImage')
  const formDiv = document.getElementById('reportFloatForm')
  const buttonsDiv = document.querySelector('#reportFloatPanel .float-buttons')
  const headerSpan = document.querySelector('#reportFloatPanel .float-header span:first-child')
  
  if (descInput) descInput.value = ''
  if (imageInput) imageInput.value = ''
  if (formDiv) formDiv.style.display = 'none'
  if (buttonsDiv) buttonsDiv.style.display = 'flex'
  if (headerSpan) headerSpan.innerHTML = 'تبليغ عن مشكلة'
  
  userLat = null
  userLng = null
  currentReportType = ''
}

// تهيئة النظام
document.addEventListener('DOMContentLoaded', () => {
  initComplaintsSystem()
})

// تحديث عداد البلاغات على الأيقونة
function updateReportBadge() {
  const badge = document.getElementById('reportBadge')
  if (!badge) return
  
  const count = reportsFloat.length
  if (count > 0) {
    badge.style.display = 'flex'
    badge.textContent = count > 99 ? '99+' : count
  } else {
    badge.style.display = 'none'
  }
}

// تأثير اهتزاز الأيقونة عند بلاغ جديد
function shakeReportButton() {
  const btn = document.getElementById('reportFloatBtn')
  if (!btn) return
  btn.classList.add('shake')
  setTimeout(() => {
    btn.classList.remove('shake')
  }, 500)
}

// إضافة تأثير عند إرسال بلاغ
function showSuccessAnimation() {
  const btn = document.getElementById('reportFloatBtn')
  if (btn) {
    btn.style.transform = 'scale(1.2)'
    setTimeout(() => {
      btn.style.transform = ''
    }, 300)
  }
}

// تعديل دالة addReportFloat لإضافة التأثيرات
const originalAddReportFloat = addReportFloat
window.addReportFloat = async function() {
  const result = await originalAddReportFloat()
  updateReportBadge()
  showSuccessAnimation()
  return result
}

// تحديث عرض البلاغات بشكل أفضل
function showReportFloatListEnhanced() {
  const container = document.getElementById('reportFloatList')
  if (!container) return
  
  if (reportsFloat.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <i class="fas fa-check-circle" style="font-size: 48px; color: #10b981; margin-bottom: 12px; display: block;"></i>
        <p style="color: #94a3b8;">لا توجد بلاغات حالياً</p>
        <p style="color: #64748b; font-size: 12px;">ساعد في تحسين مدينتك</p>
      </div>
    `
    return
  }
  
  const typeIcon = { 'pothole': '🕳️', 'light': '💡', 'garbage': '🗑️' }
  const typeName = { 'pothole': 'حفرة', 'light': 'إنارة', 'garbage': 'نفايات' }
  
  container.innerHTML = reportsFloat.slice(0, 5).map(r => `
    <div class="report-item">
      <span class="report-type ${r.type}">${typeIcon[r.type]} ${typeName[r.type]}</span>
      <div class="report-desc">${r.description && r.description.length > 60 ? r.description.substring(0, 60) + '...' : (r.description || r.desc)}</div>
      <div class="report-footer">
        <span class="report-status status-${r.status || 'pending'}">
          ${r.status === 'resolved' ? '✅ تم الحل' : '⏳ قيد المراجعة'}
        </span>
        ${r.location_lat && r.location_lng ? `
          <a href="https://www.google.com/maps?q=${r.location_lat},${r.location_lng}" target="_blank" class="report-location">
            <i class="fas fa-map-marker-alt"></i> موقع
          </a>
        ` : ''}
        <span><i class="far fa-clock"></i> ${new Date(r.created_at).toLocaleTimeString('ar-MA', {hour:'2-digit', minute:'2-digit'})}</span>
      </div>
    </div>
  `).join('')
  
  if (reportsFloat.length > 5) {
    container.innerHTML += `
      <div style="text-align: center; padding: 12px;">
        <a href="#" style="color: #3b82f6; text-decoration: none; font-size: 12px;" onclick="showAllReports()">
          عرض الكل (${reportsFloat.length}) <i class="fas fa-arrow-left"></i>
        </a>
      </div>
    `
  }
}

// عرض كل البلاغات
function showAllReports() {
  alert(`📋 إجمالي البلاغات: ${reportsFloat.length}\n\n` + 
    reportsFloat.map((r, i) => `${i+1}. ${typeName[r.type]}: ${r.description?.substring(0, 50)}...`).join('\n'))
}

// استبدال دالة العرض
window.showReportFloatList = showReportFloatListEnhanced

// تهيئة العداد عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(updateReportBadge, 500)
})
