/* ============================================================
   TypenTeX Web PPT · 翻页 / 自适应 / 导航
   ============================================================ */
(function () {
  'use strict';

  var BASE_W = 1280;
  var BASE_H = 720;

  var stage    = document.getElementById('stage');
  var slides   = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var curEl    = document.getElementById('cur');
  var totalEl  = document.getElementById('total');
  var prevBtn  = document.getElementById('prev');
  var nextBtn  = document.getElementById('next');
  var controls = document.getElementById('controls');
  var progress = document.getElementById('progress');
  var fill     = document.getElementById('progress-fill');
  var toc      = document.getElementById('toc');
  var tocMask  = document.getElementById('toc-mask');
  var tocList  = document.getElementById('toc-list');
  var tocBtn   = document.getElementById('toc-btn');
  var tocClose = document.getElementById('toc-close');
  var fullBtn  = document.getElementById('full-btn');
  var hint     = document.getElementById('hint');

  var index = 0;
  var total = slides.length;
  var controlsTimer = null;

  /* ---------- 舞台等比缩放 ---------- */
  function fit() {
    var availW = window.innerWidth;
    var availH = window.innerHeight;
    // 给上下控制栏和顶栏留出安全空间
    var padH = window.innerWidth < 520 ? 70 : 96;
    var padW = window.innerWidth < 520 ? 12 : 40;
    var scale = Math.min((availW - padW) / BASE_W, (availH - padH) / BASE_H);
    if (!isFinite(scale) || scale <= 0) scale = 0.1;
    stage.style.transform = 'scale(' + scale + ')';
  }

  /* ---------- 页码显示（补零） ---------- */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  /* ---------- 跳转 ---------- */
  function go(n, force) {
    n = Math.max(0, Math.min(total - 1, n));
    if (n === index && !force) return;

    slides[index].classList.remove('active');
    slides[index].classList.remove('prev');
    index = n;
    var s = slides[index];
    s.classList.remove('prev');
    s.classList.add('active');

    // 重新触发柱状图入场动画
    var bars = s.querySelectorAll('.bar');
    bars.forEach(function (bar) {
      bar.style.animation = 'none';
      void bar.offsetWidth;
      bar.style.animation = '';
    });

    curEl.textContent = pad(index + 1);
    fill.style.width = ((index + 1) / total * 100) + '%';
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === total - 1;

    Array.prototype.forEach.call(tocList.children, function (li, i) {
      li.classList.toggle('on', i === index);
    });

    showControls();
  }
  function next() { go(index + 1); }
  function prev() { go(index - 1); }

  /* ---------- 控制栏自动隐藏 ---------- */
  function showControls() {
    controls.classList.add('show');
    clearTimeout(controlsTimer);
    controlsTimer = setTimeout(function () {
      // 目录打开时保持显示
      if (!toc.classList.contains('open')) controls.classList.remove('show');
    }, 2800);
  }

  /* ---------- 目录 ---------- */
  function buildToc() {
    slides.forEach(function (s, i) {
      var li = document.createElement('li');
      var num = document.createElement('i');
      num.textContent = pad(i + 1);
      var label = document.createElement('span');
      label.textContent = s.getAttribute('data-title') || ('第 ' + (i + 1) + ' 页');
      li.appendChild(num);
      li.appendChild(label);
      li.addEventListener('click', function () {
        go(i);
        toggleToc(false);
      });
      tocList.appendChild(li);
    });
  }
  function toggleToc(open) {
    var on = typeof open === 'boolean' ? open : !toc.classList.contains('open');
    toc.classList.toggle('open', on);
    tocMask.classList.toggle('open', on);
    toc.setAttribute('aria-hidden', on ? 'false' : 'true');
    if (on) showControls();
  }

  /* ---------- 全屏 ---------- */
  function toggleFull() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      var req = document.documentElement.requestFullscreen ||
                document.documentElement.webkitRequestFullscreen;
      if (req) req.call(document.documentElement);
    } else {
      var exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) exit.call(document);
    }
  }

  /* ---------- 事件绑定 ---------- */
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  tocBtn.addEventListener('click', function () { toggleToc(); });
  tocClose.addEventListener('click', function () { toggleToc(false); });
  tocMask.addEventListener('click', function () { toggleToc(false); });
  fullBtn.addEventListener('click', toggleFull);

  progress.addEventListener('click', function (e) {
    var rect = progress.getBoundingClientRect();
    var ratio = (e.clientX - rect.left) / rect.width;
    go(Math.round(ratio * (total - 1)));
  });

  document.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'ArrowRight' || k === 'PageDown' || k === ' ' || k === 'Enter') {
      e.preventDefault(); next();
    } else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'Backspace') {
      e.preventDefault(); prev();
    } else if (k === 'Home') {
      e.preventDefault(); go(0);
    } else if (k === 'End') {
      e.preventDefault(); go(total - 1);
    } else if (k === 'f' || k === 'F') {
      toggleFull();
    } else if (k === 'o' || k === 'O') {
      toggleToc();
    } else if (k === 'Escape') {
      toggleToc(false);
    }
  });

  // 触摸滑动
  var touchX = null, touchY = null;
  document.addEventListener('touchstart', function (e) {
    touchX = e.changedTouches[0].clientX;
    touchY = e.changedTouches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    var dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      dx < 0 ? next() : prev();
    }
    touchX = touchY = null;
  }, { passive: true });

  // 鼠标滚轮翻页（节流）
  var wheelLock = false;
  document.addEventListener('wheel', function (e) {
    if (toc.classList.contains('open')) return;
    if (wheelLock) return;
    if (Math.abs(e.deltaY) < 18) return;
    wheelLock = true;
    e.deltaY > 0 ? next() : prev();
    setTimeout(function () { wheelLock = false; }, 650);
  }, { passive: true });

  // 鼠标移动唤出控制栏
  document.addEventListener('mousemove', showControls);

  window.addEventListener('resize', fit);
  document.addEventListener('fullscreenchange', fit);
  document.addEventListener('webkitfullscreenchange', fit);

  /* ---------- 初始化 ---------- */
  totalEl.textContent = pad(total);
  buildToc();
  fit();
  go(0, true);
  showControls();

  // 8 秒后收起键盘提示
  setTimeout(function () { hint.classList.add('hide'); }, 8000);
})();
