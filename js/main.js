// Professional Practices in Computing - main.js
// Theme, sidebar, progress, search, quiz engine, reflections
(function () {
  'use strict';

  const STORAGE_KEY = 'ppc-progress';
  const THEME_KEY = 'ppc-theme';

  // ---------- Theme ----------
  function getTheme() {
    return localStorage.getItem(THEME_KEY) || document.documentElement.getAttribute('data-theme') || 'dark';
  }
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
  function toggleTheme() {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  }

  // ---------- Progress ----------
  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }
  function saveProgress(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  function markComplete(lectureId) {
    const p = loadProgress();
    p[lectureId] = { completed: true, at: new Date().toISOString() };
    saveProgress(p);
    updateProgressUI();
  }
  function isComplete(lectureId) {
    const p = loadProgress();
    return !!(p[lectureId] && p[lectureId].completed);
  }
  function updateProgressUI() {
    const bars = document.querySelectorAll('[data-progress-bar]');
    const total = document.querySelectorAll('[data-lecture-id]').length || 5;
    const done = Object.values(loadProgress()).filter((x) => x.completed).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    bars.forEach((el) => {
      el.style.width = pct + '%';
      el.setAttribute('aria-valuenow', pct);
    });
    document.querySelectorAll('[data-progress-text]').forEach((el) => {
      el.textContent = done + ' / ' + total + ' modules (' + pct + '%)';
    });
    document.querySelectorAll('[data-lecture-id]').forEach((card) => {
      const id = card.getAttribute('data-lecture-id');
      if (isComplete(id)) card.classList.add('completed');
    });
  }

  // ---------- Sidebar ----------
  function initSidebar() {
    const toggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!toggle || !sidebar) return;
    function open() {
      sidebar.classList.add('open');
      if (overlay) overlay.classList.add('visible');
      document.body.classList.add('sidebar-open');
    }
    function close() {
      sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('visible');
      document.body.classList.remove('sidebar-open');
    }
    toggle.addEventListener('click', () => (sidebar.classList.contains('open') ? close() : open()));
    if (overlay) overlay.addEventListener('click', close);
    document.querySelectorAll('.sidebar-nav a').forEach((a) => a.addEventListener('click', close));
  }

  // ---------- Search ----------
  function initSearch() {
    const input = document.getElementById('site-search');
    if (!input) return;
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      document.querySelectorAll('[data-searchable]').forEach((el) => {
        const text = (el.textContent || '').toLowerCase();
        el.style.display = !q || text.includes(q) ? '' : 'none';
      });
    });
  }

  // ---------- Quiz engine ----------
  function initQuizzes() {
    document.querySelectorAll('[data-quiz]').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const result = form.querySelector('.quiz-result');
        let correct = 0;
        let total = 0;
        form.querySelectorAll('[data-correct]').forEach((q) => {
          total++;
          const name = q.getAttribute('data-q');
          const selected = form.querySelector('input[name="' + name + '"]:checked');
          const ans = selected ? selected.value : null;
          const right = q.getAttribute('data-correct');
          if (ans === right) correct++;
          q.classList.toggle('correct', ans === right);
          q.classList.toggle('incorrect', ans && ans !== right);
        });
        if (result) {
          result.hidden = false;
          result.textContent = 'Score: ' + correct + ' / ' + total;
          result.className = 'quiz-result ' + (correct === total ? 'perfect' : correct >= total / 2 ? 'pass' : 'fail');
        }
        const lid = form.getAttribute('data-lecture');
        if (lid && correct === total) markComplete(lid);
      });
    });
  }

  // ---------- Reflections ----------
  function initReflections() {
    document.querySelectorAll('[data-reflection]').forEach((ta) => {
      const key = 'ppc-reflection-' + (ta.getAttribute('data-reflection') || 'default');
      ta.value = localStorage.getItem(key) || '';
      ta.addEventListener('change', () => localStorage.setItem(key, ta.value));
    });
  }

  // ---------- Complete button ----------
  function initCompleteButtons() {
    document.querySelectorAll('[data-mark-complete]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-mark-complete');
        markComplete(id);
        btn.textContent = 'Completed ✓';
        btn.disabled = true;
      });
      const id = btn.getAttribute('data-mark-complete');
      if (isComplete(id)) {
        btn.textContent = 'Completed ✓';
        btn.disabled = true;
      }
    });
  }

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', () => {
    setTheme(getTheme());
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    initSidebar();
    initSearch();
    initQuizzes();
    initReflections();
    initCompleteButtons();
    updateProgressUI();
  });
})();
