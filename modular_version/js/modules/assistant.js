// ========== المساعد الذكي ==========
window.toggleAssistant = function() {
    const p = document.getElementById('assistantPanel');
    if (p) p.style.display = p.style.display === 'none' ? 'flex' : 'none';
};
window.sendAssistantMessage = function() {
    const input = document.getElementById('assistantInput');
    if (input && input.value) {
        alert('رد: ' + input.value);
        input.value = '';
    }
};
