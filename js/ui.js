function formatPhone(p) { return p ? p.replace(/(\d{2})(\d{3})(\d{3})(\d{2})/, '$1 $2 $3 $4') : ''; }
function escapeHtml(t) { return t ? t.replace(/[&<>]/g, function(m) { return {'&':'&amp;','<':'&lt;','>':'&gt;'}[m]; }) : ''; }

function getPharmacyCoords(name) {
    const coords = {
        'صيدلية الجابري': [34.4118699, -2.8938031],
        'صيدلية تاوريرت': [34.4104488, -2.8920991],
        'صيدلية واد زا': [34.4009184, -2.8981587],
        'صيدلية الأندلس': [34.4056633, -2.9074899],
        'صيدلية المحطة': [34.4112578, -2.8962049],
        'صيدلية النهضة': [34.4087392, -2.8895171],
        'صيدلية مستوصف الحلفة': [34.4066304, -2.8967145],
        'صيدلية الحكمة': [34.405044, -2.8931881],
        'صيدلية المغرب': [34.399456, -2.892343],
        'صيدلية البغدادي': [34.4104522, -2.8900091],
        'صيدلية الخليل': [34.4049655, -2.89801]
    };
    return coords[name] || [34.408, -2.895];
}

function openDirections(pharmacy) {
    const coords = getPharmacyCoords(pharmacy.name);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}`;
    window.open(url, '_blank');
}

function renderPharmacyCard(p) {
    const rating = getRating(p.id);
    return `
        <div class="card" data-id="${p.id}">
            <div class="card-header">
                <h3>🏪 ${escapeHtml(p.name)}</h3>
                <div class="rating">
                    ${[1,2,3,4,5].map(star => `<i class="fas fa-star star" data-star="${star}" style="color: ${star <= rating ? '#facc15' : '#475569'}"></i>`).join('')}
                </div>
            </div>
            <p><i class="fas fa-location-dot"></i> ${escapeHtml(p.address) || 'العنوان غير متوفر'}</p>
            <p><i class="fas fa-phone"></i> <a href="tel:${p.phone}" class="phone-link">${formatPhone(p.phone) || 'رقم غير متوفر'}</a></p>
            <div class="card-footer">
                <span class="${p.is_on_duty ? 'status-on' : 'status-off'}">${p.is_on_duty ? '🟢 متوفر' : '⚪ غير متوفر'}</span>
                <button class="direction-btn" onclick="openDirections({name:'${p.name}'})">
                    <i class="fas fa-map-marked-alt"></i> اتجاهات
                </button>
                <button class="share-btn" data-name="${p.name}" data-phone="${p.phone}" data-address="${p.address}">
                    <i class="fab fa-whatsapp"></i> مشاركة
                </button>
            </div>
        </div>
    `;
}

function renderMarketCard(m) {
    return `
        <div class="card">
            <h3>🛍️ ${escapeHtml(m.name)}</h3>
            <p><i class="fas fa-location-dot"></i> ${escapeHtml(m.address) || 'العنوان غير متوفر'}</p>
            <p><i class="fas fa-phone"></i> <a href="tel:${m.phone}" class="phone-link">${formatPhone(m.phone) || 'رقم غير متوفر'}</a></p>
            <button class="share-btn" data-name="${m.name}" data-phone="${m.phone}" data-address="${m.address}">
                <i class="fab fa-whatsapp"></i> مشاركة
            </button>
        </div>
    `;
}

function renderDutyCard(p) {
    if (!p) return '<div class="card">⚠️ لا توجد صيدلية حراسة اليوم</div>';
    return `
        <div class="duty-card">
            <h3>🚨 صيدلية الحراسة الآن</h3>
            <h2>${escapeHtml(p.name)}</h2>
            <p><i class="fas fa-location-dot"></i> ${escapeHtml(p.address || '')}</p>
            <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                <a href="tel:${p.phone}" class="btn">📞 اتصل الآن</a>
                <button class="btn-direction" onclick="openDirections({name:'${p.name}'})" style="background:#3b82f6;">🗺️ اتجاهات</button>
            </div>
        </div>
    `;
}

function renderNeighborhoods(a) {
    const neighborhoods = [
        { id: 'all', name: 'الكل', icon: '🌍' },
        { id: 'center', name: 'وسط المدينة', icon: '🏙️' },
        { id: 'masira', name: 'حي المسيرة', icon: '🏘️' },
        { id: 'salam', name: 'حي السلام', icon: '🕊️' },
        { id: 'taawon', name: 'حي التعاون', icon: '🤝' },
        { id: 'nahda', name: 'حي النهضة', icon: '🌅' },
        { id: 'takatof', name: 'حي التقدم', icon: '📈' }
    ];
    return `<div class="neighborhoods">${neighborhoods.map(n => `<button class="neighbor-btn ${n.id === a ? 'active' : ''}" data-neighbor="${n.id}">${n.icon} ${n.name}</button>`).join('')}</div>`;
}
