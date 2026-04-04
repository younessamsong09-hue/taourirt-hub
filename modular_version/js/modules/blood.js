        function toggleBlood() {
            let c = document.getElementById('bloodContent');
            let a = document.getElementById('bloodArrow');
        function updateBloodCount() {
            document.getElementById('bloodCount').innerText = donors.length + emergencies.length;
        setInterval(() => { updateBloodCount(); updateLostCount(); }, 1000);
        updateBloodCount();
