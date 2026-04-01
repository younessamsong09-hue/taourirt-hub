export const PotholeModule = {
    render: (data) => `
        <div class="post-card" style="background:#1a1a1a; border-radius:15px; margin-bottom:20px; border:1px solid #ff4757; overflow:hidden;">
            ${data.image_url ? `<img src="${data.image_url}" style="width:100%; height:220px; object-fit:cover;">` : ''}
            <div style="padding:15px; color:white;">
                <div style="display:flex; justify-content:space-between; font-size:12px; color:#ff4757; font-weight:bold;">
                    <span>🕳️ بلاغ: حفرة طريق</span>
                    <span>${new Date(data.created_at).toLocaleDateString('ar-MA')}</span>
                </div>
                <p style="margin:10px 0; font-size:15px; line-height:1.6;">${data.description}</p>
                <div style="display:flex; gap:20px; border-top:1px solid #333; padding-top:10px;">
                    <span style="color:#ff4757; cursor:pointer; font-weight:bold;">❤️ إعجاب</span>
                    <span style="color:#3498db; cursor:pointer; font-weight:bold;">💬 تعليقات</span>
                    <a href="https://www.google.com/maps?q=${data.location_lat},${data.location_lng}" target="_blank" style="margin-right:auto; color:#2ecc71; text-decoration:none;">📍 الموقع</a>
                </div>
            </div>
        </div>`
};
