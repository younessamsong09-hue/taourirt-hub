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
    </script>
<style>
    .social-feed { max-height: 450px; overflow-y: auto; padding: 5px; }
    .card-pothole { border-right: 5px solid #ff4757; background: #1a1a1a; }
    .card-light { border-right: 5px solid #f1c40f; background: #1a1a1a; }
