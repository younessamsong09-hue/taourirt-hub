        const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(10);
        // مساعد تاوريرت الذكي
        const btn = document.getElementById('assistantBtn');
        const panel = document.getElementById('assistantPanel');
        const closeBtn = document.getElementById('closeAssistant');
        const input = document.getElementById('assistantInput');
        const messages = document.getElementById('assistantMessages');
            div.style.cssText = `background:${isUser ? '#3b82f6' : '#334155'}; align-self:${isUser ? 'flex-end' : 'flex-start'}; padding:8px 12px; border-radius:15px; max-width:85%; margin-bottom:5px; font-size:13px;`;
            const container = document.getElementById('pharmacies-container');
                container.innerHTML = '<div class="card" style="text-align:center">📭 لا توجد صيدليات مفتوحة حالياً</div>';
                container.innerHTML = filtered.map(p => renderPharmacyCard(p)).join('');
        <div class="comment-input-container">
    margin-bottom: 10px;
    margin-bottom: 5px;
.comment-input-container {
window.toggleAssistant = function() { const p = document.getElementById("assistantPanel"); if(p) p.style.display = p.style.display === "none" ? "flex" : "none"; };
