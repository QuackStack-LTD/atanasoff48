/* ============================================
   ATANASOFF48 HACKATHON — INTERACTIVE EFFECTS
   Premium animations, particles, tilt, magnetic buttons,
   countdown, custom cursor, scroll reveals, parallax
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initParticleNetwork();
    initRevealAnimations();
    initCountdown();
    initNavbar();
    initScheduleTabs();
    initSmoothScroll();
    initTiltCards();
    initMagneticButtons();
    initParallaxHero();
    initLogoParticles();
});

/* ============================================
   PARTICLE NETWORK BACKGROUND
   ============================================ */
function initParticleNetwork() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.8 + 0.3;
            this.baseX = this.x;
            this.baseY = this.y;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.4 + 0.1;
            this.color = Math.random() > 0.7 ? '194, 24, 91' : '41, 171, 226';
        }

        update() {
            // Drift
            this.x += this.vx;
            this.y += this.vy;

            // Mouse interaction
            if (mouse.x !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    this.x += Math.cos(angle) * force * 2;
                    this.y += Math.sin(angle) * force * 2;
                }
            }

            // Wrap
            if (this.x < -10) this.x = canvas.width + 10;
            if (this.x > canvas.width + 10) this.x = -10;
            if (this.y < -10) this.y = canvas.height + 10;
            if (this.y > canvas.height + 10) this.y = -10;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
            ctx.fill();
        }
    }

    const count = Math.min(Math.floor((canvas.width * canvas.height) / 15000), 100);
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 140) {
                    const op = (1 - dist / 140) * 0.12;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(41, 171, 226, ${op})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        connectParticles();
        requestAnimationFrame(animate);
    }
    animate();
}

/* ============================================
   CUSTOM CURSOR
   ============================================ */
function initCustomCursor() {
    if (window.innerWidth < 768) return;

    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    let mx = 0, my = 0;
    let rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
        dot.style.left = mx + 'px';
        dot.style.top = my + 'px';
    });

    function animateRing() {
        rx += (mx - rx) * 0.15;
        ry += (my - ry) * 0.15;
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';
        requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover effect on interactive elements
    const hoverEls = document.querySelectorAll('a, button, .tilt-card, .info-chip, .sched-tab');
    hoverEls.forEach(el => {
        el.addEventListener('mouseenter', () => {
            ring.classList.add('hover');
            dot.style.transform = 'scale(2.5)';
            dot.style.background = '#c2185b';
        });
        el.addEventListener('mouseleave', () => {
            ring.classList.remove('hover');
            dot.style.transform = 'scale(1)';
            dot.style.background = '#29abe2';
        });
    });
}

/* ============================================
   SCROLL REVEAL ANIMATIONS
   ============================================ */
function initRevealAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.dataset.delay || '0');
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
}

/* ============================================
   COUNTDOWN
   ============================================ */
function initCountdown() {
    const target = new Date('2026-10-02T10:00:00+03:00').getTime();

    function padDigits(num, len) {
        return String(num).padStart(len, '0');
    }

    function setDigits(containerId, value, pad) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const str = padDigits(value, pad);
        const existing = container.querySelectorAll('.digit');

        // Check if we need to update
        const currentStr = Array.from(existing).map(d => d.textContent).join('');
        if (currentStr === str) return;

        // Update digits with glitch flicker on changed ones
        str.split('').forEach((char, i) => {
            if (existing[i]) {
                if (existing[i].textContent !== char) {
                    existing[i].textContent = char;
                    existing[i].classList.remove('digit-glitch');
                    void existing[i].offsetWidth; // reflow to restart animation
                    existing[i].classList.add('digit-glitch');
                }
            }
        });
    }

    function update() {
        const now = Date.now();
        const diff = Math.max(0, target - now);

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setDigits('cd-days', days, 3);
        setDigits('cd-hours', hours, 2);
        setDigits('cd-minutes', minutes, 2);
        setDigits('cd-seconds', seconds, 2);
    }

    update();
    setInterval(update, 1000);
}

/* ============================================
   NAVBAR
   ============================================ */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = y;
    });

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        links.classList.toggle('open');
    });

    links.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            links.classList.remove('open');
        });
    });

    document.addEventListener('click', e => {
        if (!navbar.contains(e.target) && links.classList.contains('open')) {
            toggle.classList.remove('active');
            links.classList.remove('open');
        }
    });
}

/* ============================================
   SCHEDULE TABS
   ============================================ */
function initScheduleTabs() {
    const tabs = document.querySelectorAll('.sched-tab');
    const panels = document.querySelectorAll('.sched-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const dayId = tab.dataset.day;

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            panels.forEach(p => p.classList.remove('active'));
            const panel = document.getElementById(dayId);
            panel.classList.add('active');

            // Re-trigger timeline animations
            const items = panel.querySelectorAll('.tl-item');
            items.forEach((item, i) => {
                item.style.animation = 'none';
                item.offsetHeight; // trigger reflow
                item.style.animation = `tl-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.06}s both`;
            });
        });
    });
}

/* ============================================
   SMOOTH SCROLL
   ============================================ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 70;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
}

/* ============================================
   3D TILT CARDS
   ============================================ */
function initTiltCards() {
    if (window.innerWidth < 768) return;

    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-6px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            setTimeout(() => { card.style.transition = ''; }, 500);
        });
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });
    });
}

/* ============================================
   MAGNETIC BUTTONS
   ============================================ */
function initMagneticButtons() {
    if (window.innerWidth < 768) return;

    document.querySelectorAll('.magnetic-btn').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
            btn.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            setTimeout(() => { btn.style.transition = ''; }, 400);
        });
        btn.addEventListener('mouseenter', () => {
            btn.style.transition = 'none';
        });
    });
}

/* ============================================
   PARALLAX HERO ELEMENTS
   ============================================ */
function initParallaxHero() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    const logo = document.getElementById('hero-logo');
    const grid = hero.querySelector('.hero-grid-bg');

    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
            const ratio = y / window.innerHeight;
            if (logo) {
                logo.style.transform = `translateY(${y * 0.15}px) scale(${1 - ratio * 0.1})`;
            }
            if (grid) {
                grid.style.transform = `translateY(${y * 0.08}px)`;
            }
        }
    });

    // Logo mouse interaction
    if (logo) {
        const container = logo.closest('.hero-logo-container');
        container.addEventListener('mousemove', e => {
            const rect = container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            logo.style.transform = `perspective(400px) rotateY(${x * 25}deg) rotateX(${-y * 25}deg)`;
        });
        container.addEventListener('mouseleave', () => {
            logo.style.transform = '';
        });
    }
}

/* ============================================
   LOGO PARTICLE RING
   ============================================ */
function initLogoParticles() {
    const container = document.getElementById('logo-particles');
    if (!container) return;

    for (let i = 0; i < 20; i++) {
        const dot = document.createElement('div');
        const angle = (i / 20) * Math.PI * 2;
        const radius = 80 + Math.random() * 20;
        const size = Math.random() * 3 + 1;
        const duration = 3 + Math.random() * 4;
        const delay = Math.random() * 3;

        Object.assign(dot.style, {
            position: 'absolute',
            width: size + 'px',
            height: size + 'px',
            borderRadius: '50%',
            background: Math.random() > 0.5 ? '#29abe2' : '#c2185b',
            left: '50%',
            top: '50%',
            marginLeft: (Math.cos(angle) * radius) + 'px',
            marginTop: (Math.sin(angle) * radius) + 'px',
            opacity: '0',
            animation: `particle-orbit ${duration}s ease-in-out ${delay}s infinite`
        });
        container.appendChild(dot);
    }

    // Add the CSS animation if not exists
    if (!document.getElementById('particle-orbit-style')) {
        const style = document.createElement('style');
        style.id = 'particle-orbit-style';
        style.textContent = `
            @keyframes particle-orbit {
                0%, 100% { opacity: 0; transform: scale(0.5) translate(0, 0); }
                25% { opacity: 0.8; transform: scale(1) translate(5px, -8px); }
                50% { opacity: 0.4; transform: scale(0.8) translate(-3px, 5px); }
                75% { opacity: 0.7; transform: scale(1.1) translate(4px, 3px); }
            }
        `;
        document.head.appendChild(style);
    }
}
