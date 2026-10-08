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

  /* 7. Форма заявки врача (FormSubmit AJAX) */
  var form = document.getElementById('lf');
  if (form) (function () {
    var ENDPOINT = 'https://formsubmit.co/ajax/mmikhwork@gmail.com';
    var apply = document.getElementById('apply');
    var okBox = document.getElementById('lf-ok');
    var alertBox = document.getElementById('lf-alert');
    var btnLbl = form.querySelector('.lf-btn .lbl');
    var first = document.getElementById('f-name');
    var F = {
      name: document.getElementById('f-name'), spec: document.getElementById('f-spec'),
      city: document.getElementById('f-city'), phone: document.getElementById('f-phone'),
      tg: document.getElementById('f-tg'), msg: document.getElementById('f-msg'),
      ok: document.getElementById('f-ok'), hp: document.getElementById('f-hp')
    };
    var rules = {
      name: function (v) { return v.trim().length < 2 ? 'Укажите имя и фамилию' : ''; },
      spec: function (v) { return v.trim().length < 2 ? 'Укажите специальность' : ''; },
      phone: function (v) {
        var d = v.replace(/\D/g, '');
        if (!d) return 'Укажите номер телефона';
        return (d.length < 10 || d.length > 15 || /[^\d\s()+\-.]/.test(v)) ? 'Проверьте номер: например, +7 999 123-45-67' : '';
      },
      ok: function () { return F.ok.checked ? '' : 'Нужно согласие на обработку данных'; }
    };
    function errEl(k) { return document.getElementById('e-' + k); }
    function check(k) {
      var m = rules[k](F[k].value);
      errEl(k).textContent = m;
      if (m) F[k].setAttribute('aria-invalid', 'true'); else F[k].removeAttribute('aria-invalid');
      return !m;
    }
    Object.keys(rules).forEach(function (k) {
      var el = F[k];
      el.addEventListener(k === 'ok' ? 'change' : 'blur', function () { if (k === 'ok' || el.value) check(k); });
      el.addEventListener(k === 'ok' ? 'change' : 'input', function () { if (el.getAttribute('aria-invalid')) check(k); });
    });
    /* Telegram: «username» -> «@username» */
    F.tg.addEventListener('blur', function () { var v = F.tg.value.trim(); if (v && !/^@|^https?:|^t\.me/i.test(v) && !/^\+?\d[\d\s()-]*$/.test(v)) F.tg.value = '@' + v; });

    /* CTA «Стать врачом-партнёром» -> к форме + фокус на первом поле */
    function goForm(e) {
      if (e) e.preventDefault();
      apply.classList.add('in');
      var target = okBox.hidden ? first : document.getElementById('lf-ok-t');
      apply.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      var done = false;
      var fo = function () { if (done) return; done = true; try { target.focus({ preventScroll: true }); } catch (x) { target.focus(); } };
      if (reduce) fo();
      else { if ('onscrollend' in window) window.addEventListener('scrollend', fo, { once: true }); setTimeout(fo, 1100); }
    }
    $$('a[href="#apply"]').forEach(function (a) { a.addEventListener('click', goForm); });
    if (location.hash === '#apply') setTimeout(function () { goForm(); }, 300);

    var payload = null;
    function collect() {
      var dash = function (v) { v = (v || '').trim(); return v || '—'; };
      return {
        'Имя и фамилия': F.name.value.trim(),
        'Специальность': F.spec.value.trim(),
        'Город': dash(F.city.value),
        'Телефон': F.phone.value.trim(),
        'Telegram': dash(F.tg.value),
        'Комментарий': dash(F.msg.value),
        'Согласие на обработку персональных данных': 'Да',
        'Страница': location.origin + location.pathname,
        _subject: 'Новая заявка врача-партнёра — Консилиум',
        _template: 'table',
        _captcha: 'false',
        _honey: F.hp.value
      };
    }
    function busy(on) {
      form.classList.toggle('busy', on);
      form.setAttribute('aria-busy', on ? 'true' : 'false');
      btnLbl.textContent = on ? 'Отправляем…' : 'Отправить заявку';
    }
    function success() {
      okBox.style.minHeight = Math.min(form.offsetHeight, innerWidth < 641 ? 440 : 600) + 'px';
      form.hidden = true; okBox.hidden = false;
      var t = document.getElementById('lf-ok-t');
      try { t.focus({ preventScroll: true }); } catch (x) { t.focus(); }
      var r = apply.getBoundingClientRect();
      if (r.top < 0 || r.top > innerHeight * 0.5) apply.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
    function fail() { busy(false); alertBox.hidden = false; }
    function send() {
      alertBox.hidden = true; busy(true);
      var ctl = ('AbortController' in window) ? new AbortController() : null;
      var to = setTimeout(function () { if (ctl) ctl.abort(); }, 20000);
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        signal: ctl ? ctl.signal : undefined
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; });
      }).then(function (res) {
        clearTimeout(to);
        if (res.ok && (res.j.success === true || res.j.success === 'true')) { busy(false); success(); }
        else fail();
      }).catch(function () { clearTimeout(to); fail(); });
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.classList.contains('busy')) return;
      var bad = null;
      ['name', 'spec', 'phone', 'ok'].forEach(function (k) { if (!check(k) && !bad) bad = F[k]; });
      if (bad) { bad.focus(); return; }
      if (F.hp.value) { success(); return; } /* бот заполнил скрытое поле */
      payload = collect();
      send();
    });
    document.getElementById('lf-retry').addEventListener('click', function () { if (payload) send(); });
  })();
})();
