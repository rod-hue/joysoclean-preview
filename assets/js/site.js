(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const hasGSAP = !!window.gsap;
  const IMG = 'assets/img/';
  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- data ---------- */
  const WORK = [
    ['g16', "Chef's kitchen"], ['g22', 'Spa bath'], ['g04', 'Airbnb suite'], ['g14', 'Grand foyer'],
    ['g06', 'Lounge bar'], ['g21', 'New build kitchen'], ['g12', 'Folded and finished'], ['g17', 'Family room'],
    ['g24', 'Marble bath'], ['g00', 'Hardwood shine'], ['g23', 'Dining'], ['g10', 'Bathroom'],
    ['g08', 'Venue bar'], ['g05', 'Airbnb turnover'], ['g27', 'Laundry'], ['g13', 'Powder room']
  ];
  const IG = [
    ['flyer-300', 'DeTMflYt5IG'], ['g25', 'DdibE5JFso0'], ['ba-base-a', 'DcWtl3Vj3U3'], ['ba-garage-a', 'DYLFsBKDyjN'],
    ['g21', 'DIJ0F-MxUd_'], ['g20', 'DGl4ZMhSHDJ'], ['g16', 'DCkBJlNyHZT'], ['g14', 'DCaV7xbyXbe'],
    ['g26', 'DB-DBiUxHf-'], ['g11', 'DAHHoGMy9MF'], ['g04', 'C_Ti2tkSlW8'], ['joy', 'CwlBeCKpyN6']
  ];

  /* ---------- loader ---------- */
  const loader = $('#loader');
  const finishLoad = () => { loader && loader.classList.add('done'); intro(); };
  let loaded = false;
  const done = () => { if (loaded) return; loaded = true; setTimeout(finishLoad, reduce ? 0 : 400); };
  window.addEventListener('load', done);
  setTimeout(done, 2600);

  /* ---------- clock ---------- */
  const clock = $('#clock');
  const tick = () => { if (clock) clock.textContent = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' }); };
  tick(); setInterval(tick, 15000);

  /* ---------- nav ---------- */
  const nav = $('#nav'), burger = $('#burger'), drawer = $('#drawer');
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open); drawer.classList.toggle('open', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  $$('#drawer a').forEach(a => a.addEventListener('click', () => { burger.setAttribute('aria-expanded', 'false'); drawer.classList.remove('open'); }));
  let lastY = 0;
  const onScroll = y => { nav.classList.toggle('hide', y > lastY && y > 300 && !drawer.classList.contains('open')); lastY = y; };

  /* ---------- lenis ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', e => { onScroll(e.scroll); window.ScrollTrigger && ScrollTrigger.update(); });
    if (hasGSAP) { gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); if (id.length < 2) return; const t = $(id); if (!t) return;
      e.preventDefault(); lenis.scrollTo(t, { offset: id === '#top' ? 0 : -20, duration: 1.4 });
    }));
  } else {
    addEventListener('scroll', () => onScroll(scrollY), { passive: true });
  }

  /* ---------- cursor ---------- */
  const cur = $('#cursor');
  if (fine && cur) {
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; }, { passive: true });
    const loop = () => { cx += (x - cx) * .2; cy += (y - cy) * .2; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); };
    loop();
    document.addEventListener('pointerover', e => cur.classList.toggle('big', !!e.target.closest('a,button,.ba__stage,.work__card,input')));
  }

  /* ---------- bubbles canvas ---------- */
  const cv = $('#bubbles');
  if (cv && !reduce) {
    const ctx = cv.getContext('2d');
    let W, H, dpr, bubbles = [], sparks = [], mx = -999, my = -999, running = true;
    const resize = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const make = (initial) => {
      const r = 8 + Math.random() ** 2 * (W < 700 ? 46 : 70);
      return { x: Math.random() * W, y: initial ? Math.random() * H : H + r + Math.random() * 100, r, vy: .25 + Math.random() * .6 + (40 / r) * .08, ph: Math.random() * 6.28, hue: Math.random() * 360, wob: .4 + Math.random() };
    };
    resize();
    const N = W < 700 ? 16 : 30;
    for (let i = 0; i < N; i++) bubbles.push(make(true));
    addEventListener('resize', resize);
    cv.parentElement.addEventListener('pointermove', e => { const b = cv.getBoundingClientRect(); mx = e.clientX - b.left; my = e.clientY - b.top; });
    cv.parentElement.addEventListener('pointerleave', () => { mx = my = -999; });
    const pop = (b) => {
      for (let i = 0; i < 14; i++) { const a = Math.random() * 6.28, s = 1 + Math.random() * 3; sparks.push({ x: b.x, y: b.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1 }); }
      Object.assign(b, make(false));
    };
    const drawBubble = (b, t) => {
      const x = b.x + Math.sin(t * .001 * b.wob + b.ph) * 10, y = b.y, r = b.r;
      const g = ctx.createRadialGradient(x, y, r * .55, x, y, r);
      const h = (b.hue + t * .02) % 360;
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(.78, `hsla(${h},100%,75%,.06)`);
      g.addColorStop(.9, `hsla(${(h + 60) % 360},100%,78%,.28)`);
      g.addColorStop(.97, `hsla(${(h + 140) % 360},100%,85%,.45)`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.75)';
      ctx.beginPath(); ctx.ellipse(x - r * .38, y - r * .42, r * .16, r * .08, -.7, 0, 6.283); ctx.fill();
      b._x = x;
    };
    const io = new IntersectionObserver(([en]) => { running = en.isIntersecting; if (running) requestAnimationFrame(frame); });
    io.observe(cv);
    function frame(t) {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (const b of bubbles) {
        b.y -= b.vy;
        if (b.y < -b.r - 20) Object.assign(b, make(false));
        const dx = (b._x || b.x) - mx, dy = b.y - my;
        if (dx * dx + dy * dy < b.r * b.r) pop(b);
        drawBubble(b, t);
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]; s.x += s.vx; s.y += s.vy; s.vy += .05; s.life -= .03;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.fillStyle = `rgba(255,${150 + 100 * s.life | 0},220,${s.life})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, 1.6 * s.life + .4, 0, 6.283); ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- before / after ---------- */
  const stage = $('#baStage'), range = $('#baRange'), bA = $('#baAfter'), bB = $('#baBefore'), bL = $('#baLabel');
  const setPos = v => stage.style.setProperty('--pos', v + '%');
  range.addEventListener('input', () => setPos(range.value));
  const tabs = $$('.ba__tabs button');
  // preload
  tabs.forEach(t => { [new Image().src = IMG + t.dataset.b + '-a.jpg', new Image().src = IMG + t.dataset.b + '-b.jpg']; });
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(o => o.setAttribute('aria-selected', o === t));
    bA.src = IMG + t.dataset.b + '-a.jpg'; bB.src = IMG + t.dataset.b + '-b.jpg';
    bA.alt = 'After: ' + t.dataset.label; bB.alt = 'Before: ' + t.dataset.label;
    bL.textContent = t.dataset.label;
    stage.classList.remove('swap'); void stage.offsetWidth; stage.classList.add('swap');
    sweepDemo();
  }));
  let demoed = false;
  function sweepDemo() {
    if (reduce || !hasGSAP) { range.value = 50; setPos(50); return; }
    const o = { v: 92 };
    gsap.fromTo(o, { v: 92 }, { v: 50, duration: 1.4, ease: 'expo.out', onUpdate: () => { range.value = o.v; setPos(o.v); } });
  }

  /* ---------- tilt + glow ---------- */
  if (fine && !reduce) {
    $$('.tilt').forEach(el => {
      el.addEventListener('pointermove', e => {
        const b = el.getBoundingClientRect(), px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
        el.style.transform = `perspective(900px) rotateX(${(.5 - py) * 6}deg) rotateY(${(px - .5) * 8}deg)`;
        el.style.setProperty('--mx', px * 100 + '%'); el.style.setProperty('--my', py * 100 + '%');
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- work track ---------- */
  const track = $('#workTrack');
  track.innerHTML = WORK.map(([k, c], i) => `<figure class="work__card"><img src="${IMG}${k}-s.jpg" srcset="${IMG}${k}-s.jpg 720w, ${IMG}${k}.jpg 1080w" sizes="(max-width:640px) 76vw, 480px" alt="${c}, cleaned by Joy So Clean" loading="lazy"><figcaption>${String(i + 1).padStart(2, '0')} / ${c}</figcaption></figure>`).join('');
  $('#workTot').textContent = String(WORK.length).padStart(2, '0');

  /* ---------- instagram ---------- */
  $('#igGrid').innerHTML = IG.map(([k, code]) => `<a class="ig__item" href="https://www.instagram.com/p/${code}/" target="_blank" rel="noopener" aria-label="Open this Joy So Clean post on Instagram"><img src="${IMG}${k}-s.jpg" alt="" loading="lazy"></a>`).join('');

  /* ---------- quote builder ---------- */
  const qb = $('#qb'), msgEl = $('#qbMsg'), send = $('#qbSend'), copyBtn = $('#qbCopy');
  const state = { type: 'Home or apartment', beds: 2, baths: 1, freq: 'One time', adds: [], area: 'Nashville' };
  $$('.seg', qb).forEach(seg => {
    const name = seg.dataset.name, multi = seg.classList.contains('seg--multi');
    seg.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (multi) { b.classList.toggle('on'); state[name] = $$('button.on', seg).map(x => x.textContent); }
      else { $$('button', seg).forEach(x => x.classList.toggle('on', x === b)); state[name] = b.textContent; }
      render();
    });
  });
  $$('.stepper', qb).forEach(st => {
    const name = st.dataset.name, out = $('output', st);
    st.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      state[name] = Math.max(name === 'beds' ? 0 : 1, Math.min(8, state[name] + +b.dataset.d));
      out.textContent = name === 'beds' && state[name] === 0 ? 'Studio' : state[name]; render();
    });
  });
  function render() {
    const size = state.type === 'Commercial space' ? '' : `${state.beds === 0 ? 'a studio' : state.beds + ' bed'}, ${state.baths} bath`;
    const lines = [
      `Hi Joy! I found you on your website and I'd like a quote.`,
      `Service: ${state.type}${size ? ' (' + size + ')' : ''}`,
      `How often: ${state.freq}`,
      state.adds.length ? `Add-ons: ${state.adds.join(', ')}` : '',
      `Area: ${state.area}`,
      `What dates do you have open?`
    ].filter(Boolean);
    const txt = lines.join('\n');
    msgEl.textContent = txt;
    const ios = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
    send.href = `sms:+16292388298${ios ? '&' : '?'}body=${encodeURIComponent(txt)}`;
    return txt;
  }
  render();
  copyBtn.addEventListener('click', async () => {
    const t = render();
    try { await navigator.clipboard.writeText(t); copyBtn.textContent = 'Copied. Opening Instagram'; }
    catch (e) { copyBtn.textContent = 'Opening Instagram'; }
    setTimeout(() => { window.open('https://ig.me/m/joysoclean', '_blank', 'noopener'); copyBtn.textContent = 'Copy for Instagram DM'; }, 700);
  });
  $$('[data-pick]').forEach(a => a.addEventListener('click', () => {
    const want = a.dataset.pick, seg = $('.seg[data-name=type]', qb);
    const b = $$('button', seg).find(x => x.textContent === want); if (b) b.click();
  }));

  /* ---------- GSAP scroll motion ---------- */
  function intro() {
    if (!hasGSAP || reduce) { sweepDemoOnView(); return; }
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.hero__title .w', { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: .12 });
    gsap.from('.hero .chip, .hero__sub, .hero__ctas, .hero__meta', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', stagger: .08, delay: .3 });
    gsap.from('.capsule', { clipPath: 'inset(100% 0 0 0 round 999px 999px 28px 28px)', duration: 1.6, ease: 'expo.inOut', delay: .1 });
    gsap.from('.float-card, .hud', { scale: .6, opacity: 0, duration: .9, ease: 'back.out(1.8)', stagger: .1, delay: 1 });

    // hero parallax
    gsap.to('.capsule img', { yPercent: 8, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__title', { yPercent: -25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // generic reveals
    $$('.section__head, .svc, .step, .joy__copy > *, .area__copy > *, .ig__item, .qb, .quote__intro > *, .addons, .cta > *').forEach(el => {
      gsap.from(el, { y: 50, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    ScrollTrigger.batch('.step', { start: 'top 85%', once: true, onEnter: els => els.forEach((e, i) => setTimeout(() => e.classList.add('in'), i * 150)) });
    gsap.from('.joy__ph', { y: 120, rotate: (i) => [-6, 8, -4][i], opacity: 0, duration: 1.4, ease: 'expo.out', stagger: .15, scrollTrigger: { trigger: '.joy__photos', start: 'top 80%', once: true } });
    gsap.from('.ba__stage', { clipPath: 'inset(0 0 100% 0 round 28px)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: '.ba__stage', start: 'top 80%', once: true, onEnter: () => setTimeout(sweepDemo, 700) } });
    gsap.from('.radar__pt', { scale: 0, duration: .8, ease: 'back.out(2)', stagger: .12, scrollTrigger: { trigger: '.radar', start: 'top 75%', once: true } });

    // marquee velocity
    const mq = $('#marquee'); let mqX = 0, vel = 0;
    gsap.ticker.add(() => {
      const half = mq.scrollWidth / 2;
      mqX -= .6 + Math.abs(vel) * .004; vel *= .92;
      if (mqX <= -half) mqX += half;
      mq.style.transform = `translate3d(${mqX}px,0,0)`;
    });
    ScrollTrigger.create({ onUpdate: s => { vel = s.getVelocity(); } });

    // horizontal work
    const mm = gsap.matchMedia();
    mm.add('(min-width: 641px)', () => {
      const dist = () => track.scrollWidth - innerWidth + $('.work__head').offsetWidth + 80;
      const tw = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: '#workPin', pin: true, start: 'top top', end: () => '+=' + dist(), scrub: 1, invalidateOnRefresh: true,
          onUpdate: s => { $('#workNum').textContent = String(Math.min(WORK.length, 1 + Math.floor(s.progress * WORK.length))).padStart(2, '0'); }
        }
      });
      $$('.work__card img').forEach(img => gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentElement, containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } }));
    });
    addEventListener('load', () => ScrollTrigger.refresh());
  }
  function sweepDemoOnView() {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && !demoed) { demoed = true; sweepDemo(); io.disconnect(); } }, { threshold: .4 });
    io.observe(stage);
  }
})();
