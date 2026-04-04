// ========== إضافة بيانات Supabase إلى الخريطة (يعتمد على map-base.js) ==========
// هذا الملف يُستخدم بعد تحميل map-base.js ليضيف بيانات حقيقية من Supabase

let supabaseMap = null;
const SUPABASE_URL = 'https://pyxeusrxoizjlihyqhac.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_u1vYpwFYhvou2oyvsxoNIQ_1WDklzXt';

async function loadRealDataFromSupabase() {
    if (typeof supabase === 'undefined') {
        await new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }
    supabaseMap = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    try {
        const { data: pharmacies, error: phErr } = await supabaseMap.from('pharmacies').select('*');
        const { data: markets, error: mErr } = await supabaseMap.from('markets').select('*');
        if (!phErr && !mErr) {
            // مسح العلامات الحالية (التجريبية) وإضافة الحقيقية
            clearMarkers();  // من map-base.js
            if (pharmacies) pharmacies.forEach(p => addMarker(p, 'pharmacy'));
            if (markets) markets.forEach(m => addMarker(m, 'market'));
            console.log(`✅ تم تحميل ${pharmacies?.length || 0} صيدلية و ${markets?.length || 0} سوق من Supabase`);
        } else {
            console.warn('⚠️ فشل تحميل البيانات من Supabase، استمرار بالبيانات التجريبية');
        }
    } catch (err) {
        console.error('خطأ في Supabase:', err);
    }
}

// استدعاء هذه الوظيفة بعد تحميل الخريطة الأساسية
if (typeof initMap === 'function') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(loadRealDataFromSupabase, 1000); // ننتظر قليلاً لتهيئة الخريطة
    });
}
