/* Lady Marcelle — logo color theme switcher */

(function () {
  const COLORS = ["gold", "navy", "black", "white"];
  const STORAGE_KEY = "lm-logo-color";
  const LOGOS = {
    full: {
      gold: "images/logos/lm-full-gold.png",
      navy: "images/logos/lm-full-navy.png",
      black: "images/logos/lm-full-black.png",
      white: "images/logos/lm-full-white.png",
    },
    icon: {
      gold: "images/logos/lm-icon-gold.png",
      navy: "images/logos/lm-icon-navy.png",
      black: "images/logos/lm-icon-black.png",
      white: "images/logos/lm-icon-white.png",
    },
  };

  const LABELS = {
    gold: "Gold",
    navy: "Navy",
    black: "Black",
    white: "White",
  };

  function getSavedColor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return COLORS.includes(saved) ? saved : "gold";
  }

  function setBodyColorClass(color) {
    COLORS.forEach((c) => document.body.classList.remove("logo-color-" + c));
    document.body.classList.add("logo-color-" + color);
    document.documentElement.setAttribute("data-logo-color", color);
  }

  function updateLogoImage(el, color) {
    const type = el.getAttribute("data-brand-logo") || "full";
    const map = LOGOS[type] || LOGOS.full;
    const src = map[color];
    if (src && el.getAttribute("src") !== src) el.setAttribute("src", src);
  }

  function updateToggle(color) {
    const toggle = document.querySelector(".logo-color-toggle");
    if (!toggle) return;
    toggle.dataset.color = color;
    toggle.setAttribute("aria-label", "Logo color: " + LABELS[color] + ". Click to change.");
    toggle.title = "Logo color: " + LABELS[color];

    const swatch = toggle.querySelector(".logo-color-toggle-swatch");
    if (swatch) swatch.style.backgroundColor = swatchColor(color);

    const icon = toggle.querySelector(".logo-color-toggle-icon");
    if (icon) icon.setAttribute("src", LOGOS.icon[color]);
  }

  function swatchColor(color) {
    return (
      {
        gold: "#c9a227",
        navy: "#001a3d",
        black: "#111111",
        white: "#ffffff",
      }[color] || "#c9a227"
    );
  }

  function applyTheme(color) {
    if (!COLORS.includes(color)) color = "gold";
    setBodyColorClass(color);
    document.querySelectorAll("[data-brand-logo]").forEach((el) => {
      if (el.classList.contains("brand-logo--modal")) return;
      updateLogoImage(el, color);
    });
    updateToggle(color);
    localStorage.setItem(STORAGE_KEY, color);
  }

  function cycleColor() {
    const current = getSavedColor();
    const next = COLORS[(COLORS.indexOf(current) + 1) % COLORS.length];
    applyTheme(next);
  }

  function init() {
    applyTheme(getSavedColor());
    document.querySelector(".logo-color-toggle")?.addEventListener("click", cycleColor);
  }

  document.documentElement.setAttribute("data-logo-color", getSavedColor());

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.LadyLogoTheme = { applyTheme, cycleColor, getSavedColor };
})();
