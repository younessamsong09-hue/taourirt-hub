let lostItems = JSON.parse(localStorage.getItem('lost_items')) || [];
let foundItems = JSON.parse(localStorage.getItem('found_items')) || [];

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
    const phone = document.getElementById(type+'Phone').value;
    const desc = document.getElementById(type+'Desc').value;
    const place = document.getElementById(type+'Place').value;
    const file = document.getElementById(type+'Image').files[0];

    if(!title || !phone) return alert('العنوان ورقم الهاتف ضروريان!');

    const finalize = (imgData) => {
        const item = { id:Date.now(), title, desc, phone, place, image:imgData, date:new Date().toLocaleDateString('ar-MA') };
        if(type==='lost') lostItems.unshift(item); else foundItems.unshift(item);
        localStorage.setItem(type+'_items', JSON.stringify(type==='lost' ? lostItems : foundItems));
        
        // إعادة ضبط النموذج
        document.getElementById(type+'Form').style.display='none';
        document.getElementById(type+'Preview').style.display='none';
        document.getElementById(type+'Title').value='';
        document.getElementById(type+'Phone').value='';
        
        showLists();
    };

    if(file) {
        const r = new FileReader();
        r.onload = e => finalize(e.target.result);
        r.readAsDataURL(file);
    } else { finalize(null); }
}

function renderCard(item, color, label) {
    return `
    <div style="background:#1e293b; border-radius:20px; overflow:hidden; margin-bottom:15px; border:1px solid #334155; box-shadow:0 10px 15px -3px rgba(0,0,0,0.2);">
        ${item.image ? `<img src="${item.image}" style="width:100%; max-height:200px; object-fit:cover;">` : `<div style="height:100px; background:#0f172a; display:flex; align-items:center; justify-content:center; color:#475569;"><i class="fas fa-camera fa-2x"></i></div>`}
        <div style="padding:15px;">
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:10px;">
                <h3 style="color:white; font-size:16px; margin:0;">${item.title}</h3>
                <span style="background:${color}; color:white; font-size:10px; padding:4px 10px; border-radius:20px; font-weight:bold; letter-spacing:0.5px;">${label}</span>
            </div>
            <p style="color:#94a3b8; font-size:13px; margin-bottom:12px; line-height:1.4;">${item.desc || 'لا يوجد وصف إضافي'}</p>
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#64748b; margin-bottom:15px; background:#0f172a; padding:8px; border-radius:10px;">
                <span>📍 ${item.place || 'تاوريرت'}</span>
                <span>📅 ${item.date}</span>
            </div>
            <div style="display:flex; gap:10px;">
                <a href="tel:${item.phone}" style="flex:3; background:linear-gradient(135deg, ${color}, #000); color:white; text-decoration:none; text-align:center; padding:12px; border-radius:12px; font-weight:bold; display:flex; align-items:center; justify-content:center; gap:8px;">
                    <i class="fas fa-phone-alt"></i> اتصل الآن
                </a>
                <button onclick="removeItem('${item.id}', '${label === 'مفقود' ? 'lost' : 'found'}')" style="flex:1; background:#334155; border:none; color:#94a3b8; border-radius:12px; font-size:12px; cursor:pointer;"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    </div>`;
}

function showLists() {
    const lList = document.getElementById('lostList');
    const fList = document.getElementById('foundList');
    if(lList) lList.innerHTML = lostItems.map(i => renderCard(i, '#ef4444', 'مفقود')).join('');
    if(fList) fList.innerHTML = foundItems.map(i => renderCard(i, '#10b981', 'موجود')).join('');
}

function removeItem(id, type) {
    if(!confirm('هل تريد حذف هذا الإعلان نهائياً؟')) return;
    if(type==='lost') { lostItems = lostItems.filter(i => i.id != id); localStorage.setItem('lost_items', JSON.stringify(lostItems)); }
    else { foundItems = foundItems.filter(i => i.id != id); localStorage.setItem('found_items', JSON.stringify(foundItems)); }
    showLists();
}

function addLost() { saveItem('lost'); }
function addFound() { saveItem('found'); }
function showLostForm() { document.getElementById('lostForm').style.display='block'; document.getElementById('foundForm').style.display='none'; }
function showFoundForm() { document.getElementById('foundForm').style.display='block'; document.getElementById('lostForm').style.display='none'; }

// تشغيل القوائم عند التحميل
showLists();

function toggleLostFound() {
    const content = document.getElementById('lostFoundContent');
    const arrow = document.getElementById('lostArrow');
    if (content) {
        const isVisible = content.style.display === 'block';
        content.style.display = isVisible ? 'none' : 'block';
        if (arrow) arrow.className = isVisible ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
    }
}
