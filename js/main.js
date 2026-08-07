/* =========================================================
   Professional Practices in Computing
   Theme, sidebar, progress, navigation
   ========================================================= */

(function () {
  'use strict';

  const STORAGE_KEY = 'ppc-progress';
  const THEME_KEY = 'ppc-theme';
  const TOTAL_LECTURES = 30;

  // Theme
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeButton(theme);
  }

  function updateThemeButton(theme) {
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
    updateThemeButton(next);
  }

  // Sidebar
  function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menuBtn');
    const closeBtn = document.getElementById('sidebarClose');

    if (menuBtn && sidebar) {
      menuBtn.addEventListener('click', () => sidebar.classList.add('open'));
    }
    if (closeBtn && sidebar) {
      closeBtn.addEventListener('click', () => sidebar.classList.remove('open'));
    }

    // Nav group toggles
    document.querySelectorAll('.nav-group-toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.target);
        if (target) target.classList.toggle('open');
      });
    });

    // Open lectures group by default on lecture pages
    const lecturesList = document.getElementById('lectures-list');
    if (lecturesList && window.location.pathname.includes('lecture')) {
      lecturesList.classList.add('open');
    }
  }

  // Progress
  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function setProgress(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    updateProgressUI();
  }

  function markLectureComplete(id) {
    const data = getProgress();
    data[id] = true;
    setProgress(data);
  }

  function updateProgressUI() {
    const data = getProgress();
    const completed = Object.keys(data).filter((k) => data[k]).length;
    const pct = Math.round((completed / TOTAL_LECTURES) * 100);
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('progressText');
    if (fill) fill.style.width = pct + '%';
    if (text) text.textContent = completed + ' / ' + TOTAL_LECTURES + ' lectures';
  }

  // Mark current lecture complete when user reaches end / interacts
  function initLectureProgress() {
    const path = window.location.pathname;
    const match = path.match(/lecture-(\d+)/);
    if (!match) return;
    const id = 'lecture-' + match[1];

    // Mark complete after a short delay or on scroll near bottom
    const mark = () => markLectureComplete(id);
    setTimeout(mark, 8000);

    window.addEventListener(
      'scroll',
      function onScroll() {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
          mark();
          window.removeEventListener('scroll', onScroll);
        }
      },
      { passive: true }
    );
  }

  // Quiz simple feedback (optional)
  function initQuizzes() {
    document.querySelectorAll('.quiz-box').forEach((box) => {
      const btn = box.querySelector('[data-check-quiz]');
      if (!btn) return;
      btn.addEventListener('click', () => {
        const answers = box.querySelectorAll('[data-correct]');
        let correct = 0;
        answers.forEach((el) => {
          const input = el.querySelector('input');
          if (input && input.checked && el.dataset.correct === 'true') correct++;
          else if (input && input.checked) el.style.outline = '1px solid var(--danger)';
          else if (el.dataset.correct === 'true') el.style.outline = '1px solid var(--success)';
        });
        const feedback = box.querySelector('.quiz-feedback');
        if (feedback) {
          feedback.textContent = 'You got ' + correct + ' correct.';
          feedback.hidden = false;
        }
      });
    });
  }

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSidebar();
    updateProgressUI();
    initLectureProgress();
    initQuizzes();

    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  });

  // Expose for lecture pages if needed
  window.PPC = {
    markLectureComplete,
    getProgress,
  };
})();
