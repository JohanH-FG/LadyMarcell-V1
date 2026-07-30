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

    const scrollBy = () => Math.min(track.clientWidth * 0.85, 380);

    prev?.addEventListener("click", () => {
      track.scrollBy({ left: -scrollBy(), behavior: "smooth" });
    });
    next?.addEventListener("click", () => {
      track.scrollBy({ left: scrollBy(), behavior: "smooth" });
    });
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
