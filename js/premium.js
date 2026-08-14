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
    const media = document.querySelector(".hero-img");
    if (!media || reduced) {
      if (media instanceof HTMLVideoElement) media.pause();
      return;
    }
    let ticking = false;
    const update = () => {
      const y = Math.min(window.scrollY * 0.32, 140);
      media.style.transform = `translate3d(0, ${y}px, 0) scale(1.15)`;
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

  function initMobileNav() {
    const header = document.querySelector(".site-header");
    const toggle = document.querySelector(".mobile-nav-toggle");
    const nav = document.querySelector(".header-nav");
    if (!header || !toggle || !nav) return;

    const mq = window.matchMedia("(max-width: 768px)");

    function close() {
      header.classList.remove("is-mobile-nav-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      document.body.classList.remove("mobile-nav-open");
    }

    function open() {
      header.classList.add("is-mobile-nav-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      document.body.classList.add("mobile-nav-open");
    }

    toggle.addEventListener("click", () => {
      if (header.classList.contains("is-mobile-nav-open")) close();
      else open();
    });

    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));

    document.addEventListener("click", (e) => {
      if (!mq.matches || !header.classList.contains("is-mobile-nav-open")) return;
      if (!header.contains(e.target)) close();
    });

    mq.addEventListener("change", (e) => {
      if (!e.matches) close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  function initStickySidebar() {
    const sidebarWrap = document.querySelector(".theme-obsidian .page-layout .sidebar");
    const sidebar = sidebarWrap?.querySelector(".sidebar-inner");
    if (!sidebar || !sidebarWrap) return;

    sidebarWrap.classList.add("is-revealed");
    sidebar.classList.add("is-revealed");

    if (reduced) return;

    const mqSidebar = window.matchMedia("(max-width: 768px)");
    const heroBand = document.querySelector(".theme-obsidian .hero-bottom-band");

    const update = () => {
      if (mqSidebar.matches) {
        sidebar.classList.remove("is-behind-hero");
        return;
      }

      const headerH =
        parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h"), 10) || 64;

      const bandRect = heroBand?.getBoundingClientRect();
      const pastHero = !bandRect || bandRect.bottom <= headerH;
      sidebar.classList.toggle("is-behind-hero", !pastHero);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
  }

  function initSectionNav() {
    const host = document.querySelector(".hero-nav-sticky-host");
    const nav = document.querySelector(".hero-section-nav");
    if (!host || !nav) return;

    const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
    const sections = links
      .map((link) => {
        const id = link.getAttribute("href").slice(1);
        const el = document.getElementById(id);
        return el ? { id, el, link } : null;
      })
      .filter(Boolean);

    if (!sections.length) return;

    const headerH =
      parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h"), 10) || 64;
    const mobileMq = window.matchMedia("(max-width: 768px)");

    const updateStickyOffset = (isFixed) => {
      const navHeight = nav.offsetHeight;
      const offset = headerH + (isFixed ? navHeight : 0);
      document.documentElement.style.setProperty("--section-nav-h", `${navHeight}px`);
      document.documentElement.style.setProperty("--sticky-top-offset", `${offset}px`);
    };

    const updateMobileNavScroll = () => {
      if (!mobileMq.matches || reduced) {
        nav.scrollLeft = 0;
        return;
      }

      const maxScroll = Math.max(0, nav.scrollWidth - nav.clientWidth);
      if (maxScroll === 0) {
        nav.scrollLeft = 0;
        return;
      }

      const hostTop = host.getBoundingClientRect().top;
      const isFixed = hostTop <= headerH;

      if (!isFixed) {
        nav.scrollLeft = 0;
        return;
      }

      const stickScrollY = window.scrollY + hostTop - headerH;
      const start = Math.max(0, stickScrollY);
      const end = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(1, Math.max(0, (window.scrollY - start) / Math.max(1, end - start)));

      nav.scrollLeft = progress * maxScroll;
    };

    const updateFixed = () => {
      const shouldFix = host.getBoundingClientRect().top <= headerH;
      const navHeight = nav.offsetHeight;

      nav.classList.toggle("is-fixed", shouldFix);
      nav.classList.toggle("is-stuck", shouldFix);
      host.style.minHeight = shouldFix ? navHeight + "px" : "";
      updateStickyOffset(shouldFix);
      updateMobileNavScroll();
    };

    const setActive = (id) => {
      links.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
      });
    };

    const visible = new Map();

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.intersectionRatio);
          } else {
            visible.delete(entry.target.id);
          }
        });

        if (visible.size) {
          const best = [...visible.entries()].sort((a, b) => b[1] - a[1])[0][0];
          setActive(best);
        }
      },
      {
        rootMargin: `-${headerH + nav.offsetHeight + 8}px 0px -45% 0px`,
        threshold: [0, 0.15, 0.35, 0.55, 0.75],
      }
    );

    sections.forEach((s) => io.observe(s.el));

    const onScroll = () => updateFixed();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    mobileMq.addEventListener("change", () => {
      nav.scrollLeft = 0;
      updateFixed();
    });
    updateFixed();
  }

  function initResponsiveLayout() {
    const mainCol = document.querySelector(".theme-obsidian .page-layout .main-col");
    const sidebarInner = document.querySelector(".theme-obsidian .page-layout .sidebar-inner");
    if (!mainCol) return;

    const update = () => {
      const w = window.innerWidth;

      if (w <= 980 || w > 1100 || !sidebarInner) {
        document.documentElement.style.removeProperty("--main-col-padding-right");
        mainCol.style.paddingRight = "";
        return;
      }

      const sidebarW = sidebarInner.getBoundingClientRect().width || 280;
      const gutter = Math.max(16, Math.min(32, Math.round(w * 0.02)));
      const paddingRight = `${Math.ceil(sidebarW + gutter)}px`;
      document.documentElement.style.setProperty("--main-col-padding-right", paddingRight);
      mainCol.style.paddingRight = paddingRight;
    };

    update();
    window.addEventListener("resize", update, { passive: true });
    window.addEventListener("load", update);
  }

  document.addEventListener("DOMContentLoaded", () => {
    autoMark();
    initHeader();
    initMobileNav();
    initParallax();
    initReveals();
    initStickySidebar();
    initSectionNav();
    initResponsiveLayout();
    initBlueprintHotspots();
  });

  function initBlueprintHotspots() {
    const wrap = document.querySelector(".blueprint-wrap");
    if (!wrap) return;
    const stage = wrap.parentElement;
    const dots = wrap.querySelectorAll(".bp-dot");
    let activeKey = null;
    const hoverMq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const rotatedMq = window.matchMedia("(max-width: 480px)");

    function hoverEnabled() {
      return hoverMq.matches;
    }

    function usesFixedTooltips() {
      return rotatedMq.matches;
    }

    function resetTipPosition(tip) {
      tip.style.position = "";
      tip.style.left = "";
      tip.style.top = "";
      tip.style.width = "";
      tip.style.transform = "";
      tip.style.zIndex = "";
    }

    function mountTip(tip) {
      if (usesFixedTooltips() && stage) {
        stage.appendChild(tip);
        return;
      }
      wrap.appendChild(tip);
    }

    function positionTip(dot, tip) {
      if (usesFixedTooltips()) {
        const tipW = Math.min(240, window.innerWidth - 32);
        const dotRect = dot.getBoundingClientRect();

        tip.style.position = "fixed";
        tip.style.zIndex = "200";
        tip.style.width = tipW + "px";
        tip.style.transform = "none";

        let left = dotRect.left + dotRect.width / 2 - tipW / 2;
        left = Math.max(16, Math.min(left, window.innerWidth - tipW - 16));

        let top = dotRect.bottom + 12;
        if (top + tip.offsetHeight > window.innerHeight - 16) {
          top = dotRect.top - tip.offsetHeight - 12;
        }
        top = Math.max(16, Math.min(top, window.innerHeight - tip.offsetHeight - 16));

        tip.style.left = left + "px";
        tip.style.top = top + "px";
        return;
      }

      resetTipPosition(tip);

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
      mountTip(tip);
      tip.classList.add("is-visible");
      positionTip(dot, tip);
    }

    function hide() {
      if (!activeKey) return;
      const tip = wrap.querySelector('[data-bp-tip="' + activeKey + '"]') ||
        stage?.querySelector('[data-bp-tip="' + activeKey + '"]');
      if (tip) {
        tip.classList.remove("is-visible");
        resetTipPosition(tip);
        wrap.appendChild(tip);
      }
      activeKey = null;
    }

    dots.forEach(function (dot) {
      var key = dot.getAttribute("data-bp");

      dot.addEventListener("mouseenter", function () {
        if (!hoverEnabled()) return;
        show(key);
      });
      dot.addEventListener("focus", function () {
        if (!hoverEnabled()) return;
        show(key);
      });
      dot.addEventListener("mouseleave", function () {
        if (!hoverEnabled()) return;
        hide();
      });
      dot.addEventListener("blur", function () {
        if (!hoverEnabled()) return;
        hide();
      });
      dot.addEventListener("click", function (e) {
        e.stopPropagation();
        if (activeKey === key) hide();
        else show(key);
      });
    });

    document.addEventListener("click", function (e) {
      if (e.target.closest(".bp-dot") || e.target.closest(".bp-tooltip")) return;
      hide();
    });

    hoverMq.addEventListener("change", hide);
    rotatedMq.addEventListener("change", hide);
    window.addEventListener("resize", function () {
      if (!activeKey) return;
      var dot = wrap.querySelector('[data-bp="' + activeKey + '"]');
      var tip = wrap.querySelector('[data-bp-tip="' + activeKey + '"]') ||
        stage?.querySelector('[data-bp-tip="' + activeKey + '"]');
      if (dot && tip) {
        mountTip(tip);
        positionTip(dot, tip);
      }
    });
  }
})();
