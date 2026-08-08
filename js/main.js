/* =========================================================
   Professional Practices in Computing - Main JS
   Theme, Sidebar, Progress, Quiz Engine, Search
   ========================================================= */

(function () {
  const THEME_KEY = "ppc-theme";
  const PROGRESS_KEY = "ppc-progress";

  // Theme
  function getTheme() {
    return localStorage.getItem(THEME_KEY) || "dark";
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  function toggleTheme() {
    const next = getTheme() === "dark" ? "light" : "dark";
    setTheme(next);
  }

  // Progress
  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveProgress(data) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
    updateProgressUI();
  }

  function markComplete(lectureId) {
    const p = loadProgress();
    p[lectureId] = true;
    saveProgress(p);
  }

  function updateProgressUI() {
    const p = loadProgress();
    const total = 5; // current modules
    const done = Object.keys(p).filter((k) => p[k]).length;
    const pct = Math.round((done / total) * 100);
    const fill = document.getElementById("progressFill");
    const label = document.getElementById("progressLabel");
    if (fill) fill.style.width = pct + "%";
    if (label) label.textContent = pct + "%";
  }

  // Sidebar
  function initSidebar() {
    const sidebar = document.getElementById("sidebar");
    const menuBtn = document.getElementById("menuBtn");
    const closeBtn = document.getElementById("sidebarClose");
    if (menuBtn && sidebar) {
      menuBtn.addEventListener("click", () => sidebar.classList.add("open"));
    }
    if (closeBtn && sidebar) {
      closeBtn.addEventListener("click", () => sidebar.classList.remove("open"));
    }
  }

  // Theme buttons
  function initTheme() {
    setTheme(getTheme());
    document.querySelectorAll("#themeToggle, #themeToggleTop").forEach((btn) => {
      if (btn) btn.addEventListener("click", toggleTheme);
    });
  }

  // Quiz engine
  window.PPCQuiz = {
    check(btn, correct) {
      const options = btn.parentElement.querySelectorAll(".quiz-option");
      options.forEach((o) => {
        o.classList.remove("correct", "incorrect");
        o.disabled = true;
      });
      if (btn.dataset.answer === String(correct)) {
        btn.classList.add("correct");
      } else {
        btn.classList.add("incorrect");
        options.forEach((o) => {
          if (o.dataset.answer === String(correct)) o.classList.add("correct");
        });
      }
    },
  };

  // Mark lecture complete if on a lecture page
  function initLectureProgress() {
    const match = location.pathname.match(/lecture-0(\d)/);
    if (match) {
      const id = "lecture-0" + match[1];
      // Mark after short delay so user sees content
      setTimeout(() => markComplete(id), 1500);
    }
  }

  // Init
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initSidebar();
    updateProgressUI();
    initLectureProgress();
  });
})();
