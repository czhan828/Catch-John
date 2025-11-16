// Core Game class (modified to support level health and emit completion events)
(function(window){
  function Game(canvas, levels, ui) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.levels = levels || [];
    this.ui = ui || {}; // {timerEl, levelNameEl, stateEl}
    this.gunImg = new Image();
    this.gunImg.src = 'assets/GUN.png';
    this.gunLoaded = false;
    this.gunImg.onload = () => { this.gunLoaded = true; };

    this.johnImg = new Image();
    this.johnImg.src = 'assets/THEJOHNPORK.png';
    this.johnLoaded = false;
    this.johnImg.onload = () => { this.johnLoaded = true; };

    this.currentLevelIndex = 0;
    this.resetState();
  }

  Game.prototype.resetState = function(){
    this.john = { x: this.canvas.width/2, y: this.canvas.height/2, r: 36, scale: 1, dead: false, hp: 1 };
    this.mouse = { x: this.canvas.width/2, y: this.canvas.height/2 };
    this.startTime = 0;
    this.timeLeft = 0;
    this.running = false;
    this.lastFrame = 0;
    this._raf = null;
    this._hurtUntil = 0; // for hit flash effect timestamps
  };

  Game.prototype.startLevel = function(index){
    if (index < 0) index = 0;
    if (index >= this.levels.length) index = this.levels.length - 1;
    this.currentLevelIndex = index;
    const lvl = this.levels[index];

    // ensure canvas sizing before positioning
    this.resizeCanvasToDisplaySize();

    this.john = {
      x: this.canvas.width/2,
      y: this.canvas.height/2,
      r: Math.max(28, Math.floor(Math.min(this.canvas.width, this.canvas.height) * 0.035)),
      scale: 1,
      dead: false,
      hp: Math.max(1, lvl.health || 1)
    };
    this.timeLeft = lvl.timeSeconds;
    this.startTime = performance.now();
    this.running = true;
    this.lastFrame = performance.now();
    this.levelStartTime = performance.now();
    this._levelCfg = lvl;

    if (this.ui && this.ui.levelNameEl) this.ui.levelNameEl.textContent = lvl.name;
    if (this.ui && this.ui.stateEl) this.ui.stateEl.textContent = 'Playing';
    if (this.ui && this.ui.timerEl) this.ui.timerEl.textContent = formatTime(lvl.timeSeconds);

    this.randomTeleport();
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(this.loop.bind(this));
  };

  Game.prototype.nextLevel = function(){
    const next = Math.min(this.currentLevelIndex + 1, this.levels.length - 1);
    this.startLevel(next);
  };

  Game.prototype.restartLevel = function(){
    this.startLevel(this.currentLevelIndex);
  };

  Game.prototype.stop = function(){
    this.running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
  };

  Game.prototype.resizeCanvasToDisplaySize = function(){
    const CANVAS = this.canvas;
    const displayWidth  = CANVAS.clientWidth;
    const displayHeight = CANVAS.clientHeight;
    if (CANVAS.width !== displayWidth || CANVAS.height !== displayHeight) {
      CANVAS.width = displayWidth;
      CANVAS.height = displayHeight;
      // clamp positions
      this.john.x = Math.min(this.john.x, CANVAS.width - this.john.r);
      this.john.y = Math.min(this.john.y, CANVAS.height - this.john.r);
      this.mouse.x = Math.min(this.mouse.x, CANVAS.width);
      this.mouse.y = Math.min(this.mouse.y, CANVAS.height);
    }
  };

  function formatTime(sec){
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  Game.prototype.loop = function(now){
    this.resizeCanvasToDisplaySize();
    const dtSeconds = (now - this.lastFrame) / 1000;
    this.lastFrame = now;

    if (this.running && !this.john.dead) {
      const elapsed = (now - this.startTime) / 1000;
      this.timeLeft = Math.max(0, this._levelCfg.timeSeconds - elapsed);
      if (this.ui && this.ui.timerEl) this.ui.timerEl.textContent = formatTime(Math.ceil(this.timeLeft));

      // move John away from mouse
      const d = distance(this.john, this.mouse);
      let vx = 0, vy = 0;
      if (d > 0.1) { vx = (this.john.x - this.mouse.x) / d; vy = (this.john.y - this.mouse.y) / d; }

      // speed calculation: baseSpeed scaled by level multiplier and aggression
      const baseSpeed = Math.max(60, Math.floor(Math.min(this.canvas.width, this.canvas.height) * 0.07));
      const lvlMult = (this._levelCfg.baseSpeedMultiplier || 1);
      const aggression = Math.min(1, (this._levelCfg.timeSeconds - this.timeLeft) / this._levelCfg.timeSeconds);
      // Stronger scaling with level multiplier: John's speed grows with aggression and level multiplier.
      const speed = baseSpeed * lvlMult * (1 + aggression * 1.8);
      this.john.x += vx * speed * dtSeconds;
      this.john.y += vy * speed * dtSeconds;

      // clamp
      this.john.x = Math.max(this.john.r, Math.min(this.canvas.width - this.john.r, this.john.x));
      this.john.y = Math.max(this.john.r, Math.min(this.canvas.height - this.john.r, this.john.y));

      // teleport chance scales with level config and aggression
      const tcBase = this._levelCfg.teleportChanceBase || 0.002;
      const tcAgg = this._levelCfg.teleportChanceAggression || 0.02;
      if (Math.random() < tcBase + tcAgg * aggression) {
        this.randomTeleport();
      }

      // growth in last phase
      if (this.timeLeft <= this._levelCfg.timeSeconds * (this._levelCfg.lastPhasePercent || 0.3)) {
        const t = 1 - (this.timeLeft / (this._levelCfg.timeSeconds * (this._levelCfg.lastPhasePercent || 0.3)));
        this.john.scale = 1 + t * 3;
      }
    }

    // time out
    if (this.running && this.timeLeft <= 0 && !this.john.dead) {
      this.running = false;
      if (this.ui && this.ui.stateEl) this.ui.stateEl.textContent = 'You lose';
      // notify listeners that the level failed
      window.dispatchEvent(new CustomEvent('levelFailed', { detail: { index: this.currentLevelIndex } }));
    }

    this.draw();
    this._raf = requestAnimationFrame(this.loop.bind(this));
  };

  function distance(a,b){
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }

  Game.prototype.randomTeleport = function(){
    const marginX = Math.max(60, Math.floor(this.canvas.width * 0.05));
    const marginY = Math.max(60, Math.floor(this.canvas.height * 0.05));
    this.john.x = Math.random() * (this.canvas.width - marginX*2) + marginX;
    this.john.y = Math.random() * (this.canvas.height - marginY*2) + marginY;
  };

  // click handling with health support
  Game.prototype.onClick = function(clickX, clickY){
    if (!this.running) return;
    // check collision - click coords must already be mapped to canvas pixels
    if (!this.john.dead && distance({x:clickX,y:clickY}, this.john) <= this.john.r * this.john.scale) {
      // if boss has hp > 1, decrement hp first
      this.john.hp = Math.max(0, (this.john.hp || 1) - 1);
      // visual hurt feedback: set timestamp until which a flash is shown
      const hurtMs = (this._levelCfg && this._levelCfg.hurtFlashMs) || 100;
      this._hurtUntil = performance.now() + hurtMs;

      if (this.john.hp > 0) {
        // still alive: optionally give small knockback or audio (left for you to add)
        // small random teleport as a reaction for boss hit (optional)
        if (this._levelCfg && this._levelCfg.health > 1) {
          // small bounce/teleport chance on hit
          if (Math.random() < 0.35) this.randomTeleport();
        }
        return;
      }

      // hp == 0 -> defeated
      this.john.dead = true;
      this.running = false;
      if (this.ui && this.ui.stateEl) this.ui.stateEl.textContent = 'You win!';
      // enlarge effect
      const self = this;
      const enlarge = setInterval(function(){
        self.john.scale += 0.3;
        if (self.john.scale >= 6) clearInterval(enlarge);
      }, 40);

      // dispatch levelComplete event
      window.dispatchEvent(new CustomEvent('levelComplete', { detail: { index: this.currentLevelIndex } }));
    }
  };

  Game.prototype.draw = function(){
    const ctx = this.ctx;
    const CANVAS = this.canvas;
    ctx.clearRect(0,0,CANVAS.width,CANVAS.height);

    // background
    ctx.fillStyle = '#222';
    ctx.fillRect(0,0,CANVAS.width,CANVAS.height);

    // draw john (image or fallback)
    let showHurtOverlay = (performance.now() < (this._hurtUntil || 0));
    if (this.johnLoaded) {
      const baseW = this.john.r * 2;
      const drawW = baseW * this.john.scale;
      const aspect = this.johnImg.width / this.johnImg.height || 1;
      const drawH = drawW / aspect;
      ctx.save();
      ctx.translate(this.john.x - drawW/2, this.john.y - drawH/2);
      ctx.drawImage(this.johnImg, 0, 0, drawW, drawH);
      if (showHurtOverlay) {
        ctx.fillStyle = 'rgba(255,0,0,0.22)';
        ctx.fillRect(0,0,drawW,drawH);
      }
      if (this.john.dead) {
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = Math.max(4, 4 * this.john.scale);
        ctx.beginPath();
        ctx.moveTo(0,0); ctx.lineTo(drawW, drawH);
        ctx.moveTo(drawW,0); ctx.lineTo(0, drawH);
        ctx.stroke();
      } else if (this.john.hp > 1) {
        // draw a subtle HP bar above the boss when it has multiple HP
        const barW = Math.min(CANVAS.width * 0.25, drawW);
        const barH = Math.max(6, Math.floor(barW * 0.07));
        const x = this.john.x - barW/2;
        const y = this.john.y - drawH/2 - 12;
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, barW, barH);
        const hpPct = Math.max(0, (this.john.hp / (this._levelCfg.health || 1)));
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(x + 2, y + 2, Math.max(0, barW - 4) * hpPct, Math.max(0, barH - 4));
      }
      ctx.restore();
    } else {
      ctx.save();
      ctx.translate(this.john.x, this.john.y);
      ctx.scale(this.john.scale, this.john.scale);
      ctx.beginPath();
      ctx.fillStyle = this.john.dead ? '#999' : '#ffd86b';
      ctx.arc(0,0,this.john.r,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    }

    // lose text
    if (!this.running && this.timeLeft <= 0 && !this.john.dead) {
      ctx.fillStyle = '#ff4d4d';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${Math.max(18, Math.floor(CANVAS.width * 0.03))}px 'DM Serif Display', serif`;
      ctx.fillText('Time is up — Tim Cheese is dead (replace with image)', CANVAS.width/2, CANVAS.height/2 + 30);
    }

    // win overlay
    if (!this.running && this.john.dead) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0,0,CANVAS.width, CANVAS.height);
      ctx.fillStyle = '#7CFC00';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${Math.max(24, Math.floor(CANVAS.width * 0.06))}px 'DM Serif Display', serif`;
      ctx.fillText('YOU WIN!', CANVAS.width/2, CANVAS.height/2);
    }

    // draw gun cursor
    if (this.gunLoaded) {
      const gunBaseW = Math.max(36, Math.floor(Math.min(CANVAS.width, CANVAS.height) * 0.04));
      const aspect = this.gunImg.width / this.gunImg.height || 1;
      const gunW = gunBaseW;
      const gunH = gunBaseW / aspect;
      ctx.drawImage(this.gunImg, this.mouse.x - gunW/2, this.mouse.y - gunH/2, gunW, gunH);
    } else {
      ctx.strokeStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(this.mouse.x - 6, this.mouse.y);
      ctx.lineTo(this.mouse.x + 6, this.mouse.y);
      ctx.moveTo(this.mouse.x, this.mouse.y - 6);
      ctx.lineTo(this.mouse.x, this.mouse.y + 6);
      ctx.stroke();
    }
  };

  // map mouse coords (client) to canvas pixel coordinates
  Game.prototype.mapClientToCanvas = function(clientX, clientY){
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (this.canvas.width / rect.width),
      y: (clientY - rect.top)  * (this.canvas.height / rect.height)
    };
  };

  // Input handlers to attach externally
  Game.prototype.onMouseMove = function(clientX, clientY){
    const p = this.mapClientToCanvas(clientX, clientY);
    this.mouse.x = p.x;
    this.mouse.y = p.y;
  };

  Game.prototype.onMouseClick = function(clientX, clientY){
    const p = this.mapClientToCanvas(clientX, clientY);
    this.onClick(p.x, p.y);
  };

  // expose Game
  window.Game = Game;

})(window);