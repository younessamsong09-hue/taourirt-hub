            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendMessage();
            });
        }
    </script>
    <script>
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
    </script>
    <!-- أيقونة التبليغ العائمة -->
    <div id="reportFloatBtn" class="float-btn report-float" onclick="toggleReportFloat()">
        <i class="fas fa-exclamation-triangle"></i>
    </div>
    <div id="reportFloatPanel" class="float-panel" style="display:none;">
        <div class="float-header">
            <span>تبليغ عن مشكلة</span>
            <span onclick="toggleReportFloat()" style="cursor:pointer;">✖</span>
        </div>
        <div class="float-buttons">
            <button onclick="startReportFloat('pothole')">🕳️ حفرة</button>
            <button onclick="startReportFloat('light')">💡 إنارة</button>
            <button onclick="startReportFloat('garbage')">🗑️ نفايات</button>
        </div>
        <div id="reportFloatForm" style="display:none;">
            <textarea id="reportFloatDesc" rows="2" placeholder="الوصف" class="float-input"></textarea>
            <label class="btn-cam" for="reportFloatImage">📷 إرفاق صورة للمشكلة</label><input type="file" id="reportFloatImage" accept="image/*" style="display:none" onchange="previewImage(this)"><img id="reportImgPreview" style="display:none; border-radius:8px; margin-bottom:10px;">
            <div id="reportFloatLocation" class="float-location"></div>
            <button onclick="addReportFloat()" class="float-submit">إرسال</button>
        </div>
        <div id="reportFloatList"></div>
    </div>

    <!-- أيقونة الكراء العائمة -->
    <div id="rentalFloatBtn" class="float-btn rental-float" onclick="toggleRentalFloat()">
        <i class="fas fa-home"></i>
    </div>
    <div id="rentalFloatPanel" class="float-panel" style="display:none;">
        <div class="float-header">
            <span>كراء وعقارات</span>
            <span onclick="toggleRentalFloat()" style="cursor:pointer;">✖</span>
        </div>
        <div class="float-buttons">
            <button onclick="showRentalFloatForm('rent')">🏠 للكراء</button>
            <button onclick="showRentalFloatForm('sale')">💰 للبيع</button>
            <button onclick="showRentalFloatForm('land')">🌾 أرض</button>
        </div>
        <div id="rentalFloatForm" style="display:none;">
            <input type="text" id="rentalFloatTitle" placeholder="العنوان" class="float-input">
            <textarea id="rentalFloatDesc" rows="2" placeholder="الوصف" class="float-input"></textarea>
            <input type="text" id="rentalFloatPrice" placeholder="السعر" class="float-input">
            <select id="rentalFloatNeighborhood" class="float-input">
                <option>الحي</option><option>وسط المدينة</option><option>حي المسيرة</option>
                <option>حي السلام</option><option>حي التعاون</option>
            </select>
            <input type="tel" id="rentalFloatPhone" placeholder="الهاتف" class="float-input">
            <label class="btn-cam" for="reportFloatImage">📷 إرفاق صورة للمشكلة</label><input type="file" id="reportFloatImage" accept="image/*" style="display:none" onchange="previewImage(this)"><img id="reportImgPreview" style="display:none; border-radius:8px; margin-bottom:10px;">
            <button onclick="addRentalFloat()" class="float-submit">نشر</button>
