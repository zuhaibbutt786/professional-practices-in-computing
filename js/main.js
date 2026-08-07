/* =========================================================
   Professional Practices in Computing - Main JS
   Theme, Progress, Quiz Engine, Search, Reflections
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
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = theme === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
    }
  }

  setTheme(getPreferredTheme());

  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
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
      el.textContent = done + ' / ' + total + ' lectures (' + pct + '%)';
    });

    document.querySelectorAll('.sidebar-nav-link[data-lecture]').forEach(link => {
      const id = link.getAttribute('data-lecture');
      if (p[id]) {
        link.classList.add('completed');
      }
    });
  }

  document.getElementById('mark-complete')?.addEventListener('click', function () {
    const id = this.getAttribute('data-lecture-id');
    if (id) {
      markLectureComplete(id);
      this.innerHTML = '✓ Completed';
      this.disabled = true;
      this.classList.remove('btn-primary');
      this.classList.add('btn-outline-secondary');
    }
  });

  updateProgressUI();

  // ---------- Quiz Engine ----------
  window.initQuiz = function (containerId, questions) {
    const container = document.getElementById(containerId);
    if (!container || !questions || !questions.length) return;

    let current = 0;
    let score = 0;

    function render() {
      if (current >= questions.length) {
        container.innerHTML =
          '<div class="text-center">' +
          '<h4>Quiz Complete</h4>' +
          '<p>You scored <strong>' + score + '</strong> out of <strong>' + questions.length + '</strong></p>' +
          '<button class="btn btn-primary mt-2" onclick="location.reload()">Retry</button>' +
          '</div>';
        return;
      }

      const q = questions[current];
      let optsHtml = '';
      q.options.forEach(function (opt, i) {
        optsHtml += '<label><input type="radio" name="q' + current + '" value="' + i + '"> ' + opt + '</label>';
      });

      container.innerHTML =
        '<div class="quiz-question mb-3"><strong>' + (current + 1) + '.</strong> ' + q.question + '</div>' +
        '<div class="quiz-options" id="quiz-opts">' + optsHtml + '</div>' +
        '<div class="quiz-feedback mt-2" id="quiz-fb"></div>' +
        '<div class="mt-3 d-flex justify-content-between align-items-center">' +
        '<span class="small text-muted">' + (current + 1) + ' / ' + questions.length + '</span>' +
        '<button class="btn btn-primary btn-sm" id="quiz-next" style="display:none;">Next</button>' +
        '</div>';

      document.querySelectorAll('#quiz-opts label').forEach(function (label) {
        label.addEventListener('click', function () {
          const input = label.querySelector('input');
          if (!input || input.disabled) return;
          selectOption(parseInt(input.value, 10), q.correct);
        });
      });
    }

    function selectOption(index, correctIndex) {
      const inputs = document.querySelectorAll('#quiz-opts input');
      inputs.forEach(function (inp) { inp.disabled = true; });

      const fb = document.getElementById('quiz-fb');
      if (index === correctIndex) {
        score++;
        fb.className = 'quiz-feedback mt-2 text-success';
        fb.textContent = 'Correct! ' + (questions[current].explanation || '');
      } else {
        fb.className = 'quiz-feedback mt-2 text-danger';
        fb.textContent = 'Not quite. ' + (questions[current].explanation || '');
      }
      const nextBtn = document.getElementById('quiz-next');
      nextBtn.style.display = 'inline-block';
      nextBtn.onclick = function () {
        current++;
        render();
      };
    }

    render();
  };

  // ---------- Search ----------
  const searchInput = document.getElementById('search-input');
  searchInput?.addEventListener('input', function () {
    const q = this.value.toLowerCase().trim();
    document.querySelectorAll('.module-card, .lecture-card').forEach(function (card) {
      const text = card.textContent.toLowerCase();
      card.style.display = !q || text.includes(q) ? '' : 'none';
    });
  });

  // ---------- Reflection local save ----------
  document.querySelectorAll('[data-reflection]').forEach(function (textarea) {
    const key = 'ppc-reflection-' + textarea.getAttribute('data-reflection');
    textarea.value = localStorage.getItem(key) || '';
    textarea.addEventListener('input', function () {
      localStorage.setItem(key, textarea.value);
    });
  });

  // ---------- Smooth scroll ----------
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
