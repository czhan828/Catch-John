// Wiring and UI logic (updated to build weapons UI and switch weapon images)
(function(){
  const canvas = document.getElementById('game');
  const timerEl = document.getElementById('timer');
  const levelNameEl = document.getElementById('levelName');
  const stateEl = document.getElementById('state');
  const restartBtn = document.getElementById('restart');
  const nextBtn = document.getElementById('next');
  const levelsListEl = document.getElementById('levels');
  const weaponsContainer = document.getElementById('weapons');

  // weapon assets (the user mentioned these exist in assets/)
  const WEAPONS = [
    { file: 'llama.png', label: 'Llama' },
    { file: 'pickaxe.png', label: 'Pickaxe' },
    { file: 'pinkgun.png', label: 'Pink Gun' },
    { file: 'valGun.png', label: 'Val Gun' },
    { file: 'GUN.png', label: 'Default Gun' } // include original default as option if present
  ];

  // persistent keys
  const SECRET_KEY = 'catch_john_secret_unlocked';
  const WEAPON_KEY = 'catch_john_selected_weapon';

  function isSecretUnlocked(){
    try { return localStorage.getItem(SECRET_KEY) === '1'; } catch(e) { return false; }
  }
  function setSecretUnlocked(){
    try { localStorage.setItem(SECRET_KEY, '1'); } catch(e) {}
  }
  function getSavedWeapon(){
    try { return localStorage.getItem(WEAPON_KEY); } catch(e) { return null; }
  }

  // create game instance
  const game = new Game(canvas, window.LEVELS, { timerEl, levelNameEl, stateEl });

  // build weapons UI
  function buildWeaponsUI(){
    weaponsContainer.innerHTML = '';
    const saved = getSavedWeapon();
    let initial = saved || WEAPONS[0].file;
    WEAPONS.forEach(w => {
      // only show files that actually exist in assets? We'll display and rely on network errors if missing.
      const div = document.createElement('div');
      div.className = 'weapon';
      div.title = w.label;
      const img = document.createElement('img');
      img.src = `assets/${w.file}`;
      img.alt = w.label;
      div.appendChild(img);

      div.addEventListener('click', () => {
        selectWeapon(w.file);
        // visually mark selection
        Array.from(weaponsContainer.children).forEach(c => c.classList.remove('selected'));
        div.classList.add('selected');
      });

      weaponsContainer.appendChild(div);

      // mark preselected
      if (w.file === initial) div.classList.add('selected');
    });

    // set initial weapon on the game instance
    selectWeapon(initial);
  }

  function selectWeapon(filename){
    if (!filename) return;
    game.setWeapon(filename);
    try { localStorage.setItem(WEAPON_KEY, filename); } catch(e) {}
  }

  // populate level list (hide secret unless unlocked)
  function buildLevelList(){
    levelsListEl.innerHTML = '';
    const unlocked = isSecretUnlocked();
    (window.LEVELS || []).forEach((lvl, idx) => {
      if (lvl.secret && !unlocked) return; // hide secret if locked
      const li = document.createElement('li');
      li.textContent = `${idx+1}. ${lvl.name} — ${lvl.timeSeconds}s`;
      li.style.cursor = 'pointer';
      li.onclick = () => { game.startLevel(idx); };
      levelsListEl.appendChild(li);
    });
    // if secret unlocked, show a small note
    if (unlocked) {
      const note = document.createElement('div');
      note.className = 'small';
      note.style.marginTop = '8px';
      note.textContent = 'Secret boss unlocked!';
      levelsListEl.parentNode.appendChild(note);
    }
  }

  buildLevelList();
  buildWeaponsUI();

  // wire canvas input
  canvas.addEventListener('mousemove', e => {
    game.onMouseMove(e.clientX, e.clientY);
  });
  canvas.addEventListener('click', e => {
    game.onMouseClick(e.clientX, e.clientY);
  });

  // buttons
  restartBtn.addEventListener('click', () => {
    game.restartLevel();
  });
  nextBtn.addEventListener('click', () => {
    game.nextLevel();
  });

  // listen for levelComplete events to unlock secret after level 6 (index 5)
  window.addEventListener('levelComplete', (ev) => {
    const idx = ev && ev.detail && typeof ev.detail.index === 'number' ? ev.detail.index : null;
    // If the player beat level 6 (index 5), unlock the secret boss
    if (idx === 5 && !isSecretUnlocked()) {
      setSecretUnlocked();
      buildLevelList();
      setTimeout(() => {
        alert('Secret unlocked! The boss level is available — ready to fight?');
        const secretIndex = (window.LEVELS || []).findIndex(l => l.secret);
        if (secretIndex >= 0) game.startLevel(secretIndex);
      }, 250);
    }
  });

  // optional: listen for levelFailed if you want to do something
  window.addEventListener('levelFailed', (ev) => {
    // could show retry prompt / record stats
  });

  // start first visible level on load
  window.addEventListener('load', () => {
    const startIdx = (window.LEVELS || []).findIndex(l => !l.secret);
    if (startIdx >= 0) game.startLevel(startIdx);
  });

})();