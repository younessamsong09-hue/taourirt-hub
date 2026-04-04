    
        function toggleBlood() {
            let c = document.getElementById('bloodContent');
            let a = document.getElementById('bloodArrow');
            if (c.style.display === 'none') {
                c.style.display = 'block';
                a.className = 'fas fa-chevron-up';
            } else {
                c.style.display = 'none';
                a.className = 'fas fa-chevron-down';
            }
        }
        function toggleLostFound() {
            let c = document.getElementById('lostFoundContent');
            let a = document.getElementById('lostArrow');
            if (c.style.display === 'none') {
                c.style.display = 'block';
                a.className = 'fas fa-chevron-up';
            } else {
                c.style.display = 'none';
                a.className = 'fas fa-chevron-down';
            }
        }
        function toggleJobs() {
            let c = document.getElementById('jobsContent');
            let a = document.getElementById('jobsArrow');
            if (c.style.display === 'none') {
                c.style.display = 'block';
                a.className = 'fas fa-chevron-up';
                if (typeof showJobsList === 'function') showJobsList();
            } else {
                c.style.display = 'none';
                a.className = 'fas fa-chevron-down';
            }
        }
        // تحديث الأعداد
        function updateBloodCount() {
            let donors = JSON.parse(localStorage.getItem('donors')) || [];
            let emergencies = JSON.parse(localStorage.getItem('emergencies')) || [];
            document.getElementById('bloodCount').innerText = donors.length + emergencies.length;
        }
        function updateLostCount() {
            let lost = JSON.parse(localStorage.getItem('lost_items')) || [];
            let found = JSON.parse(localStorage.getItem('found_items')) || [];
            document.getElementById('lostCount').innerText = lost.length + found.length;
        }
        setInterval(() => { updateBloodCount(); updateLostCount(); }, 1000);
        updateBloodCount();
        updateLostCount();
    

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

    
        // مساعد تاوريرت الذكي
        let isOpen = false;
        const btn = document.getElementById('assistantBtn');
        const panel = document.getElementById('assistantPanel');
        const closeBtn = document.getElementById('closeAssistant');
        const sendBtn = document.getElementById('sendBtn');
        const micBtn = document.getElementById('micBtn');
        const input = document.getElementById('assistantInput');
        const messages = document.getElementById('assistantMessages');
        
        if (btn) {
            btn.onclick = () => {
                isOpen = !isOpen;
                panel.style.display = isOpen ? 'flex' : 'none';
            };
        }
        if (closeBtn) {
            closeBtn.onclick = () => {
                panel.style.display = 'none';
                isOpen = false;
            };
        }
        
        function addMessage(text, isUser) {
            const div = document.createElement('div');
            div.style.cssText = `background:${isUser ? '#3b82f6' : '#334155'}; align-self:${isUser ? 'flex-end' : 'flex-start'}; padding:8px 12px; border-radius:15px; max-width:85%; margin-bottom:5px; font-size:13px;`;
            div.innerText = text;
            messages.appendChild(div);
            messages.scrollTop = messages.scrollHeight;
        }
        
        function speak(text) {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'ar-MA';
                utterance.rate = 0.85;
                window.speechSynthesis.speak(utterance);
            }
        }
        
        // إحداثيات الصيدليات
        const pharmacyCoords = {
            'الجابري': [34.41187, -2.89380],
            'تاوريرت': [34.41045, -2.89210],
            'المحطة': [34.41126, -2.89620]
        };
        
        async function sendMessage() {
            const q = input.value.trim();
            if (!q) return;
            addMessage(q, true);
            input.value = '';
            
            let answer = '';
            const lower = q.toLowerCase();
            
            // دلني على الطريق
            if (lower.includes('دلني') || lower.includes('الطريق') || lower.includes('كيفاش نمشي') || lower.includes('وصلني')) {
                let pharmacy = '';
                if (lower.includes('الجابري')) pharmacy = 'الجابري';
                else if (lower.includes('تاوريرت')) pharmacy = 'تاوريرت';
                else if (lower.includes('المحطة')) pharmacy = 'المحطة';
                
                if (pharmacy) {
                    const coords = pharmacyCoords[pharmacy];
                    if (coords && navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((pos) => {
                            const dx = coords[0] - pos.coords.latitude;
                            const dy = coords[1] - pos.coords.longitude;
                            const dist = (Math.sqrt(dx*dx + dy*dy) * 111).toFixed(1);
                            const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'الشمال' : 'الجنوب') : (dy > 0 ? 'الشرق' : 'الغرب');
                            const url = `https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}`;
                            const msg = `صيدلية ${pharmacy} على بعد ${dist} كم فاتجاه ${dir}. ${url}`;
                            addMessage(msg, false);
                            speak(msg);
                        });
                        answer = 'جاري تحديد موقعك...';
                        addMessage(answer, false);
                        speak(answer);
                        return;
                    }
                    answer = `صيدلية ${pharmacy} كاينة فوسط المدينة.`;
                } else {
                    answer = 'شنو الصيدلية اللي بغيتي؟ خاصك تقول "دلني على صيدلية الجابري"';
                }
            }
            // صيدلية الحراسة
            else if (lower.includes('حراسة') || lower.includes('مفتوحة')) {
                answer = 'صيدلية الحراسة دابا هي صيدلية الجابري فشارع مولاي عبد الله. رقم الهاتف: 0536699222';
            }
            // أقرب صيدلية
            else if (lower.includes('أقرب') || lower.includes('قريب')) {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                        let nearest = null;
                        let minDist = 999;
                        for (let [name, coords] of Object.entries(pharmacyCoords)) {
                            const dx = coords[0] - pos.coords.latitude;
                            const dy = coords[1] - pos.coords.longitude;
                            const dist = Math.sqrt(dx*dx + dy*dy) * 111;
                            if (dist < minDist) {
                                minDist = dist;
                                nearest = name;
                            }
                        }
                        if (nearest) {
                            const msg = `أقرب صيدلية ليك هي صيدلية ${nearest} على بعد ${minDist.toFixed(1)} كم.`;
                            addMessage(msg, false);
                            speak(msg);
                        }
                    });
                    answer = 'جاري البحث عن أقرب صيدلية...';
                } else {
                    answer = 'عذراً، متصفحك ما كيدعمش تحديد الموقع.';
                }
            }
            // عدد الصيدليات
            else if (lower.includes('عدد') || lower.includes('كم')) {
                answer = 'تاوريرت فيها 20 صيدلية منتشرة فجميع الأحياء.';
            }
            else {
                answer = 'تقدر تسألني:\n• "دلني على صيدلية الجابري"\n• "شنو هي صيدلية الحراسة?"\n• "أقرب صيدلية ليا"';
            }
            
            if (answer && !answer.includes('جاري')) {
                addMessage(answer, false);
                speak(answer);
            }
        }
        
        function startListening() {
            if (!('webkitSpeechRecognition' in window)) {
                alert('متصفحك لا يدعم التعرف على الصوت');
                return;
            }
            const recognition = new webkitSpeechRecognition();
            recognition.lang = 'ar-MA';
            micBtn.style.background = '#ef4444';
            recognition.start();
            recognition.onresult = (event) => {
                const text = event.results[0][0].transcript;
                input.value = text;
                micBtn.style.background = '#3b82f6';
                sendMessage();
            };
            recognition.onerror = () => {
                micBtn.style.background = '#3b82f6';
                alert('لم أستطع فهم الكلام');
            };
        }
        
        if (sendBtn) sendBtn.onclick = sendMessage;
        if (micBtn) micBtn.onclick = startListening;
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendMessage();
            });
        }
    
    
        // فلتر الصيدليات المفتوحة
        let currentFilter = 'all'; // 'all' or 'open'
        
        // دالة لتحديد إذا كانت الصيدلية مفتوحة الآن
        function isPharmacyOpen(pharmacy) {
            // صيدلية الحراسة (الموجودة في قاعدة البيانات)
            if (pharmacy.is_on_duty) return true;
            
            // يمكن إضافة منطق أوقات العمل هنا لاحقاً
            // حالياً نعتمد على is_on_duty
            
            return false;
        }
        
        // تحديث عرض الصيدليات حسب الفلتر
        function filterPharmacies() {
            let filtered = allPharmacies;
            
            if (currentFilter === 'open') {
                filtered = allPharmacies.filter(p => isPharmacyOpen(p));
            }
            
            // تحديث الخريطة
            updateMap(filtered);
            
            // تحديث قائمة الصيدليات
            const container = document.getElementById('pharmacies-container');
            if (filtered.length === 0) {
                container.innerHTML = '<div class="card" style="text-align:center">📭 لا توجد صيدليات مفتوحة حالياً</div>';
            } else {
                container.innerHTML = filtered.map(p => renderPharmacyCard(p)).join('');
            }
            
            // تحديث العداد
            const pharmCount = document.getElementById('pharmCount');
            if (pharmCount) pharmCount.innerHTML = `(${filtered.length})`;
        }
        
        // ربط أزرار الفلتر
        document.addEventListener('DOMContentLoaded', () => {
            const showAllBtn = document.getElementById('showAllBtn');
            const showOpenBtn = document.getElementById('showOpenBtn');
            
            if (showAllBtn) {
                showAllBtn.onclick = () => {
                    currentFilter = 'all';
                    showAllBtn.classList.add('active');
                    showOpenBtn.classList.remove('active');
                    filterPharmacies();
                };
            }
            
            if (showOpenBtn) {
                showOpenBtn.onclick = () => {
                    currentFilter = 'open';
                    showOpenBtn.classList.add('active');
                    showAllBtn.classList.remove('active');
                    filterPharmacies();
                };
            }
        });
        
        // حفظ الدالة الأصلية
        const originalRenderAll = window.renderAll;
        if (originalRenderAll) {
            window.renderAll = function() {
                originalRenderAll();
                filterPharmacies();
            };
        }
    
    

// Add a global variable for comments
// Stores comments as an object where keys are item IDs and values are arrays of comment objects.
let itemComments = JSON.parse(localStorage.getItem('item_comments')) || {};

// Function to toggle comments section visibility and load/render comments
function toggleComments(itemId) {
    const commentsSection = document.getElementById(`comments-section-${itemId}`);
    if (!commentsSection) return;

    if (commentsSection.style.display === 'none' || commentsSection.style.display === '') {
        commentsSection.style.display = 'block';
        renderComments(itemId); // Render comments when showing the section
    } else {
        commentsSection.style.display = 'none';
    }
}

// Function to render comments for a specific item ID
function renderComments(itemId) {
    const commentsSection = document.getElementById(`comments-section-${itemId}`);
    if (!commentsSection) return;

    const comments = itemComments[itemId] || [];
    let commentsHtml = `<div class="comment-list">`;

    if (comments.length === 0) {
        commentsHtml += `<div class="no-comments">لا توجد تعليقات بعد.</div>`;
    } else {
        comments.forEach(comment => {
            commentsHtml += `
                <div class="comment-item">
                    <span class="comment-text">${comment.text}</span>
                    <span class="comment-meta"> - ${comment.date}</span>
                </div>
            `;
        });
    }
    commentsHtml += `</div>`; // End comment-list

    commentsHtml += `
        <div class="comment-input-container">
            <input type="text" id="comment-input-${itemId}" class="comment-input" placeholder="اكتب تعليقك...">
            <button class="comment-post-button" onclick="addComment(${itemId})">نشر</button>
        </div>
    `;

    commentsSection.innerHTML = commentsHtml;
}

// Function to add a new comment to an item
function addComment(itemId) {
    const commentInput = document.getElementById(`comment-input-${itemId}`);
    if (!commentInput) return;

    const commentText = commentInput.value.trim();
    if (commentText === '') {
        alert('التعليق لا يمكن أن يكون فارغاً.');
        return;
    }

    if (!itemComments[itemId]) {
        itemComments[itemId] = [];
    }

    const newComment = {
        text: commentText,
        date: new Date().toLocaleDateString('ar-MA', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };

    itemComments[itemId].unshift(newComment); // Add to the beginning (most recent first)
    localStorage.setItem('item_comments', JSON.stringify(itemComments));

    commentInput.value = ''; // Clear the input field
    renderComments(itemId); // Re-render comments for the item to show the new comment
}


// CSS for comments system. This should be added to your <style> block in the HTML or a separate CSS file.
/*
.comment-section {
    background-color: #f9f9f9;
    border-top: 1px solid #eee;
    padding: 10px;
    margin-top: 10px;
    border-radius: 5px;
}

.comment-list {
    max-height: 150px; /* Limit height and enable scrolling */
    overflow-y: auto;
    margin-bottom: 10px;
    padding-right: 5px; /* For scrollbar spacing */
}

.comment-item {
    background-color: #fff;
    border: 1px solid #ddd;
    padding: 8px;
    margin-bottom: 5px;
    border-radius: 4px;
    font-size: 0.9em;
    display: flex;
    flex-direction: column;
}

.comment-text {
    font-weight: bold;
    color: #333;
}

.comment-meta {
    color: #777;
    font-size: 0.8em;
    align-self: flex-end; /* Puts date/time on the right */
}

.no-comments {
    color: #888;
    text-align: center;
    padding: 10px;
}

.comment-input-container {
    display: flex;
    gap: 5px;
    margin-top: 10px;
}

.comment-input {
    flex-grow: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.comment-post-button {
    background-color: #007bff; /* Example blue color */
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    white-space: nowrap; /* Prevent button text from wrapping */
}

.comment-post-button:hover {
    background-color: #0056b3; /* Darker blue on hover */
}

/* Optional: style for a generic icon button if not already defined */
.icon-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2em; /* Adjust size as needed */
    padding: 0 5px;
    color: inherit; /* Use parent text color */
}
.icon-button:hover {
    opacity: 0.7;
}
*/

// ========== أيقونة التبليغ ==========
let reportsFloat = JSON.parse(localStorage.getItem('city_reports')) || [];
let currentReportType = '';
let userLat = null, userLng = null;

function toggleReportFloat() {
    let p = document.getElementById('reportFloatPanel');
    p.style.display = p.style.display === 'none' ? 'block' : 'none';
    showReportFloatList();
}

function getReportLocationFloat() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                userLat = pos.coords.latitude;
                userLng = pos.coords.longitude;
                document.getElementById('reportFloatLocation').innerHTML = `📍 ${userLat.toFixed(4)}, ${userLng.toFixed(4)}`;
            },
            () => { document.getElementById('reportFloatLocation').innerHTML = '⚠️ لم نتمكن'; }
        );
    }
}

function startReportFloat(type) {
    currentReportType = type;
    document.getElementById('reportFloatForm').style.display = 'block';
    getReportLocationFloat();
}

function addReportFloat() {
    let desc = document.getElementById('reportFloatDesc').value.trim();
    if (!desc) { alert('اكتب الوصف'); return; }
    let newReport = { id: Date.now(), type: currentReportType, desc: desc, lat: userLat, lng: userLng, date: new Date().toLocaleString('ar-MA'), status: 'pending' };
    let img = document.getElementById('reportFloatImage').files[0];
    if (img) {
        let reader = new FileReader();
        reader.onload = function(e) {
            newReport.image = e.target.result;
            reportsFloat.unshift(newReport);
            localStorage.setItem('city_reports', JSON.stringify(reportsFloat));
            showReportFloatList();
            clearReportFloat();
            alert('تم الإرسال');
        };
        reader.readAsDataURL(img);
    } else {
        reportsFloat.unshift(newReport);
        localStorage.setItem('city_reports', JSON.stringify(reportsFloat));
        showReportFloatList();
        clearReportFloat();
        alert('تم الإرسال');
    }
}

function clearReportFloat() {
    document.getElementById('reportFloatDesc').value = '';
    document.getElementById('reportFloatImage').value = '';
    document.getElementById('reportFloatForm').style.display = 'none';
}

function showReportFloatList() {
    let c = document.getElementById('reportFloatList');
    if (!c) return;
    if (reportsFloat.length === 0) { c.innerHTML = '<div class="card">📭 لا بلاغات</div>'; return; }
    let typeIcon = { 'pothole': '🕳️', 'light': '💡', 'garbage': '🗑️' };
    c.innerHTML = reportsFloat.slice(0, 3).map(r => `
        <div class="float-item"><span>${typeIcon[r.type]} ${r.desc.substring(0, 30)}</span><a href="https://www.google.com/maps?q=${r.lat},${r.lng}" target="_blank">🗺️</a></div>
    `).join('');
}

// ========== أيقونة الكراء ==========
let rentalsFloat = JSON.parse(localStorage.getItem('rentals')) || [];
let currentRentalType = '';

function toggleRentalFloat() {
    let p = document.getElementById('rentalFloatPanel');
    p.style.display = p.style.display === 'none' ? 'block' : 'none';
    showRentalFloatList();
}

function showRentalFloatForm(type) {
    currentRentalType = type;
    document.getElementById('rentalFloatForm').style.display = 'block';
}

function addRentalFloat() {
    let title = document.getElementById('rentalFloatTitle').value.trim();
    let desc = document.getElementById('rentalFloatDesc').value.trim();
    let price = document.getElementById('rentalFloatPrice').value.trim();
    let neighborhood = document.getElementById('rentalFloatNeighborhood').value;
    let phone = document.getElementById('rentalFloatPhone').value.trim();
    if (!title || !desc || !price || !neighborhood || !phone) { alert('املأ الحقول'); return; }
    let newRental = { id: Date.now(), type: currentRentalType, title: title, desc: desc, price: price, neighborhood: neighborhood, phone: phone, date: new Date().toLocaleDateString('ar-MA') };
    let img = document.getElementById('rentalFloatImage').files[0];
    if (img) {
        let reader = new FileReader();
        reader.onload = function(e) {
            newRental.image = e.target.result;
            rentalsFloat.unshift(newRental);
            localStorage.setItem('rentals', JSON.stringify(rentalsFloat));
            showRentalFloatList();
            clearRentalFloat();
            alert('تم النشر');
        };
        reader.readAsDataURL(img);
    } else {
        rentalsFloat.unshift(newRental);
        localStorage.setItem('rentals', JSON.stringify(rentalsFloat));
        showRentalFloatList();
        clearRentalFloat();
        alert('تم النشر');
    }
}

function clearRentalFloat() {
    document.getElementById('rentalFloatTitle').value = '';
    document.getElementById('rentalFloatDesc').value = '';
    document.getElementById('rentalFloatPrice').value = '';
    document.getElementById('rentalFloatNeighborhood').value = '';
    document.getElementById('rentalFloatPhone').value = '';
    document.getElementById('rentalFloatImage').value = '';
    document.getElementById('rentalFloatForm').style.display = 'none';
}

function showRentalFloatList() {
    let c = document.getElementById('rentalFloatList');
    if (!c) return;
    let filter = document.getElementById('filterFloatType').value;
    let filtered = rentalsFloat.filter(r => filter === 'all' || r.type === filter);
    if (filtered.length === 0) { c.innerHTML = '<div class="card">📭 لا إعلانات</div>'; return; }
    let typeName = { 'rent': '🏠', 'sale': '💰', 'land': '🌾' };
    
    // --- START OF MODIFIED SECTION FOR COMMENTS ---
    c.innerHTML = filtered.slice(0, 5).map(r => `
        <div class="float-item">
            <span>${typeName[r.type]} ${r.title}</span>
            <a href="tel:${r.phone}">📞</a>
            <button class="icon-button" onclick="toggleComments(${r.id})">💬</button> 
            <div id="comments-section-${r.id}" class="comment-section" style="display:none;"></div>
        </div>
    `).join('');
    // --- END OF MODIFIED SECTION FOR COMMENTS ---
}

showReportFloatList();
showRentalFloatList();