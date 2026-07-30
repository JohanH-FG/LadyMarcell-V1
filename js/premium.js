/* LadyMarcell-3 — Obsidian Tide motion */

(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initHeader() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    const tick = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
    tick();
    window.addEventListener("scroll", tick, { passive: true });
  }

  function initParallax() {
    const img = document.querySelector(".hero-img");
    if (!img || reduced) return;
    let ticking = false;
    const update = () => {
      const y = Math.min(window.scrollY * 0.32, 140);
      img.style.transform = `translate3d(0, ${y}px, 0) scale(1.15)`;
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  }

  function autoMark() {
    [
      ".content-section", ".sidebar-inner", ".enquire-card", ".dest-card",
      ".gallery-grid > *", ".croatia-guide", ".croatia-facts", ".croatia-break",
      ".croatia-hero-copy", ".dest-croatia", ".articles-section", ".faq-section",
      ".croatia-cta", ".booking-aside", ".booking-card", ".booking-hero",
      ".footer-grid > *", ".detail-row",
    ].forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        if (!el.hasAttribute("data-reveal")) el.setAttribute("data-reveal", "");
      });
    });
  }

  function initReveals() {
    const nodes = document.querySelectorAll("[data-reveal]");
    if (!nodes.length) return;
    if (reduced) {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );
    nodes.forEach((n, i) => {
      n.style.setProperty("--reveal-delay", `${(i % 6) * 65}ms`);
      io.observe(n);
    });
  }

  function initStickySidebar() {}

  document.addEventListener("DOMContentLoaded", () => {
    autoMark();
    initHeader();
    initParallax();
    initReveals();
    initStickySidebar();
    initBlueprintHotspots();
  });

  function initBlueprintHotspots() {
    const wrap = document.querySelector(".blueprint-wrap");
    if (!wrap) return;
    const dots = wrap.querySelectorAll(".bp-dot");
    let activeKey = null;

    function positionTip(dot, tip) {
      const wrapRect = wrap.getBoundingClientRect();
      const dotRect = dot.getBoundingClientRect();
      const dotCx = dotRect.left + dotRect.width / 2 - wrapRect.left;
      const dotCy = dotRect.top - wrapRect.top;
      let left = dotCx - 120;
      if (left < 8) left = 8;
      if (left + 240 > wrapRect.width - 8) left = wrapRect.width - 248;
      let top = dotCy - tip.offsetHeight - 14;
      if (top < 0) top = dotCy + dotRect.height + 14;
      tip.style.left = left + "px";
      tip.style.top = top + "px";
    }

    function show(key) {
      if (activeKey === key) return;
      hide();
      activeKey = key;
      const dot = wrap.querySelector('[data-bp="' + key + '"]');
      const tip = wrap.querySelector('[data-bp-tip="' + key + '"]');
      if (!dot || !tip) return;
      tip.classList.add("is-visible");
      positionTip(dot, tip);
    }

    function hide() {
      if (!activeKey) return;
      const tip = wrap.querySelector('[data-bp-tip="' + activeKey + '"]');
      if (tip) tip.classList.remove("is-visible");
      activeKey = null;
    }

    dots.forEach(function (dot) {
      var key = dot.getAttribute("data-bp");
      dot.addEventListener("mouseenter", function () { show(key); });
      dot.addEventListener("focus", function () { show(key); });
      dot.addEventListener("mouseleave", function () { hide(); });
      dot.addEventListener("blur", function () { hide(); });
      dot.addEventListener("click", function (e) {
        e.stopPropagation();
        if (activeKey === key) { hide(); } else { show(key); }
      });
    });
    document.addEventListener("click", hide);
  }
})();
