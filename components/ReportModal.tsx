'use client';
import { useState, useEffect } from 'react';
import { X, AlertTriangle, MapPin, Loader2, Camera, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase'; // تأكد من صحة مسار ملف سوبابيس لديك

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [success, setSuccess] = useState(false);

  // 1. جلب موقع المستخدم فور فتح النموذج
  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error("Error getting location", err)
      );
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;

      // 2. رفع الصورة إذا وجدت
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('report-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('report-images')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      // 3. إرسال البيانات للجدول
      const { error: insertError } = await supabase
        .from('reports')
        .insert([{
          category,
          description,
          location_lat: location?.lat,
          location_lng: location?.lng,
          image_url: imageUrl,
          status: 'pending'
        }]);

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setCategory('');
        setDescription('');
        setImageFile(null);
      }, 3000);

    } catch (error: any) {
      alert('حدث خطأ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[2000] flex items-center justify-center p-4 font-sans" dir="rtl">
      <div className="bg-zinc-950 w-full max-w-md rounded-[2.5rem] border border-zinc-800 shadow-3xl p-6 relative overflow-hidden">
        
        {success ? (
          <div className="py-12 text-center animate-in fade-in zoom-in duration-300">
            <div className="bg-emerald-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">تم استلام تبليغك!</h2>
            <p className="text-zinc-400">شكراً لمساهمتك في جعل تاوريرت أفضل.</p>
          </div>
        ) : (
          <>
            <button onClick={onClose} className="absolute top-6 left-6 text-zinc-600 hover:text-white transition-colors"><X size={24} /></button>

            <div className="flex items-center gap-4 mb-6">
              <div className="bg-red-600/20 p-3 rounded-2xl border border-red-600/30 text-red-500"><AlertTriangle size={24} /></div>
              <h2 className="text-xl font-black text-white italic">عين المواطن - تاوريرت</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 mr-2">فئة التبليغ</label>
                <select value={category} onChange={(e)=>setCategory(e.target.value)} required className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-red-600 outline-none appearance-none cursor-pointer">
                  <option value="" disabled>ما هي المشكلة؟</option>
                  <option value="حفرة طريق">حفرة في الطريق</option>
                  <option value="إنارة معطلة">إنارة عمومية معطلة</option>
                  <option value="تراكم نفايات">تراكم أزبال / نفايات</option>
                  <option value="تسرب مياه">تسرب مياه (ONEE)</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 mr-2">وصف قصير</label>
                <textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="مثال: حفرة كبيرة قرب مسجد حي مغنية..." required rows={3} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-red-600 outline-none resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-2xl p-4 cursor-pointer hover:bg-zinc-900 transition-colors">
                  <Camera size={20} className="text-zinc-500 mb-2" />
                  <span className="text-[10px] text-zinc-400 font-bold">{imageFile ? "تم اختيار الصورة" : "إرفاق صورة"}</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
                
                <div className={`flex flex-col items-center justify-center border-2 border-zinc-800 rounded-2xl p-4 ${location ? 'bg-emerald-500/5 border-emerald-500/20' : ''}`}>
                  <MapPin size={20} className={location ? "text-emerald-500 mb-2" : "text-zinc-500 mb-2"} />
                  <span className="text-[10px] text-zinc-400 font-bold">{location ? "تم تحديد الموقع" : "جاري تحديد الموقع..."}</span>
                </div>
              </div>

              <button type="submit" disabled={loading || !location} className="w-full bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl p-4 flex items-center justify-center gap-3 transition-all disabled:opacity-30 shadow-lg shadow-red-900/20">
                {loading ? <Loader2 className="animate-spin" /> : "إرسال التبليغ الآن"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
