(function () {
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Score chips count up like an arcade readout (24 steps), then settle on the real value.
    function fmt(el, v) {
        var dec = +el.dataset.dec || 0;
        return (el.dataset.prefix || '') + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + (el.dataset.suffix || '');
    }
    if (!reduce) {
        document.querySelectorAll('.chip-value[data-to]').forEach(function (el) {
            var to = +el.dataset.to, start = performance.now(), dur = 1200;
            el.textContent = fmt(el, 0);
            (function tick(now) {
                var p = Math.min(1, (now - start) / dur);
                el.textContent = fmt(el, to * Math.floor(p * 24) / 24);
                if (p < 1) requestAnimationFrame(tick); else el.textContent = fmt(el, to);
            })(start);
        });
    }

    // CONTINUE? countdown: ticks 9 -> 0 once, when scrolled into view.
    var countdown = document.querySelector('.countdown');
    if (countdown && !reduce) {
        new IntersectionObserver(function (entries, observer) {
            if (!entries[0].isIntersecting) return;
            observer.disconnect();
            var n = 9;
            var timer = setInterval(function () {
                n--;
                countdown.textContent = n < 0 ? '!' : n;
                if (n < 0) { clearInterval(timer); countdown.classList.add('done'); }
            }, 1000);
        }, { threshold: 0.6 }).observe(countdown);
    }

    // Easter egg: Konami code (or #cheat-codes in the URL) opens the Cheat Codes dialog.
    var dialog = document.getElementById('cheats');
    var code = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
    var seen = [];
    function open() { if (dialog && !dialog.open && dialog.showModal) dialog.showModal(); }
    document.addEventListener('keydown', function (e) {
        seen.push(e.key.toLowerCase());
        seen = seen.slice(-code.length);
        if (seen.join() === code.join()) open();
    });
    if (location.hash === '#cheat-codes') open();
})();
