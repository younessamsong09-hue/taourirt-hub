// Supabase Configuration
const SUPABASE_URL = 'https://pyxeusrxoizjlihyqhac.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt'

let supabaseClient = null

// تهيئة Supabase
async function initSupabase() {
  try {
    // محاولة استخدام Supabase من CDN
    if (typeof supabase === 'undefined') {
      // تحميل مكتبة Supabase
      await new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js'
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    }
    
    // إنشاء العميل
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    console.log('✅ Supabase متصل بنجاح')
    return supabaseClient
  } catch (err) {
    console.error('❌ فشل تحميل Supabase:', err)
    return null
  }
}

// دالة رفع الصورة
async function uploadReportImage(file, reportId) {
  if (!supabaseClient) return null
  
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

// تصدير الدوال
window.SupabaseAPI = {
  init: initSupabase,
  uploadImage: uploadReportImage,
  getClient: () => supabaseClient
}
