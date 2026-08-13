document.getElementById('year').textContent = new Date().getFullYear();

/* loader */
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('hide'), 1500);
});

/* navbar shrink */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive:true });

/* mobile burger */
const burger = document.getElementById('burger');
const navLinks = document.querySelector('.nav-links');
burger.addEventListener('click', () => {
  const open = navLinks.style.display === 'flex';
  navLinks.style.cssText = open ? '' : 'display:flex;position:fixed;top:70px;left:20px;right:20px;background:#0B1026;flex-direction:column;padding:24px;border-radius:16px;gap:20px;border:1px solid var(--line);z-index:1500;';
});

/* ripple */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e){
    const r = document.createElement('span');
    r.className = 'ripple';
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.4;
    r.style.width = r.style.height = size + 'px';
    r.style.left = (e.clientX - rect.left - size/2) + 'px';
    r.style.top = (e.clientY - rect.top - size/2) + 'px';
    this.appendChild(r);
    setTimeout(() => r.remove(), 650);
  });
});

/* ---------------- rocket cursor system ---------------- */
const rocket = document.getElementById('rocketCursor');
const rocketBody = rocket ? rocket.querySelector('.rocket-body') : null;
const rocketFlame = rocket ? rocket.querySelector('.rocket-flame') : null;
const sparks = [document.getElementById('spark1'), document.getElementById('spark2'), document.getElementById('spark3')];
const hasHover = window.matchMedia('(hover: hover)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let mx = window.innerWidth/2, my = window.innerHeight/2;

if (hasHover && !reducedMotion && rocket) {
  const TIP_X = 18, TIP_Y = 3; // nose-tip position within the 36x45 box — the visual "hotspot"
  let px = mx, py = my;       // rocket's rendered (lagged/inertial) position — tracks the tip, not the box center
  let heading = 0;             // current facing angle, degrees, 0 = pointing up
  let lastMx = mx, lastMy = my;
  let sparkIndex = 0;
  let trailAccum = 0;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
  }, { passive:true });

  const CATEGORIES = ['link','button','card','image'];
  document.querySelectorAll('[data-cursor]').forEach(el => {
    const kind = el.getAttribute('data-cursor');
    if (!CATEGORIES.includes(kind)) return;
    el.addEventListener('mouseenter', () => document.body.classList.add('cur-' + kind));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-' + kind));
  });

  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const relX = e.clientX - r.left - r.width/2;
      const relY = e.clientY - r.top - r.height/2;
      el.style.transform = `translate(${relX*0.25}px, ${relY*0.25}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });

  function fireSpark(x, y, angleDeg){
    const el = sparks[sparkIndex % sparks.length];
    sparkIndex++;
    const rad = (angleDeg + 180) * Math.PI / 180; // spark drifts opposite the heading, like exhaust
    const dist = 8 + Math.random() * 6;
    const ex = x + Math.sin(rad) * dist;
    const ey = y - Math.cos(rad) * dist;
    el.style.transition = 'none';
    el.style.opacity = '0.7';
    el.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%)`;
    requestAnimationFrame(() => {
      el.style.transition = 'transform .35s ease-out, opacity .35s ease-out';
      el.style.transform = `translate(${ex}px, ${ey}px) translate(-50%,-50%)`;
      el.style.opacity = '0';
    });
  }

  /* click: quick forward burst, flame flare, tiny spark burst, scale spring-back */
  let burstUntil = 0;
  window.addEventListener('mousedown', () => {
    document.body.classList.add('cur-down');
    const rad = heading * Math.PI / 180;
    const burstX = px + Math.sin(rad) * 10;
    const burstY = py - Math.cos(rad) * 10;
    burstUntil = performance.now() + 130;
    rocket.style.transition = 'transform .12s ease-out';
    rocket.style.transform = `translate(${burstX - TIP_X}px, ${burstY - TIP_Y}px) rotate(${heading}deg)`;
    if (rocketFlame) rocketFlame.style.opacity = '1';
    for (let i = 0; i < 3; i++) fireSpark(px, py, heading);
    setTimeout(() => { rocket.style.transition = 'transform .19s cubic-bezier(.34,1.56,.64,1)'; }, 130);
    setTimeout(() => { rocket.style.transition = ''; }, 320);
  });
  window.addEventListener('mouseup', () => {
    document.body.classList.remove('cur-down');
    if (rocketFlame) rocketFlame.style.opacity = '';
  });

  (function rocketLoop(){
    px += (mx - px) * 0.18;
    py += (my - py) * 0.18;

    const dx = mx - lastMx, dy = my - lastMy;
    const speed = Math.min(Math.hypot(dx, dy), 40);
    lastMx = mx; lastMy = my;

    if (speed > 1.2) {
      const targetHeading = Math.atan2(dy, dx) * 180 / Math.PI + 90;
      let diff = ((targetHeading - heading + 540) % 360) - 180;
      heading += diff * 0.18;
    }

    if (performance.now() >= burstUntil) {
      rocket.style.transform = `translate(${px - TIP_X}px, ${py - TIP_Y}px) rotate(${heading}deg)`;
    }

    if (rocketFlame && !document.body.classList.contains('cur-down')) {
      const flameScale = 1 + Math.min(speed / 40, 1) * 0.8;
      rocketFlame.style.transform = `scaleY(${flameScale})`;
      rocketFlame.style.opacity = String(0.55 + Math.min(speed / 40, 1) * 0.45);
    }

    /* subtle exhaust trail — capped, only while actually moving */
    trailAccum += speed;
    if (trailAccum > 55) {
      trailAccum = 0;
      fireSpark(px, py, heading);
    }

    requestAnimationFrame(rocketLoop);
  })();
}
/* reduced motion or touch: native cursor only, no rocket rendered (see CSS) */


/* scroll reveal */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

/* ---------------- background journey: Earth -> clouds/space -> stars -> nebula -> asteroid/planet -> moon ---------------- */
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let vw, vh;
function resize(){ vw = canvas.width = window.innerWidth; vh = canvas.height = window.innerHeight; }
window.addEventListener('resize', resize, { passive:true });
resize();

let stars = [];
function makeStars(){
  stars = [];
  const count = Math.floor((vw*vh)/8500);
  for(let i=0;i<count;i++){
    stars.push({ x:Math.random()*vw, y:Math.random()*vh, r:Math.random()*1.2+0.3, phase:Math.random()*Math.PI*2, speed:Math.random()*0.6+0.3 });
  }
}
makeStars();
window.addEventListener('resize', makeStars, { passive:true });

let particles = [];
function makeParticles(){
  particles = [];
  const count = Math.floor((vw*vh)/48000);
  for(let i=0;i<count;i++){
    particles.push({ x:Math.random()*vw, y:Math.random()*vh, r:Math.random()*1.6+0.6, vy:Math.random()*0.16+0.05, vx:(Math.random()-0.5)*0.07, a:Math.random()*0.26+0.06 });
  }
}
makeParticles();
window.addEventListener('resize', makeParticles, { passive:true });

/* shooting stars — rare, subtle */
let shootingStars = [];
function maybeSpawnShootingStar(){
  if (Math.random() < 0.006 && shootingStars.length < 2) {
    shootingStars.push({ x:Math.random()*vw*0.6+vw*0.2, y:Math.random()*vh*0.3, vx:6+Math.random()*4, vy:2+Math.random()*2, life:1 });
  }
}

const stageDefs = [
  { id:'home',     neb:[80,170,255],  brightness:0.22, galaxy:0.0  }, // Earth atmosphere
  { id:'about',    neb:[195,210,255], brightness:0.34, galaxy:0.05 }, // clouds fading into space
  { id:'skills',   neb:[210,220,255], brightness:0.44, galaxy:0.08 }, // stars
  { id:'services', neb:[130,160,255], brightness:0.5,  galaxy:0.12 },
  { id:'process',  neb:[90,200,215],  brightness:0.5,  galaxy:0.12 },
  { id:'why',      neb:[255,193,7],   brightness:0.56, galaxy:0.18 }, // asteroid lead-in
  { id:'projects', neb:[220,150,90],  brightness:0.7,  galaxy:0.42 }, // planet + asteroid field
  { id:'contact',  neb:[175,190,220], brightness:0.85, galaxy:0.6  }  // moon
];
let stagePositions = [];
function computeStagePositions(){
  stagePositions = stageDefs.map(s => {
    const el = document.getElementById(s.id);
    if (!el) return { ...s, top:0, height:vh };
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    return { ...s, top, height:rect.height };
  });
}
computeStagePositions();
window.addEventListener('resize', computeStagePositions, { passive:true });
window.addEventListener('load', computeStagePositions);
setTimeout(computeStagePositions, 1600);

const constellations = stageDefs.map(() => {
  const n = 5 + Math.floor(Math.random()*2);
  const pts = [];
  for(let i=0;i<n;i++) pts.push({ x:10+Math.random()*80, y:8+Math.random()*30 });
  return pts;
});
let constOpacity = stageDefs.map(() => 0);

function smoothstep(t){ return t*t*(3-2*t); }
function lerp(a,b,t){ return a+(b-a)*t; }

function getJourneyState(){
  const scrollY = window.scrollY;
  const centerY = scrollY + vh*0.5;
  let i = 0;
  for(let k=0;k<stagePositions.length-1;k++){ if (scrollY >= stagePositions[k].top) i = k; }
  const cur = stagePositions[i];
  const next = stagePositions[Math.min(i+1, stagePositions.length-1)];
  let t = 0;
  if (next.top !== cur.top) t = Math.max(0, Math.min(1, (scrollY - cur.top) / (next.top - cur.top)));
  const te = smoothstep(t);
  let activeIdx = 0, bestDist = Infinity;
  stagePositions.forEach((s, idx) => {
    const c = s.top + s.height/2;
    const d = Math.abs(c - centerY);
    if (d < bestDist) { bestDist = d; activeIdx = idx; }
  });
  return { i, next:Math.min(i+1, stagePositions.length-1), te, activeIdx };
}

function draw(timeMs){
  ctx.clearRect(0,0,vw,vh);
  const state = getJourneyState();
  const curDef = stageDefs[state.i];
  const nextDef = stageDefs[state.next];

  constOpacity = constOpacity.map((v, idx) => lerp(v, idx === state.activeIdx ? 1 : 0, 0.035));
  const totalW = constOpacity.reduce((a,b)=>a+b,0) || 1;
  const brightness = stageDefs.reduce((acc,s,i) => acc + s.brightness*constOpacity[i], 0) / totalW;
  const galaxy = stageDefs.reduce((acc,s,i) => acc + s.galaxy*constOpacity[i], 0) / totalW;
  const contactWeight = constOpacity[stageDefs.length-1] || 0;

  const nc = [
    Math.round(lerp(curDef.neb[0], nextDef.neb[0], state.te)),
    Math.round(lerp(curDef.neb[1], nextDef.neb[1], state.te)),
    Math.round(lerp(curDef.neb[2], nextDef.neb[2], state.te))
  ];
  const t = timeMs*0.00006;
  const n1x = vw*0.25 + Math.sin(t*1.3)*vw*0.08;
  const n1y = vh*0.3 + Math.cos(t*1.1)*vh*0.06;
  const n2x = vw*0.75 + Math.cos(t*0.9)*vw*0.08;
  const n2y = vh*0.65 + Math.sin(t*1.2)*vh*0.06;

  let g1 = ctx.createRadialGradient(n1x,n1y,0,n1x,n1y,vw*0.45);
  g1.addColorStop(0, `rgba(${nc[0]},${nc[1]},${nc[2]},${0.045+brightness*0.03})`);
  g1.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g1; ctx.fillRect(0,0,vw,vh);

  let g2 = ctx.createRadialGradient(n2x,n2y,0,n2x,n2y,vw*0.4);
  g2.addColorStop(0, `rgba(255,193,7,${0.018+brightness*0.025})`);
  g2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g2; ctx.fillRect(0,0,vw,vh);

  if (galaxy > 0.02) {
    const gx = vw*0.68, gy = vh*0.35;
    let gg = ctx.createRadialGradient(gx,gy,0,gx,gy,vw*0.5*galaxy+120);
    gg.addColorStop(0, `rgba(190,170,255,${0.05*galaxy})`);
    gg.addColorStop(0.5, `rgba(255,193,7,${0.03*galaxy})`);
    gg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gg; ctx.fillRect(0,0,vw,vh);
  }

  /* moon disc — appears softly for the contact stage */
  if (contactWeight > 0.03) {
    const mx2 = vw*0.86, my2 = vh*0.22, mr = 46*contactWeight;
    let mg = ctx.createRadialGradient(mx2-mr*0.3,my2-mr*0.3,0,mx2,my2,mr*1.4);
    mg.addColorStop(0, `rgba(230,230,240,${0.5*contactWeight})`);
    mg.addColorStop(1, 'rgba(230,230,240,0)');
    ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx2,my2,mr,0,Math.PI*2); ctx.fill();
  }

  stars.forEach(s => {
    const tw = 0.5 + Math.sin(timeMs*0.001*s.speed + s.phase)*0.4;
    ctx.globalAlpha = tw * (0.55 + brightness*0.55);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
  });
  ctx.globalAlpha = 1;

  particles.forEach(p => {
    p.y -= p.vy; p.x += p.vx;
    if (p.y < -5) { p.y = vh+5; p.x = Math.random()*vw; }
    ctx.globalAlpha = p.a;
    ctx.fillStyle = '#FFC107';
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
  });
  ctx.globalAlpha = 1;

  maybeSpawnShootingStar();
  shootingStars = shootingStars.filter(s => s.life > 0);
  shootingStars.forEach(s => {
    ctx.strokeStyle = `rgba(255,255,255,${s.life*0.6})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - s.vx*8, s.y - s.vy*8);
    ctx.stroke();
    s.x += s.vx; s.y += s.vy; s.life -= 0.02;
  });

  constellations.forEach((pts, idx) => {
    const op = constOpacity[idx];
    if (op < 0.01) return;
    ctx.strokeStyle = `rgba(255,193,7,${op*0.3})`;
    ctx.fillStyle = `rgba(255,193,7,${op*0.6})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    pts.forEach((p, i) => {
      const px = p.x/100*vw, py = p.y/100*vh;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();
    pts.forEach(p => {
      const px = p.x/100*vw, py = p.y/100*vh;
      ctx.beginPath(); ctx.arc(px, py, 1.6, 0, Math.PI*2); ctx.fill();
    });
  });

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

/* contact form -> web3forms (name, email, project details only) */
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const errorEl = document.getElementById('formError');
const successEl = document.getElementById('formSuccess');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.classList.remove('show'); errorEl.textContent = '';

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const details = document.getElementById('details').value.trim();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name || !email || !details) {
    errorEl.textContent = 'Please fill in all required fields.';
    errorEl.classList.add('show');
    return;
  }
  if (!emailOk) {
    errorEl.textContent = 'Please enter a valid email address.';
    errorEl.classList.add('show');
    return;
  }

  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  try {
    const accessKey = form.querySelector('input[name="access_key"]').value;
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: accessKey,
        subject: 'New project inquiry — P7MCI website',
        from_name: 'P7MCI Website',
        name, email,
        message: details
      })
    });
    const data = await res.json();
    if (data.success) {
      form.style.opacity = '0';
      setTimeout(() => {
        form.hidden = true;
        successEl.hidden = false;
        requestAnimationFrame(() => successEl.classList.add('show'));
      }, 300);
    } else {
      throw new Error(data.message || 'Something went wrong.');
    }
  } catch (err) {
    errorEl.textContent = "We couldn't send your message. Please try again or email us directly.";
    errorEl.classList.add('show');
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
});
