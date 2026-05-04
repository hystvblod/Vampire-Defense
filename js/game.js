(function () {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const coinsText = document.getElementById("coinsText");
  const baseText = document.getElementById("baseText");
  const endCard = document.getElementById("endCard");
  const buildTowerBtn = document.getElementById("buildTowerBtn");
  const upgradeBaseBtn = document.getElementById("upgradeBaseBtn");
  const waveBtn = document.getElementById("waveBtn");
  const installBtn = document.getElementById("installBtn");
  const continueBtn = document.getElementById("continueBtn");
  const homeView = document.getElementById("homeView");
  const gameView = document.getElementById("gameView");
  const panelView = document.getElementById("panelView");
  const panelTitle = document.getElementById("panelTitle");
  const panelContent = document.getElementById("panelContent");
  const closePanelBtn = document.getElementById("closePanelBtn");
  const playHomeBtn = document.getElementById("playHomeBtn");
  const contextUpgradeBtn = document.getElementById("contextUpgradeBtn");
  let currentUpgradeTarget = null;

  const DPR = Math.min(2, window.devicePixelRatio || 1);
  const world = { w: 3000, h: 3000 };
  const camera = { x: 0, y: 0, shake: 0 };

  const player = {
    x: world.w / 2,
    y: world.h / 2 + 210,
    r: 22,
    speed: 4.35,
    angle: -Math.PI / 2,
    direction: "down",
    anim: 0,
    attackCooldown: 0,
    attackAnim: 0,
    moving: false
  };

  const base = { x: world.w / 2, y: world.h / 2, r: 90, hp: 140, maxHp: 140, level: 1, pulse: 0 };

  let target = { x: player.x, y: player.y };
  let fingerDown = false;
  const state = { screen:"home", coins:120, wave:1, currentUniverseId:"forest", unlockedTowers:{crossbow:true,fire:true,holy:true,garlic:false}, fragments:0, noAds:false, playerHp:120, playerMaxHp:120, superTowerUntil:0 };
  let time = 0;

  const images = {};
  const enemies = [];
  const deathFx = [];
  const towers = [];
  const drops = [];
  const projectiles = [];
  const particles = [];
  const texts = [];
  const slashes = [];

  const propLayout = [
    { key: "treeDead01", x: 710, y: 650, w: 130, h: 150 },
    { key: "treeDead02", x: 2300, y: 690, w: 140, h: 165 },
    { key: "treeDead01", x: 640, y: 2130, w: 130, h: 150 },
    { key: "treeDead02", x: 2380, y: 2240, w: 140, h: 165 },
    { key: "rockDark01", x: 1050, y: 900, w: 110, h: 82 },
    { key: "rockDark01", x: 2120, y: 1900, w: 120, h: 88 },
    { key: "tombstone01", x: 1150, y: 2210, w: 78, h: 95 },
    { key: "tombstone01", x: 1980, y: 790, w: 78, h: 95 },
    { key: "fenceBroken01", x: 875, y: 1580, w: 180, h: 85 },
    { key: "fenceBroken01", x: 2170, y: 1420, w: 180, h: 85 },
    { key: "ruinWall01", x: 1160, y: 1150, w: 175, h: 130 },
    { key: "ruinWall01", x: 1910, y: 1830, w: 180, h: 135 },
    { key: "lampPost01", x: 1280, y: 1320, w: 70, h: 130 },
    { key: "lampPost01", x: 1720, y: 1660, w: 70, h: 130 }
  ];

  function loadImage(key, src) {
    const img = new Image();
    img.onload = () => { img.ready = true; };
    img.onerror = () => { img.ready = false; };
    img.src = src;
    images[key] = img;
  }

  function loadAssets() {
    const A = window.VAMPIRE_ASSETS;
    loadImage("map", A.map);
    Object.keys(A.props).forEach(k => loadImage(k, A.props[k]));
    loadImage("playerIdle", A.player.idle);
    loadImage("playerDown", A.player.walkDown);
    loadImage("playerUp", A.player.walkUp);
    loadImage("playerSide", A.player.walkSide);
    loadImage("playerAttack", A.player.attack);
    loadImage("vampireBasicWalk", A.enemies.basicWalk);
    loadImage("vampireBasicAttack", A.enemies.basicAttack);
    loadImage("vampireBasicDeath", A.enemies.basicDeath);
    loadImage("vampireFastWalk", A.enemies.fastWalk);
    loadImage("vampireTankWalk", A.enemies.tankWalk);
    loadImage("base1", A.base.level01);
    loadImage("base2", A.base.level02);
    loadImage("base3", A.base.level03);
    loadImage("towerCrossbow1", A.towers.crossbow01);
    loadImage("towerCrossbow2", A.towers.crossbow02);
    loadImage("towerFire1", A.towers.fire01);
    loadImage("towerHoly1", A.towers.holy01);
    loadImage("coin", A.fx.coin);
    loadImage("hitSlash", A.fx.hitSlash);
    loadImage("darkSmoke", A.fx.darkSmoke);
    loadImage("arrow", A.fx.arrow);
    loadImage("fireball", A.fx.fireball);
    loadImage("buttonMain", A.ui.buttonMain);
  }

  function resize() {
    canvas.width = Math.floor(window.innerWidth * DPR);
    canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  function screenToWorld(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return { x: clientX - rect.left + camera.x, y: clientY - rect.top + camera.y };
  }

  function updateHUD() {
    coinsText.textContent = state.coins;
    baseText.textContent = "Base " + Math.max(0, Math.round((base.hp / base.maxHp) * 100)) + "%";
  }

  function addText(x, y, value, color = "#fff") { texts.push({ x, y, value, color, life: 62 }); }

  function addParticles(x, y, amount, color, smoke) {
    for (let i = 0; i < amount; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = Math.random() * 2.8 + 0.45;
      particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color, smoke: !!smoke, size: smoke ? 24 + Math.random() * 20 : 3 + Math.random() * 2, life: 26 + Math.random() * 24 });
    }
  }

  function spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    if (side === 0) { x = Math.random() * world.w; y = -110; }
    if (side === 1) { x = world.w + 110; y = Math.random() * world.h; }
    if (side === 2) { x = Math.random() * world.w; y = world.h + 110; }
    if (side === 3) { x = -110; y = Math.random() * world.h; }

    const roll = Math.random();
    const kind = roll < 0.18 ? "tank" : roll > 0.72 ? "fast" : "basic";
    const hp = kind === "tank" ? 92 + wave * 9 : kind === "fast" ? 34 + wave * 5 : 52 + wave * 6;
    enemies.push({ x, y, r: kind === "tank" ? 27 : kind === "fast" ? 17 : 21, hp, maxHp: hp, speed: kind === "tank" ? .78 : kind === "fast" ? 1.72 : 1.12, dmg: kind === "tank" ? .34 : kind === "fast" ? .18 : .24, kind, anim: Math.random() * 10, hit: 0, attacking: 0, slow: 0 });
  }

  function spawnWave() {
    addText(base.x, base.y - 135, "Vague " + state.wave, "#ffd84b");
    for (let i = 0; i < 6 + state.wave * 2; i++) setTimeout(spawnEnemy, i * 105);
    state.wave++;
  }

  function killEnemy(enemy, index) {
    const value = enemy.kind === "tank" ? 20 : enemy.kind === "fast" ? 10 : 13;
    deathFx.push({ x: enemy.x, y: enemy.y, kind: enemy.kind, anim: 0, life: 26 });
    drops.push({ x: enemy.x, y: enemy.y, r: 10, value, life: 640, magnet: false, anim: Math.random() * 6 });
    addParticles(enemy.x, enemy.y, 13, "#9c55ff", true);
    addText(enemy.x, enemy.y - 24, "+" + value, "#ffd84b");
    camera.shake = Math.max(camera.shake, 5);
    enemies.splice(index, 1);
  }

  function tryBuildTower() {
    if (state.coins < GAME_BALANCE.economy.buildTowerCost) { addText(player.x, player.y - 45, "Pas assez", "#ff7084"); return; }
    if (Math.hypot(player.x - base.x, player.y - base.y) < 140) { addText(player.x, player.y - 45, "Trop près", "#ff7084"); return; }
    for (const t of towers) if (Math.hypot(t.x - player.x, t.y - player.y) < 96) { addText(player.x, player.y - 45, "Déjà une tour", "#ff7084"); return; }

    const count = towers.length % 3;
    const type = count === 0 ? "crossbow" : count === 1 ? "fire" : "holy";
    state.coins -= GAME_BALANCE.economy.buildTowerCost;
    towers.push({ x: player.x, y: player.y, type, range: type === "holy" ? 230 : 275, cooldown: 0, dmg: type === "fire" ? 30 : type === "holy" ? 18 : 24, level: type === "crossbow" && towers.length > 2 ? 2 : 1, anim: 0 });
    addParticles(player.x, player.y, 24, "#ffd84b", false);
    addText(player.x, player.y - 48, type === "fire" ? "Tour feu" : type === "holy" ? "Tour sacrée" : "Arbalète", "#fff");
    updateHUD();
  }

  function upgradeBase() {
    if (state.coins < GAME_BALANCE.economy.baseUpgradeCosts[base.level+1]) { addText(base.x, base.y - 125, "Pas assez", "#ff7084"); return; }
    state.coins -= GAME_BALANCE.economy.baseUpgradeCosts[base.level+1] || 0;
    base.level = Math.min(3, base.level + 1);
    base.maxHp += 45;
    base.hp = base.maxHp;
    base.r += 8;
    camera.shake = 7;
    addParticles(base.x, base.y, 34, "#ffd84b", false);
    addText(base.x, base.y - 130, "Base niv. " + base.level, "#ffd84b");
    updateHUD();
  }

  function updatePlayer() {
    const dx = target.x - player.x, dy = target.y - player.y;
    const d = Math.hypot(dx, dy);
    player.moving = d > 8;
    if (player.moving) {
      const nx = dx / d, ny = dy / d;
      player.x = clamp(player.x + nx * player.speed, 80, world.w - 80);
      player.y = clamp(player.y + ny * player.speed, 80, world.h - 80);
      player.angle = Math.atan2(ny, nx);
      player.anim += .25;
      if (Math.abs(nx) > Math.abs(ny)) player.direction = nx > 0 ? "right" : "left";
      else player.direction = ny > 0 ? "down" : "up";
    } else {
      player.anim += .055;
    }

    player.attackCooldown = Math.max(0, player.attackCooldown - 1);
    player.attackAnim = Math.max(0, player.attackAnim - 1);
    if (player.attackCooldown <= 0) {
      let bestIndex = -1, bestD = 100;
      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        const dd = Math.hypot(e.x - player.x, e.y - player.y);
        if (dd < bestD) { bestD = dd; bestIndex = i; }
      }
      if (bestIndex >= 0) {
        const e = enemies[bestIndex];
        e.hp -= 25;
        e.hit = 8;
        player.attackCooldown = 19;
        player.attackAnim = 12;
        slashes.push({ x: e.x, y: e.y, angle: player.angle, life: 13 });
        addParticles(e.x, e.y, 6, "#ff4a64", false);
        if (e.hp <= 0) killEnemy(e, bestIndex);
      }
    }
  }

  function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      e.anim += .11;
      e.hit = Math.max(0, e.hit - 1);
      e.slow = Math.max(0, e.slow - 1);
      const targetObj = dist(e, player) < 225 ? player : base;
      const dx = targetObj.x - e.x, dy = targetObj.y - e.y;
      const d = Math.hypot(dx, dy);
      const stop = targetObj === base ? base.r + e.r - 8 : player.r + e.r + 2;
      if (d > stop) {
        const slowFactor = e.slow > 0 ? .55 : 1;
        e.x += (dx / d) * e.speed * slowFactor;
        e.y += (dy / d) * e.speed * slowFactor;
        e.attacking = 0;
      } else {
        e.attacking = 1;
        if (targetObj === base) {
          base.hp -= e.dmg;
          base.pulse = 12;
          if (Math.random() < .08) addParticles(base.x + (Math.random() - .5) * base.r, base.y + (Math.random() - .5) * base.r, 1, "#ff4a64", false);
        }
      }
      if (base.hp <= 0) { base.hp = 0; showEndCard(); }
    }
  }

  function updateTowers() {
    for (const t of towers) {
      t.anim += .08;
      t.cooldown = Math.max(0, t.cooldown - 1);
      if (t.cooldown > 0) continue;
      let best = null, bestD = t.range;
      for (const e of enemies) {
        const d = Math.hypot(e.x - t.x, e.y - t.y);
        if (d < bestD) { best = e; bestD = d; }
      }
      if (best) {
        const fire = t.type === "fire";
        const holy = t.type === "holy";
        projectiles.push({ x: t.x, y: t.y - 24, target: best, speed: fire ? 7.5 : 9.5, dmg: t.dmg, type: t.type, life: 120 });
        if (holy) best.slow = 60;
        t.cooldown = fire ? 55 : holy ? 68 : 38;
      }
    }
  }

  function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.life--;
      if (!enemies.includes(p.target) || p.life <= 0) { projectiles.splice(i, 1); continue; }
      const dx = p.target.x - p.x, dy = p.target.y - p.y;
      const d = Math.hypot(dx, dy);
      if (d < 14) {
        const e = p.target;
        e.hp -= p.dmg;
        e.hit = 8;
        addParticles(e.x, e.y, p.type === "fire" ? 14 : 8, p.type === "fire" ? "#ff9a2e" : "#ff4a64", p.type === "fire");
        const idx = enemies.indexOf(e);
        if (e.hp <= 0 && idx >= 0) killEnemy(e, idx);
        projectiles.splice(i, 1);
      } else {
        p.x += (dx / d) * p.speed;
        p.y += (dy / d) * p.speed;
      }
    }
  }

  function updateDrops() {
    for (let i = drops.length - 1; i >= 0; i--) {
      const c = drops[i];
      c.life--; c.anim += .12;
      const d = Math.hypot(c.x - player.x, c.y - player.y);
      if (d < 150) c.magnet = true;
      if (c.magnet) { c.x += (player.x - c.x) * .09; c.y += (player.y - c.y) * .09; }
      if (d < player.r + 16) {
        state.coins += c.value;
        addParticles(c.x, c.y, 10, "#ffd84b", false);
        drops.splice(i, 1);
        updateHUD();
      } else if (c.life <= 0) drops.splice(i, 1);
    }
  }

  function updateFx() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.vx *= .94; p.vy *= .94; p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }
    for (let i = texts.length - 1; i >= 0; i--) { const t = texts[i]; t.y -= .55; t.life--; if (t.life <= 0) texts.splice(i, 1); }
    for (let i = slashes.length - 1; i >= 0; i--) { slashes[i].life--; if (slashes[i].life <= 0) slashes.splice(i, 1); }
    for (let i = deathFx.length - 1; i >= 0; i--) { deathFx[i].anim += .22; deathFx[i].life--; if (deathFx[i].life <= 0) deathFx.splice(i, 1); }
    base.pulse = Math.max(0, base.pulse - 1);
    camera.shake *= .88;
  }

  function updateCamera() {
    const sw = window.innerWidth, sh = window.innerHeight;
    const lookAhead = player.moving ? 45 : 0;
    const tx = clamp(player.x + Math.cos(player.angle) * lookAhead - sw / 2, 0, world.w - sw);
    const ty = clamp(player.y + Math.sin(player.angle) * lookAhead - sh / 2, 0, world.h - sh);
    camera.x += (tx - camera.x) * .085;
    camera.y += (ty - camera.y) * .085;
  }

  function drawImageCentered(img, x, y, w, h, flipX, alpha = 1, rotation = 0) {
    if (!img || !img.ready) return false;
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(rotation); if (flipX) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore(); return true;
  }

  function drawSprite(img, x, y, w, h, frame, count, flipX, alpha = 1) {
    if (!img || !img.ready || !img.naturalWidth || !img.naturalHeight) return false;
    const sw = img.naturalWidth / count, sh = img.naturalHeight, sx = Math.floor(frame % count) * sw;
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); if (flipX) ctx.scale(-1, 1);
    ctx.drawImage(img, sx, 0, sw, sh, -w / 2, -h / 2, w, h);
    ctx.restore(); return true;
  }

  function beginWorld() {
    const s = camera.shake;
    const sx = s ? (Math.random() - .5) * s : 0;
    const sy = s ? (Math.random() - .5) * s : 0;
    ctx.save(); ctx.translate(sx, sy);
  }
  function endWorld() { ctx.restore(); }

  function drawBackground() {
    if (images.map && images.map.ready) ctx.drawImage(images.map, -camera.x, -camera.y, world.w, world.h);
    else drawFallbackMap();

    const sw = window.innerWidth, sh = window.innerHeight;
    const g = ctx.createRadialGradient(sw / 2, sh / 2, 90, sw / 2, sh / 2, Math.max(sw, sh) * .75);
    g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(0,0,0,.55)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, sw, sh);
  }

  function drawFallbackMap() {
    ctx.save(); ctx.translate(-camera.x, -camera.y);
    ctx.fillStyle = "#141326"; ctx.fillRect(0, 0, world.w, world.h);
    const grid = 120;
    for (let x = 0; x < world.w; x += grid) for (let y = 0; y < world.h; y += grid) { ctx.fillStyle = ((x / grid + y / grid) % 2 === 0) ? "#1d1b31" : "#17192b"; ctx.fillRect(x, y, grid, grid); }
    ctx.strokeStyle = "rgba(139,104,78,.45)"; ctx.lineWidth = 72; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(base.x - 790, base.y - 620); ctx.quadraticCurveTo(base.x - 240, base.y - 210, base.x, base.y); ctx.quadraticCurveTo(base.x + 390, base.y + 260, base.x + 790, base.y + 650); ctx.stroke();
    ctx.restore();
  }

  function drawProps() {
    for (const p of propLayout) {
      const ok = drawImageCentered(images[p.key], p.x - camera.x, p.y - camera.y, p.w, p.h, false);
      if (!ok) drawFallbackProp(p);
    }
  }

  function drawFallbackProp(p) {
    const x = p.x - camera.x, y = p.y - camera.y;
    ctx.save(); ctx.translate(x, y);
    if (p.key.includes("tree")) { ctx.fillStyle = "rgba(0,0,0,.28)"; ctx.beginPath(); ctx.ellipse(6, 46, 38, 12, 0, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = "#342315"; ctx.fillRect(-7, 0, 14, 58); ctx.fillStyle = "#263c30"; ctx.beginPath(); ctx.arc(0, -12, 38, 0, Math.PI*2); ctx.fill(); }
    else if (p.key.includes("rock")) { ctx.fillStyle = "#56586a"; ctx.beginPath(); ctx.moveTo(-35,22); ctx.lineTo(-10,-18); ctx.lineTo(34,-15); ctx.lineTo(50,18); ctx.lineTo(20,35); ctx.closePath(); ctx.fill(); }
    else { ctx.fillStyle = "#524b5c"; ctx.beginPath(); ctx.roundRect(-35, -35, 70, 70, 9); ctx.fill(); }
    ctx.restore();
  }

  function drawBase() {
    const x = base.x - camera.x, y = base.y - camera.y;
    const img = base.level >= 3 ? images.base3 : base.level >= 2 ? images.base2 : images.base1;
    const scale = 1 + base.pulse * .006 + Math.sin(time * .035) * .008;
    if (!drawImageCentered(img, x, y, base.r * 2.25 * scale, base.r * 1.95 * scale, false)) {
      ctx.save(); ctx.translate(x, y); ctx.fillStyle = "rgba(0,0,0,.38)"; ctx.beginPath(); ctx.ellipse(0, 47, base.r*1.2, base.r*.42, 0, 0, Math.PI*2); ctx.fill(); const g = ctx.createRadialGradient(-20,-30,20,0,0,base.r*1.1); g.addColorStop(0,"#bd63ff"); g.addColorStop(.55,"#5c2382"); g.addColorStop(1,"#25142f"); ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-base.r*.9,-base.r*.65,base.r*1.8,base.r*1.3,26); ctx.fill(); ctx.restore();
    }
    ctx.save(); ctx.textAlign = "center"; ctx.font = "900 14px Arial"; ctx.strokeStyle = "rgba(0,0,0,.65)"; ctx.fillStyle = "#fff"; ctx.lineWidth = 4; ctx.strokeText("BASE " + base.level, x, y - base.r - 16); ctx.fillText("BASE " + base.level, x, y - base.r - 16); ctx.restore();
  }

  function drawPlayer() {
    const x = player.x - camera.x, y = player.y - camera.y;
    const frame = Math.floor(player.anim) % 4;
    let img = images.playerDown, flip = false;
    if (!player.moving && images.playerIdle && images.playerIdle.ready) {
      if (drawImageCentered(images.playerIdle, x, y, 70, 82, player.direction === "left")) return;
    }
    if (player.attackAnim > 0 && images.playerAttack && images.playerAttack.ready) img = images.playerAttack;
    else if (player.direction === "up") img = images.playerUp;
    else if (player.direction === "left") { img = images.playerSide; flip = true; }
    else if (player.direction === "right") img = images.playerSide;
    if (drawSprite(img, x, y, 72, 84, frame, 4, flip)) return;
    drawFallbackPlayer(x, y);
  }

  function drawFallbackPlayer(x, y) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(player.angle + Math.PI/2); ctx.fillStyle = "rgba(0,0,0,.4)"; ctx.beginPath(); ctx.ellipse(0,20,24,9,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle = "#27324d"; ctx.beginPath(); ctx.roundRect(-13,-8,26,33,10); ctx.fill(); ctx.fillStyle = "#d9c0a0"; ctx.beginPath(); ctx.arc(0,-21,13,0,Math.PI*2); ctx.fill(); ctx.strokeStyle = "#e2e7f4"; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(12,-1); ctx.lineTo(28,-17); ctx.stroke(); ctx.restore();
  }

  function drawEnemy(e) {
    const x = e.x - camera.x, y = e.y - camera.y;
    const frame = Math.floor(e.anim * 3) % 4;
    let img = e.kind === "fast" ? images.vampireFastWalk : e.kind === "tank" ? images.vampireTankWalk : (e.attacking && images.vampireBasicAttack.ready ? images.vampireBasicAttack : images.vampireBasicWalk);
    let w = e.kind === "tank" ? 78 : e.kind === "fast" ? 54 : 60;
    let h = e.kind === "tank" ? 90 : e.kind === "fast" ? 68 : 72;
    const bob = Math.sin(e.anim * 4) * 2;
    if (!drawSprite(img, x, y + bob, w, h, frame, 4, false, e.hit > 0 ? .72 : 1)) drawFallbackEnemy(e, x, y);
    const hpW = e.r * 2.2; ctx.fillStyle = "rgba(0,0,0,.55)"; ctx.fillRect(x - hpW/2, y - e.r - 20, hpW, 4); ctx.fillStyle = "#ff4a64"; ctx.fillRect(x - hpW/2, y - e.r - 20, hpW * Math.max(0, e.hp/e.maxHp), 4);
  }

  function drawFallbackEnemy(e, x, y) {
    const color = e.kind === "tank" ? "#842442" : e.kind === "fast" ? "#d73c66" : "#9a2e56";
    ctx.save(); ctx.translate(x,y); ctx.fillStyle = "rgba(0,0,0,.32)"; ctx.beginPath(); ctx.ellipse(0,e.r+7,e.r*1.05,e.r*.34,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle = e.hit > 0 ? "#fff" : color; ctx.beginPath(); ctx.arc(0,0,e.r + Math.sin(e.anim*5)*2,0,Math.PI*2); ctx.fill(); ctx.restore();
  }

  function drawTower(t) {
    const x = t.x - camera.x, y = t.y - camera.y;
    const pulse = 1 + Math.sin(t.anim * 3) * .01;
    let img = t.type === "fire" ? images.towerFire1 : t.type === "holy" ? images.towerHoly1 : (t.level >= 2 ? images.towerCrossbow2 : images.towerCrossbow1);
    if (!drawImageCentered(img, x, y, 82 * pulse, 96 * pulse, false)) {
      ctx.save(); ctx.translate(x,y); ctx.fillStyle = "#342b46"; ctx.beginPath(); ctx.roundRect(-20,-8,40,44,8); ctx.fill(); ctx.fillStyle = t.type === "fire" ? "#ff8f2c" : t.type === "holy" ? "#fff0a6" : "#8364ff"; ctx.beginPath(); ctx.moveTo(0,-35); ctx.lineTo(27,-4); ctx.lineTo(-27,-4); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    ctx.strokeStyle = t.type === "fire" ? "rgba(255,140,50,.16)" : t.type === "holy" ? "rgba(255,245,170,.16)" : "rgba(155,122,255,.14)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, t.range, 0, Math.PI*2); ctx.stroke();
  }

  function drawDrop(c) {
    const x = c.x - camera.x, y = c.y - camera.y + Math.sin(c.anim) * 3;
    if (drawImageCentered(images.coin, x, y, 27, 27, false)) return;
    const g = ctx.createRadialGradient(x-4,y-4,2,x,y,c.r); g.addColorStop(0,"#fff5b9"); g.addColorStop(.45,"#ffd84b"); g.addColorStop(1,"#b46a11"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x,y,c.r,0,Math.PI*2); ctx.fill();
  }

  function drawProjectile(p) {
    const x = p.x - camera.x, y = p.y - camera.y;
    const angle = Math.atan2(p.target.y - p.y, p.target.x - p.x);
    const img = p.type === "fire" ? images.fireball : images.arrow;
    if (drawImageCentered(img, x, y, p.type === "fire" ? 32 : 34, p.type === "fire" ? 32 : 13, false, 1, angle)) return;
    ctx.save(); ctx.translate(x,y); ctx.rotate(angle); ctx.strokeStyle = p.type === "fire" ? "#ff9a2e" : "#e7d6ff"; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-12,0); ctx.lineTo(12,0); ctx.stroke(); ctx.restore();
  }

  function drawFx() {
    for (const d of deathFx) {
      const x = d.x - camera.x, y = d.y - camera.y;
      const frame = Math.floor(d.anim) % 4;
      if (!drawSprite(images.vampireBasicDeath, x, y, 68, 78, frame, 4, false, Math.max(0, d.life/26))) drawImageCentered(images.darkSmoke, x, y, 65, 65, false, Math.max(0, d.life/26));
    }
    for (const s of slashes) drawImageCentered(images.hitSlash, s.x - camera.x, s.y - camera.y, 70, 70, false, Math.max(0, s.life/13), s.angle);
    for (const p of particles) {
      const x = p.x - camera.x, y = p.y - camera.y;
      const alpha = Math.max(0, p.life / 40);
      if (p.smoke && images.darkSmoke && images.darkSmoke.ready) drawImageCentered(images.darkSmoke, x, y, p.size, p.size, false, alpha);
      else { ctx.globalAlpha = alpha; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(x,y,p.size,0,Math.PI*2); ctx.fill(); ctx.globalAlpha = 1; }
    }
    ctx.save(); ctx.textAlign = "center"; ctx.font = "900 18px Arial";
    for (const t of texts) { const x = t.x-camera.x, y = t.y-camera.y; ctx.globalAlpha = Math.max(0,t.life/62); ctx.strokeStyle = "rgba(0,0,0,.65)"; ctx.fillStyle = t.color; ctx.lineWidth = 4; ctx.strokeText(t.value,x,y); ctx.fillText(t.value,x,y); }
    ctx.globalAlpha = 1; ctx.restore();
  }

  function drawTarget() {
    if (!fingerDown) return;
    const x = target.x - camera.x, y = target.y - camera.y;
    ctx.strokeStyle = "rgba(255,255,255,.48)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x,y,22 + Math.sin(Date.now()*.012)*3,0,Math.PI*2); ctx.stroke();
  }

  function update() { time++; updatePlayer(); updateEnemies(); updateTowers(); updateProjectiles(); updateDrops(); updateFx(); updateCamera(); updateHUD(); }

  function draw() {
    ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
    beginWorld();
    drawBackground();
    drawProps();
    const drawables = [
      ...towers.map(o => ({ y:o.y, type:"tower", obj:o })),
      { y:base.y, type:"base", obj:base },
      ...drops.map(o => ({ y:o.y, type:"drop", obj:o })),
      ...enemies.map(o => ({ y:o.y, type:"enemy", obj:o })),
      { y:player.y, type:"player", obj:player }
    ].sort((a,b) => a.y-b.y);
    for (const d of drawables) {
      if (d.type === "tower") drawTower(d.obj);
      if (d.type === "base") drawBase();
      if (d.type === "drop") drawDrop(d.obj);
      if (d.type === "enemy") drawEnemy(d.obj);
      if (d.type === "player") drawPlayer();
    }
    for (const p of projectiles) drawProjectile(p);
    drawFx(); drawTarget();
    endWorld();
  }

  function loop() { update(); draw(); requestAnimationFrame(loop); }
  function showEndCard() { endCard.style.display = "flex"; }
  function hideEndCard() { if (base.hp <= 0) { base.hp = base.maxHp; enemies.length = 0; drops.length = 0; projectiles.length = 0; deathFx.length = 0; wave = 1; coins = Math.max(coins, 100); player.x = base.x; player.y = base.y + 210; target.x = player.x; target.y = player.y; } endCard.style.display = "none"; }

  canvas.addEventListener("pointerdown", e => { fingerDown = true; canvas.setPointerCapture(e.pointerId); target = screenToWorld(e.clientX, e.clientY); });
  canvas.addEventListener("pointermove", e => { if (fingerDown) target = screenToWorld(e.clientX, e.clientY); });
  canvas.addEventListener("pointerup", () => { fingerDown = false; target.x = player.x; target.y = player.y; });
  canvas.addEventListener("pointercancel", () => { fingerDown = false; target.x = player.x; target.y = player.y; });
  buildTowerBtn.addEventListener("click", tryBuildTower);
  if (playHomeBtn) playHomeBtn.addEventListener("click", () => showView("game"));
  if (closePanelBtn) closePanelBtn.addEventListener("click", () => showView("home"));
  document.querySelectorAll("[data-open-panel]").forEach(btn => btn.addEventListener("click", () => openPanel(btn.getAttribute("data-open-panel"))));
  upgradeBaseBtn.addEventListener("click", upgradeBase);
  waveBtn.addEventListener("click", spawnWave);
  installBtn.addEventListener("click", showEndCard);
  continueBtn.addEventListener("click", hideEndCard);
  window.addEventListener("resize", resize);

  resize(); loadAssets(); updateHUD(); spawnWave(); showView("home"); I18N.apply();
  setInterval(() => { if (endCard.style.display !== "flex") spawnEnemy(); }, 1700);
  loop();


  function showView(name) {
    if (!homeView || !gameView || !panelView) return;
    homeView.classList.remove("active"); gameView.classList.remove("active"); panelView.classList.remove("active");
    if (name === "home") homeView.classList.add("active");
    if (name === "game") gameView.classList.add("active");
    if (name === "panel") panelView.classList.add("active");
    state.screen = name;
  }

  function renderShopHtml() {
    return `<div class="shopGrid">${window.GAME_BALANCE.shop.map(item => `<div class="fakeCard"><h3>${I18N.t(item.labelKey)}</h3><p>Type : ${item.type}</p><p>${item.priceCoins > 0 ? `Prix : ${item.priceCoins}` : "Achat premium"}</p><button type="button">${item.enabled ? "Voir" : "Bientôt"}</button></div>`).join("")}</div>`;
  }
  function openPanel(panel) { showView("panel"); if (panel === "settings") { panelTitle.textContent = I18N.t("panel_settings"); panelContent.innerHTML = `<div class="fakeCard">${I18N.t("placeholder_settings")}</div>`; } if (panel === "shop") { panelTitle.textContent = I18N.t("panel_shop"); panelContent.innerHTML = renderShopHtml(); } if (panel === "crosspromo") { panelTitle.textContent = I18N.t("panel_crosspromo"); panelContent.innerHTML = `<div class="fakeCard">${I18N.t("placeholder_crosspromo")}</div>`; } if (panel === "profile") { panelTitle.textContent = I18N.t("panel_profile"); panelContent.innerHTML = `<div class="fakeCard"><strong>${I18N.t("panel_profile")}</strong><br>Pièces : ${state.coins}<br>Fragments : ${state.fragments}<br>Vague actuelle : ${state.wave}</div>`; } if (panel === "noads") { panelTitle.textContent = I18N.t("panel_noads"); panelContent.innerHTML = `<div class="fakeCard">${I18N.t("placeholder_noads")}</div>`; } }

})();
