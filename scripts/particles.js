/* =============================================
   FLOATING PARTICLE BACKGROUND ANIMATION
   Antigravity geometric shapes with neon glow
   ============================================= */

(function () {
    'use strict';

    // Bail out entirely if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var NEON_COLORS = ['#ff48c4', '#2bd1fc', '#f3ea5f', '#6ded8a', '#c04df9'];
    var SHAPES = ['circle', 'square', 'triangle'];
    var REPULSION_RADIUS = 120;
    var FRICTION = 0.98;

    var canvas, ctx, particles, mouseX, mouseY, width, height, dpr, animFrame;
    var spriteCache = {};
    var resizeTimer = null;
    var scrollOpacity = 1;
    var ticking = false;

    // ---- Particle ----

    function createParticle(canvasW, canvasH, randomY) {
        var depth = 0.3 + Math.random() * 0.7;
        var baseSize = 4 + Math.random() * 10;
        var size = baseSize * depth;
        return {
            x: Math.random() * canvasW,
            y: randomY ? Math.random() * canvasH : canvasH + size,
            vx: 0,
            vy: -(0.2 + Math.random() * 0.6) * depth,
            size: size,
            color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
            shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
            opacity: 0.3 + Math.random() * 0.4,
            depth: depth,
            phase: Math.random() * Math.PI * 2,
            driftSpeed: 0.3 + Math.random() * 0.7
        };
    }

    // ---- Sprite cache ----

    function spriteKey(p) {
        return p.shape + '_' + p.color + '_' + Math.round(p.size);
    }

    function buildSprite(shape, color, size) {
        var pad = size * 2.5;
        var full = size + pad * 2;
        var off = document.createElement('canvas');
        off.width = full;
        off.height = full;
        var c = off.getContext('2d');
        var cx = full / 2;
        var cy = full / 2;

        // Glow halo
        c.save();
        c.globalAlpha = 0.35;
        c.shadowBlur = size * 1.5;
        c.shadowColor = color;
        c.fillStyle = color;
        drawShape(c, shape, cx, cy, size * 1.2);
        c.fill();
        c.restore();

        // Solid shape
        c.save();
        c.globalAlpha = 1;
        c.shadowBlur = size * 0.6;
        c.shadowColor = color;
        c.fillStyle = color;
        drawShape(c, shape, cx, cy, size / 2);
        c.fill();
        c.restore();

        return off;
    }

    function drawShape(c, shape, cx, cy, r) {
        c.beginPath();
        if (shape === 'circle') {
            c.arc(cx, cy, r, 0, Math.PI * 2);
        } else if (shape === 'square') {
            c.rect(cx - r, cy - r, r * 2, r * 2);
        } else {
            // Triangle
            c.moveTo(cx, cy - r);
            c.lineTo(cx + r, cy + r);
            c.lineTo(cx - r, cy + r);
            c.closePath();
        }
    }

    function getSprite(p) {
        var key = spriteKey(p);
        if (!spriteCache[key]) {
            spriteCache[key] = buildSprite(p.shape, p.color, p.size);
        }
        return spriteCache[key];
    }

    // ---- Count ----

    function targetCount() {
        return window.innerWidth < 768 ? 40 : 80;
    }

    // ---- Init ----

    function init() {
        canvas = document.getElementById('particle-canvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        mouseX = -9999;
        mouseY = -9999;

        resize();
        seedParticles();

        document.addEventListener('mousemove', onMouse);
        document.addEventListener('mouseleave', function () {
            mouseX = -9999;
            mouseY = -9999;
        });
        window.addEventListener('resize', onResize);
        window.addEventListener('scroll', onScroll, { passive: true });

        onScroll(); // set initial opacity
        loop();
    }

    function seedParticles() {
        var count = targetCount();
        particles = [];
        for (var i = 0; i < count; i++) {
            particles.push(createParticle(width, height, true));
        }
    }

    // ---- Events ----

    function onMouse(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }

    function onResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            resize();
            reconcileCount();
        }, 200);
    }

    function resize() {
        dpr = window.devicePixelRatio || 1;
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function reconcileCount() {
        var target = targetCount();
        while (particles.length < target) {
            particles.push(createParticle(width, height, true));
        }
        while (particles.length > target) {
            particles.pop();
        }
    }

    function onScroll() {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(function () {
                var progress = window.scrollY / window.innerHeight;
                scrollOpacity = Math.max(0, 1 - progress);
                canvas.style.opacity = scrollOpacity;
                ticking = false;
            });
        }
    }

    // ---- Loop ----

    function loop() {
        update();
        draw();
        animFrame = requestAnimationFrame(loop);
    }

    function update() {
        var i, p, dx, dy, dist, force;
        for (i = 0; i < particles.length; i++) {
            p = particles[i];

            // Sinusoidal horizontal drift
            p.phase += 0.01 * p.driftSpeed;
            p.vx += Math.sin(p.phase) * 0.02;

            // Mouse repulsion (in CSS / client coordinates)
            dx = p.x - mouseX;
            dy = p.y - mouseY;
            dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < REPULSION_RADIUS && dist > 1) {
                force = Math.min(4, REPULSION_RADIUS / (dist * dist) * 8);
                p.vx += (dx / dist) * force;
                p.vy += (dy / dist) * force;
            }

            // Friction
            p.vx *= FRICTION;
            p.vy *= FRICTION;

            // Apply base upward velocity each frame (constant drift, not accumulated)
            p.x += p.vx;
            p.y += p.vy;

            // Wrap
            if (p.y < -p.size * 3) {
                p.y = height + p.size * 3;
                p.x = Math.random() * width;
            } else if (p.y > height + p.size * 3) {
                p.y = -p.size * 3;
                p.x = Math.random() * width;
            }
            if (p.x < -p.size * 3) {
                p.x = width + p.size * 3;
            } else if (p.x > width + p.size * 3) {
                p.x = -p.size * 3;
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        var i, p, sprite, offset;
        for (i = 0; i < particles.length; i++) {
            p = particles[i];
            sprite = getSprite(p);
            offset = sprite.width / (2 * dpr);
            ctx.globalAlpha = p.opacity;
            ctx.drawImage(sprite, p.x - offset, p.y - offset, sprite.width / dpr, sprite.height / dpr);
        }
        ctx.globalAlpha = 1;
    }

    // ---- Bootstrap ----

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
