(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* preloader: curtain lifts, then hero animations play */
  function lift() {
    var pre = document.getElementById('pre');
    if (pre) pre.classList.add('done');
    document.body.classList.remove('loading');
    setTimeout(function () { if (pre) pre.style.display = 'none'; }, 1100);
  }
  if (reduce) lift();
  else window.addEventListener('load', function () { setTimeout(lift, 450); });
  setTimeout(lift, 3500); // safety net on slow connections

  /* open / closed by Moscow time */
  var now = new Date();
  var msk = new Date(now.getTime() + (now.getTimezoneOffset() + 180) * 60000);
  var d = msk.getDay(), h = msk.getHours() + msk.getMinutes() / 60;
  var opens = (d === 0 || d === 6) ? 9 : 8;
  var open = h >= opens && h < 22;
  document.querySelectorAll('.js-open-text').forEach(function (el) {
    el.textContent = open ? 'Сейчас открыто, до 22:00' : 'Закрыто, откроемся в 0' + opens + ':00';
  });
  document.querySelectorAll('.js-open-dot').forEach(function (el) {
    el.style.background = open ? '#3E9B5B' : '#C2255C';
  });

  /* mobile menu */
  var nav = document.getElementById('nav');
  var burger = document.getElementById('burger');
  burger.addEventListener('click', function () {
    var o = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', o ? 'true' : 'false');
    burger.setAttribute('aria-label', o ? 'Закрыть меню' : 'Открыть меню');
  });
  nav.querySelectorAll('.mnav a').forEach(function (a) {
    a.addEventListener('click', function () { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); });
  });

  /* scroll reveal */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }) : null;
  document.querySelectorAll('.reveal').forEach(function (el, i) {
    if (el.classList.contains('ph')) el.style.transitionDelay = (i % 4) * 0.08 + 's';
    if (io && !reduce) io.observe(el); else el.classList.add('is-in');
  });

  /* catalog filter */
  var tabs = document.querySelectorAll('#tabs .tab');
  var cards = document.querySelectorAll('#grid .card');
  function filter(f) {
    var n = 0;
    cards.forEach(function (c) {
      var show = f === 'all' || c.getAttribute('data-group') === f;
      c.classList.remove('show');
      c.classList.toggle('hide', !show);
      if (show) { void c.offsetWidth; c.style.animationDelay = (n++ * 0.05) + 's'; c.classList.add('show'); }
    });
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.remove('on'); x.setAttribute('aria-selected', 'false'); });
      t.classList.add('on'); t.setAttribute('aria-selected', 'true');
      filter(t.getAttribute('data-f'));
    });
  });

  /* scroll progress + hero parallax on scroll */
  var prog = document.getElementById('prog');
  var collage = document.getElementById('collage');
  var pfs = collage ? collage.querySelectorAll('.pf') : [];
  var mx = 0, my = 0, sy = 0, ticking = false;
  function paint() {
    ticking = false;
    var max = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = 'scaleX(' + (max > 0 ? sy / max : 0) + ')';
    if (reduce) return;
    pfs.forEach(function (p) {
      var k = +p.getAttribute('data-depth');
      var base = p.classList.contains('pf2') ? ' rotate(5deg)' : p.classList.contains('pf3') ? ' rotate(-6deg)' : '';
      p.style.transform = 'translate(' + (mx * k) + 'px,' + (my * k - sy * k / 120) + 'px)' + base;
    });
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }
  addEventListener('scroll', function () { sy = scrollY; req(); }, { passive: true });
  if (collage && matchMedia('(pointer: fine)').matches) {
    addEventListener('mousemove', function (e) {
      mx = (e.clientX / innerWidth - 0.5) * 0.6;
      my = (e.clientY / innerHeight - 0.5) * 0.6;
      req();
    });
  }

  /* magnetic buttons */
  if (!reduce && matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* lightbox */
  var lb = document.getElementById('lb'), img = document.getElementById('lbimg'), cnt = document.getElementById('lbcount');
  var shots = Array.prototype.map.call(document.querySelectorAll('#masonry .ph img'), function (i) { return i; });
  var cur = 0, lastFocus = null;
  function show(i, animate) {
    cur = (i + shots.length) % shots.length;
    var go = function () {
      img.src = shots[cur].getAttribute('src');
      img.alt = shots[cur].alt;
      cnt.textContent = (cur + 1) + ' / ' + shots.length;
      img.classList.remove('swap');
    };
    if (animate && !reduce) { img.classList.add('swap'); setTimeout(go, 220); } else go();
  }
  function openLb(i) {
    lastFocus = document.activeElement;
    show(i, false);
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lb.querySelector('.lb-close').focus();
  }
  function closeLb() {
    lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll('#masonry .ph').forEach(function (b) {
    b.addEventListener('click', function () { openLb(+b.getAttribute('data-i')); });
  });
  lb.querySelector('.lb-close').addEventListener('click', closeLb);
  lb.querySelector('.lb-prev').addEventListener('click', function () { show(cur - 1, true); });
  lb.querySelector('.lb-next').addEventListener('click', function () { show(cur + 1, true); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  lb.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') show(cur - 1, true);
    if (e.key === 'ArrowRight') show(cur + 1, true);
  });
  var tx = null;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1), true);
    tx = null;
  });
})();
