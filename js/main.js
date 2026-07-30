/* Lady Marcelle — interactions */

const GALLERY_IMAGES = [
  "images/1667398866777_lady_marcelle1_1600x900.webp",
  "images/1667398866779_lady_marcelle2_1600x900.webp",
  "images/1667398866779_lady_marcelle3_1600x900.webp",
  "images/1667398866780_lady_marcelle4_1600x900.webp",
  "images/1667398866781_lady_marcelle5_1600x900.webp",
  "images/1667398866781_lady_marcelle6_1600x900.webp",
  "images/1667398866782_lady_marcelle7_1600x900.webp",
  "images/1667398866783_lady_marcelle8_1600x900.webp",
  "images/1667398866784_lady_marcelle9_1600x900.webp",
  "images/1667398866785_lady_marcelle10_1600x900.webp",
  "images/1667398866788_lady_marcelle12_1600x900.webp",
  "images/1667398866789_lady_marcelle13_1600x900.webp",
  "images/1667398866789_lady_marcelle14_1600x900.webp",
  "images/1667398866790_lady_marcelle15_1600x900.webp",
  "images/1667398866791_lady_marcelle16_1600x900.webp",
  "images/1667398866792_lady_marcelle17_1600x900.webp",
  "images/1667398866792_lady_marcelle18_1600x900.webp",
  "images/1667398866793_lady_marcelle19_1600x900.webp",
  "images/1667398866794_lady_marcelle20_1600x900.webp",
];

document.addEventListener("DOMContentLoaded", () => {
  initCharterSelection();
  initToysToggle();
  initFavorites();
  initEnquireForm();
  initNewsletter();
  if (!document.querySelector("script[src*='gallery-pro']")) {
    initGallery();
  }
});

function initCharterSelection() {
  const destDisplay = document.getElementById("selection-destination");
  const datesDisplay = document.getElementById("selection-dates");
  const editBtn = document.getElementById("edit-selection-btn");
  const editor = document.getElementById("selection-editor");
  const destInput = document.getElementById("sidebar-destination");
  const startInput = document.getElementById("sidebar-start");
  const endInput = document.getElementById("sidebar-end");
  const applyBtn = document.getElementById("apply-selection-btn");
  const enquireBtn = document.getElementById("enquire-btn");
  const reserveBtn = document.getElementById("reserve-btn");
  const enquireForm = document.getElementById("enquire-form");

  if (!destDisplay || !editBtn || !editor) return;

  const today = new Date().toISOString().slice(0, 10);
  if (startInput) startInput.min = today;
  if (endInput) endInput.min = today;

  let selection = initCharterSelectionFromUrl();

  function renderDestinationDisplay(destination) {
    if (destination) {
      destDisplay.textContent = destination;
      destDisplay.classList.remove("is-placeholder");
    } else {
      destDisplay.textContent = "Select a destination";
      destDisplay.classList.add("is-placeholder");
    }
  }

  function updateDisplay() {
    renderDestinationDisplay(selection.destination);
    if (selection.startDate) {
      datesDisplay.textContent = formatCharterDateRange(selection.startDate, selection.endDate);
      datesDisplay.hidden = false;
    } else {
      datesDisplay.hidden = true;
      datesDisplay.textContent = "";
    }
    if (reserveBtn) reserveBtn.href = buildBookingUrl(selection);
    applyCharterSelectionToForm(enquireForm, selection);
  }

  function updatePreviewFromEditor() {
    renderDestinationDisplay(destInput?.value || "");
    const start = startInput?.value || "";
    const end = endInput?.value || "";
    if (start) {
      datesDisplay.textContent = formatCharterDateRange(start, end);
      datesDisplay.hidden = false;
    } else {
      datesDisplay.hidden = true;
      datesDisplay.textContent = "";
    }
  }

  function openEditor() {
    editor.hidden = false;
    editBtn.setAttribute("aria-expanded", "true");
    if (destInput) destInput.value = selection.destination || "";
    if (startInput) startInput.value = selection.startDate || "";
    if (endInput) endInput.value = selection.endDate || "";
    updatePreviewFromEditor();
  }

  function closeEditor(revert = true) {
    editor.hidden = true;
    editBtn.setAttribute("aria-expanded", "false");
    if (revert) updateDisplay();
  }

  function applyEditor() {
    const start = startInput?.value || "";
    const end = endInput?.value || "";
    if (start && end && end < start) {
      endInput.setCustomValidity("End date must be after start date.");
      endInput.reportValidity();
      endInput.setCustomValidity("");
      return false;
    }
    selection = setCharterSelection({
      destination: destInput?.value || "",
      startDate: start,
      endDate: end,
    });
    updateDisplay();
    closeEditor(false);
    return true;
  }

  editBtn.addEventListener("click", () => {
    if (editor.hidden) openEditor();
    else closeEditor(true);
  });

  applyBtn?.addEventListener("click", applyEditor);

  destInput?.addEventListener("change", updatePreviewFromEditor);
  startInput?.addEventListener("change", () => {
    if (startInput.value && endInput) {
      endInput.min = startInput.value;
    }
    updatePreviewFromEditor();
  });
  endInput?.addEventListener("change", updatePreviewFromEditor);

  enquireBtn?.addEventListener("click", (e) => {
    if (!editor.hidden && !applyEditor()) return;
    selection = getCharterSelection();
    applyCharterSelectionToForm(enquireForm, selection);
    const target = document.getElementById("enquire");
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      const firstEmpty = enquireForm?.querySelector(
        'input[required]:not([type="checkbox"]):not([value]), input[required][value=""]'
      );
      (firstEmpty || enquireForm?.querySelector("#first-name"))?.focus();
    }
  });

  reserveBtn?.addEventListener("click", (e) => {
    if (!editor.hidden && !applyEditor()) {
      e.preventDefault();
      return;
    }
    selection = getCharterSelection();
    e.preventDefault();
    window.location.href = buildBookingUrl(selection);
  });

  updateDisplay();
}

function initToysToggle() {
  const list = document.getElementById("toys-list");
  const toggle = document.getElementById("toys-toggle");
  if (!list || !toggle) return;

  toggle.addEventListener("click", () => {
    const expanded = list.classList.toggle("is-expanded");
    toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    const label = toggle.querySelector("span") || toggle;
    label.textContent = expanded ? "View less" : "View more toys";
  });
}

function initFavorites() {
  const btn = document.getElementById("favorites-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const active = btn.classList.toggle("is-active");
    const label = btn.querySelector("span");
    if (label) label.textContent = active ? "Added to Favorites" : "Add to Favorites";
  });
}

function initEnquireForm() {
  const form = document.getElementById("enquire-form");
  const success = document.getElementById("form-success");
  if (!form) return;

  const today = new Date().toISOString().slice(0, 10);
  const start = form.querySelector('[name="startDate"]');
  const end = form.querySelector('[name="endDate"]');
  if (start) start.min = today;
  if (end) end.min = today;

  start?.addEventListener("change", () => {
    if (start.value) end.min = start.value;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (start?.value && end?.value && end.value < start.value) {
      end.setCustomValidity("End date must be after start date.");
      form.reportValidity();
      end.setCustomValidity("");
      return;
    }
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (success) {
      success.hidden = false;
    }
    form.reset();
  });
}

function initNewsletter() {
  const form = document.getElementById("newsletter-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (input) {
      input.value = "";
      input.placeholder = "You're subscribed — thank you";
    }
  });
}

function initGallery() {
  const modal = document.getElementById("gallery-modal");
  const mainImg = document.getElementById("gallery-main-img");
  const thumbs = document.getElementById("gallery-thumbs");
  const counter = document.getElementById("gallery-counter");
  const prevBtn = document.getElementById("gallery-prev");
  const nextBtn = document.getElementById("gallery-next");
  if (!modal || !mainImg || !thumbs) return;

  let index = 0;

  GALLERY_IMAGES.forEach((src, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", `Photo ${i + 1}`);
    const img = document.createElement("img");
    img.src = src;
    img.alt = `Lady Marcelle photo ${i + 1}`;
    img.loading = "lazy";
    btn.appendChild(img);
    btn.addEventListener("click", () => show(i));
    thumbs.appendChild(btn);
  });

  const meta = document.createElement("p");
  meta.className = "gallery-thumb-meta";
  meta.id = "gallery-thumb-meta";
  thumbs.appendChild(meta);

  function show(i) {
    index = (i + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
    mainImg.src = GALLERY_IMAGES[index];
    mainImg.alt = `Lady Marcelle photo ${index + 1}`;
    thumbs.querySelectorAll("button").forEach((b, bi) => {
      b.classList.toggle("is-active", bi === index);
    });
    if (counter) {
      counter.querySelector("span").textContent = `${GALLERY_IMAGES.length} Photos`;
    }
    const m = document.getElementById("gallery-thumb-meta");
    if (m) m.textContent = `${index + 1} of ${GALLERY_IMAGES.length}`;
  }

  function open(start = 0) {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    show(start);
  }

  function close() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-open-gallery]").forEach((el) => {
    el.addEventListener("click", () => open(0));
  });

  document.querySelectorAll("[data-close-gallery]").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (el.classList.contains("btn-enquire-sm")) {
        close();
        return;
      }
      e.preventDefault();
      close();
    });
  });

  prevBtn?.addEventListener("click", () => show(index - 1));
  nextBtn?.addEventListener("click", () => show(index + 1));

  document.addEventListener("keydown", (e) => {
    if (modal.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });
}
