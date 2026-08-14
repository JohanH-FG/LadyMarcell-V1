/* Shared charter destination & date selection */

const CHARTER_STORAGE_KEY = "ladyMarcelleCharterSelection";

const CHARTER_DESTINATIONS = [
  "Croatia",
  "Montenegro",
  "Slovenia",
];

function getCharterSelection() {
  try {
    const raw = sessionStorage.getItem(CHARTER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {
    /* ignore */
  }
  return { destination: "", startDate: "", endDate: "" };
}

function setCharterSelection(selection) {
  const next = {
    destination: selection.destination || "",
    startDate: selection.startDate || "",
    endDate: selection.endDate || "",
  };
  sessionStorage.setItem(CHARTER_STORAGE_KEY, JSON.stringify(next));
  return next;
}

function readCharterParams(search = window.location.search) {
  const params = new URLSearchParams(search);
  const destination = params.get("destination");
  const startDate = params.get("startDate") || params.get("start") || "";
  const endDate = params.get("endDate") || params.get("end") || "";
  if (!destination && !startDate && !endDate) return null;
  return {
    destination: destination || "",
    startDate,
    endDate,
  };
}

function buildBookingUrl(selection = getCharterSelection()) {
  const url = new URL("booking.html", window.location.href);
  if (selection.destination) url.searchParams.set("destination", selection.destination);
  if (selection.startDate) url.searchParams.set("startDate", selection.startDate);
  if (selection.endDate) url.searchParams.set("endDate", selection.endDate);
  return `${url.pathname}${url.search}`;
}

function formatCharterDate(iso) {
  if (!iso) return "";
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCharterDateRange(start, end) {
  if (!start) return "";
  if (!end || end === start) return formatCharterDate(start);
  const startDate = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);
  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  const sameMonth = sameYear && startDate.getMonth() === endDate.getMonth();
  if (sameMonth) {
    const endFmt = endDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return `${startDate.getDate()} – ${endFmt}`;
  }
  return `${formatCharterDate(start)} – ${formatCharterDate(end)}`;
}

function applyCharterSelectionToForm(form, selection) {
  if (!form || !selection) return;
  const dest = form.querySelector('[name="destination"]');
  const start = form.querySelector('[name="startDate"]');
  const end = form.querySelector('[name="endDate"]');
  if (dest) dest.value = selection.destination || "";
  if (start) start.value = selection.startDate || "";
  if (end) end.value = selection.endDate || "";
}

function initCharterSelectionFromUrl() {
  const fromUrl = readCharterParams();
  if (!fromUrl) return getCharterSelection();
  return setCharterSelection(fromUrl);
}
