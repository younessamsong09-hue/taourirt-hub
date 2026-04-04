function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}
function showToast(msg, type = 'success') {
    const toast = document.createElement('div');
    const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
    toast.style.cssText = `position:fixed; bottom:20px; right:20px; background:${colors[type]}; color:white; padding:12px 20px; border-radius:12px; z-index:10000; font-size:14px; animation: fadeIn 0.3s ease;`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
