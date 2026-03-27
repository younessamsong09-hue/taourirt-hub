function formatPhone(phone) {
    if (!phone) return '';
    return phone.replace(/(\d{2})(\d{3})(\d{3})(\d{2})/, '$1 $2 $3 $4');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getPharmacyCoords(pharmacy) {
    const coordsMap = {
        'صيدلية المزينين': [34.4180, -2.8820],
        'صيدلية الأندلس': [34.4250, -2.8750],
        'صيدلية النور': [34.4100, -2.8900],
        'صيدلية الفتح': [34.4050, -2.8850],
        'صيدلية السلام': [34.4200, -2.8780]
    };
    return coordsMap[pharmacy.name] || [34.4167, -2.8833];
}

function renderPharmacyCard(pharmacy) {
    const rating = getRating(pharmacy.id);
    const coords = getPharmacyCoords(pharmacy);
    const distance = userLocation ? calculateDistance(userLocation, coords) : null;
    const distanceText = distance ? `<br><span style="font-size:11px;color:#94a3b8;">📏 ${distance.toFixed(1)} كم</span>` : '';
    return `
        <div class="card" data-id="${pharmacy.id}">
            <div class="card-header">
                <h3>🏪 ${escapeHtml(pharmacy.name)}</h3>
                <div class="rating">
                    ${[1,2,3,4,5].map(star => `<i class="fas fa-star star" data-star="${star}" style="color: ${star <= rating ? '#facc15' : '#475569'}"></i>`).join('')}
                </div>
            </div>
            <p>📍 ${escapeHtml(pharmacy.address) || 'العنوان غير متوفر'}</p>
            <p>📞 <a href="tel:${pharmacy.phone}" class="phone-link">${formatPhone(pharmacy.phone)}</a>${distanceText}</p>
            <div class="card-footer">
                <span class="${pharmacy.is_on_duty ? 'status-on' : 'status-off'}">${pharmacy.is_on_duty ? '🟢 متوفر' : '⚪ غير متوفر'}</span>
                <button class="share-btn" data-name="${pharmacy.name}" data-phone="${pharmacy.phone}" data-address="${pharmacy.address}">
                    <i class="fab fa-whatsapp"></i> مشاركة
                </button>
            </div>
        </div>
    `;
}

function renderMarketCard(market) {
    return `
        <div class="card">
            <h3>🛍️ ${escapeHtml(market.name)}</h3>
            <p>📍 ${escapeHtml(market.address) || 'العنوان غير متوفر'}</p>
            <p>📞 <a href="tel:${market.phone}" class="phone-link">${formatPhone(market.phone)}</a></p>
            <button class="share-btn" data-name="${market.name}" data-phone="${market.phone}" data-address="${market.address}">
                <i class="fab fa-whatsapp"></i> مشاركة
            </button>
        </div>
    `;
}

function renderDutyCard(pharmacy) {
    if (!pharmacy) return '<div class="card">⚠️ لا توجد صيدلية حراسة اليوم</div>';
    return `
        <div class="duty-card">
            <h3>🚨 صيدلية الحراسة الآن</h3>
            <h2>${escapeHtml(pharmacy.name)}</h2>
            <p>${escapeHtml(pharmacy.address || '')}</p>
            <a href="tel:${pharmacy.phone}" class="btn">📞 اتصل الآن</a>
        </div>
    `;
}

function renderNeighborhoods(activeId) {
    return `
        <div class="neighborhoods">
            ${NEIGHBORHOODS.map(n => `
                <button class="neighbor-btn ${n.id === activeId ? 'active' : ''}" data-neighbor="${n.id}">
                    ${n.icon} ${n.name}
                </button>
            `).join('')}
        </div>
    `;
}
