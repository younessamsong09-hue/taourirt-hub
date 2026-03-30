// ========== مساعد Supabase للتبليغات ==========

const SUPABASE_URL = 'https://pyxeusrxoizjlihyqhac.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt'

let supabaseClient = null

async function initSupabaseHelper() {
  if (typeof supabase === 'undefined') {
    await new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js'
      script.onload = resolve
      document.head.appendChild(script)
    })
  }
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  console.log('✅ Supabase جاهز')
  return supabaseClient
}

async function saveReportToSupabase(report) {
  if (!supabaseClient) await initSupabaseHelper()
  
  try {
    const { data, error } = await supabaseClient
      .from('reports')
      .insert([{
        type: report.type,
        description: report.description,
        location_lat: report.lat,
        location_lng: report.lng,
        image_url: report.image_url,
        status: 'pending'
      }])
      .select()
    
    if (error) throw error
    return { success: true, data: data[0] }
  } catch (err) {
    console.error('خطأ في الحفظ:', err)
    return { success: false, error: err }
  }
}

async function uploadReportImage(file, reportId) {
  if (!supabaseClient) await initSupabaseHelper()
  if (!file) return null
  
  const ext = file.name.split('.').pop()
  const fileName = `${reportId}_${Date.now()}.${ext}`
  
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
    console.error('خطأ في رفع الصورة:', err)
    return null
  }
}

async function loadReportsFromSupabase() {
  if (!supabaseClient) await initSupabaseHelper()
  
  try {
    const { data, error } = await supabaseClient
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (error) throw error
    return data || []
  } catch (err) {
    console.error('خطأ في التحميل:', err)
    return []
  }
}

window.SupabaseReports = {
  init: initSupabaseHelper,
  save: saveReportToSupabase,
  uploadImage: uploadReportImage,
  load: loadReportsFromSupabase
}
