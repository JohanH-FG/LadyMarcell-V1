# Lady Marcelle — Charter Website

Static front-end (HTML, CSS, JavaScript) with a small Node/Express backend for enquiry and booking form email delivery.

## Stack

| Layer | Technology |
|--------|------------|
| Pages | `index.html`, `booking.html`, `croatia.html`, `montenegro.html` |
| Styles | `css/styles.css`, `premium.css`, `experience.css`, `layout-shared.css`, `mobile.css` |
| Scripts | `js/main.js`, `premium.js`, `gallery-pro.js`, `charter-selection.js`, etc. |
| Server | Node 18+ / Express (`server.js`) |
| Email | SMTP via nodemailer (environment variables) |

## Local development

```bash
npm install
cp .env.example .env   # then fill in your values
npm start
```

Open [http://localhost:3000](http://localhost:3000).

Forms POST to `/api/enquire` and `/api/booking`. If you open HTML files directly (`file://`), the client falls back to `http://localhost:3000` for API calls (see `js/api.js`).

### Environment variables

Copy `.env.example` to `.env`:

| Variable | Purpose |
|----------|---------|
| `PORT` | Server port (default `3000`) |
| `MAIL_TO` / `ENQUIRY_TO_EMAIL` | **Required** — recipient for form submissions (at least one) |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | **Required** — SMTP credentials |
| `SMTP_FROM` | From address for SMTP (falls back to `SMTP_USER`) |
| `SMTP_PORT`, `SMTP_SECURE` | Optional SMTP settings (defaults: `587`, `false`) |
| `CONTACT_EMAIL` | Optional — for public mailto links (currently set manually in HTML) |

---

### What you need to add

1. **`Dockerfile`** — Node 18+, `npm install`, `CMD ["node", "server.js"]`
2. **Push image to ECR** (AWS container registry)
3. **Run the container** with env vars from `.env.example` (`MAIL_TO`, `SMTP_*`, etc.)
4. **Custom domain + HTTPS** via Route 53 + ACM certificate

HTML, CSS, JS, images, and the hero video stay unchanged.

### AWS service options

#### App Runner (simplest)

- Push Docker image → App Runner service
- Built-in custom domain + automatic HTTPS
- Good for a small charter site with low traffic
- **Pros:** Easiest ops, scales automatically
- **Cons:** Less control than full ECS

#### ECS Fargate + ALB (standard production)

- ECR → ECS task → Application Load Balancer
- Route 53 points `yourdomain.com` → ALB
- ACM certificate on the load balancer
- **Pros:** Standard production pattern, flexible
- **Cons:** More setup (VPC, ALB, target groups, health checks)

#### Lightsail containers (budget/simple)

- Cheaper and simpler than ECS
- Custom domain supported
- Fine for a brochure + forms site

### Custom domain flow

```
yourdomain.com  →  Route 53 (DNS)
                →  ALB / App Runner
                →  HTTPS (ACM cert)
                →  Container :3000
                →  server.js
```

Steps:

1. Register domain in Route 53 (or keep it at another registrar and point DNS to AWS)
2. Request ACM certificate for `yourdomain.com` and `www.yourdomain.com`
3. Map domain to your container service
4. Set `CNAME` / `A` records in DNS

### Things to watch

| Topic | Note |
|--------|------|
| **Port** | Container must listen on `PORT` (default `3000`). App Runner / ECS map that to 443 externally. |
| **Secrets** | Put SMTP credentials in AWS Secrets Manager or SSM — not baked into the image. |
| **Health check** | Add a `/health` route in `server.js` (or use `/`) so AWS knows the container is alive. |
| **Video size** | Hero MP4 increases image size; consider S3 + CloudFront later, but not required to start. |
| **CORS** | Production uses same origin (`getApiBase()` returns `""`), so no CORS issues once the domain matches. |
| **Email** | SMTP must be reachable from AWS outbound network. Office 365 may require SMTP AUTH enabled by IT. |

### Rough cost (low traffic)

| Service | Approx. monthly |
|---------|-----------------|
| App Runner / Lightsail | $5–25 |
| ECS Fargate + ALB | $25–50+ (ALB alone ~$16) |
| Route 53 hosted zone | ~$0.50 |
| ACM certificate | Free |

For a yacht charter brochure site, **App Runner** or **Lightsail** is usually enough unless you need ECS for other reasons.

### Deploy to EC2 (PuTTY + domain + HTTPS)

Step-by-step guide for Windows, PEM/PPK, Docker, nginx, and Let’s Encrypt:

**[DEPLOY-EC2.md](./DEPLOY-EC2.md)**

### Dockerfile

Build and run locally:

```bash
docker build -t lady-marcelle .
docker run -p 3000:3000 --env-file .env lady-marcelle
```

---

## Project structure

```
├── index.html          # Yacht overview (hero video, gallery, enquire sidebar)
├── booking.html        # Booking / enquire form
├── croatia.html        # Croatia destination page
├── montenegro.html     # Montenegro destination page
├── server.js           # Express static server + form API
├── css/                # Stylesheets
├── js/                 # Client scripts
├── images/             # Images and logos
├── videos/             # Hero video
├── Dockerfile          # Container image for AWS / local Docker
├── .env.example        # Environment template
└── package.json
```

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/enquire` | Charter enquiry form (index page) |
| `POST` | `/api/booking` | Booking form |

Both expect JSON bodies and send HTML email to `MAIL_TO`.
