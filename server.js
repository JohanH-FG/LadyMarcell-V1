require("dotenv").config();

const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

function getMailTo() {
  const to = (
    process.env.MAIL_TO ||
    process.env.BOOKING_TO_EMAIL ||
    process.env.ENQUIRY_TO_EMAIL ||
    process.env.MAIL_BOOKING_TO ||
    ""
  ).trim();
  if (!to) {
    const error = new Error("MAIL_TO is not configured.");
    error.status = 503;
    throw error;
  }
  return to;
}

function getMailFrom() {
  return (
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    "Lady Marcelle Website <enquiries@ladymarcelle.co.za>"
  ).trim();
}

app.use(express.json({ limit: "32kb" }));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.static(path.join(__dirname)));

function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
}

function smtpTlsOptions() {
  const tls = {};
  const servername = (process.env.SMTP_TLS_SERVERNAME || "").trim();
  if (servername) tls.servername = servername;
  if (process.env.SMTP_TLS_REJECT_UNAUTHORIZED === "false") {
    tls.rejectUnauthorized = false;
  }
  return Object.keys(tls).length ? tls : undefined;
}

function createTransporter() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: smtpTlsOptions(),
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatField(label, value) {
  const display = value && String(value).trim() ? String(value).trim() : "—";
  return `<tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:6px 0;">${escapeHtml(display)}</td></tr>`;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function buildContactFields(body) {
  const {
    firstName,
    lastName,
    email,
    countryCode,
    phone,
    destination,
    startDate,
    endDate,
    guests,
    message,
  } = body || {};

  const fullName = `${firstName?.trim() || ""} ${lastName?.trim() || ""}`.trim();
  const fullPhone = phone?.trim() ? `${countryCode || ""} ${phone.trim()}`.trim() : "";
  const dateRange =
    startDate && endDate ? `${startDate} to ${endDate}` : startDate || endDate || "";

  return {
    fullName,
    email: email?.trim() || "",
    fullPhone,
    destination: destination?.trim() || "",
    dateRange,
    guests: guests?.trim() || "",
    message: message?.trim() || "",
  };
}

function validateContact(body) {
  const { firstName, lastName, email } = body || {};
  if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
    return "Please complete all required fields.";
  }
  if (!isValidEmail(email)) {
    return "Please enter a valid email address.";
  }
  return null;
}

function buildEmailContent({ heading, fields }) {
  const text = [
    heading,
    "",
    ...fields.map(({ label, value }) => `${label}: ${value || "—"}`),
  ].join("\n");

  const html = `
    <h2 style="margin:0 0 16px;font-family:Georgia,serif;">${escapeHtml(heading)}</h2>
    <table style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;border-collapse:collapse;">
      ${fields
        .filter((field) => field.label !== "Message")
        .map((field) => formatField(field.label, field.value))
        .join("")}
    </table>
    <p style="font-family:Arial,sans-serif;font-size:14px;margin:20px 0 8px;color:#666;">Message</p>
    <p style="font-family:Arial,sans-serif;font-size:14px;margin:0;white-space:pre-wrap;">${escapeHtml(
      fields.find((field) => field.label === "Message")?.value || "—"
    )}</p>
  `.trim();

  return { text, html };
}

async function sendViaSmtp({ subject, heading, fields, replyTo, to }) {
  const transporter = createTransporter();
  if (!transporter) {
    const error = new Error("Email is not configured on the server.");
    error.status = 503;
    throw error;
  }

  const { text, html } = buildEmailContent({ heading, fields });
  const from = getMailFrom();

  await transporter.sendMail({
    from,
    to,
    replyTo,
    subject,
    text,
    html,
  });
}

async function sendFormEmail(payload) {
  if (!isEmailConfigured()) {
    const error = new Error("Email is not configured on the server.");
    error.status = 503;
    throw error;
  }

  return sendViaSmtp(payload);
}

function handleEmailError(res, err, fallbackMessage) {
  if (err.status === 503) {
    console.error("Email failed:", err.message);
    return res.status(503).json({
      error: "Email is not configured on the server. Please contact us directly.",
    });
  }

  console.error("Email failed:", err.message || err);
  if (err.code === "EAUTH" && String(err.response || "").includes("SmtpClientAuthentication is disabled")) {
    console.error(
      "Office 365 SMTP is disabled for this tenant. Ask IT to enable SMTP AUTH."
    );
  }
  return res.status(500).json({ error: fallbackMessage });
}

app.post("/api/enquire", async (req, res) => {
  const validationError = validateContact(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const contact = buildContactFields(req.body);

  try {
    await sendFormEmail({
      subject: `Lady Marcelle charter enquiry — ${contact.fullName}`,
      heading: "New charter enquiry — Lady Marcelle",
      replyTo: contact.email,
      to: getMailTo(),
      fields: [
        { label: "Name", value: contact.fullName },
        { label: "Email", value: contact.email },
        { label: "Phone", value: contact.fullPhone },
        { label: "Destination", value: contact.destination },
        { label: "Guests", value: contact.guests },
        { label: "Preferred dates", value: contact.dateRange },
        { label: "Message", value: contact.message },
      ],
    });

    res.json({ ok: true });
  } catch (err) {
    handleEmailError(
      res,
      err,
      "We could not send your enquiry. Please try again or email us directly."
    );
  }
});

app.post("/api/booking", async (req, res) => {
  const validationError = validateContact(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { destination, startDate, endDate, guests } = req.body || {};
  if (!destination?.trim() || !startDate || !endDate || !guests) {
    return res.status(400).json({ error: "Please complete all required booking fields." });
  }

  if (endDate < startDate) {
    return res.status(400).json({ error: "End date must be after start date." });
  }

  const contact = buildContactFields(req.body);

  try {
    await sendFormEmail({
      subject: `Lady Marcelle booking request — ${contact.fullName}`,
      heading: "New booking request — Lady Marcelle",
      replyTo: contact.email,
      to: getMailTo(),
      fields: [
        { label: "Name", value: contact.fullName },
        { label: "Email", value: contact.email },
        { label: "Phone", value: contact.fullPhone },
        { label: "Destination", value: contact.destination },
        { label: "Guests", value: contact.guests },
        { label: "Charter dates", value: contact.dateRange },
        { label: "Message", value: contact.message },
      ],
    });

    res.json({ ok: true });
  } catch (err) {
    handleEmailError(
      res,
      err,
      "We could not send your booking request. Please try again or email us directly."
    );
  }
});

app.listen(PORT, () => {
  const mailTo = (
    process.env.MAIL_TO ||
    process.env.BOOKING_TO_EMAIL ||
    process.env.ENQUIRY_TO_EMAIL ||
    process.env.MAIL_BOOKING_TO ||
    ""
  ).trim();
  const mailFrom = getMailFrom();

  console.log(`Lady Marcelle site running at http://localhost:${PORT}`);

  if (!mailTo) {
    console.warn("Warning: MAIL_TO is not set. Form emails cannot be delivered.");
  } else {
    console.log(`Form emails will be sent to ${mailTo}`);
  }

  console.log(`Form emails will be sent from ${mailFrom}`);

  if (isEmailConfigured()) {
    console.log("Email provider: SMTP");
  } else {
    console.warn("Warning: SMTP is not configured. Add SMTP_HOST, SMTP_USER, and SMTP_PASS to .env");
  }
});
