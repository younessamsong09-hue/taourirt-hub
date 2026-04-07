import { fetchPharmacies, getNeighborhoods, filterByNeighborhood, filterBySearch, getOpenCount, renderPharmaciesList, initMap } from './modules/pharmacies.js';

let allPharmacies = [];
let currentNeighborhood = 'الكل';
let currentSearch = '';
let map;

async function load() {
  allPharmacies = await fetchPharmacies();
  updateUI();
}

function updateUI() {
  let filtered = filterByNeighborhood(allPharmacies, currentNeighborhood);
  filtered = filterBySearch(filtered, currentSearch);
  document.getElementById('stat-pharmacies').innerText = allPharmacies.length;
  document.getElementById('openCount').innerText = getOpenCount(filtered);
  renderPharmaciesList(filtered, 'pharmaciesList');
  if (map) map.remove();
  map = initMap(filtered, 'map');
  renderNeighborhoodFilters();
}

async function renderNeighborhoodFilters() {
  const hoods = ['الكل', ...await getNeighborhoods(allPharmacies)];
  const container = document.getElementById('neighborhoodFilters');
  container.innerHTML = hoods.map(hood => `
    <button class="filter-btn ${hood === currentNeighborhood ? 'active' : ''}" data-hood="${hood}">${hood}</button>
  `).join('');
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentNeighborhood = btn.dataset.hood;
      updateUI();
    });
  });
}

document.getElementById('searchInput').addEventListener('input', (e) => {
  currentSearch = e.target.value;
  updateUI();
});

// أزرار الإجراءات السريعة
document.getElementById('bloodBtn').onclick = () => alert('قريباً');
document.getElementById('lostBtn').onclick = () => alert('قريباً');
document.getElementById('jobsBtn').onclick = () => alert('قريباً');

load();
