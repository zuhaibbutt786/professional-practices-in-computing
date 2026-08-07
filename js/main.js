/* =========================================================
   Professional Practices in Computing - Main JS
   Theme, Sidebar, Progress, Quiz Engine, Search
   ========================================================= */

(function () {
  'use strict';

  // ---------- Theme ----------
  const THEME_KEY = 'ppc-theme';
  function getTheme() {
    return localStorage.getItem(THEME_KEY) || 'dark';
  }
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }
  function toggleTheme() {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }
  // Init theme
  setTheme(getTheme());

  // Theme toggle button
  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', toggleTheme);
  });

  // ---------- Progress ----------
  const PROGRESS_KEY = 'ppc-progress';
  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    } catch {
      return {};
    }
  }
  function markComplete(lectureId) {
    const p = getProgress();
    p[lectureId] = true;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
    updateProgressUI();
  }
  function updateProgressUI() {
    const p = getProgress();
    const total = 30;
    const done = Object.keys(p).filter(k => p[k]).length;
    const pct = Math.round((done / total) * 100);
    const bar = document.getElementById('progress-bar');
    const text = document.getElementById('progress-text');
    if (bar) bar.style.width = pct + '%';
    if (text) text.textContent = done + ' / ' + total + ' lectures (' + pct + '%)';
  }

  // ---------- Sidebar ----------
  function toggleSidebar() {
    document.body.classList.toggle('sidebar-open');
  }
  document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById('sidebar-toggle');
    if (toggle) toggle.addEventListener('click', toggleSidebar);
    updateProgressUI();
  });

  // Expose for lecture pages
  window.PPC = {
    markComplete,
    getProgress,
    getTheme,
    setTheme,
    toggleTheme
  };
})();
