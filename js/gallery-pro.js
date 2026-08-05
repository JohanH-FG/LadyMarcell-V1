/* Shared gallery engine — theme-aware */

(function () {
  const EXTRA_LIFESTYLE = [];

  function getItems() {
    if (typeof getGalleryItems === "function") return getGalleryItems();
    const base = typeof GALLERY_IMAGES !== "undefined" ? GALLERY_IMAGES.slice() : [];
    EXTRA_LIFESTYLE.forEach((src) => {
      if (!base.includes(src)) base.push(src);
    });
    return base.map((src) => ({ src, category: "all", alt: "Lady Marcelle photo" }));
  }

  function getFiltered(category) {
    if (typeof getGalleryByCategory === "function") return getGalleryByCategory(category);
    const items = getItems();
    if (category === "all") return items;
    return items.filter((item) => item.category === category);
  }

  function buildCategoryButtons(container, activeCategory, onSelect) {
    if (!container) return;
    const cats =
      typeof GALLERY_CATEGORIES !== "undefined"
        ? GALLERY_CATEGORIES
        : [
            { id: "interior", label: "Interior" },
            { id: "exterior", label: "Exterior" },
            { id: "aerial", label: "Aerial" },
            { id: "all", label: "All" },
          ];

    container.innerHTML = "";
    cats.forEach(({ id, label }) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gallery-cat-btn" + (id === activeCategory ? " is-active" : "");
      btn.dataset.galleryCategory = id;
      btn.textContent = label;
      btn.addEventListener("click", () => onSelect(id));
      container.appendChild(btn);
    });
  }

  function getPreviewCategories() {
    if (typeof GALLERY_PREVIEW_CATEGORIES !== "undefined") return GALLERY_PREVIEW_CATEGORIES;
    return [
      { id: "interior", label: "Interior" },
      { id: "exterior", label: "Exterior" },
      { id: "aerial", label: "Aerial" },
    ];
  }

  function renderCategoryPreviews(grid, activeFilter, onOpen) {
    if (!grid) return;
    grid.innerHTML = "";

    const previews =
      activeFilter === "all"
        ? getPreviewCategories()
        : getPreviewCategories().filter((cat) => cat.id === activeFilter);

    previews.forEach(({ id, label }) => {
      const items = getFiltered(id);
      if (!items.length) return;

      const item = items[0];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gallery-category-card";
      btn.setAttribute("role", "listitem");
      btn.setAttribute("aria-label", `${label} gallery`);

      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.alt || label;
      img.loading = "lazy";

      const caption = document.createElement("span");
      caption.className = "gallery-category-label";
      caption.textContent = label;

      btn.appendChild(img);
      btn.appendChild(caption);
      btn.addEventListener("click", () => onOpen(id, 0));
      grid.appendChild(btn);
    });
  }

  function getImages() {
    return getItems().map((item) => item.src);
  }

  function initObsidianGallerySection(openAt) {
    const grid = document.getElementById("gallery-category-grid");
    if (!grid) return;
    renderCategoryPreviews(grid, "all", (cat, index) => openAt(cat, index));
  }

  function openGalleryModal(modal) {
    document.body.appendChild(modal);
    modal.hidden = false;
    modal.classList.add("is-open");
    document.documentElement.classList.add("gallery-modal-open");
    document.body.style.overflow = "hidden";
  }

  function closeGalleryModal(modal) {
    modal.hidden = true;
    modal.classList.remove("is-open");
    document.documentElement.classList.remove("gallery-modal-open");
    document.body.style.overflow = "";
  }

  function enhanceModal(theme) {
    const modal = document.getElementById("gallery-modal");
    if (!modal) return null;
    document.body.appendChild(modal);
    modal.classList.add("gallery-pro", `gallery-pro--${theme}`);
    const body = modal.querySelector(".gallery-modal-body");
    if (body) body.classList.add("gallery-pro-body");
    return modal;
  }

  function wireGridOpens(images, openAt) {
    document.querySelectorAll("[data-gallery-index]").forEach((el) => {
      el.addEventListener("click", () => {
        const i = Number(el.getAttribute("data-gallery-index") || 0);
        openAt(i);
      });
    });
    document.querySelectorAll("[data-open-gallery]").forEach((el) => {
      el.addEventListener("click", () => openAt(0));
    });
  }

  window.LadyGallery = {
    getImages,
    enhanceModal,
    wireGridOpens,
    mountAether(modal, images) {
      const main = modal.querySelector(".gallery-main");
      const mainImg = modal.querySelector("#gallery-main-img");
      const oldThumbs = modal.querySelector("#gallery-thumbs");
      if (oldThumbs) oldThumbs.remove();

      let film = modal.querySelector(".gallery-filmstrip");
      if (!film) {
        film = document.createElement("div");
        film.className = "gallery-filmstrip";
        modal.querySelector(".gallery-modal-body")?.appendChild(film);
      }
      film.innerHTML = "";

      let grid = modal.querySelector(".gallery-grid-view");
      if (!grid) {
        grid = document.createElement("div");
        grid.className = "gallery-grid-view";
        modal.querySelector(".gallery-modal-body")?.appendChild(grid);
      }
      grid.innerHTML = "";

      const actions = modal.querySelector(".gallery-modal-actions");
      if (actions && !actions.querySelector(".gallery-view-toggle")) {
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "gallery-view-toggle";
        toggle.textContent = "Grid";
        toggle.addEventListener("click", () => {
          const on = modal.classList.toggle("is-grid");
          toggle.textContent = on ? "Film" : "Grid";
        });
        actions.insertBefore(toggle, actions.firstChild);
      }

      let index = 0;
      const show = (i) => {
        index = (i + images.length) % images.length;
        main?.classList.add("is-swapping");
        setTimeout(() => {
          if (mainImg) {
            mainImg.src = images[index];
            mainImg.alt = `Lady Marcelle photo ${index + 1}`;
          }
          main?.classList.remove("is-swapping");
        }, 160);
        film.querySelectorAll("button").forEach((b, bi) => b.classList.toggle("is-active", bi === index));
        grid.querySelectorAll("button").forEach((b, bi) => b.classList.toggle("is-active", bi === index));
        const counter = modal.querySelector("#gallery-counter span");
        if (counter) counter.textContent = `${index + 1} / ${images.length}`;
        film.querySelectorAll("button")[index]?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
      };

      images.forEach((src, i) => {
        const mk = (cls) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = cls || "";
          const img = document.createElement("img");
          img.src = src;
          img.alt = `Thumb ${i + 1}`;
          img.loading = "lazy";
          btn.appendChild(img);
          btn.addEventListener("click", () => {
            modal.classList.remove("is-grid");
            const t = actions?.querySelector(".gallery-view-toggle");
            if (t) t.textContent = "Grid";
            show(i);
          });
          return btn;
        };
        film.appendChild(mk());
        grid.appendChild(mk());
      });

      modal.querySelector("#gallery-prev")?.addEventListener("click", () => show(index - 1));
      modal.querySelector("#gallery-next")?.addEventListener("click", () => show(index + 1));

      return {
        open(start = 0) {
          openGalleryModal(modal);
          show(start);
        },
        close() {
          closeGalleryModal(modal);
        },
        show,
      };
    },

    mountSignal(modal, images) {
      const body = modal.querySelector(".gallery-modal-body");
      const mainImg = modal.querySelector("#gallery-main-img");
      modal.querySelector("#gallery-thumbs")?.remove();

      let overview = modal.querySelector(".gallery-overview");
      if (!overview) {
        overview = document.createElement("div");
        overview.className = "gallery-overview";
        body?.insertBefore(overview, body.firstChild);
      }
      overview.innerHTML = "";

      let index = 0;
      const show = (i) => {
        index = (i + images.length) % images.length;
        if (mainImg) mainImg.src = images[index];
        overview.querySelectorAll("button").forEach((b, bi) => b.classList.toggle("is-active", bi === index));
        const counter = modal.querySelector("#gallery-counter span");
        if (counter) counter.textContent = `${index + 1} / ${images.length}`;
      };

      images.forEach((src, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        const img = document.createElement("img");
        img.src = src;
        img.loading = "lazy";
        img.alt = `Photo ${i + 1}`;
        btn.appendChild(img);
        btn.addEventListener("click", () => show(i));
        overview.appendChild(btn);
      });

      modal.querySelector("#gallery-prev")?.addEventListener("click", () => show(index - 1));
      modal.querySelector("#gallery-next")?.addEventListener("click", () => show(index + 1));

      return {
        open(start = 0) {
          openGalleryModal(modal);
          show(start);
        },
        close() {
          closeGalleryModal(modal);
        },
        show,
      };
    },

    mountObsidian(modal) {
      const main = modal.querySelector(".gallery-main");
      const mainImg = modal.querySelector("#gallery-main-img");
      const modalCategories = modal.querySelector("#gallery-modal-categories");
      modal.querySelector("#gallery-thumbs")?.remove();
      modal.querySelector(".gallery-vstrip")?.remove();

      let category = "all";
      let index = 0;
      let items = getFiltered(category);

      const syncCategoryButtons = () => {
        buildCategoryButtons(modalCategories, category, setCategory);
      };

      const show = (i) => {
        if (!items.length) return;
        index = (i + items.length) % items.length;
        const item = items[index];
        main?.classList.add("is-swapping");
        setTimeout(() => {
          if (mainImg) {
            mainImg.src = item.src;
            mainImg.alt = item.alt || `Lady Marcelle photo ${index + 1}`;
            mainImg.style.animation = "none";
            void mainImg.offsetWidth;
            mainImg.style.animation = "";
          }
          main?.classList.remove("is-swapping");
        }, 140);
        const counter = modal.querySelector("#gallery-counter span");
        if (counter) counter.textContent = `${index + 1} / ${items.length}`;
      };

      const open = (cat = "all", start = 0) => {
        category = cat;
        items = getFiltered(category);
        index = start;
        syncCategoryButtons();
        openGalleryModal(modal);
        show(start);
      };

      const setCategory = (next) => {
        category = next;
        items = getFiltered(category);
        index = 0;
        syncCategoryButtons();
        if (items.length) show(0);
        else if (mainImg) mainImg.removeAttribute("src");
      };

      buildCategoryButtons(modalCategories, category, setCategory);

      modal.querySelector("#gallery-prev")?.addEventListener("click", () => show(index - 1));
      modal.querySelector("#gallery-next")?.addEventListener("click", () => show(index + 1));

      return {
        open,
        close() {
          closeGalleryModal(modal);
        },
        show,
        setCategory,
        getIndex: () => index,
        getCategory: () => category,
      };
    },
  };

  document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const theme = body.classList.contains("theme-aether")
      ? "aether"
      : body.classList.contains("theme-signal")
        ? "signal"
        : body.classList.contains("theme-obsidian")
          ? "obsidian"
          : null;
    if (!theme) return;

    const images = LadyGallery.getImages();
    const modal = LadyGallery.enhanceModal(theme);
    if (!modal) return;

    const api =
      theme === "aether"
        ? LadyGallery.mountAether(modal, images)
        : theme === "signal"
          ? LadyGallery.mountSignal(modal, images)
          : LadyGallery.mountObsidian(modal);

    if (theme === "obsidian") {
      initObsidianGallerySection((category, index) => api.open(category, index));
    }

    let idx = 0;
    const show = api.show;
    api.show = (i) => {
      show(i);
      idx = typeof api.getIndex === "function" ? api.getIndex() : ((i % images.length) + images.length) % images.length;
    };

    if (theme !== "obsidian") {
      document.querySelectorAll("[data-open-gallery]").forEach((el) => {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          api.open(0);
        });
      });

      document.querySelectorAll("[data-gallery-index]").forEach((el) => {
        el.addEventListener("click", () => {
          api.open(Number(el.getAttribute("data-gallery-index") || 0));
        });
      });
    }

    modal.querySelectorAll("[data-close-gallery]").forEach((el) => {
      el.addEventListener("click", (e) => {
        if (!el.classList.contains("btn-enquire-sm")) e.preventDefault();
        api.close();
      });
    });

    document.addEventListener("keydown", (e) => {
      if (modal.hidden) return;
      if (e.key === "Escape") api.close();
      if (e.key === "ArrowLeft") api.show(idx - 1);
      if (e.key === "ArrowRight") api.show(idx + 1);
    });
  });
})();
