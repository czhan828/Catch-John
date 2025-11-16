// Wiring and UI logic (updated to hide/show secret and unlock it on levelComplete)
(function(){
  const canvas = document.getElementById('game');
  const timerEl = document.getElementById('timer');
  const levelNameEl = document.getElementById('levelName');
  const stateEl = document.getElementById('state');
  const restartBtn = document.getElementById('restart');
  const nextBtn = document.getElementById('next');
  const levelsListEl = document.getElementById('levels');

  // read persistent unlock flag
  const SECRET_KEY = 'catch_john_secret_unlocked';
  function isSecretUnlocked(){
    try { return localStorage.getItem(SECRET_KEY) === '1'; } catch(e) { return false; }
  }
  function setSecretUnlocked(){
    try { localStorage.setItem(SECRET_KEY, '1'); } catch(e) {}
  }

  // create game instance
  const game = new Game(canvas, window.LEVELS, { timerEl, levelNameEl, stateEl });

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
      // give player an immediate choice: auto-start secret or show a message
      // simple alert then auto-start
      setTimeout(() => {
        alert('Secret unlocked! The boss level is available — ready to fight?');
        // find secret level index
        const secretIndex = (window.LEVELS || []).findIndex(l => l.secret);
        if (secretIndex >= 0) game.startLevel(secretIndex);
      }, 250);
    }
  });

  // optional: listen for levelFailed if you want to do something
  window.addEventListener('levelFailed', (ev) => {
    // could show retry prompt / record stats
    // console.log('Level failed:', ev && ev.detail && ev.detail.index);
  });

  // start first visible level on load
  window.addEventListener('load', () => {
    // start the first non-secret level
    const startIdx = (window.LEVELS || []).findIndex(l => !l.secret);
    if (startIdx >= 0) game.startLevel(startIdx);
  });

})();