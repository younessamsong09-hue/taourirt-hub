// ========== نظام التبليغات المتطور ==========

let reportsData = []
let currentReportType = ''
let currentUserLat = null
let currentUserLng = null

// تحميل البلاغات
async function loadReports() {
  if (window.SupabaseReports) {
    const data = await window.SupabaseReports.load()
    if (data && data.length > 0) {
      reportsData = data
      saveReportsToLocal()
    } else {
      loadReportsFromLocal()
    }
  } else {
    loadReportsFromLocal()
  }
  updateReportsDisplay()
  updateReportsBadge()
}

// تحميل من localStorage
function loadReportsFromLocal() {
  const saved = localStorage.getItem('reports_advanced')
  reportsData = saved ? JSON.parse(saved) : []
}

// حفظ في localStorage
function saveReportsToLocal() {
  localStorage.setItem('reports_advanced', JSON.stringify(reportsData))
}

// تحديث عرض البلاغات في اللوحة
function updateReportsDisplay() {
  const container = document.getElementById('reportsListContainer')
  if (!container) return
  
  if (reportsData.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding:20px; color:#64748b;">📭 لا توجد بلاغات</div>'
    return
  }
  
  const typeIcons = { pothole: '🕳️', light: '💡', garbage: '🗑️', other: '📌' }
  const typeNames = { pothole: 'حفرة', light: 'إنارة', garbage: 'نفايات', other: 'أخرى' }
  
  container.innerHTML = reportsData.slice(0, 5).map(r => `
    <div style="background:#1e293b; border-radius:12px; padding:12px; margin-bottom:8px; border-right:3px solid #ef4444;">
      <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
        <span style="font-weight:bold; color:#ef4444;">${typeIcons[r.type]} ${typeNames[r.type] || r.type}</span>
        <span style="font-size:10px; color:#64748b;">${new Date(r.created_at).toLocaleTimeString()}</span>
      </div>
      <div style="font-size:13px; color:#cbd5e1;">${r.description.substring(0, 60)}${r.description.length > 60 ? '...' : ''}</div>
      ${r.location_lat ? `<div style="font-size:10px; color:#3b82f6; margin-top:6px;"><i class="fas fa-map-marker-alt"></i> ${r.location_lat.toFixed(4)}, ${r.location_lng.toFixed(4)}</div>` : ''}
    </div>
  `).join('')
}

// تحديث عداد البلاغات
function updateReportsBadge() {
  const badge = document.getElementById('reportsBadge')
  if (badge) {
    const count = reportsData.length
    if (count > 0) {
      badge.style.display = 'flex'
      badge.textContent = count > 99 ? '99+' : count
    } else {
      badge.style.display = 'none'
    }
  }
}

// الحصول على موقع المستخدم
function getCurrentUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        currentUserLat = pos.coords.latitude
        currentUserLng = pos.coords.longitude
        const locationDiv = document.getElementById('reportLocationDisplay')
        if (locationDiv) {
          locationDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${currentUserLat.toFixed(4)}, ${currentUserLng.toFixed(4)}`
          locationDiv.style.color = '#10b981'
        }
      },
      () => {
        const locationDiv = document.getElementById('reportLocationDisplay')
        if (locationDiv) {
          locationDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> لم نتمكن من تحديد الموقع'
          locationDiv.style.color = '#f59e0b'
        }
      }
    )
  }
}

// معاينة الصورة
function previewReportImage(input) {
  const preview = document.getElementById('reportImagePreview')
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      preview.innerHTML = `<img src="${e.target.result}" style="width:100%; border-radius:12px; max-height:120px; object-fit:cover;">`
      preview.style.display = 'block'
    }
    reader.readAsDataURL(input.files[0])
  } else {
    preview.innerHTML = ''
    preview.style.display = 'none'
  }
}

// إرسال بلاغ
async function submitNewReport() {
  const type = document.getElementById('reportTypeSelect')?.value
  const desc = document.getElementById('reportDescInput')?.value.trim()
  const imageFile = document.getElementById('reportImageInput')?.files[0]
  
  if (!desc) {
    alert('❌ الرجاء كتابة وصف للمشكلة')
    return
  }
  
  const submitBtn = document.querySelector('#reportFormPanel button[onclick="submitNewReport()"]')
  if (submitBtn) {
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...'
    submitBtn.disabled = true
  }
  
  try {
    let imageUrl = null
    let reportId = null
    
    const reportData = {
      type: type || 'other',
      description: desc,
      lat: currentUserLat,
      lng: currentUserLng,
      image_url: null,
      created_at: new Date().toISOString()
    }
    
    if (window.SupabaseReports) {
      const result = await window.SupabaseReports.save(reportData)
      if (result.success) {
        reportId = result.data.id
        if (imageFile) {
          imageUrl = await window.SupabaseReports.uploadImage(imageFile, reportId)
          if (imageUrl) {
            reportData.image_url = imageUrl
          }
        }
        reportData.id = reportId
        reportsData.unshift(reportData)
      } else {
        throw new Error('فشل الحفظ')
      }
    } else {
      reportData.id = Date.now()
      reportsData.unshift(reportData)
    }
    
    saveReportsToLocal()
    updateReportsDisplay()
    updateReportsBadge()
    closeReportForm()
    alert('✅ تم إرسال البلاغ بنجاح! شكراً لك.')
    
  } catch (err) {
    console.error(err)
    alert('❌ حدث خطأ، حاول مرة أخرى')
  } finally {
    if (submitBtn) {
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال البلاغ'
      submitBtn.disabled = false
    }
  }
}

// فتح نموذج التبليغ
function openReportForm() {
  const panel = document.getElementById('reportFormPanel')
  if (panel) {
    panel.style.display = 'block'
    getCurrentUserLocation()
  }
}

// إغلاق نموذج التبليغ
function closeReportForm() {
  const panel = document.getElementById('reportFormPanel')
  if (panel) {
    panel.style.display = 'none'
    document.getElementById('reportDescInput').value = ''
    document.getElementById('reportImageInput').value = ''
    document.getElementById('reportImagePreview').innerHTML = ''
    document.getElementById('reportImagePreview').style.display = 'none'
  }
}

// تبديل اللوحة
function toggleReportPanel() {
  const panel = document.getElementById('reportFormPanel')
  if (panel) {
    if (panel.style.display === 'none' || !panel.style.display) {
      openReportForm()
    } else {
      closeReportForm()
    }
  }
}

// تهيئة النظام
document.addEventListener('DOMContentLoaded', async () => {
  if (window.SupabaseReports) {
    await window.SupabaseReports.init()
  }
  await loadReports()
})
