let lostItems = JSON.parse(localStorage.getItem('lost_items')) || [];
let foundItems = JSON.parse(localStorage.getItem('found_items')) || [];

function toggleLostFound() {
    const c = document.getElementById('lostFoundContent');
    const a = document.getElementById('lostArrow');
    c.style.display = (c.style.display === 'none') ? 'block' : 'none';
    if(a) a.className = (c.style.display === 'block') ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
}

function previewImage(input, targetId) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            const img = document.getElementById(targetId);
            img.src = e.target.result; img.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function saveItem(type) {
    const title = document.getElementById(type+'Title').value;
    const desc = document.getElementById(type+'Desc').value;
    const phone = document.getElementById(type+'Phone').value;
    const place = document.getElementById(type+'Place').value;
    const file = document.getElementById(type+'Image').files[0];

    if(!title || !phone) return alert('العنوان والهاتف ضروريان!');

    const finalize = (imgData) => {
        const item = { id:Date.now(), title, desc, phone, place, image:imgData, date:new Date().toLocaleDateString('ar-MA') };
        if(type==='lost') lostItems.unshift(item); else foundItems.unshift(item);
        localStorage.setItem(type+'_items', JSON.stringify(type==='lost' ? lostItems : foundItems));
        resetForm(type);
        showLists();
    };

    if(file) { const r = new FileReader(); r.onload = e => finalize(e.target.result); r.readAsDataURL(file); }
    else finalize(null);
}

function renderCard(item, color, label) {
    return `
    <div style="background:#1e293b; border-radius:16px; overflow:hidden; margin-bottom:15px; border:1px solid #334155; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
        ${item.image ? `<img src="${item.image}" style="width:100%; max-height:180px; object-fit:cover;">` : `<div style="height:80px; background:#2d3748; display:flex; align-items:center; justify-content:center; color:#718096;">📷 بدون صورة</div>`}
        <div style="padding:15px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <b style="color:white; font-size:16px;">${item.title}</b>
                <span style="background:${color}; color:white; font-size:10px; padding:3px 8px; border-radius:10px; font-weight:bold;">${label}</span>
            </div>
            <p style="color:#94a3b8; font-size:13px; margin-bottom:10px;">${item.desc || ''}</p>
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#64748b; margin-bottom:12px;">
                <span>📍 ${item.place || 'تاوريرت'}</span>
                <span>📅 ${item.date}</span>
            </div>
            <div style="display:flex; gap:8px;">
                <a href="tel:${item.phone}" style="flex:2; background:${color}; color:white; text-decoration:none; text-align:center; padding:10px; border-radius:10px; font-weight:bold; font-size:14px;"><i class="fas fa-phone"></i> اتصل</a>
                <button onclick="removeItem('${item.id}', '${label === 'مفقود' ? 'lost' : 'found'}')" style="flex:1; background:transparent; border:1px solid #4a5568; color:#a0aec0; border-radius:10px; font-size:12px;">حذف</button>
            </div>
        </div>
    </div>`;
}

function showLists() {
    document.getElementById('lostList').innerHTML = lostItems.map(i => renderCard(i, '#ef4444', 'مفقود')).join('');
    document.getElementById('foundList').innerHTML = foundItems.map(i => renderCard(i, '#10b981', 'موجود')).join('');
}

function resetForm(type) {
    document.getElementById(type+'Form').style.display='none';
    document.getElementById(type+'Preview').style.display='none';
    document.getElementById(type+'Title').value='';
    document.getElementById(type+'Phone').value='';
    document.getElementById(type+'Image').value='';
}

function removeItem(id, type) {
    if(!confirm('هل تريد الحذف؟')) return;
    if(type==='lost') { lostItems = lostItems.filter(i => i.id != id); localStorage.setItem('lost_items', JSON.stringify(lostItems)); }
    else { foundItems = foundItems.filter(i => i.id != id); localStorage.setItem('found_items', JSON.stringify(foundItems)); }
    showLists();
}

function addLost() { saveItem('lost'); }
function addFound() { saveItem('found'); }
function showLostForm() { document.getElementById('lostForm').style.display='block'; document.getElementById('foundForm').style.display='none'; }
function showFoundForm() { document.getElementById('foundForm').style.display='block'; document.getElementById('lostForm').style.display='none'; }

showLists();
