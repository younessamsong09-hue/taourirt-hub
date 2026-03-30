// ========== نظام التبليغات مع Supabase ==========

let reportsFloat = []
let supabaseClient = null
let currentReportType = ''
let userLat = null
let userLng = null

// بيانات Supabase
const SUPABASE_URL = 'https://pyxeusrxoizjlihyqhac.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt'

// تهيئة Supabase
async function initSupabaseReports() {
  try {
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
    console.log('✅ Supabase متصل')
    await loadReportsFromSupabase()
  } catch (err) {
    console.error('خطأ:', err)
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
      .limit(10)
    if (!error && data) {
      reportsFloat = data
      saveReportsToLocal()
      showReportFloatList()
      updateReportsCount()
    }
  } catch (err) {
    loadReportsFromLocal()
  }
}

// تحميل من localStorage
function loadReportsFromLocal() {
  const saved = localStorage.getItem('city_reports')
  reportsFloat = saved ? JSON.parse(saved) : []
  showReportFloatList()
  updateReportsCount()
}

// حفظ في localStorage
function saveReportsToLocal() {
  localStorage.setItem('city_reports', JSON.stringify(reportsFloat))
}

// تحديث العداد
function updateReportsCount() {
  const badge = document.getElementById('reportBadge')
  if (badge) {
    const count = reportsFloat.length
    if (count > 0) {
      badge.style.display = 'flex'
      badge.textContent = count > 99 ? '99+' : count
    } else {
      badge.style.display = 'none'
    }
  }
}

// تبديل اللوحة
function toggleReportFloat() {
  const panel = document.getElementById('reportFloatPanel')
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none'
    if (panel.style.display === 'block') {
      getReportLocation()
      showReportFloatList()
    }
  }
}

// الحصول على الموقع
function getReportLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userLat = pos.coords.latitude
        userLng = pos.coords.longitude
        const locationDiv = document.getElementById('reportFloatLocation')
        if (locationDiv) {
          locationDiv.innerHTML = `📍 ${userLat.toFixed(4)}, ${userLng.toFixed(4)}`
          locationDiv.style.color = '#10b981'
        }
      },
      () => {
        const locationDiv = document.getElementById('reportFloatLocation')
        if (locationDiv) {
          locationDiv.innerHTML = '⚠️ لم نتمكن من تحديد الموقع'
          locationDiv.style.color = '#f59e0b'
        }
      }
    )
  }
}

// بدء التبليغ
function startReportFloat(type) {
  currentReportType = type
  document.getElementById('reportFloatForm').style.display = 'block'
  document.querySelector('#reportFloatPanel .float-buttons').style.display = 'none'
  getReportLocation()
}

// رفع الصورة
async function uploadReportImage(file, reportId) {
  if (!supabaseClient || !file) return null
  const fileExt = file.name.split('.').pop()
  const fileName = `${reportId}_${Date.now()}.${fileExt}`
  try {
    const { error } = await supabaseClient.storage
      .from('reports-media')
      .upload(`reports/${fileName}`, file)
    if (error) throw error
    const { data: { publicUrl } } = supabaseClient.storage
      .from('reports-media')
      .getPublicUrl(`reports/${fileName}`)
    return publicUrl
  } catch (err) {
    return null
  }
}

// إرسال البلاغ
async function addReportFloat() {
  const desc = document.getElementById('reportFloatDesc').value.trim()
  const imageFile = document.getElementById('reportFloatImage').files[0]
  
  if (!desc) {
    alert('❌ الرجاء كتابة وصف للمشكلة')
    return
  }
  
  const submitBtn = document.querySelector('#reportFloatForm button[onclick="addReportFloat()"]')
  if (submitBtn) {
    submitBtn.textContent = 'جاري الإرسال... 📤'
    submitBtn.disabled = true
  }
  
  try {
    let imageUrl = null
    let reportId = null
    
    const reportData = {
      type: currentReportType,
      description: desc,
      location_lat: userLat,
      location_lng: userLng,
      status: 'pending',
      created_at: new Date().toISOString()
    }
    
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('reports')
        .insert([reportData])
        .select()
      
      if (!error && data && data[0]) {
        reportId = data[0].id
        reportData.id = reportId
        
        if (imageFile) {
          imageUrl = await uploadReportImage(imageFile, reportId)
          if (imageUrl) {
            await supabaseClient
              .from('reports')
              .update({ image_url: imageUrl })
              .eq('id', reportId)
            reportData.image_url = imageUrl
          }
        }
        reportsFloat.unshift(reportData)
      } else {
        throw error
      }
    } else {
      reportData.id = Date.now()
      reportsFloat.unshift(reportData)
    }
    
    saveReportsToLocal()
    clearReportFloat()
    showReportFloatList()
    updateReportsCount()
    alert('✅ تم إرسال البلاغ بنجاح! شكراً لك.')
    
  } catch (err) {
    console.error(err)
    alert('❌ حدث خطأ، حاول مرة أخرى')
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
    container.innerHTML = '<div style="text-align:center; padding:20px; color:#64748b;">📭 لا توجد بلاغات</div>'
    return
  }
  
  const typeIcon = { 'pothole': '🕳️', 'light': '💡', 'garbage': '🗑️' }
  const typeName = { 'pothole': 'حفرة', 'light': 'إنارة', 'garbage': 'نفايات' }
  
  container.innerHTML = reportsFloat.slice(0, 5).map(r => `
    <div style="background:#1e293b; border-radius:12px; padding:10px; margin-bottom:8px; border-right:3px solid #ef4444;">
      <div style="display:flex; justify-content:space-between;">
        <span style="font-weight:bold; color:#ef4444; font-size:12px;">${typeIcon[r.type]} ${typeName[r.type] || r.type}</span>
        <span style="font-size:10px; color:#64748b;">${new Date(r.created_at).toLocaleTimeString()}</span>
      </div>
      <div style="font-size:12px; color:#cbd5e1; margin-top:5px;">${r.description.substring(0, 50)}${r.description.length > 50 ? '...' : ''}</div>
      ${r.location_lat ? `<div style="font-size:10px; color:#3b82f6; margin-top:5px;"><i class="fas fa-map-marker-alt"></i> موقع</div>` : ''}
    </div>
  `).join('')
}

// تنظيف النموذج
function clearReportFloat() {
  document.getElementById('reportFloatDesc').value = ''
  document.getElementById('reportFloatImage').value = ''
  document.getElementById('reportFloatForm').style.display = 'none'
  document.querySelector('#reportFloatPanel .float-buttons').style.display = 'flex'
  document.getElementById('reportFloatPanel').style.display = 'none'
  currentReportType = ''
  userLat = null
  userLng = null
}

// تهيئة النظام
document.addEventListener('DOMContentLoaded', () => {
  initSupabaseReports()
})
