/* =========================================================
   Professional Practices in Computing - Main JS
   Theme, Sidebar, Progress, Quiz Engine
   ========================================================= */

(function () {
  'use strict';

  // ---------- Theme ----------
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');

  function getPreferredTheme() {
    const stored = localStorage.getItem('ppc-theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('ppc-theme', theme);
    if (themeToggle) {
      themeToggle.innerHTML = theme === 'dark'
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }
  }

  setTheme(getPreferredTheme());
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });
  }

  // ---------- Sidebar ----------
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menu-toggle');
  const overlay = document.getElementById('overlay');

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      sidebar && sidebar.classList.toggle('open');
      overlay && overlay.classList.toggle('active');
    });
  }
  if (overlay) overlay.addEventListener('click', closeSidebar);

  // ---------- Progress ----------
  const PROGRESS_KEY = 'ppc-progress';
  const TOTAL_LECTURES = 30;

  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function saveProgress(data) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
    updateProgressUI();
  }

  function markComplete(id) {
    const p = getProgress();
    p[id] = true;
    saveProgress(p);
  }

  function updateProgressUI() {
    const p = getProgress();
    const done = Object.keys(p).filter(k => p[k]).length;
    const pct = Math.round((done / TOTAL_LECTURES) * 100);
    const fill = document.getElementById('progress-fill');
    const label = document.getElementById('progress-pct');
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = pct + '%';

    // Mark sidebar links
    document.querySelectorAll('[data-lecture]').forEach(el => {
      const id = el.getAttribute('data-lecture');
      if (p[id]) el.classList.add('completed');
    });
  }

  updateProgressUI();

  const markBtn = document.getElementById('mark-complete');
  if (markBtn) {
    markBtn.addEventListener('click', () => {
      const id = markBtn.getAttribute('data-lecture-id');
      if (id) {
        markComplete(id);
        markBtn.textContent = '✓ Completed';
        markBtn.disabled = true;
      }
    });
    const id = markBtn.getAttribute('data-lecture-id');
    if (id && getProgress()[id]) {
      markBtn.textContent = '✓ Completed';
      markBtn.disabled = true;
    }
  }

  // ---------- Reflections (localStorage) ----------
  document.querySelectorAll('[data-reflection]').forEach(ta => {
    const key = 'ppc-reflection-' + ta.getAttribute('data-reflection');
    const saved = localStorage.getItem(key);
    if (saved) ta.value = saved;
    ta.addEventListener('input', () => {
      localStorage.setItem(key, ta.value);
    });
  });

  // ---------- Quiz Engine ----------
  window.initQuiz = function (containerId, questions) {
    const container = document.getElementById(containerId);
    if (!container || !questions || !questions.length) return;

    let html = '';
    questions.forEach((q, qi) => {
      html += `<div class="quiz-question" data-q="${qi}">
        <h4>${qi + 1}. ${q.question}</h4>`;
      q.options.forEach((opt, oi) => {
        html += `<div class="quiz-option" data-q="${qi}" data-o="${oi}">${opt}</div>`;
      });
      html += `<div class="quiz-explanation" id="exp-${qi}" style="display:none;"></div></div>`;
    });
    html += `<button class="btn btn-primary" id="quiz-submit-${containerId}">Check Answers</button>`;
    container.innerHTML = html;

    const selected = {};
    container.querySelectorAll('.quiz-option').forEach(el => {
      el.addEventListener('click', () => {
        const qi = el.getAttribute('data-q');
        container.querySelectorAll(`.quiz-option[data-q="${qi}"]`).forEach(o => o.classList.remove('selected'));
        el.classList.add('selected');
        selected[qi] = parseInt(el.getAttribute('data-o'), 10);
      });
    });

    const submitBtn = document.getElementById(`quiz-submit-${containerId}`);
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        let correctCount = 0;
        questions.forEach((q, qi) => {
          const opts = container.querySelectorAll(`.quiz-option[data-q="${qi}"]`);
          opts.forEach(o => {
            o.classList.remove('correct', 'incorrect');
            const oi = parseInt(o.getAttribute('data-o'), 10);
            if (oi === q.correct) o.classList.add('correct');
            else if (selected[qi] === oi) o.classList.add('incorrect');
          });
          const exp = document.getElementById(`exp-${qi}`);
          if (exp) {
            exp.style.display = 'block';
            exp.textContent = q.explanation || '';
          }
          if (selected[qi] === q.correct) correctCount++;
        });
        submitBtn.textContent = `Score: ${correctCount} / ${questions.length}`;
        submitBtn.disabled = true;
      });
    }
  };

  // ---------- Search (simple) ----------
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      document.querySelectorAll('.lecture-card, .sidebar-link[data-lecture]').forEach(el => {
        const text = el.textContent.toLowerCase();
        el.style.display = !term || text.includes(term) ? '' : 'none';
      });
    });
  }
})();
