/* ============================================
   ATANASOFF48 GAME LAB — INTERACTIVE LOGIC
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initCountdown();
    initScrollAnimations();
    initNavbar();
    initScheduleTabs();
    initSmoothScroll();
    initLogoTilt();
});

/* ============================================
   PARTICLE SYSTEM
   ============================================ */
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null };
    let animationId;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.hue = Math.random() > 0.5 ? 195 : 335; // cyan or pink hue
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Mouse repulsion
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const force = (120 - dist) / 120;
                    this.x += (dx / dist) * force * 1.5;
                    this.y += (dy / dist) * force * 1.5;
                }
            }

            // Wrap around
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            if (this.hue === 195) {
                ctx.fillStyle = `rgba(41, 171, 226, ${this.opacity})`;
            } else {
                ctx.fillStyle = `rgba(194, 24, 91, ${this.opacity * 0.6})`;
            }
            ctx.fill();
        }
    }

    // Create particles — scale with screen size
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 120);
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150) {
                    const opacity = (1 - dist / 150) * 0.15;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(41, 171, 226, ${opacity})`;
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
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        connectParticles();
        animationId = requestAnimationFrame(animate);
    }

    animate();
}

/* ============================================
   COUNTDOWN TIMER
   ============================================ */
function initCountdown() {
    const target = new Date('2026-10-02T10:00:00+03:00').getTime();

    function update() {
        const now = Date.now();
        const diff = target - now;

        if (diff <= 0) {
            document.getElementById('cd-days').textContent = '000';
            document.getElementById('cd-hours').textContent = '00';
            document.getElementById('cd-minutes').textContent = '00';
            document.getElementById('cd-seconds').textContent = '00';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const daysEl = document.getElementById('cd-days');
        const hoursEl = document.getElementById('cd-hours');
        const minutesEl = document.getElementById('cd-minutes');
        const secondsEl = document.getElementById('cd-seconds');

        // Animate value changes
        updateValue(daysEl, String(days).padStart(3, '0'));
        updateValue(hoursEl, String(hours).padStart(2, '0'));
        updateValue(minutesEl, String(minutes).padStart(2, '0'));
        updateValue(secondsEl, String(seconds).padStart(2, '0'));
    }

    function updateValue(el, newVal) {
        if (el.textContent !== newVal) {
            el.style.transform = 'translateY(-5px)';
            el.style.opacity = '0.5';
            setTimeout(() => {
                el.textContent = newVal;
                el.style.transform = 'translateY(0)';
                el.style.opacity = '1';
            }, 150);
        }
    }

    update();
    setInterval(update, 1000);
}

/* ============================================
   SCROLL ANIMATIONS (Intersection Observer)
   ============================================ */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

/* ============================================
   NAVBAR
   ============================================ */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');

    // Scroll state
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile toggle
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        links.classList.toggle('open');
    });

    // Close mobile nav on link click
    links.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            links.classList.remove('open');
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
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
    const tabs = document.querySelectorAll('.schedule-tab');
    const days = document.querySelectorAll('.schedule-day');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const dayId = tab.dataset.day;

            // Update tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update days
            days.forEach(d => d.classList.remove('active'));
            document.getElementById(dayId).classList.add('active');

            // Re-trigger animations for visible items
            const newItems = document.getElementById(dayId).querySelectorAll('.animate-on-scroll');
            newItems.forEach((item, i) => {
                item.classList.remove('visible');
                setTimeout(() => {
                    item.classList.add('visible');
                }, i * 80);
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
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({
                    top: top,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ============================================
   LOGO 3D TILT ON MOUSE MOVE
   ============================================ */
function initLogoTilt() {
    const logo = document.getElementById('hero-logo');
    if (!logo) return;

    const wrapper = logo.parentElement;

    wrapper.addEventListener('mousemove', (e) => {
        const rect = wrapper.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        logo.style.transform = `perspective(400px) rotateY(${x * 20}deg) rotateX(${-y * 20}deg) translateY(${Math.sin(Date.now() / 500) * 6}px)`;
    });

    wrapper.addEventListener('mouseleave', () => {
        logo.style.transform = '';
    });
}
