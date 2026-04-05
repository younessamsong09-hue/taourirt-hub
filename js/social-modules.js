    /* نظام الموديلات الداخلي (فكرتك) */
    const Modules = {
        pothole: (r) => `<div class="post-card card-pothole">${r.image_url ? `<img src="${r.image_url}" class="post-img">` : ""}<div style="padding:15px;color:white;"><small style="color:#ff4757">🕳️ حفرة</small><p>${r.description}</p><div style="display:flex;gap:15px;font-size:0.8em;margin-top:10px;color:#888;"><span>❤️ إعجاب</span><span>💬 تعليق</span></div></div></div>`,
        light: (r) => `<div class="post-card card-light">${r.image_url ? `<img src="${r.image_url}" class="post-img">` : ""}<div style="padding:15px;color:white;"><small style="color:#f1c40f">💡 إنارة</small><p>${r.description}</p><div style="display:flex;gap:15px;font-size:0.8em;margin-top:10px;color:#888;"><span>❤️ إعجاب</span><span>💬 تعليق</span></div></div></div>`
    };

    async function fetchLatestReports() {
        const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(10);
        const list = document.getElementById("reportFloatList");
        if (error || !list) return;
        list.className = "social-feed";
        list.innerHTML = data.map(r => Modules[r.type] ? Modules[r.type](r) : `<div class="post-card" style="padding:15px;color:white;">⚠️ ${r.description}</div>`).join("") || "📭 لا بلاغات";
    }

    function previewImage(input) {
        const reader = new FileReader();
        reader.onload = e => { 
            const p = document.getElementById("reportImgPreview"); 
            p.src = e.target.result; p.style.display = "block"; p.style.width="100%"; p.style.height="150px"; p.style.objectFit="cover";
        };
        reader.readAsDataURL(input.files[0]);
    }
</script>

<style id="social-style">
    .social-feed { max-height: 450px; overflow-y: auto; padding: 10px; }
    .post-card { background: #1a1a1a; border-radius: 15px; margin-bottom: 20px; border: 1px solid #333; overflow: hidden; }
    .card-pothole { border-right: 5px solid #ff4757; }
    .card-light { border-right: 5px solid #f1c40f; }
    .post-img { width: 100%; height: 200px; object-fit: cover; }
    .post-content { padding: 15px; color: white; }
    .post-actions { display: flex; gap: 15px; border-top: 1px solid #2c3e50; padding-top: 10px; margin-top: 10px; }
    .action-btn { color: #3498db; font-size: 0.9em; cursor: pointer; font-weight: bold; }
