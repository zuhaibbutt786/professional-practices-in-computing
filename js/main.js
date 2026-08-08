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

  // Close on link click (mobile)
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 992) closeSidebar();
    });
  });

  // ---------- Progress Tracking ----------
  const PROGRESS_KEY = 'ppc-progress';

  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveProgress(data) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
  }

  function markLectureComplete(id) {
    const p = getProgress();
    p[id] = true;
    saveProgress(p);
    updateProgressUI();
  }

  function updateProgressUI() {
    const p = getProgress();
    const total = 30;
    const done = Object.keys(p).filter(k => p[k]).length;
    const pct = Math.round((done / total) * 100);

    document.querySelectorAll('[data-progress-bar]').forEach(el => {
      el.style.width = pct + '%';
    });
    document.querySelectorAll('[data-progress-text]').forEach(el => {
      el.textContent = `${done} / ${total} lectures (${pct}%)`;
    });

    // Mark sidebar items
    document.querySelectorAll('.sidebar-link[data-lecture]').forEach(link => {
      const id = link.getAttribute('data-lecture');
      if (p[id]) {
        link.classList.add('completed');
        const num = link.querySelector('.num');
        if (num) num.innerHTML = '✓';
      }
    });
  }

  // Complete button
  document.getElementById('mark-complete')?.addEventListener('click', function () {
    const id = this.getAttribute('data-lecture-id');
    if (id) {
      markLectureComplete(id);
      this.innerHTML = '✓ Completed';
      this.disabled = true;
      this.classList.add('btn-outline');
      this.classList.remove('btn-primary');
    }
  });

  updateProgressUI();

  // ---------- Quiz Engine ----------
  window.initQuiz = function (containerId, questions) {
    const container = document.getElementById(containerId);
    if (!container || !questions?.length) return;

    let current = 0;
    let score = 0;

    function render() {
      if (current >= questions.length) {
        container.innerHTML = `
          <div class="text-center">
            <h3>Quiz Complete</h3>
            <p>You scored <strong>${score}</strong> out of <strong>${questions.length}</strong></p>
            <button class="btn btn-primary mt-2" onclick="location.reload()">Retry</button>
          </div>`;
        return;
      }

      const q = questions[current];
      container.innerHTML = `
        <div class="quiz-question">${current + 1}. ${q.question}</div>
        <div class="quiz-options" id="quiz-opts"></div>
        <div class="quiz-feedback" id="quiz-fb"></div>
        <div class="mt-2" style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:0.85rem;color:var(--text-muted);">${current + 1} / ${questions.length}</span>
          <button class="btn btn-primary btn-sm" id="quiz-next" style="display:none;">Next</button>
        </div>`;

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
      options.forEach(o => o.style.pointerEvents = 'none');

      if (index === correctIndex) {
        el.classList.add('correct');
        score++;
        document.getElementById('quiz-fb').className = 'quiz-feedback show correct';
        document.getElementById('quiz-fb').textContent = 'Correct! ' + (questions[current].explanation || '');
      } else {
        el.classList.add('incorrect');
        options[correctIndex].classList.add('correct');
        document.getElementById('quiz-fb').className = 'quiz-feedback show incorrect';
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

  // ---------- Simple Search (client-side) ----------
  const searchInput = document.getElementById('search-input');
  searchInput?.addEventListener('input', function () {
    const q = this.value.toLowerCase().trim();
    // Basic: highlight or filter lecture cards if on home
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
