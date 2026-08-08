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
    overlay?.classList.add('show');
  }
  function closeSidebar() {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('show');
  }

  menuBtn?.addEventListener('click', () => {
    if (sidebar?.classList.contains('open')) closeSidebar();
    else openSidebar();
  });
  overlay?.addEventListener('click', closeSidebar);

  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 992) closeSidebar();
    });
  });

  // ---------- Progress Tracking ----------
  const PROGRESS_KEY = 'ppc-progress';
  const TOTAL_LECTURES = 30;

  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function markComplete(id) {
    const p = getProgress();
    p[id] = true;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
    updateProgressUI();
  }

  function updateProgressUI() {
    const p = getProgress();
    const done = Object.keys(p).filter(k => p[k]).length;
    const pct = Math.min(100, Math.round((done / TOTAL_LECTURES) * 100));
    document.querySelectorAll('[data-progress-bar]').forEach(el => {
      el.style.width = pct + '%';
    });
    document.querySelectorAll('[data-progress-text]').forEach(el => {
      el.textContent = done + ' / ' + TOTAL_LECTURES + ' lectures (' + pct + '%)';
    });
  }

  updateProgressUI();

  // Auto-mark current lecture if on lecture page
  const path = window.location.pathname;
  const match = path.match(/lecture-(\d+)/);
  if (match) {
    const id = match[1];
    setTimeout(() => markComplete(id), 12000);
    document.getElementById('markComplete')?.addEventListener('click', () => markComplete(id));
  }

  // ---------- Quiz Engine ----------
  window.initQuiz = function (questions) {
    if (!questions || !questions.length) return;
    let current = 0;
    let score = 0;

    const box = document.getElementById('quiz-box');
    if (!box) return;

    function render() {
      if (current >= questions.length) {
        box.innerHTML =
          '<div class="quiz-question">Quiz complete</div>' +
          '<p class="quiz-feedback show correct">Score: ' + score + ' / ' + questions.length + '</p>';
        return;
      }
      const q = questions[current];
      box.innerHTML =
        '<div class="quiz-question">' + (current + 1) + '. ' + q.question + '</div>' +
        '<div class="quiz-options" id="quiz-opts"></div>' +
        '<div class="quiz-feedback" id="quiz-fb"></div>' +
        '<button class="btn btn-primary" id="quiz-next" style="display:none;margin-top:0.75rem">Next</button>';

      const opts = document.getElementById('quiz-opts');
      q.options.forEach((opt, i) => {
        const div = document.createElement('div');
        div.className = 'quiz-option';
        div.textContent = opt;
        div.addEventListener('click', () => selectOption(i, q.correct, div));
        opts.appendChild(div);
      });
    }

    function selectOption(index, correctIndex, el) {
      const options = document.querySelectorAll('#quiz-opts .quiz-option');
      options.forEach(o => (o.style.pointerEvents = 'none'));

      if (index === correctIndex) {
        el.classList.add('correct');
        score++;
        document.getElementById('quiz-fb').className = 'quiz-feedback show correct';
        document.getElementById('quiz-fb').textContent =
          'Correct! ' + (questions[current].explanation || '');
      } else {
        el.classList.add('incorrect');
        options[correctIndex].classList.add('correct');
        document.getElementById('quiz-fb').className = 'quiz-feedback show incorrect';
        document.getElementById('quiz-fb').textContent =
          'Not quite. ' + (questions[current].explanation || '');
      }
      const next = document.getElementById('quiz-next');
      next.style.display = 'inline-flex';
      next.onclick = () => {
        current++;
        render();
      };
    }

    render();
  };

  // ---------- Simple Search (client-side) ----------
  const searchInput = document.getElementById('search-input');
  searchInput?.addEventListener('input', function () {
    const q = this.value.toLowerCase().trim();
    document.querySelectorAll('.lecture-card').forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = !q || text.includes(q) ? '' : 'none';
    });
  });

  // ---------- Reflection local save ----------
  document.querySelectorAll('[data-reflection]').forEach(textarea => {
    const key = 'ppc-reflection-' + textarea.getAttribute('data-reflection');
    textarea.value = localStorage.getItem(key) || '';
    textarea.addEventListener('input', () => {
      localStorage.setItem(key, textarea.value);
    });
  });

  // ---------- Smooth scroll for internal links ----------
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
