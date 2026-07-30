(function () {
  const form = document.getElementById("booking-form");
  const success = document.getElementById("form-success");

  const selection = initCharterSelectionFromUrl();
  applyCharterSelectionToForm(form, selection);

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
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

      form.querySelector('button[type="submit"]').hidden = true;
      if (success) success.hidden = false;
      form.reset();
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
