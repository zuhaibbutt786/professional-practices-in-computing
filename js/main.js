/* =========================================================
   Professional Practices in Computing - Main JS
   Theme, Sidebar, Progress, Quiz Engine
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
  }

  setTheme(getPreferredTheme());

  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });

  // ---------- Sidebar ----------
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const menuBtn = document.getElementById('menuToggle');
  const closeBtn = document.getElementById('sidebarClose');

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
  closeBtn?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click', closeSidebar);

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 900) closeSidebar();
    });
  });

  // ---------- Progress Tracking ----------
  const PROGRESS_KEY = 'ppc-progress';
  const TOTAL_LECTURES = 5;

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
    const pct = Math.round((done / TOTAL_LECTURES) * 100);
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('progressText');
    if (fill) fill.style.width = pct + '%';
    if (text) text.textContent = done + ' / ' + TOTAL_LECTURES + ' lectures';
  }

  updateProgressUI();

  // Auto-mark current lecture if on lecture page
  const path = window.location.pathname;
  const match = path.match(/lecture-(\d+)/);
  if (match) {
    const id = match[1];
    setTimeout(() => markComplete(id), 8000);
    const btn = document.getElementById('markComplete');
    btn?.addEventListener('click', () => markComplete(id));
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
          '<p class="quiz-feedback">Score: ' + score + ' / ' + questions.length + '</p>';
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
        const div = document.createElement('button');
        div.type = 'button';
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
        document.getElementById('quiz-fb').textContent =
          'Correct! ' + (questions[current].explanation || '');
      } else {
        el.classList.add('incorrect');
        options[correctIndex].classList.add('correct');
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

  // ---------- Reflection local save ----------
  document.querySelectorAll('[data-reflection]').forEach(textarea => {
    const key = 'ppc-reflection-' + textarea.getAttribute('data-reflection');
    textarea.value = localStorage.getItem(key) || '';
    textarea.addEventListener('input', () => {
      localStorage.setItem(key, textarea.value);
    });
  });

  // ---------- Smooth scroll ----------
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
