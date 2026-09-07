/** Cookie consent banner for EEA visitors (Google Consent Mode) */
(function () {
  const CONSENT_KEY = "lm_cookie_consent";
  const EEA = window.lmEeaRegions || [];

  function hasStoredConsent() {
    try {
      return localStorage.getItem(CONSENT_KEY) !== null;
    } catch (_) {
      return false;
    }
  }

  async function isEeaVisitor() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch("https://ipapi.co/country_code/", {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const code = (await res.text()).trim().toUpperCase();
        if (code && EEA.includes(code)) return true;
        if (code && !EEA.includes(code)) return false;
      }
    } catch (_) {
      /* fall through to language heuristic */
    }

    const lang = (navigator.language || "").toUpperCase();
    return /^(DE|FR|IT|ES|NL|PL|PT|SV|DA|FI|EL|CS|SK|SL|HU|RO|BG|HR|ET|LV|LT|MT)/.test(lang);
  }

  function createBanner() {
    const banner = document.createElement("div");
    banner.className = "cookie-consent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Cookie consent");
    banner.setAttribute("aria-live", "polite");
    banner.innerHTML = `
      <div class="cookie-consent__inner">
        <p class="cookie-consent__text">
          We use cookies for advertising and analytics. You can accept or reject non-essential cookies.
          See our <a href="index.html#enquire">Privacy Policy</a> for details.
        </p>
        <div class="cookie-consent__actions">
          <button type="button" class="cookie-consent__btn cookie-consent__btn--reject" data-consent="denied">
            Reject
          </button>
          <button type="button" class="cookie-consent__btn cookie-consent__btn--accept" data-consent="granted">
            Accept
          </button>
        </div>
      </div>
    `;

    banner.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-consent]");
      if (!btn) return;
      const choice = btn.getAttribute("data-consent");
      if (typeof window.lmApplyCookieConsent === "function") {
        window.lmApplyCookieConsent(choice);
      }
      banner.remove();
    });

    document.body.appendChild(banner);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    if (hasStoredConsent()) return;
    if (!(await isEeaVisitor())) return;
    createBanner();
  });
})();
