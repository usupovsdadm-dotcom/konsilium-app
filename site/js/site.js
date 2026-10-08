/* Консилиум — лендинги приложения. Чистый JS, без зависимостей. Без JS весь контент виден. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var hdr = document.getElementById('hdr');

  /* 1. Каскадные задержки для групп карточек */
  $$('.stg').forEach(function (g) {
    var k = 0;
    Array.prototype.forEach.call(g.children, function (c) {
      c.style.setProperty('--d', (k * 0.09) + 's');
      if (!c.classList.contains('arrow')) k++;
    });
  });
  /* внутри секции элементы .rv идут друг за другом */
  $$('main > section').forEach(function (s) {
    $$('.rv', s).forEach(function (el, i) { if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', Math.min(i * 0.08, 0.4) + 's'); });
  });

  /* 2. Счётчики */
  function count(el) {
    var to = +el.getAttribute('data-to'); if (!to || el._done) return; el._done = true;
    if (reduce) { el.textContent = to; return; }
    var t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1); p = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * p); if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0'; requestAnimationFrame(step);
  }

  /* 3. Появление при прокрутке */
  var items = $$('.rv, .stg');
  function show(el) {
    el.classList.add('in');
    $$('.count', el).forEach(count);
  }
  var hero = document.querySelector('main > section');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(show); $$('.count').forEach(count);
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach(function (el) { if (!hero.contains(el)) io.observe(el); });
    /* первый экран — сразу, каскадом */
    requestAnimationFrame(function () {
      $$('.rv', hero).forEach(function (el, i) {
        el.style.setProperty('--d', (0.08 + i * 0.12) + 's'); show(el);
      });
    });
    /* страховка от быстрой прокрутки/якорей */
    var sweep = function () {
      var vh = window.innerHeight;
      items.forEach(function (el) { if (!el.classList.contains('in') && el.getBoundingClientRect().top < vh * 0.9) show(el); });
    };
    window.addEventListener('scroll', function () { clearTimeout(sweep.t); sweep.t = setTimeout(sweep, 150); }, { passive: true });
  }

  /* 4. Шапка: стекло, светлая тема над светлыми секциями, прогресс прокрутки */
  var secs = $$('main > section');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY, probe = y + 40, cur = null;
    secs.forEach(function (s) { if (s.offsetTop <= probe && s.offsetTop + s.offsetHeight > probe) cur = s; });
    hdr.classList.toggle('scrolled', y > 20);
    hdr.classList.toggle('light', !!cur && !cur.classList.contains('dark') && y > 20);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    hdr.style.setProperty('--p', max > 0 ? Math.min(y / max, 1).toFixed(4) : 0);
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll); onScroll();

  /* 5. Параллакс первого экрана (только десктоп с мышью) */
  var vis = document.querySelector('[data-parallax]');
  if (vis && !reduce && finePointer && window.matchMedia('(min-width: 961px)').matches) {
    var mx = 0, my = 0, pt = false;
    var apply = function () {
      var sy = Math.min(window.scrollY, 900);
      vis.style.transform = 'translate3d(' + (mx * 16).toFixed(1) + 'px,' + (my * 14 + sy * -0.1).toFixed(1) + 'px,0) rotateY(' + (mx * 5).toFixed(2) + 'deg) rotateX(' + (-my * 5).toFixed(2) + 'deg)';
      pt = false;
    };
    var req = function () { if (!pt) { pt = true; requestAnimationFrame(apply); } };
    vis.style.transition = 'transform .3s ease-out';
    hero.style.perspective = '1400px';
    window.addEventListener('mousemove', function (e) { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; req(); }, { passive: true });
    window.addEventListener('scroll', req, { passive: true });
  }

  /* 6. Световое пятно за курсором на карточках */
  if (finePointer && !reduce) {
    $$('.glass, .dglass, .gcard, .ncard').forEach(function (c) {
      if (c.closest('.phone')) return;
      c.classList.add('spot');
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }
})();
