// Wiring and UI logic (unchanged, provided for completeness)
(function(){
  const canvas = document.getElementById('game');
  const timerEl = document.getElementById('timer');
  const levelNameEl = document.getElementById('levelName');
  const stateEl = document.getElementById('state');
  const restartBtn = document.getElementById('restart');
  const nextBtn = document.getElementById('next');
  const levelsListEl = document.getElementById('levels');

  // create game instance
  const game = new Game(canvas, window.LEVELS, { timerEl, levelNameEl, stateEl });

  // populate level list
  function buildLevelList(){
    levelsListEl.innerHTML = '';
    (window.LEVELS || []).forEach((lvl, idx) => {
      const li = document.createElement('li');
      li.textContent = `${idx+1}. ${lvl.name} — ${lvl.timeSeconds}s`;
      li.style.cursor = 'pointer';
      li.onclick = () => { game.startLevel(idx); };
      levelsListEl.appendChild(li);
    });
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

  // start first level on load
  window.addEventListener('load', () => {
    if ((window.LEVELS || []).length > 0) game.startLevel(0);
  });

})();