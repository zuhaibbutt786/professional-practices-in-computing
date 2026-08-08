/* =========================================================
   Professional Practices in Computing - Main JS
   Theme, Sidebar, Progress, Quiz Engine, Search
   ========================================================= */

(function () {
  'use strict';

  // ---------- Theme ----------
  const THEME_KEY = 'ppc-theme';
  const html = document.documentElement;

  function getPreferredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    updateThemeIcon(theme);
  }

  function updateThemeIcon(theme) {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.innerHTML = theme === 'dark'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  setTheme(getPreferredTheme());

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });

  // ---------- Sidebar ----------
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const menuBtn = document.getElementById('menu-toggle');

  function openSidebar() {
    sidebar?.classList.add('open');
    overlay?.classList.add('open');
  }
  function closeSidebar() {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('open');
  }

  menuBtn?.addEventListener('click', () => {
    if (sidebar?.classList.contains('open')) closeSidebar();
    else openSidebar();
  });
  overlay?.addEventListener('click', closeSidebar);

  // ---------- Progress ----------
  const PROGRESS_KEY = 'ppc-progress';
  const TOTAL = 30;

  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveProgress(arr) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(arr));
    updateProgressUI();
  }

  function markLecture(id) {
    const arr = getProgress();
    if (!arr.includes(id)) {
      arr.push(id);
      saveProgress(arr);
    }
  }

  function updateProgressUI() {
    const arr = getProgress();
    const pct = Math.round((arr.length / TOTAL) * 100);
    document.querySelectorAll('[data-progress-bar]').forEach(el => {
      el.style.width = pct + '%';
    });
    document.querySelectorAll('[data-progress-text]').forEach(el => {
      el.textContent = arr.length + ' / ' + TOTAL + ' lectures (' + pct + '%)';
    });
  }

  // Auto-mark current lecture if on a lecture page
  const match = location.pathname.match(/lecture-(\d+)/);
  if (match) {
    markLecture(match[1]);
  }
  updateProgressUI();

  // ---------- Search (simple) ----------
  const searchInput = document.getElementById('search-input');
  searchInput?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    document.querySelectorAll('.lecture-card, .sidebar-link').forEach(el => {
      const text = el.textContent.toLowerCase();
      el.style.display = !q || text.includes(q) ? '' : 'none';
    });
  });

  // ---------- Quiz helpers (for lecture pages) ----------
  window.PPC = {
    markLecture,
    getProgress,
    gradeQuiz(formId, answers) {
      const form = document.getElementById(formId);
      if (!form) return;
      let score = 0;
      const total = Object.keys(answers).length;
      Object.entries(answers).forEach(([name, correct]) => {
        const checked = form.querySelector(`input[name="${name}"]:checked`);
        if (checked && checked.value === correct) score++;
      });
      const result = form.querySelector('.quiz-result') || document.createElement('div');
      result.className = 'quiz-result callout callout-info';
      result.innerHTML = `<strong>Score: ${score} / ${total}</strong>`;
      if (!form.querySelector('.quiz-result')) form.appendChild(result);
    }
  };
})();
