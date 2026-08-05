(function () {
  const form = document.getElementById("booking-form");
  const success = document.getElementById("form-success");
  const error = document.getElementById("form-error");
  const submitBtn = form?.querySelector('button[type="submit"]');

  const selection = initCharterSelectionFromUrl();
  applyCharterSelectionToForm(form, selection);

  if (form) {
    const today = new Date().toISOString().slice(0, 10);
    if (form.startDate) form.startDate.min = today;
    if (form.endDate) form.endDate.min = today;

    form.startDate?.addEventListener("change", () => {
      if (form.startDate.value) form.endDate.min = form.startDate.value;
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (success) success.hidden = true;
      if (error) error.hidden = true;

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const start = form.startDate.value;
      const end = form.endDate.value;
      if (start && end && end < start) {
        form.endDate.setCustomValidity("End date must be after start date.");
        form.reportValidity();
        form.endDate.setCustomValidity("");
        return;
      }

      const payload = Object.fromEntries(new FormData(form));
      const defaultLabel = submitBtn?.textContent || "Book Now";

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      try {
        const response = await fetch(`${getApiBase()}/api/booking`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || "Unable to send your booking request.");
        }

        if (success) success.hidden = false;
        form.reset();
        applyCharterSelectionToForm(form, selection);
        if (form.startDate) form.startDate.min = today;
        if (form.endDate) form.endDate.min = today;
      } catch (err) {
        if (error) {
          error.textContent = getFormSubmitError(err);
          error.hidden = false;
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = defaultLabel;
        }
      }
    });

    form.endDate?.addEventListener("change", () => {
      form.endDate.setCustomValidity("");
    });
  }

  const newsletter = document.getElementById("newsletter-form");
  if (newsletter) {
    newsletter.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = newsletter.querySelector('input[type="email"]');
      if (input?.value) {
        input.value = "";
        input.placeholder = "Thank you for subscribing!";
      }
    });
  }
})();
