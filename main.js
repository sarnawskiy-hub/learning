/* ==============================
   AELORA — main.js
   ============================== */

// ── LANGUAGE TOGGLE ──────────────────────────────────────────────────────────
let currentLang = 'uk';
const langToggle = document.getElementById('lang-toggle');
const langLabel = document.getElementById('lang-label');

function applyLang(lang) {
  currentLang = lang;
  langLabel.textContent = lang === 'uk' ? 'EN' : 'UA';

  document.querySelectorAll('[data-en]').forEach(el => {
    const text = lang === 'en' ? el.dataset.en : (el.dataset.uk || '');
    if (!text) return;

    // Для елементів без дочірніх тегів — просто замінюємо textContent
    const hasChildElements = el.children.length > 0;
    if (!hasChildElements) {
      el.textContent = text;
      return;
    }

    // Для елементів з дочірніми тегами (кнопки з SVG тощо) —
    // оновлюємо лише перший текстовий вузол, не чіпаючи SVG
    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        node.textContent = text;
        return;
      }
    }
  });

  // Оновлення placeholder у полях форми
  const placeholders = {
    'cf-name': { en: 'Alex Doe', uk: 'Іван Петренко' },
    'cf-email': { en: 'hello@example.com', uk: 'hello@example.com' },
    'cf-message': { en: 'Tell me about your project...', uk: 'Розкажіть про ваш проєкт...' }
  };
  Object.entries(placeholders).forEach(([id, vals]) => {
    const el = document.getElementById(id);
    if (el) el.placeholder = lang === 'en' ? vals.en : vals.uk;
  });
}

langToggle.addEventListener('click', () => {
  applyLang(currentLang === 'uk' ? 'en' : 'uk');
});

applyLang('uk');

// ── HAMBURGER ─────────────────────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// ── NAVBAR SCROLL ─────────────────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── REVEAL ON SCROLL ─────────────────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── SKILL BARS ────────────────────────────────────────────────────────────────
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const bar = e.target.querySelector('.skill-bar');
      if (bar && !bar.style.width) {
        setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, 200);
      }
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-card').forEach(card => skillObserver.observe(card));

// ── COUNTER ANIMATION ─────────────────────────────────────────────────────────
function animateCount(el, target, duration = 1800) {
  let start = null;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.stat-num').forEach(num => {
        animateCount(num, parseInt(num.dataset.target));
      });
      statsObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.4 });

const statsBar = document.querySelector('.stats-bar');
if (statsBar) statsObserver.observe(statsBar);

// ── PARTICLE CANVAS ───────────────────────────────────────────────────────────
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

let W, H, particles = [];

function resizeCanvas() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas, { passive: true });

const COLORS = ['rgba(16,185,129,', 'rgba(4,120,87,', 'rgba(245,158,11,', 'rgba(52,211,153,', 'rgba(134,239,172,'];

class Particle {
  constructor() { this.reset(true); }
  reset(initial = false) {
    this.x = Math.random() * W;
    this.y = initial ? Math.random() * H : H + 10;
    this.r = Math.random() * 1.8 + 0.4;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = -(Math.random() * 0.4 + 0.15);
    this.life = 0;
    this.maxLife = Math.random() * 200 + 100;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life++;
    if (this.y < -10 || this.life > this.maxLife) this.reset();
  }
  draw() {
    const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * 0.6;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color + alpha + ')';
    ctx.fill();
  }
}

for (let i = 0; i < 120; i++) particles.push(new Particle());

let animating = true;
function animate() {
  if (!animating) return;
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animate);
}
animate();

// --- Global Firefly Animation ---
const globalFirefly = document.getElementById('global-firefly');

function animateGlobalFirefly() {
  if (!globalFirefly) return;
  const time = Date.now() * 0.0005;

  // Use compound sine waves for organic, seemingly random movement across the entire viewport
  const ww = window.innerWidth;
  const wh = window.innerHeight;

  // Base movement + smaller chaotic oscillations
  const x = (ww / 2) + Math.sin(time * 0.7) * (ww * 0.4) + Math.sin(time * 2.3) * (ww * 0.1);
  const y = (wh / 2) + Math.cos(time * 0.5) * (wh * 0.4) + Math.cos(time * 1.9) * (wh * 0.1);

  globalFirefly.style.transform = `translate(${x}px, ${y}px)`;

  requestAnimationFrame(animateGlobalFirefly);
}
requestAnimationFrame(animateGlobalFirefly);

// Pause particles when tab hidden
document.addEventListener('visibilitychange', () => { animating = !document.hidden; if (animating) animate(); });

// ── MAGNETIC BUTTONS ──────────────────────────────────────────────────────────
document.querySelectorAll('.btn-primary, .btn-ghost').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    btn.style.transform = `translate(${dx * 0.12}px, ${dy * 0.12}px) scale(1.04)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

// ── FORM SUBMIT ───────────────────────────────────────────────────────────────
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"] span');
    const original = btn.textContent;
    btn.textContent = '✓ ' + (currentLang === 'uk' ? 'Надіслано!' : 'Sent!');
    form.querySelectorAll('input, textarea').forEach(el => el.value = '');
    setTimeout(() => { btn.textContent = original; }, 3000);
  });
}

// ── SMOOTH PARALLAX for ORBS ─────────────────────────────────────────────────
let mouseX = 0, mouseY = 0;
const orbs = document.querySelectorAll('.orb');
document.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

function updateOrbs() {
  orbs.forEach((orb, i) => {
    const factor = (i + 1) * 8;
    const tx = mouseX * factor;
    const ty = mouseY * factor;
    orb.style.transform = `translate(${tx}px, ${ty}px)`;
  });
  requestAnimationFrame(updateOrbs);
}
updateOrbs();

// ── AVATAR FALLBACK ────────────────────────────────────────────────────────────
const avatarImg = document.getElementById('avatar-img');
if (avatarImg) {
  avatarImg.addEventListener('error', () => {
    avatarImg.style.display = 'none';
    const wrapper = avatarImg.closest('.avatar-wrapper');
    if (wrapper) {
      const fallback = document.createElement('div');
      fallback.style.cssText = `
        width:100%;height:100%;border-radius:50%;
        background:linear-gradient(135deg,#047857,#10b981,#f59e0b);
        display:flex;align-items:center;justify-content:center;
        font-family:'Outfit',sans-serif;font-size:4rem;font-weight:900;color:#fff;
        position:relative;z-index:2;
      `;
      fallback.textContent = 'A';
      wrapper.appendChild(fallback);
    }
  });
}
