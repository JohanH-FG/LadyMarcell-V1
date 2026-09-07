/** Google tag + Consent Mode v2 (EEA defaults denied) */
(function () {
  const GTAG_ID = "AW-399555234";
  const CONSENT_KEY = "lm_cookie_consent";

  const EEA_REGIONS = [
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
    "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES",
    "SE", "IS", "LI", "NO",
  ];

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  const denied = {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  };

  const granted = {
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
    analytics_storage: "granted",
  };

  gtag("consent", "default", {
    ...denied,
    wait_for_update: 500,
    region: EEA_REGIONS,
  });

  gtag("consent", "default", granted);

  const saved = (() => {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch (_) {
      return null;
    }
  })();

  if (saved === "granted") {
    gtag("consent", "update", granted);
  } else if (saved === "denied") {
    gtag("consent", "update", denied);
  }

  window.lmApplyCookieConsent = function (choice) {
    const value = choice === "granted" ? granted : denied;
    gtag("consent", "update", value);
    try {
      localStorage.setItem(CONSENT_KEY, choice);
    } catch (_) {
      /* ignore */
    }
  };

  window.lmEeaRegions = EEA_REGIONS;

  /** Google Ads "Apply Now" conversion — call after successful form submit or on tracked clicks */
  window.gtag_report_conversion = function (url) {
    const callback = function () {
      if (typeof url !== "undefined") {
        window.location = url;
      }
    };
    gtag("event", "conversion", {
      send_to: "AW-399555234/kzdtCMSRv5IDEKL1wr4B",
      event_callback: callback,
    });
    return false;
  };

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`;
  script.onload = function () {
    gtag("js", new Date());
    gtag("config", GTAG_ID);
  };
  document.head.appendChild(script);
})();
