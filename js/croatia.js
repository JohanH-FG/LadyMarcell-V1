/* Croatia destination page interactions */

document.addEventListener("DOMContentLoaded", () => {
  initCarousels();
  initNewsletter();
  initHearts();
});

function initCarousels() {
  document.querySelectorAll("[data-carousel]").forEach((root) => {
    const track = root.querySelector("[data-carousel-track]");
    const prev = root.querySelector("[data-carousel-prev]");
    const next = root.querySelector("[data-carousel-next]");
    if (!track) return;

    const cards = () => [...track.children];

    const maxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);

    const stepSize = () => {
      const first = cards()[0];
      if (!first) return 380;
      const gap = parseFloat(getComputedStyle(track).gap) || 20;
      return first.getBoundingClientRect().width + gap;
    };

    const scrollTolerance = () => Math.max(4, stepSize() * 0.05);

    const updateButtons = () => {
      const tolerance = scrollTolerance();
      const scroll = track.scrollLeft;
      const max = maxScroll();

      if (prev) prev.disabled = scroll <= tolerance;
      if (next) next.disabled = scroll >= max - tolerance;
    };

    prev?.addEventListener("click", () => {
      const step = stepSize();
      const tolerance = scrollTolerance();

      if (track.scrollLeft <= tolerance) {
        track.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }

      track.scrollBy({ left: -step, behavior: "smooth" });
    });

    next?.addEventListener("click", () => {
      const step = stepSize();
      const max = maxScroll();
      const remaining = max - track.scrollLeft;

      if (remaining <= step * 0.5) {
        track.scrollTo({ left: max, behavior: "smooth" });
        return;
      }

      track.scrollBy({ left: step, behavior: "smooth" });
    });

    track.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    updateButtons();
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

function initHearts() {
  document.querySelectorAll(".card-heart").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.toggle("is-active");
      btn.textContent = btn.classList.contains("is-active") ? "♥" : "♡";
    });
  });
}
