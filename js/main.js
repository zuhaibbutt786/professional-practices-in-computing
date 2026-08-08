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
  }

  setTheme(getPreferredTheme());

  function toggleTheme() {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

  // ---------- Sidebar ----------
  const sidebar = document.getElementById('sidebar');
  const menuBtn = document.getElementById('menuBtn');
  const closeBtn = document.getElementById('sidebarClose');

  function openSidebar() {
    sidebar?.classList.add('open');
  }
  function closeSidebar() {
    sidebar?.classList.remove('open');
  }

  menuBtn?.addEventListener('click', () => {
    if (sidebar?.classList.contains('open')) closeSidebar();
    else openSidebar();
  });
  closeBtn?.addEventListener('click', closeSidebar);

  document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 900) closeSidebar();
    });
  });

  // ---------- Progress Tracking ----------
  const PROGRESS_KEY = 'ppc-progress';
  const TOTAL_MODULES = 5;

  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function setProgress(id, value) {
    const p = getProgress();
    p[id] = value;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
    updateProgressUI();
  }

  function updateProgressUI() {
    const p = getProgress();
    const done = Object.values(p).filter(Boolean).length;
    const pct = Math.min(100, Math.round((done / TOTAL_MODULES) * 100));
    const pill = document.getElementById('progressPill');
    if (pill) pill.textContent = pct + '%';
    document.querySelectorAll('[data-status]').forEach(el => {
      const id = el.getAttribute('data-status');
      if (p[id]) el.textContent = 'Completed';
    });
  }

  const lectureId = document.body.getAttribute('data-lecture');
  if (lectureId) {
    setProgress(lectureId, true);
  }
  updateProgressUI();

  // ---------- Quiz Engine ----------
  window.initQuiz = function (questions) {
    if (!questions || !questions.length) return;
    let current = 0;
    let score = 0;
    const container = document.getElementById('quiz-container');
    if (!container) return;

    function render() {
      if (current >= questions.length) {
        container.innerHTML = '<div class="glass"><h3>Quiz complete</h3><p>Score: ' + score + ' / ' + questions.length + '</p></div>';
        return;
      }
      const q = questions[current];
      let html = '<div class="quiz-card glass"><h4>Q' + (current + 1) + '. ' + q.question + '</h4><div class="quiz-options" id="quiz-opts"></div><div id="quiz-fb" class="quiz-feedback"></div><button class="btn primary" id="quiz-next" style="display:none;margin-top:0.75rem">Next</button></div>';
      container.innerHTML = html;
      const opts = document.getElementById('quiz-opts');
      q.options.forEach((opt, i) => {
        const label = document.createElement('label');
        label.innerHTML = '<input type="radio" name="q" value="' + i + '"> <span>' + opt + '</span>';
        label.addEventListener('click', () => selectOption(i, q.correct, label));
        opts.appendChild(label);
      });
    }

    function selectOption(index, correctIndex, el) {
      const options = document.querySelectorAll('#quiz-opts label');
      options.forEach(o => { o.style.pointerEvents = 'none'; });
      if (index === correctIndex) {
        el.style.borderColor = 'var(--success)';
        score++;
        document.getElementById('quiz-fb').textContent = 'Correct! ' + (questions[current].explanation || '');
      } else {
        el.style.borderColor = 'var(--danger)';
        document.getElementById('quiz-fb').textContent = 'Not quite. ' + (questions[current].explanation || '');
      }
      document.getElementById('quiz-next').style.display = 'inline-flex';
      document.getElementById('quiz-next').onclick = () => {
        current++;
        render();
      };
    }

    render();
  };

  // ---------- Search ----------
  const searchInput = document.getElementById('siteSearch');
  const searchResults = document.getElementById('searchResults');
  searchInput?.addEventListener('input', function () {
    const q = this.value.toLowerCase().trim();
    if (!searchResults) return;
    if (!q) {
      searchResults.hidden = true;
      return;
    }
    document.querySelectorAll('.module-card').forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(q) ? '' : 'none';
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
