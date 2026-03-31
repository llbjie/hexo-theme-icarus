/**
 * Icarus 夜间模式
 * 文件路径: icarus/source/js/night.js
 */
(function () {

  var isNight = localStorage.getItem('night') === 'true';
  applyNight(isNight);

  document.addEventListener('pjax:complete', function () {
    isNight = localStorage.getItem('night') === 'true';
    applyNight(isNight);
    bindBtn();
  });

  function applyNight(value) {
    if (value) {
      document.body.classList.add('night');
      document.body.classList.remove('light');
    } else {
      document.body.classList.remove('night');
      document.body.classList.add('light');
    }
    syncUtterances(value);
  }

  // ── Utterances：等 iframe 加载完再发 postMessage ───────────
  var utterancesObserver = null;

  function syncUtterances(nightMode) {
    var theme = nightMode ? 'github-dark' : 'github-light';

    var iframe = document.querySelector('iframe.utterances-frame');
    if (iframe) {
      // iframe 已存在，直接发
      iframe.contentWindow.postMessage(
        { type: 'set-theme', theme: theme },
        'https://utteranc.es'
      );
      return;
    }

    // iframe 还没渲染，用 MutationObserver 等它出现
    if (utterancesObserver) utterancesObserver.disconnect();

    utterancesObserver = new MutationObserver(function () {
      var el = document.querySelector('iframe.utterances-frame');
      if (!el) return;

      // iframe 出现了，但内容可能还没加载完，监听 load 事件
      el.addEventListener('load', function () {
        el.contentWindow.postMessage(
          { type: 'set-theme', theme: theme },
          'https://utteranc.es'
        );
      });

      utterancesObserver.disconnect();
      utterancesObserver = null;
    });

    utterancesObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // ── 绑定切换按钮 ───────────────────────────────────────────
  function bindBtn() {
    var btn = document.getElementById('night-nav');
    if (!btn) {
      setTimeout(bindBtn, 100);
      return;
    }
    var newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', function () {
      isNight = !isNight;
      applyNight(isNight);
      localStorage.setItem('night', isNight);
    });
  }

  // ── Pjax 支持 ──────────────────────────────────────────────
  document.addEventListener('pjax:complete', function () {
    isNight = localStorage.getItem('night') === 'true';
    applyNight(isNight);
    bindBtn();
  });

  bindBtn();

}());