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

  const DPR = Math.min(2, window.devicePixelRatio || 1);

  const world = { w: 2600, h: 2600 };
  const camera = { x: 0, y: 0 };

  const player = {
    x: world.w / 2,
    y: world.h / 2 + 180,
    r: 22,
    speed: 4.2,
    angle: -Math.PI / 2,
    direction: "down",
    anim: 0,
    attackCooldown: 0
  };

  const base = {
    x: world.w / 2,
    y: world.h / 2,
    r: 86,
    hp: 100,
    maxHp: 100,
    level: 1
  };

  let target = { x: player.x, y: player.y };
  let fingerDown = false;
  let coins = 80;
  let wave = 1;

  const images = {};
  const enemies = [];
  const towers = [];
  const drops = [];
  const projectiles = [];
  const particles = [];
  const texts = [];

  function loadImage(key, src) {
    const img = new Image();
    img.onload = function () { img.ready = true; };
    img.onerror = function () { img.ready = false; };
    img.src = src;
    images[key] = img;
  }

  function loadAssets() {
    const A = window.VAMPIRE_ASSETS;

    loadImage("map", A.map);
    loadImage("playerIdle", A.player.idle);
    loadImage("playerDown", A.player.walkDown);
    loadImage("playerUp", A.player.walkUp);
    loadImage("playerSide", A.player.walkSide);
    loadImage("vampireBasic", A.enemies.basic);
    loadImage("vampireFast", A.enemies.fast);
    loadImage("vampireTank", A.enemies.tank);
    loadImage("base1", A.base.level01);
    loadImage("base2", A.base.level02);
    loadImage("base3", A.base.level03);
    loadImage("tower1", A.towers.crossbow01);
    loadImage("tower2", A.towers.crossbow02);
    loadImage("coin", A.fx.coin);
    loadImage("arrow", A.fx.arrow);
  }

  function resize() {
    canvas.width = Math.floor(window.innerWidth * DPR);
    canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function screenToWorld(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left + camera.x,
      y: clientY - rect.top + camera.y
    };
  }

  function updateHUD() {
    coinsText.textContent = coins;
    const p = Math.max(0, Math.round((base.hp / base.maxHp) * 100));
    baseText.textContent = "Base " + p + "%";
  }

  function addText(x, y, value) {
    texts.push({ x, y, value, life: 60 });
  }

  function addParticles(x, y, amount, color) {
    for (let i = 0; i < amount; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = Math.random() * 2.5 + 0.6;
      particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        color,
        life: 28 + Math.random() * 18
      });
    }
  }

  function spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;

    if (side === 0) { x = Math.random() * world.w; y = -90; }
    if (side === 1) { x = world.w + 90; y = Math.random() * world.h; }
    if (side === 2) { x = Math.random() * world.w; y = world.h + 90; }
    if (side === 3) { x = -90; y = Math.random() * world.h; }

    const roll = Math.random();
    const kind = roll < 0.18 ? "tank" : roll > 0.72 ? "fast" : "basic";
    const hp = kind === "tank" ? 80 + wave * 8 : kind === "fast" ? 32 + wave * 5 : 48 + wave * 6;

    enemies.push({
      x,
      y,
      r: kind === "tank" ? 25 : kind === "fast" ? 16 : 20,
      hp,
      maxHp: hp,
      speed: kind === "tank" ? 0.75 : kind === "fast" ? 1.55 : 1.05,
      dmg: kind === "tank" ? 0.32 : kind === "fast" ? 0.17 : 0.22,
      kind,
      anim: Math.random() * 10,
      hit: 0
    });
  }

  function spawnWave() {
    addText(base.x, base.y - 130, "Vague " + wave);

    for (let i = 0; i < 10 + wave * 2; i++) {
      setTimeout(spawnEnemy, i * 120);
    }

    wave++;
  }

  function killEnemy(enemy, index) {
    const value = enemy.kind === "tank" ? 18 : enemy.kind === "fast" ? 9 : 12;

    drops.push({
      x: enemy.x,
      y: enemy.y,
      r: 10,
      value,
      life: 600,
      magnet: false
    });

    addParticles(enemy.x, enemy.y, 12, "#9c55ff");
    addText(enemy.x, enemy.y - 20, "+" + value);
    enemies.splice(index, 1);
  }

  function tryBuildTower() {
    if (coins < 50) {
      addText(player.x, player.y - 45, "Pas assez");
      return;
    }

    if (Math.hypot(player.x - base.x, player.y - base.y) < 135) {
      addText(player.x, player.y - 45, "Trop près");
      return;
    }

    for (const t of towers) {
      if (Math.hypot(t.x - player.x, t.y - player.y) < 90) {
        addText(player.x, player.y - 45, "Déjà une tour");
        return;
      }
    }

    coins -= 50;

    towers.push({
      x: player.x,
      y: player.y,
      range: 260,
      cooldown: 0,
      dmg: 22,
      level: 1
    });

    addParticles(player.x, player.y, 20, "#ffd84b");
    addText(player.x, player.y - 45, "Tour !");
    updateHUD();
  }

  function upgradeBase() {
    if (coins < 100) {
      addText(base.x, base.y - 120, "Pas assez");
      return;
    }

    coins -= 100;
    base.level = Math.min(3, base.level + 1);
    base.maxHp += 35;
    base.hp = base.maxHp;
    base.r += 7;

    addParticles(base.x, base.y, 28, "#ffd84b");
    addText(base.x, base.y - 120, "Base niv. " + base.level);
    updateHUD();
  }

  function updatePlayer() {
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const d = Math.hypot(dx, dy);

    if (d > 8) {
      const nx = dx / d;
      const ny = dy / d;

      player.x = clamp(player.x + nx * player.speed, 70, world.w - 70);
      player.y = clamp(player.y + ny * player.speed, 70, world.h - 70);
      player.angle = Math.atan2(ny, nx);
      player.anim += 0.22;

      if (Math.abs(nx) > Math.abs(ny)) {
        player.direction = nx > 0 ? "right" : "left";
      } else {
        player.direction = ny > 0 ? "down" : "up";
      }
    }

    player.attackCooldown = Math.max(0, player.attackCooldown - 1);

    if (player.attackCooldown <= 0) {
      let bestIndex = -1;
      let bestDistance = 95;

      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        const dist = Math.hypot(e.x - player.x, e.y - player.y);

        if (dist < bestDistance) {
          bestDistance = dist;
          bestIndex = i;
        }
      }

      if (bestIndex >= 0) {
        const e = enemies[bestIndex];
        e.hp -= 24;
        e.hit = 8;
        addParticles(e.x, e.y, 5, "#ff4a64");
        player.attackCooldown = 20;

        if (e.hp <= 0) {
          killEnemy(e, bestIndex);
        }
      }
    }
  }

  function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];

      e.anim += 0.1;
      e.hit = Math.max(0, e.hit - 1);

      const dxPlayer = player.x - e.x;
      const dyPlayer = player.y - e.y;
      const distPlayer = Math.hypot(dxPlayer, dyPlayer);

      const targetObj = distPlayer < 220 ? player : base;
      const dx = targetObj.x - e.x;
      const dy = targetObj.y - e.y;
      const d = Math.hypot(dx, dy);

      const stop = targetObj === base ? base.r + e.r - 8 : player.r + e.r + 2;

      if (d > stop) {
        e.x += (dx / d) * e.speed;
        e.y += (dy / d) * e.speed;
      } else if (targetObj === base) {
        base.hp -= e.dmg;
      }

      if (base.hp <= 0) {
        base.hp = 0;
        showEndCard();
      }
    }
  }

  function updateTowers() {
    for (const t of towers) {
      t.cooldown = Math.max(0, t.cooldown - 1);

      if (t.cooldown > 0) {
        continue;
      }

      let best = null;
      let bestDistance = t.range;

      for (const e of enemies) {
        const d = Math.hypot(e.x - t.x, e.y - t.y);

        if (d < bestDistance) {
          best = e;
          bestDistance = d;
        }
      }

      if (best) {
        projectiles.push({
          x: t.x,
          y: t.y - 20,
          target: best,
          speed: 9,
          dmg: t.dmg
        });

        t.cooldown = 42;
      }
    }
  }

  function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];

      if (!enemies.includes(p.target)) {
        projectiles.splice(i, 1);
        continue;
      }

      const dx = p.target.x - p.x;
      const dy = p.target.y - p.y;
      const d = Math.hypot(dx, dy);

      if (d < 12) {
        const e = p.target;
        e.hp -= p.dmg;
        e.hit = 8;
        addParticles(e.x, e.y, 7, "#ff4a64");

        const idx = enemies.indexOf(e);
        if (e.hp <= 0 && idx >= 0) {
          killEnemy(e, idx);
        }

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

      c.life--;

      const d = Math.hypot(c.x - player.x, c.y - player.y);

      if (d < 150) {
        c.magnet = true;
      }

      if (c.magnet) {
        c.x += (player.x - c.x) * 0.08;
        c.y += (player.y - c.y) * 0.08;
      }

      if (d < player.r + 16) {
        coins += c.value;
        addParticles(c.x, c.y, 9, "#ffd84b");
        drops.splice(i, 1);
        updateHUD();
      } else if (c.life <= 0) {
        drops.splice(i, 1);
      }
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.94;
      p.vy *= 0.94;
      p.life--;

      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  function updateTexts() {
    for (let i = texts.length - 1; i >= 0; i--) {
      const t = texts[i];

      t.y -= 0.5;
      t.life--;

      if (t.life <= 0) {
        texts.splice(i, 1);
      }
    }
  }

  function updateCamera() {
    const sw = window.innerWidth;
    const sh = window.innerHeight;

    const tx = clamp(player.x - sw / 2, 0, world.w - sw);
    const ty = clamp(player.y - sh / 2, 0, world.h - sh);

    camera.x += (tx - camera.x) * 0.09;
    camera.y += (ty - camera.y) * 0.09;
  }

  function drawImageCentered(img, x, y, w, h, flipX) {
    if (!img || !img.ready) {
      return false;
    }

    ctx.save();
    ctx.translate(x, y);

    if (flipX) {
      ctx.scale(-1, 1);
    }

    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();

    return true;
  }

  function drawSprite(img, x, y, w, h, frame, count, flipX) {
    if (!img || !img.ready || !img.naturalWidth || !img.naturalHeight) {
      return false;
    }

    const sw = img.naturalWidth / count;
    const sh = img.naturalHeight;
    const sx = Math.floor(frame % count) * sw;

    ctx.save();
    ctx.translate(x, y);

    if (flipX) {
      ctx.scale(-1, 1);
    }

    ctx.drawImage(img, sx, 0, sw, sh, -w / 2, -h / 2, w, h);
    ctx.restore();

    return true;
  }

  function drawBackground() {
    if (images.map && images.map.ready) {
      ctx.drawImage(images.map, -camera.x, -camera.y, world.w, world.h);
    } else {
      ctx.save();
      ctx.translate(-camera.x, -camera.y);

      ctx.fillStyle = "#141326";
      ctx.fillRect(0, 0, world.w, world.h);

      const grid = 120;

      for (let x = 0; x < world.w; x += grid) {
        for (let y = 0; y < world.h; y += grid) {
          ctx.fillStyle = ((x / grid + y / grid) % 2 === 0) ? "#1d1b31" : "#17192b";
          ctx.fillRect(x, y, grid, grid);
        }
      }

      ctx.strokeStyle = "rgba(139, 104, 78, 0.45)";
      ctx.lineWidth = 72;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(base.x - 680, base.y - 520);
      ctx.quadraticCurveTo(base.x - 200, base.y - 180, base.x, base.y);
      ctx.quadraticCurveTo(base.x + 340, base.y + 230, base.x + 660, base.y + 560);
      ctx.stroke();

      ctx.strokeStyle = "rgba(106, 79, 68, 0.42)";
      ctx.lineWidth = 46;
      ctx.beginPath();
      ctx.moveTo(base.x + 640, base.y - 520);
      ctx.quadraticCurveTo(base.x + 240, base.y - 120, base.x, base.y);
      ctx.quadraticCurveTo(base.x - 250, base.y + 100, base.x - 630, base.y + 480);
      ctx.stroke();

      drawFakeProps();

      ctx.restore();
    }

    const sw = window.innerWidth;
    const sh = window.innerHeight;
    const g = ctx.createRadialGradient(sw / 2, sh / 2, 100, sw / 2, sh / 2, Math.max(sw, sh) * 0.75);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(1, "rgba(0,0,0,0.54)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, sw, sh);
  }

  function drawFakeProps() {
    const props = [
      [base.x - 520, base.y - 300],
      [base.x - 620, base.y + 190],
      [base.x + 420, base.y - 320],
      [base.x + 570, base.y + 220],
      [base.x - 760, base.y - 620],
      [base.x + 790, base.y + 640],
      [base.x - 280, base.y + 440],
      [base.x + 260, base.y + 420],
      [base.x + 290, base.y - 240],
      [base.x - 390, base.y + 140]
    ];

    for (let i = 0; i < props.length; i++) {
      const x = props[i][0];
      const y = props[i][1];

      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.beginPath();
      ctx.ellipse(x + 6, y + 42, 36, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      if (i < 6) {
        ctx.fillStyle = "#342315";
        ctx.fillRect(x - 7, y, 14, 54);

        ctx.fillStyle = "#263c30";
        ctx.beginPath();
        ctx.arc(x, y - 10, 36, 0, Math.PI * 2);
        ctx.fill();
      } else if (i < 8) {
        ctx.fillStyle = "#545566";
        ctx.beginPath();
        ctx.moveTo(x - 30, y + 20);
        ctx.lineTo(x - 10, y - 18);
        ctx.lineTo(x + 32, y - 14);
        ctx.lineTo(x + 48, y + 18);
        ctx.lineTo(x + 20, y + 34);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = "#4a4654";
        ctx.fillRect(x - 48, y - 34, 34, 80);
        ctx.fillRect(x + 8, y - 18, 48, 64);
      }
    }
  }

  function drawBase() {
    const x = base.x - camera.x;
    const y = base.y - camera.y;

    const img = base.level >= 3 ? images.base3 : base.level >= 2 ? images.base2 : images.base1;

    if (!drawImageCentered(img, x, y, base.r * 2.2, base.r * 1.9, false)) {
      ctx.save();
      ctx.translate(x, y);

      ctx.fillStyle = "rgba(0,0,0,0.38)";
      ctx.beginPath();
      ctx.ellipse(0, 45, base.r * 1.2, base.r * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();

      const g = ctx.createRadialGradient(-20, -30, 20, 0, 0, base.r * 1.1);
      g.addColorStop(0, "#bd63ff");
      g.addColorStop(0.55, "#5c2382");
      g.addColorStop(1, "#25142f");

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.roundRect(-base.r * 0.9, -base.r * 0.65, base.r * 1.8, base.r * 1.3, 26);
      ctx.fill();

      ctx.fillStyle = "#1c1024";
      ctx.fillRect(-base.r * 0.25, -base.r * 0.08, base.r * 0.5, base.r * 0.72);

      ctx.restore();
    }

    ctx.save();
    ctx.textAlign = "center";
    ctx.font = "900 14px Arial";
    ctx.strokeStyle = "rgba(0,0,0,0.65)";
    ctx.fillStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.strokeText("BASE " + base.level, x, y - base.r - 14);
    ctx.fillText("BASE " + base.level, x, y - base.r - 14);
    ctx.restore();
  }

  function drawPlayer() {
    const x = player.x - camera.x;
    const y = player.y - camera.y;
    const frame = Math.floor(player.anim) % 4;

    let img = images.playerDown;
    let flip = false;

    if (player.direction === "up") img = images.playerUp;
    if (player.direction === "right") img = images.playerSide;
    if (player.direction === "left") {
      img = images.playerSide;
      flip = true;
    }

    if (drawSprite(img, x, y, 70, 82, frame, 4, flip)) {
      return;
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(player.angle + Math.PI / 2);

    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(0, 20, 24, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#27324d";
    ctx.beginPath();
    ctx.roundRect(-13, -8, 26, 33, 10);
    ctx.fill();

    ctx.fillStyle = "#d9c0a0";
    ctx.beginPath();
    ctx.arc(0, -21, 13, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#181924";
    ctx.beginPath();
    ctx.arc(0, -26, 14, Math.PI, 0);
    ctx.fill();

    ctx.strokeStyle = "#e2e7f4";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(12, -1);
    ctx.lineTo(28, -17);
    ctx.stroke();

    ctx.restore();
  }

  function drawEnemy(e) {
    const x = e.x - camera.x;
    const y = e.y - camera.y;
    const frame = Math.floor(e.anim * 3) % 4;

    let img = images.vampireBasic;
    let w = 58;
    let h = 70;

    if (e.kind === "fast") {
      img = images.vampireFast;
      w = 52;
      h = 66;
    }

    if (e.kind === "tank") {
      img = images.vampireTank;
      w = 76;
      h = 88;
    }

    if (!drawSprite(img, x, y, w, h, frame, 4, false)) {
      const color = e.kind === "tank" ? "#842442" : e.kind === "fast" ? "#d73c66" : "#9a2e56";

      ctx.save();
      ctx.translate(x, y);

      ctx.fillStyle = "rgba(0,0,0,0.32)";
      ctx.beginPath();
      ctx.ellipse(0, e.r + 7, e.r * 1.05, e.r * 0.34, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = e.hit > 0 ? "#ffffff" : color;
      ctx.beginPath();
      ctx.arc(0, 0, e.r + Math.sin(e.anim * 5) * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#f5eaf0";
      ctx.beginPath();
      ctx.arc(-e.r * 0.28, -e.r * 0.12, 3, 0, Math.PI * 2);
      ctx.arc(e.r * 0.28, -e.r * 0.12, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    const hpW = e.r * 2;

    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(x - hpW / 2, y - e.r - 18, hpW, 4);

    ctx.fillStyle = "#ff4a64";
    ctx.fillRect(x - hpW / 2, y - e.r - 18, hpW * Math.max(0, e.hp / e.maxHp), 4);
  }

  function drawTower(t) {
    const x = t.x - camera.x;
    const y = t.y - camera.y;

    const img = t.level >= 2 ? images.tower2 : images.tower1;

    if (!drawImageCentered(img, x, y, 78, 92, false)) {
      ctx.save();
      ctx.translate(x, y);

      ctx.fillStyle = "rgba(0,0,0,0.34)";
      ctx.beginPath();
      ctx.ellipse(0, 25, 30, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#342b46";
      ctx.beginPath();
      ctx.roundRect(-20, -8, 40, 44, 8);
      ctx.fill();

      ctx.fillStyle = "#8364ff";
      ctx.beginPath();
      ctx.moveTo(0, -35);
      ctx.lineTo(27, -4);
      ctx.lineTo(-27, -4);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    ctx.strokeStyle = "rgba(155,122,255,0.14)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, t.range, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawDrop(c) {
    const x = c.x - camera.x;
    const y = c.y - camera.y;

    if (drawImageCentered(images.coin, x, y, 26, 26, false)) {
      return;
    }

    const g = ctx.createRadialGradient(x - 4, y - 4, 2, x, y, c.r);
    g.addColorStop(0, "#fff5b9");
    g.addColorStop(0.45, "#ffd84b");
    g.addColorStop(1, "#b46a11");

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, c.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawProjectile(p) {
    const x = p.x - camera.x;
    const y = p.y - camera.y;

    if (drawImageCentered(images.arrow, x, y, 30, 12, false)) {
      return;
    }

    ctx.strokeStyle = "#e7d6ff";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 10, y + 10);
    ctx.stroke();
  }

  function drawParticles() {
    for (const p of particles) {
      const x = p.x - camera.x;
      const y = p.y - camera.y;

      ctx.globalAlpha = Math.max(0, p.life / 35);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function drawTexts() {
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = "900 18px Arial";

    for (const t of texts) {
      const x = t.x - camera.x;
      const y = t.y - camera.y;

      ctx.globalAlpha = Math.max(0, t.life / 60);
      ctx.strokeStyle = "rgba(0,0,0,0.65)";
      ctx.fillStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.strokeText(t.value, x, y);
      ctx.fillText(t.value, x, y);
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawFingerTarget() {
    if (!fingerDown) return;

    const x = target.x - camera.x;
    const y = target.y - camera.y;

    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 22 + Math.sin(Date.now() * 0.012) * 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  function update() {
    updatePlayer();
    updateEnemies();
    updateTowers();
    updateProjectiles();
    updateDrops();
    updateParticles();
    updateTexts();
    updateCamera();
    updateHUD();
  }

  function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    drawBackground();

    const drawables = [
      ...towers.map(o => ({ y: o.y, type: "tower", obj: o })),
      { y: base.y, type: "base", obj: base },
      ...drops.map(o => ({ y: o.y, type: "drop", obj: o })),
      ...enemies.map(o => ({ y: o.y, type: "enemy", obj: o })),
      { y: player.y, type: "player", obj: player }
    ];

    drawables.sort((a, b) => a.y - b.y);

    for (const d of drawables) {
      if (d.type === "tower") drawTower(d.obj);
      if (d.type === "base") drawBase();
      if (d.type === "drop") drawDrop(d.obj);
      if (d.type === "enemy") drawEnemy(d.obj);
      if (d.type === "player") drawPlayer();
    }

    for (const p of projectiles) drawProjectile(p);

    drawParticles();
    drawTexts();
    drawFingerTarget();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function showEndCard() {
    endCard.style.display = "flex";
  }

  function hideEndCard() {
    if (base.hp <= 0) {
      base.hp = base.maxHp;
      enemies.length = 0;
      drops.length = 0;
      projectiles.length = 0;
      wave = 1;
      coins = Math.max(coins, 80);
      player.x = base.x;
      player.y = base.y + 180;
      target.x = player.x;
      target.y = player.y;
    }

    endCard.style.display = "none";
  }

  canvas.addEventListener("pointerdown", function (event) {
    fingerDown = true;
    canvas.setPointerCapture(event.pointerId);
    target = screenToWorld(event.clientX, event.clientY);
  });

  canvas.addEventListener("pointermove", function (event) {
    if (!fingerDown) return;
    target = screenToWorld(event.clientX, event.clientY);
  });

  canvas.addEventListener("pointerup", function () {
    fingerDown = false;
    target.x = player.x;
    target.y = player.y;
  });

  canvas.addEventListener("pointercancel", function () {
    fingerDown = false;
    target.x = player.x;
    target.y = player.y;
  });

  buildTowerBtn.addEventListener("click", tryBuildTower);
  upgradeBaseBtn.addEventListener("click", upgradeBase);
  waveBtn.addEventListener("click", spawnWave);
  installBtn.addEventListener("click", showEndCard);
  continueBtn.addEventListener("click", hideEndCard);
  window.addEventListener("resize", resize);

  resize();
  loadAssets();
  updateHUD();
  spawnWave();

  setInterval(function () {
    if (endCard.style.display !== "flex") {
      spawnEnemy();
    }
  }, 1800);

  loop();
})();
