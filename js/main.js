/**
 * =============================================
 * RAZIF PORTFOLIO — MAIN JAVASCRIPT
 * =============================================
 */

// =============================================
// 1. INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  // Add utils CSS
  const utilsLink = document.createElement('link');
  utilsLink.rel = 'stylesheet';
  utilsLink.href = 'css/utils.css';
  document.head.appendChild(utilsLink);

  initLoader();
  initParticles();
  initCursor();
  initScrollProgress();
  initNavbar();
  initThemeToggle();
  initTyping();
  initScrollReveal();
  initSkillBars();
  initCounters();
  initProjectFilter();
  initContactForm();
  initBackToTop();
  initSmoothScroll();
});

// =============================================
// 2. LOADER
// =============================================
function initLoader() {
  const loader = document.getElementById('loader');
  const progress = document.getElementById('loader-progress');
  const codeText = document.getElementById('loader-code');
  
  const steps = [
    { text: 'loading records', pct: 20 },
    { text: 'validating data', pct: 45 },
    { text: 'removing duplicates', pct: 70 },
    { text: 'generating reports', pct: 90 },
    { text: 'ready', pct: 100 },
  ];

  let current = 0;

  const tick = () => {
    if (current >= steps.length) {
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        triggerHeroAnimations();
      }, 300);
      return;
    }
    const step = steps[current++];
    codeText.textContent = step.text;
    progress.style.width = step.pct + '%';
    setTimeout(tick, 400 + Math.random() * 200);
  };

  document.body.style.overflow = 'hidden';
  setTimeout(tick, 200);
}

function triggerHeroAnimations() {
  document.querySelectorAll('.hero-section .reveal-up, .hero-section .reveal-right').forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('visible');
    }, i * 120);
  });
}

// =============================================
// 3. PARTICLE CANVAS
// =============================================
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');

  let width, height, particles = [];
  const PARTICLE_COUNT = 80;
  const COLORS = ['rgba(139,92,246,', 'rgba(6,182,212,', 'rgba(240,171,252,'];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 1.5 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = Math.random() * 0.5 + 0.1;
      this.life = Math.random() * 200 + 100;
      this.maxLife = this.life;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life--;
      if (this.life <= 0 || this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
        this.reset();
      }
    }
    draw() {
      const fade = this.life / this.maxLife;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color + (this.alpha * fade) + ')';
      ctx.fill();
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(139,92,246,${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }

  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  animate();
}

// =============================================
// 4. CUSTOM CURSOR
// =============================================
function initCursor() {
  const dot = document.getElementById('cursor-dot');
  const outline = document.getElementById('cursor-outline');

  if (!dot || !outline) return;

  let mouseX = 0, mouseY = 0;
  let outlineX = 0, outlineY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  // Smooth outline follow
  function animateOutline() {
    outlineX += (mouseX - outlineX) * 0.18;
    outlineY += (mouseY - outlineY) * 0.18;
    outline.style.left = outlineX + 'px';
    outline.style.top = outlineY + 'px';
    requestAnimationFrame(animateOutline);
  }
  animateOutline();

  // Hover effect on interactive elements
  const hoverEls = document.querySelectorAll('a, button, .project-card, .contact-card, .skill-icon-item');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => outline.classList.add('hovered'));
    el.addEventListener('mouseleave', () => outline.classList.remove('hovered'));
  });

  // Hide on leave / show on enter
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    outline.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    outline.style.opacity = '1';
  });
}

// =============================================
// 5. SCROLL PROGRESS BAR
// =============================================
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (scrolled / total * 100) + '%';
  }, { passive: true });
}

// =============================================
// 6. NAVBAR
// =============================================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks = document.getElementById('nav-links');

  // Scroll: add .scrolled class
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    updateActiveLink();
  }, { passive: true });

  // Hamburger toggle
  let overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);

  const openMenu = () => {
    hamburger.classList.add('open');
    navLinks.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => {
    if (navLinks.classList.contains('open')) closeMenu();
    else openMenu();
  });

  overlay.addEventListener('click', closeMenu);

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

// Active link based on scroll position
function updateActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-link');
  let current = '';

  sections.forEach(section => {
    const top = section.offsetTop - 120;
    if (window.scrollY >= top) current = section.id;
  });

  links.forEach(link => {
    link.classList.toggle('active', link.dataset.section === current);
  });
}

// =============================================
// 7. THEME TOGGLE
// =============================================
function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  const saved = localStorage.getItem('portfolio-theme') || 'dark';
  html.dataset.theme = saved;

  toggle.addEventListener('click', () => {
    const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
    html.dataset.theme = next;
    localStorage.setItem('portfolio-theme', next);
  });
}

// =============================================
// 8. TYPING ANIMATION
// =============================================
function initTyping() {
  const el = document.getElementById('typing-text');
  if (!el) return;

  const roles = [
    'Data Analyst',
    'Data Management Specialist',
    'IT Auditor',
    'Detail-Oriented Problem Solver',
    'Information Systems Graduate',
  ];

  let roleIdx = 0, charIdx = 0, deleting = false;
  const SPEED_TYPE = 80, SPEED_DELETE = 45, PAUSE = 2000;

  const tick = () => {
    const current = roles[roleIdx];

    if (!deleting) {
      el.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(tick, PAUSE);
        return;
      }
    } else {
      el.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
      }
    }

    setTimeout(tick, deleting ? SPEED_DELETE : SPEED_TYPE);
  };

  setTimeout(tick, 800);
}

// =============================================
// 9. SCROLL REVEAL
// =============================================
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  // Skip hero section elements (handled by loader)
  const nonHeroEls = Array.from(revealEls).filter(el => !el.closest('.hero-section'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = getComputedStyle(entry.target).getPropertyValue('--delay') || '0s';
        const delayMs = parseFloat(delay) * 1000;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delayMs);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  nonHeroEls.forEach(el => observer.observe(el));
}

// =============================================
// 10. ANIMATED SKILL BARS
// =============================================
function initSkillBars() {
  const fills = document.querySelectorAll('.skill-fill');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        setTimeout(() => fill.classList.add('animated'), 200);
        observer.unobserve(fill);
      }
    });
  }, { threshold: 0.5 });

  fills.forEach(fill => observer.observe(fill));
}

// =============================================
// 11. ANIMATED COUNTERS
// =============================================
function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-count]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const duration = 1800;
        const start = performance.now();

        const animate = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

// =============================================
// 12. PROJECT FILTER
// =============================================
function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        if (match) {
          card.style.opacity = '1';
          card.style.transform = 'scale(1) translateY(0)';
          card.style.pointerEvents = '';
          card.classList.remove('hidden');
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95) translateY(8px)';
          card.style.pointerEvents = 'none';
          setTimeout(() => {
            if (!match) card.classList.add('hidden');
          }, 350);
        }
      });
    });
  });
}

// =============================================
// 13. CONTACT FORM
// =============================================
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('form-submit-btn');
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !message) {
      shakeForm(form);
      return;
    }

    // Button loading state
    btn.classList.add('btn-loading');
    btn.querySelector('span').textContent = 'Sending...';

    // Simulate sending (replace with real API later, e.g. Formspree)
    await delay(1800);

    // Success state
    btn.classList.remove('btn-loading');
    form.innerHTML = `
      <div class="form-success visible">
        <div class="form-success-icon">🚀</div>
        <h3>Message Sent!</h3>
        <p>Thanks <strong>${name}</strong>! I'll get back to you soon at ${email}.</p>
      </div>
    `;
  });
}

function shakeForm(form) {
  form.style.animation = 'none';
  form.offsetHeight; // force reflow
  form.style.animation = 'shake 0.4s ease';
}

// Inject shake keyframe dynamically
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-5px); }
    80% { transform: translateX(5px); }
  }
`;
document.head.appendChild(shakeStyle);

// =============================================
// 14. BACK TO TOP
// =============================================
function initBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6"/></svg>`;
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// =============================================
// 15. SMOOTH SCROLL
// =============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// =============================================
// 16. UTILITIES
// =============================================
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Tilt effect on project cards
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -4;
    const rotateY = ((x - cx) / cx) * 4;
    card.style.transform = `translateY(-6px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    card.style.transformStyle = 'preserve-3d';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// Parallax on hero visual (desktop only)
if (window.innerWidth > 1024) {
  window.addEventListener('mousemove', (e) => {
    const mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
    const mouseY = (e.clientY / window.innerHeight - 0.5) * 10;
    const heroCard = document.querySelector('.hero-card-wrapper');
    if (heroCard) {
      heroCard.style.transform = `translate(${mouseX * 0.5}px, ${mouseY * 0.5}px)`;
    }
  }, { passive: true });
}

// Glitch effect on logo
const logo = document.querySelector('.nav-logo');
if (logo) {
  logo.addEventListener('mouseenter', () => {
    logo.style.animation = 'none';
    logo.style.textShadow = `
      2px 0 var(--c-primary), -2px 0 var(--c-secondary)
    `;
    setTimeout(() => {
      logo.style.textShadow = '';
    }, 200);
  });
}

console.log('%c🚀 Razif Portfolio', 'color: #8b5cf6; font-size: 18px; font-weight: bold;');
console.log('%cTurning Data Into Insight ✨', 'color: #06b6d4; font-size: 12px;');
