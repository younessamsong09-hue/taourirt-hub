let allPharmacies = [], allMarkets = [];
let currentNeighborhood = 'all';
let currentSearch = '';

function filterBySearch(items) {
    if (!currentSearch) return items;
    const search = currentSearch.toLowerCase();
    return items.filter(item => 
        item.name.toLowerCase().includes(search) ||
        (item.address && item.address.toLowerCase().includes(search)) ||
        (item.phone && item.phone.includes(search))
    );
}

function filterByNeighborhood(items) {
    if (currentNeighborhood === 'all') return items;
    const targetName = neighborhoodMap[currentNeighborhood];
    return items.filter(item => item.address && item.address.includes(targetName));
}

function getFilteredPharmacies() {
    let filtered = filterByNeighborhood(allPharmacies);
    filtered = filterBySearch(filtered);
    if (userLocation) {
        filtered.sort((a, b) => {
            const distA = calculateDistance(userLocation, getPharmacyCoords(a));
            const distB = calculateDistance(userLocation, getPharmacyCoords(b));
            return distA - distB;
        });
    }
    return filtered;
}

function renderAll() {
    const filtered = getFilteredPharmacies();
    updateMap(filtered);
    const pharmCount = document.getElementById('pharmCount');
    if (pharmCount) pharmCount.innerHTML = filtered.length > 0 ? `(${filtered.length})` : '';
    const duty = filtered.find(p => p.is_on_duty === true);
    document.getElementById('duty-container').innerHTML = renderDutyCard(duty);
    if (filtered.length === 0) {
        document.getElementById('pharmacies-container').innerHTML = '<div class="card" style="text-align:center">📭 لا توجد نتائج</div>';
    } else {
        document.getElementById('pharmacies-container').innerHTML = filtered.map(p => renderPharmacyCard(p)).join('');
    }
    if (allMarkets.length === 0) {
        document.getElementById('markets-container').innerHTML = '<div class="card">📭 لا توجد أسواق</div>';
    } else {
        document.getElementById('markets-container').innerHTML = allMarkets.map(m => renderMarketCard(m)).join('');
    }
    bindEvents();
}

function bindEvents() {
    document.querySelectorAll('.star').forEach(star => {
        star.onclick = (e) => {
            e.stopPropagation();
            const card = star.closest('.card');
            const id = parseInt(card.dataset.id);
            const rating = parseInt(star.dataset.star);
            saveRating(id, rating);
            const stars = card.querySelectorAll('.star');
            stars.forEach((s, i) => s.style.color = i < rating ? '#facc15' : '#475569');
            showToast(`قيمت بـ ${rating} نجوم`);
        };
    });
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            shareOnWhatsApp(btn.dataset.name, btn.dataset.phone, btn.dataset.address);
        };
    });
}

function handleSearch() {
    const input = document.getElementById('searchInput');
    currentSearch = input.value;
    const clearBtn = document.getElementById('clearSearch');
    if (clearBtn) clearBtn.style.display = currentSearch ? 'inline-block' : 'none';
    renderAll();
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    currentSearch = '';
    const clearBtn = document.getElementById('clearSearch');
    if (clearBtn) clearBtn.style.display = 'none';
    renderAll();
}

async function loadData() {
    try {
        const pharmRes = await fetch(`${SUPABASE_URL}/rest/v1/pharmacies?select=*`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        allPharmacies = await pharmRes.json();

        const marketRes = await fetch(`${SUPABASE_URL}/rest/v1/markets?select=*`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        allMarkets = await marketRes.json();

        initMap();
        
        document.getElementById('neighborhoods-container').innerHTML = renderNeighborhoods(currentNeighborhood);
        
        document.querySelectorAll('.neighbor-btn').forEach(btn => {
            btn.onclick = () => {
                currentNeighborhood = btn.dataset.neighbor;
                document.getElementById('neighborhoods-container').innerHTML = renderNeighborhoods(currentNeighborhood);
                renderAll();
            };
        });
        
        renderAll();

        const locateBtn = document.getElementById('locateBtn');
        if (locateBtn) locateBtn.onclick = () => getUserLocation(() => renderAll());
        
        const zoomInBtn = document.getElementById('zoomInBtn');
        if (zoomInBtn) zoomInBtn.onclick = () => zoomIn();
        
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        if (zoomOutBtn) zoomOutBtn.onclick = () => zoomOut();

        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.addEventListener('input', handleSearch);
        
        const clearBtn = document.getElementById('clearSearch');
        if (clearBtn) clearBtn.addEventListener('click', clearSearch);

    } catch (error) {
        console.error(error);
        document.getElementById('duty-container').innerHTML = '<div class="card">⚠️ خطأ في الاتصال</div>';
    }
}

document.addEventListener('DOMContentLoaded', loadData);
