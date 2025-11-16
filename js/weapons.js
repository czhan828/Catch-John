// weapons.js
// Configure these filenames to match files in your assets folder.
const weapons = [
  { id: 'pinkgun', file: 'assets/pinkgun.png', label: 'Pink Gun' },
  { id: 'llama', file: 'assets/llama.png', label: 'Fortnite Llama Pickaxe' },
  { id: 'valGun', file: 'assets/valGun.png', label: 'Valorant Gun' },
  { id: 'pickaxe', file: 'assets/pickaxe.png', label: 'Minecraft Pickaxe' },
];

let selectedWeapon = null;

function renderArsenal() {
  const container = document.getElementById('arsenal');
  container.innerHTML = '';
  weapons.forEach(w => {
    const el = document.createElement('div');
    el.className = 'weapon';
    el.tabIndex = 0;
    el.dataset.weaponId = w.id;
    el.innerHTML = `
      <img src="${w.file}" alt="${w.label}">
      <div class="weapon-label">${w.label}</div>
    `;
    el.addEventListener('click', () => selectWeapon(w.id));
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') selectWeapon(w.id); });
    container.appendChild(el);
  });
}

function selectWeapon(id) {
  const prev = document.querySelector('.weapon.selected');
  if (prev) prev.classList.remove('selected');

  const el = document.querySelector(`.weapon[data-weapon-id="${id}"]`);
  if (!el) return;

  el.classList.add('selected');

  const weapon = weapons.find(w => w.id === id);
  selectedWeapon = weapon;

  const previewImg = document.getElementById('weaponPreview');
  const selectedName = document.getElementById('selectedName');
  previewImg.src = weapon.file;
  previewImg.alt = weapon.label;
  selectedName.textContent = weapon.label;

  // Hook for your game: dispatch an event so game code can react
  window.dispatchEvent(new CustomEvent('weapon:selected', { detail: weapon }));
}

function getSelectedWeapon() {
  return selectedWeapon;
}

// init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  renderArsenal();
  // choose a default (first) weapon
  if (weapons.length) selectWeapon(weapons[0].id);
});