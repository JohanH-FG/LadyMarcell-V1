/* Google Maps — destination pins for Croatia & Montenegro pages */

const GOOGLE_MAPS_API_KEY = "AIzaSyCYiOZJlkc-xRfa9XaXIgb9j9sIK1pIjjU";

const DESTINATION_REGIONS = {
  croatia: [
    {
      name: "Dubrovnik",
      lat: 42.6507,
      lng: 18.0944,
      summary: "A UNESCO-listed walled city and the classic starting point for southern Dalmatia island hops.",
      highlights: ["Old town walls", "Island day trips", "Fine dining"],
    },
    {
      name: "Hvar",
      lat: 43.1729,
      lng: 16.4414,
      summary: "Lavender-scented hills, a lively harbour, and easy tender runs to the Pakleni islets.",
      highlights: ["Beach clubs", "Fortress views", "Wine & seafood"],
    },
    {
      name: "Kornati",
      lat: 43.8,
      lng: 15.35,
      summary: "A labyrinth of uninhabited islands and turquoise bays — ideal for slow cruising and swimming stops.",
      highlights: ["National park", "Secluded anchorages", "Snorkelling"],
    },
    {
      name: "Split",
      lat: 43.5081,
      lng: 16.4402,
      summary: "Croatia's main charter hub, built around Diocletian's Palace with fast access to Brač and Šolta.",
      highlights: ["Roman palace", "Marina base", "Island hopping"],
    },
    {
      name: "Trogir",
      lat: 43.5169,
      lng: 16.2514,
      summary: "A compact medieval island town with stone lanes, waterfront cafés, and a relaxed old-world feel.",
      highlights: ["UNESCO centre", "Waterfront strolls", "Easy provisioning"],
    },
    {
      name: "Zadar",
      lat: 44.1194,
      lng: 15.2314,
      summary: "A cultured northern gateway with the Sea Organ, sunset promenades, and routes toward Kornati.",
      highlights: ["Sea Organ", "Old town", "Kornati departures"],
    },
    {
      name: "Cavtat",
      lat: 42.5811,
      lng: 18.2181,
      summary: "A peaceful pine-lined bay just south of Dubrovnik — perfect for a quiet first or last night aboard.",
      highlights: ["Sheltered bay", "Waterfront dining", "Near Dubrovnik"],
    },
  ],
  montenegro: [
    {
      name: "Kotor",
      lat: 42.4247,
      lng: 18.7712,
      summary: "A dramatic fjord-like bay framed by mountains, with a fortified old town at the water's edge.",
      highlights: ["Bay of Kotor", "City walls", "Mountain backdrop"],
    },
    {
      name: "Budva",
      lat: 42.2864,
      lng: 18.8401,
      summary: "Medieval streets meet summer energy — beaches, restaurants, and a lively old-town waterfront.",
      highlights: ["Old town", "Beach clubs", "Nightlife"],
    },
    {
      name: "Porto Montenegro",
      lat: 42.4331,
      lng: 18.696,
      summary: "Montenegro's superyacht address in Tivat — upscale marinas, provisioning, and waterfront dining.",
      highlights: ["Superyacht marina", "Fine dining", "Provisioning"],
    },
    {
      name: "Perast",
      lat: 42.4856,
      lng: 18.6933,
      summary: "A baroque stone village on the bay, best explored by tender to Our Lady of the Rocks.",
      highlights: ["Stone palaces", "Island church", "Tender trips"],
    },
    {
      name: "Sveti Stefan",
      lat: 42.2556,
      lng: 18.8914,
      summary: "Montenegro's most photographed coast — pink-pebble beaches and a legendary peninsula resort.",
      highlights: ["Iconic views", "Pink beaches", "Luxury resorts"],
    },
    {
      name: "Tivat",
      lat: 42.4347,
      lng: 18.6963,
      summary: "A practical charter base with airport access and a gateway to the Luštica Peninsula.",
      highlights: ["Airport nearby", "Marina life", "Luštica access"],
    },
    {
      name: "Herceg Novi",
      lat: 42.4531,
      lng: 18.5375,
      summary: "The garden town at the bay's entrance — fortresses, botanical walks, and a gentler pace.",
      highlights: ["Historic forts", "Botanical gardens", "Bay entrance"],
    },
  ],
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildInfoContent(dest) {
  const tags = (dest.highlights || [])
    .map(
      (item) =>
        `<span style="display:inline-block;margin:0 6px 6px 0;padding:4px 10px;border-radius:999px;background:#dff0f4;color:#217799;font-size:11px;font-weight:600;letter-spacing:0.02em;">${escapeHtml(item)}</span>`
    )
    .join("");

  return `
    <div style="max-width:260px;padding:2px 2px 4px;font-family:Outfit,system-ui,sans-serif;color:#217799;">
      <h3 style="margin:0 0 8px;font-family:'Cormorant Infant',Georgia,serif;font-size:20px;font-weight:500;font-style:italic;line-height:1.2;color:#1a4252;">${escapeHtml(dest.name)}</h3>
      <p style="margin:0 0 10px;font-size:13px;line-height:1.55;color:#6a8a96;">${escapeHtml(dest.summary)}</p>
      <div style="display:flex;flex-wrap:wrap;">${tags}</div>
    </div>
  `;
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildDestinationMap() {
  const mapEl = document.getElementById("destination-map");
  if (!mapEl || !window.google?.maps) return;

  const region = mapEl.dataset.region;
  const destinations = DESTINATION_REGIONS[region];
  if (!destinations?.length) return;

  const map = new google.maps.Map(mapEl, {
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
  });

  const bounds = new google.maps.LatLngBounds();
  const info = new google.maps.InfoWindow();
  const markersBySlug = new Map();

  const openInfo = (marker, dest) => {
    info.setContent(buildInfoContent(dest));
    info.open({ map, anchor: marker });
    map.panTo(marker.getPosition());
  };

  destinations.forEach((dest) => {
    const position = { lat: dest.lat, lng: dest.lng };
    const marker = new google.maps.Marker({
      position,
      map,
      title: dest.name,
    });

    marker.addListener("click", () => openInfo(marker, dest));
    markersBySlug.set(slugify(dest.name), { marker, dest });
    bounds.extend(position);
  });

  document.querySelectorAll(".dest-croatia-list a").forEach((link) => {
    const label = link.textContent.replace("→", "").trim();
    const entry = markersBySlug.get(slugify(label));
    if (!entry) return;

    link.addEventListener("click", (event) => {
      event.preventDefault();
      openInfo(entry.marker, entry.dest);
      mapEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });

  map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });

  const listener = google.maps.event.addListener(map, "idle", () => {
    if (map.getZoom() > 10) map.setZoom(10);
    google.maps.event.removeListener(listener);
  });
}

window.lmInitDestinationMap = buildDestinationMap;

function loadGoogleMapsApi() {
  if (!document.getElementById("destination-map")) return;

  if (window.google?.maps) {
    buildDestinationMap();
    return;
  }

  const existing = document.querySelector('script[data-lm-maps="1"]');
  if (existing) return;

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=lmInitDestinationMap`;
  script.async = true;
  script.defer = true;
  script.dataset.lmMaps = "1";
  document.head.appendChild(script);
}

document.addEventListener("DOMContentLoaded", loadGoogleMapsApi);
