(function () {
  /* ================================================================
     STARFIELD
  ================================================================ */
  var starCanvas = document.getElementById('star-canvas');
  var sCtx = starCanvas.getContext('2d');
  var stars = [];
  function resizeStars() { starCanvas.width = window.innerWidth; starCanvas.height = window.innerHeight; }
  function initStars() {
    resizeStars(); stars = [];
    var count = Math.floor(window.innerWidth * window.innerHeight / 3800);
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * starCanvas.width,
        y: Math.random() * starCanvas.height,
        r: 0.4 + Math.random() * 1.4,
        base: 0.3 + Math.random() * 0.7,
        speed: 0.4 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() < 0.15 ? '#f2c96b' : Math.random() < 0.1 ? '#e0357b' : '#fff3da'
      });
    }
  }
  var starT = 0;
  function drawStars(dt) {
    sCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    starT += dt;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var op = s.base + (1 - s.base) * 0.5 * (1 + Math.sin(starT * s.speed + s.phase));
      sCtx.beginPath(); sCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      sCtx.fillStyle = s.color; sCtx.globalAlpha = op; sCtx.fill();
    }
    sCtx.globalAlpha = 1;
  }
  window.addEventListener('resize', initStars);
  initStars();

  /* ================================================================
     FLOATING DIYAS
  ================================================================ */
  var floatCanvas = document.getElementById('float-canvas');
  var fCtx = floatCanvas.getContext('2d');
  var floaters = [];
  function resizeFloat() { floatCanvas.width = window.innerWidth; floatCanvas.height = window.innerHeight; }
  function initFloat() {
    resizeFloat(); floaters = [];
    var n = Math.min(14, Math.floor(window.innerWidth / 90));
    for (var i = 0; i < n; i++) spawnFloater(true);
  }
  function spawnFloater(init) {
    floaters.push({
      x: Math.random() * floatCanvas.width,
      y: init ? Math.random() * floatCanvas.height : floatCanvas.height + 20,
      size: 10 + Math.random() * 14,
      speed: 0.25 + Math.random() * 0.45,
      drift: (Math.random() - 0.5) * 0.4,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.15 + Math.random() * 0.35,
      flickerSpeed: 1.5 + Math.random() * 2.5
    });
  }
  function drawDiyaSmall(ctx, x, y, s, op, flicker) {
    ctx.save(); ctx.globalAlpha = op; ctx.translate(x, y);
    ctx.beginPath(); ctx.ellipse(0, s * 0.3, s * 0.8, s * 0.22, 0, 0, Math.PI * 2); ctx.fillStyle = '#c0501a'; ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, s * 0.1, s * 0.82, s * 0.12, 0, 0, Math.PI * 2); ctx.fillStyle = '#f2c96b'; ctx.fill();
    var flkH = 1 + 0.25 * Math.sin(flicker);
    ctx.beginPath(); ctx.moveTo(0, s * 0.08);
    ctx.bezierCurveTo(s * 0.15, -s * 0.15 * flkH, s * 0.12, -s * 0.38 * flkH, 0, -s * 0.42 * flkH);
    ctx.bezierCurveTo(-s * 0.12, -s * 0.38 * flkH, -s * 0.15, -s * 0.15 * flkH, 0, s * 0.08);
    var fg = ctx.createLinearGradient(0, s * 0.08, 0, -s * 0.42 * flkH);
    fg.addColorStop(0, '#ff6a00'); fg.addColorStop(0.5, '#ffb627'); fg.addColorStop(1, '#fff9d6');
    ctx.fillStyle = fg; ctx.fill();
    var gg = ctx.createRadialGradient(0, -s * 0.15, 0, 0, -s * 0.15, s * 0.8);
    gg.addColorStop(0, 'rgba(255,180,50,0.22)'); gg.addColorStop(1, 'rgba(255,100,0,0)');
    ctx.beginPath(); ctx.arc(0, -s * 0.15, s * 0.8, 0, Math.PI * 2); ctx.fillStyle = gg; ctx.fill();
    ctx.restore();
  }
  var floatT = 0;
  function drawFloat(dt) {
    fCtx.clearRect(0, 0, floatCanvas.width, floatCanvas.height); floatT += dt;
    for (var i = floaters.length - 1; i >= 0; i--) {
      var f = floaters[i]; f.y -= f.speed; f.x += f.drift + Math.sin(floatT * 0.5 + f.phase) * 0.3;
      drawDiyaSmall(fCtx, f.x, f.y, f.size, f.opacity, floatT * f.flickerSpeed + f.phase);
      if (f.y < -30) { floaters.splice(i, 1); spawnFloater(false); }
    }
  }
  window.addEventListener('resize', initFloat); initFloat();

  /* ================================================================
     FIREWORKS
  ================================================================ */
  var fwCanvas = document.getElementById('firework-canvas');
  var wCtx = fwCanvas.getContext('2d');
  var particles = [], rockets = [], lastFW = 0, fwInterval = 3800;
  function resizeFW() { fwCanvas.width = window.innerWidth; fwCanvas.height = window.innerHeight; }
  window.addEventListener('resize', resizeFW); resizeFW();
  var PALETTE = ['#ffb627','#e0357b','#f2c96b','#fff3da','#2f7d5b','#ff6a00','#9b59b6','#1abc9c','#e74c3c'];
  function launchRocket() {
    var tx = window.innerWidth * (0.15 + Math.random() * 0.7),
        ty = window.innerHeight * (0.08 + Math.random() * 0.32);
    rockets.push({ x: tx + (Math.random() - 0.5) * 100, y: window.innerHeight + 10, tx: tx, ty: ty,
      speed: 8 + Math.random() * 6, color: PALETTE[Math.floor(Math.random() * PALETTE.length)], trail: [] });
  }
  function explode(x, y, color) {
    var count = 70 + Math.floor(Math.random() * 60);
    for (var i = 0; i < count; i++) {
      var angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.15;
      var speed = 1.5 + Math.random() * 4.5;
      particles.push({ x: x, y: y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 1, decay: 0.012 + Math.random() * 0.018, r: 1.5 + Math.random() * 2.5,
        color: Math.random() < 0.3 ? PALETTE[Math.floor(Math.random() * PALETTE.length)] : color,
        gravity: 0.06 + Math.random() * 0.04, twinkle: Math.random() < 0.3 });
    }
    for (var j = 0; j < 8; j++) {
      var a2 = (Math.PI * 2 * j) / 8;
      particles.push({ x: x, y: y, vx: Math.cos(a2) * (7 + Math.random() * 3), vy: Math.sin(a2) * (7 + Math.random() * 3),
        life: 1, decay: 0.022, r: 3, color: '#fff9d6', gravity: 0.05, twinkle: false });
    }
  }
  function drawFW(dt, now) {
    wCtx.fillStyle = 'rgba(12,9,33,0.18)'; wCtx.fillRect(0, 0, fwCanvas.width, fwCanvas.height);
    for (var ri = rockets.length - 1; ri >= 0; ri--) {
      var r = rockets[ri]; var dx = r.tx - r.x, dy = r.ty - r.y, dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < r.speed) { explode(r.tx, r.ty, r.color); rockets.splice(ri, 1); continue; }
      r.x += (dx / dist) * r.speed; r.y += (dy / dist) * r.speed;
      r.trail.push({ x: r.x, y: r.y }); if (r.trail.length > 12) r.trail.shift();
      for (var ti = 0; ti < r.trail.length; ti++) {
        var tp = r.trail[ti];
        wCtx.beginPath(); wCtx.arc(tp.x, tp.y, 1.5, 0, Math.PI * 2);
        wCtx.fillStyle = r.color; wCtx.globalAlpha = (ti / r.trail.length) * 0.8; wCtx.fill();
      }
      wCtx.globalAlpha = 1;
    }
    for (var pi = particles.length - 1; pi >= 0; pi--) {
      var p = particles[pi]; p.x += p.vx; p.y += p.vy; p.vx *= 0.97; p.vy *= 0.97; p.vy += p.gravity; p.life -= p.decay;
      if (p.life <= 0) { particles.splice(pi, 1); continue; }
      wCtx.beginPath(); wCtx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      wCtx.fillStyle = p.color; wCtx.globalAlpha = p.twinkle ? p.life * (0.5 + 0.5 * Math.sin(now * 0.015)) : p.life; wCtx.fill();
    }
    wCtx.globalAlpha = 1;
    if (now - lastFW > fwInterval) {
      launchRocket();
      if (Math.random() < 0.4) setTimeout(launchRocket, 400);
      if (Math.random() < 0.2) setTimeout(launchRocket, 800);
      lastFW = now; fwInterval = 2800 + Math.random() * 3200;
    }
  }

  /* ================================================================
     SPARKLERS (Phuljhadi Tap/Click & Drag)
  ================================================================ */
  var sparkCanvas = document.getElementById('spark-canvas');
  var spCtx = sparkCanvas ? sparkCanvas.getContext('2d') : null;
  var sparks = [];
  function resizeSparks() {
    if (!sparkCanvas) return;
    sparkCanvas.width = window.innerWidth;
    sparkCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeSparks);
  resizeSparks();

  var SPARK_COLORS = ['#ffffff', '#fff8cc', '#ffd27a', '#ffb627', '#ff7300', '#ff2e7e'];

  function spawnSparkler(x, y, count, vScale) {
    if (!spCtx) return;
    count = count || 20;
    vScale = vScale || 1;
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = (2 + Math.random() * 6.5) * vScale;
      sparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.14 + Math.random() * 0.12,
        decay: 0.02 + Math.random() * 0.03,
        life: 1,
        size: 1.5 + Math.random() * 2.2,
        color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)]
      });
    }
  }

  function drawSparks(dt) {
    if (!spCtx || !sparkCanvas) return;
    spCtx.clearRect(0, 0, sparkCanvas.width, sparkCanvas.height);
    for (var i = sparks.length - 1; i >= 0; i--) {
      var s = sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += s.gravity;
      s.vx *= 0.94;
      s.vy *= 0.94;
      s.life -= s.decay;
      if (s.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      var alpha = Math.min(1, s.life * (0.6 + 0.4 * Math.random()));
      spCtx.save();
      spCtx.strokeStyle = s.color;
      spCtx.lineWidth = Math.max(0.8, s.size * s.life);
      spCtx.lineCap = 'round';
      spCtx.globalAlpha = alpha;
      spCtx.beginPath();
      spCtx.moveTo(s.x, s.y);
      spCtx.lineTo(s.x - s.vx * 1.6, s.y - s.vy * 1.6);
      spCtx.stroke();

      spCtx.fillStyle = '#ffffff';
      spCtx.beginPath();
      spCtx.arc(s.x, s.y, Math.max(0.5, s.size * 0.35 * s.life), 0, Math.PI * 2);
      spCtx.fill();
      spCtx.restore();
    }
  }

  // Pointer sparkle bursts
  var isPointerDown = false;
  var moveThrottle = 0;
  window.addEventListener('pointerdown', function (e) {
    isPointerDown = true;
    spawnSparkler(e.clientX, e.clientY, 24, 1);
  }, { passive: true });

  window.addEventListener('pointerup', function () { isPointerDown = false; }, { passive: true });
  window.addEventListener('pointercancel', function () { isPointerDown = false; }, { passive: true });
  window.addEventListener('pointermove', function (e) {
    if (!isPointerDown) return;
    moveThrottle++;
    if (moveThrottle % 2 === 0) {
      spawnSparkler(e.clientX, e.clientY, 3, 0.6);
    }
  }, { passive: true });

  /* ================================================================
     INTERACTIVE HERO DIYA
  ================================================================ */
  var heroDiya = document.getElementById('hero-diya');
  var diyaHint = document.getElementById('diya-hint');
  var heroArt = document.querySelector('.hero-art');
  var GREETINGS = [
    '✨ शुभ दीपावली! ✨',
    '🪔 Light & Prosperity! 🪔',
    '✨ Endless Joy & Good Vibes! ✨',
    '🎉 Happy Diwali 2026! 🎉',
    '🌟 Shine Bright! 🌟'
  ];
  var greetIdx = 0;

  function kindleDiya(e) {
    if (e) e.stopPropagation();
    if (diyaHint) diyaHint.classList.add('hidden');
    if (!heroDiya) return;

    heroDiya.classList.remove('diya-flare');
    void heroDiya.offsetWidth;
    heroDiya.classList.add('diya-flare');
    setTimeout(function () {
      heroDiya.classList.remove('diya-flare');
    }, 900);

    var rect = heroDiya.getBoundingClientRect();
    var fx = rect.left + rect.width * 0.5;
    var fy = rect.top + rect.height * 0.32;

    spawnSparkler(fx, fy, 55, 1.6);
    launchRocket();
    if (Math.random() < 0.5) setTimeout(launchRocket, 300);

    if (heroArt) {
      var toast = document.createElement('div');
      toast.className = 'diya-toast';
      toast.textContent = GREETINGS[greetIdx % GREETINGS.length];
      greetIdx++;
      heroArt.appendChild(toast);
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 2100);
    }

    if (navigator.vibrate) {
      try { navigator.vibrate([40, 30, 50]); } catch (err) {}
    }
  }

  if (heroDiya) {
    heroDiya.addEventListener('pointerdown', function (e) {
      e.preventDefault();
    });
    heroDiya.addEventListener('click', kindleDiya);
  }

  /* ================================================================
     MAIN ANIMATION LOOP
  ================================================================ */
  var lastTime = 0;
  function loop(ts) {
    var dt = Math.min((ts - lastTime) / 1000, 0.1); lastTime = ts;
    var lit = document.documentElement.classList.contains('lit');
    drawStars(dt * 0.6);
    if (lit) { drawFloat(dt); drawFW(dt, ts); }
    else { wCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height); fCtx.clearRect(0, 0, floatCanvas.width, floatCanvas.height); }
    drawSparks(dt);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ================================================================
     RANGOLI
  ================================================================ */
  var g = document.getElementById('rangoli-g'), out = '', i, a;
  function petal(r0, r1, w, rot, fill, op, sc) {
    var m = r0 + (r1 - r0) * 0.35, n = r0 + (r1 - r0) * 0.75; sc = sc || '#f2c96b';
    return '<path transform="rotate(' + rot + ')" d="M0 ' + (-r0) + ' C ' + w + ' ' + (-m) + ' ' + w + ' ' + (-n) + ' 0 ' + (-r1) +
      ' C ' + (-w) + ' ' + (-n) + ' ' + (-w) + ' ' + (-m) + ' 0 ' + (-r0) + 'Z" fill="' + fill + '" fill-opacity="' + op + '" stroke="' + sc + '" stroke-opacity=".65" stroke-width="1"/>';
  }
  for (i = 0; i < 12; i++) out += petal(115, 215, 36, i * 30, '#e0357b', 0.3);
  for (i = 0; i < 12; i++) out += petal(115, 170, 24, i * 30 + 15, '#ffb627', 0.35);
  for (i = 0; i < 8; i++) out += petal(60, 112, 18, i * 45, '#2f7d5b', 0.4, '#1a8a6e');
  for (i = 0; i < 8; i++) out += petal(60, 108, 14, i * 45 + 22.5, '#1abc9c', 0.28, '#1a8a6e');
  out += '<circle r="112" fill="none" stroke="#f2c96b" stroke-opacity=".5" stroke-width="1.5"/>';
  out += '<circle r="170" fill="none" stroke="#e0357b" stroke-opacity=".3" stroke-width="1"/>';
  out += '<circle r="58" fill="none" stroke="#f2c96b" stroke-opacity=".6" stroke-width="1.5"/>';
  out += '<circle r="34" fill="rgba(255,182,39,.12)" stroke="#f2c96b" stroke-opacity=".7" stroke-width="1.5"/>';
  out += '<circle r="14" fill="rgba(255,182,39,.3)" stroke="#f2c96b" stroke-opacity=".9" stroke-width="1.5"/>';
  for (i = 0; i < 24; i++) { a = i * Math.PI / 12; out += '<circle cx="' + (224 * Math.cos(a)).toFixed(1) + '" cy="' + (224 * Math.sin(a)).toFixed(1) + '" r="4" fill="#ffb627" fill-opacity=".85"/>'; }
  for (i = 0; i < 36; i++) { a = i * Math.PI / 18; out += '<circle cx="' + (188 * Math.cos(a)).toFixed(1) + '" cy="' + (188 * Math.sin(a)).toFixed(1) + '" r="2.2" fill="#f2c96b" fill-opacity=".7"/>'; }
  for (i = 0; i < 24; i++) { a = i * Math.PI / 12; out += '<circle cx="' + (78 * Math.cos(a)).toFixed(1) + '" cy="' + (78 * Math.sin(a)).toFixed(1) + '" r="2" fill="#e0357b" fill-opacity=".7"/>'; }
  g.innerHTML = out;

  /* ================================================================
     EMBERS
  ================================================================ */
  var em = document.getElementById('embers');
  for (i = 0; i < 18; i++) {
    var sp = document.createElement('span');
    var sz = (1.8 + Math.random() * 3.2).toFixed(1) + 'px';
    sp.style.width = sz; sp.style.height = sz;
    sp.style.left = (45 + Math.random() * 10).toFixed(1) + '%';
    sp.style.setProperty('--x', (Math.random() * 90 - 45).toFixed(0) + 'px');
    sp.style.setProperty('--dur', (3.5 + Math.random() * 4.5).toFixed(1) + 's');
    sp.style.animationDelay = (Math.random() * 7).toFixed(1) + 's';
    em.appendChild(sp);
  }

  /* ================================================================
     VENUE
  ================================================================ */
  var C = CONFIG;
  if (C.address) { var ad = document.getElementById('address'); ad.textContent = C.address; ad.hidden = false; }
  var mapUrl = C.mapsLink || (C.address ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(C.address.replace(/\n/g, ', ')) : '');
  if (mapUrl) { var dir = document.getElementById('directions'); dir.href = mapUrl; dir.hidden = false; }

  /* ================================================================
     CONFETTI
  ================================================================ */
  function spawnConfetti() {
    var colors = ['#ffb627','#e0357b','#f2c96b','#2f7d5b','#ff6a00','#fff3da','#9b59b6','#1abc9c'];
    for (var ci = 0; ci < 130; ci++) {
      var el = document.createElement('div'); el.className = 'confetti-piece';
      var w = 6 + Math.random() * 8, h = 6 + Math.random() * 12;
      el.style.width = w + 'px'; el.style.height = h + 'px';
      el.style.left = (Math.random() * 100) + 'vw';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.setProperty('--rot', (Math.random() * 1080 - 540) + 'deg');
      var dur = 2.5 + Math.random() * 2;
      el.style.animationDuration = dur + 's';
      el.style.animationDelay = (Math.random() * 0.8) + 's';
      el.style.borderRadius = Math.random() < 0.5 ? '50%' : '2px';
      document.body.appendChild(el);
      setTimeout(function (e) { e.remove(); }, (dur + 1) * 1000, el);
    }
  }

  /* ================================================================
     RSVP
  ================================================================ */
  function wa(text) { return 'https://wa.me/' + (C.whatsappNumber || '').replace(/\D/g, '') + '?text=' + encodeURIComponent(text); }
  var yesBtn = document.getElementById('rsvp-yes');
  yesBtn.href = wa('Hi ' + C.hostName + "! I'll be at your Diwali party on Wednesday 28 October at 7:30 pm. Count me in!");
  yesBtn.addEventListener('click', function () { spawnConfetti(); launchRocket(); launchRocket(); });

  var no = document.getElementById('rsvp-no'), taunt = document.getElementById('taunt'), acts = document.querySelector('.actions');
  var lines = ['Oops, it slipped away!', 'Nice try.', 'Alfiya and Risha will be so sad.', 'Think of the mithai.',
               'Too slow!', 'The diya says no.', 'Not today! Come on...', 'The rangoli is crying.'];
  var tries = 0, curX = 0, curY = 0, gaveUp = false, justGaveUp = false;

  function runAway(px, py) {
    no.classList.add('dodging');
    var r = no.getBoundingClientRect(), bL = r.left - curX, bT = r.top - curY;
    var w = r.width, h = r.height, m = 12;
    var vw = document.documentElement.clientWidth, vh = window.innerHeight;
    var box = acts.getBoundingClientRect(), best = null;
    for (var k = 0; k < 40; k++) {
      var L = m + Math.random() * Math.max(1, vw - w - 2 * m);
      var T = m + Math.random() * Math.max(1, vh - h - 2 * m);
      var onB = L < box.right + 12 && L + w > box.left - 12 && T < box.bottom + 12 && T + h > box.top - 12;
      var nearP = px != null && Math.hypot(L + w / 2 - px, T + h / 2 - py) < 160;
      if (!best) best = [L, T];
      if (!onB && !nearP) { best = [L, T]; break; }
    }
    curX = best[0] - bL; curY = best[1] - bT;
    no.style.transform = 'translate(' + curX + 'px,' + curY + 'px)';
  }
  function surrender() {
    gaveUp = true; justGaveUp = true;
    setTimeout(function () { justGaveUp = false; }, 500);
    no.style.transform = 'translate(0,0)';
    no.classList.remove('dodging'); no.classList.add('surrendered');
    no.textContent = 'Fine, I\u2019ll come \uD83C\uDF89';
    taunt.textContent = 'The button gave up. See you Wednesday! \uD83E\uDEA4';
    spawnConfetti();
  }
  function attempt(px, py) {
    if (gaveUp) return; tries++;
    if (tries > lines.length) { surrender(); return; }
    taunt.textContent = lines[tries - 1]; runAway(px, py);
    yesBtn.classList.remove('nudge'); void yesBtn.offsetWidth; yesBtn.classList.add('nudge');
  }
  no.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') attempt(e.clientX, e.clientY); });
  no.addEventListener('pointerdown', function (e) { attempt(e.clientX, e.clientY); });
  no.addEventListener('click', function (e) {
    e.preventDefault(); if (justGaveUp) return;
    if (gaveUp) { window.open(yesBtn.href, '_blank', 'noopener'); return; }
    if (e.detail === 0) attempt();
  });

  /* ================================================================
     COUNTDOWN
  ================================================================ */
  var start = new Date(C.eventStartISO), endEv = new Date(C.eventEndISO);
  var elD = document.getElementById('cd-d'), elH = document.getElementById('cd-h'),
      elM = document.getElementById('cd-m'), elS = document.getElementById('cd-s'),
      cdBox = document.getElementById('cd'), cdTitle = document.getElementById('cd-title');
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function setV(el, v) { if (el.textContent !== v) el.textContent = v; }
  function tick() {
    var now = Date.now(), sv = start.getTime(), ev = endEv.getTime();
    if (now >= ev) { cdBox.hidden = true; cdTitle.textContent = 'Thank you for celebrating with us!'; return; }
    if (now >= sv) { cdBox.hidden = true; cdTitle.textContent = 'The party is on. Come on in!'; return; }
    var t = Math.floor((sv - now) / 1000);
    var d = Math.floor(t / 86400); t %= 86400;
    var h = Math.floor(t / 3600); t %= 3600;
    var mn = Math.floor(t / 60);
    setV(elD, d); setV(elH, pad(h)); setV(elM, pad(mn)); setV(elS, pad(t % 60));
  }
  tick(); setInterval(tick, 1000);

  /* ================================================================
     BACKGROUND FESTIVE MUSIC (music.mp3)
  ================================================================ */
  var musicBtn = document.getElementById('music-btn');
  var iconPlay = document.getElementById('music-icon-play'), iconPause = document.getElementById('music-icon-pause');
  var audio = new Audio('music.mp3');
  audio.loop = true;
  audio.preload = 'auto';

  function playAudio() {
    audio.play().then(function () {
      musicBtn.classList.add('playing');
      iconPlay.style.display = 'none';
      iconPause.style.display = '';
    }).catch(function (err) {
      console.warn('Audio playback error:', err);
    });
  }

  function stopAudio() {
    audio.pause();
    musicBtn.classList.remove('playing');
    iconPlay.style.display = '';
    iconPause.style.display = 'none';
  }

  if (musicBtn) {
    musicBtn.addEventListener('click', function () {
      if (audio.paused) {
        playAudio();
      } else {
        stopAudio();
      }
    });
  }

  audio.addEventListener('ended', function () {
    stopAudio();
  });
})();
