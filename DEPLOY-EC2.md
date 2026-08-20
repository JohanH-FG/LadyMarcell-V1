# Deploy Lady Marcelle to AWS EC2 (Windows + PuTTY)

This guide assumes:

- An EC2 instance is running (**Amazon Linux 2023** or Ubuntu 22.04)
- You have the **public IP** (or Elastic IP)
- You have the **`.pem` key file**
- **PuTTY** is installed on your PC
- The site runs in **Docker** on port 3000, with **nginx** for HTTPS on 443

Replace placeholders:

| Placeholder | Example |
|-------------|---------|
| `YOUR_EC2_IP` | `3.120.45.67` |
| `YOUR_DOMAIN.com` | `ladymarcelle.com` |
| `YOUR_PEM_FILE` | `C:\Users\You\Downloads\lady-marcelle.pem` |
| `ubuntu` / `ec2-user` | **`ec2-user`** on Amazon Linux · **`ubuntu`** on Ubuntu |

---

## Which Linux am I on?

Your prompt shows `ec2-user@...` → you are on **Amazon Linux**. Use the **`dnf`** commands below, **not** `apt`.

---

## Part 1 — Before you SSH

### 1. Assign an Elastic IP (strongly recommended)

EC2’s public IP **changes** when you stop/start the instance. For a domain you want a **fixed IP**:

1. AWS Console → **EC2** → **Elastic IPs** → **Allocate**
2. **Associate** it with your running instance

Use this Elastic IP everywhere below (DNS, PuTTY, browser).

### 2. Open security group ports

EC2 → your instance → **Security** → security group → **Inbound rules**:

| Type | Port | Source | Purpose |
|------|------|--------|---------|
| SSH | 22 | Your home IP (or `My IP`) | SSH only — avoid `0.0.0.0/0` if possible |
| HTTP | 80 | `0.0.0.0/0` | Web + Let’s Encrypt |
| HTTPS | 443 | `0.0.0.0/0` | HTTPS |

Do **not** expose port 3000 publicly; nginx will proxy to it locally.

### 3. Convert `.pem` to `.ppk` for PuTTY

1. Open **PuTTYgen** (installed with PuTTY)
2. **Conversions** → **Import key** → select your `.pem` file
3. **Save private key** → save as e.g. `lady-marcelle.ppk`

Keep the `.pem` file safe; you still need it for WinSCP/OpenSSH.

---

## Part 2 — Connect with PuTTY

1. Open **PuTTY**
2. **Host Name:** `ubuntu@YOUR_EC2_IP` (Amazon Linux: `ec2-user@YOUR_EC2_IP`)
3. **Connection** → **Data** → Auto-login username: `ubuntu` (optional)
4. **Connection** → **SSH** → **Auth** → **Credentials** → browse to your `.ppk` file
5. **Session** → save the profile → **Open**

First login may ask to trust the host key — accept.

---

## Part 3 — Install Docker on the server

### Amazon Linux 2023 (`ec2-user`) — use this if you see `apt: command not found`

Install packages **one step at a time** (if one package fails, the others still install):

```bash
sudo dnf update -y
sudo dnf install -y git nginx
sudo dnf install -y docker

sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ec2-user
```

Install Docker Compose plugin manually (Amazon Linux often lacks `docker-compose-plugin` in dnf):

```bash
sudo mkdir -p /usr/libexec/docker/cli-plugins
sudo curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" \
  -o /usr/libexec/docker/cli-plugins/docker-compose
sudo chmod +x /usr/libexec/docker/cli-plugins/docker-compose
sudo systemctl restart docker
```

**Do not use** `curl -fsSL https://get.docker.com` on Amazon Linux — it returns `Unsupported distribution 'amzn'`.

Install Certbot later (after DNS points to the server):

```bash
sudo dnf install -y certbot python3-certbot-nginx
```

**No Compose?** Run the app with plain Docker instead:

```bash
cd ~/LadyMarcell-V1
docker build -t lady-marcelle .
docker run -d --name lady-marcelle -p 127.0.0.1:3000:3000 --env-file .env --restart unless-stopped lady-marcelle
```

### Ubuntu (`ubuntu`)

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nginx certbot python3-certbot-nginx

curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
```

**Both:** Log out and back in (close PuTTY, reconnect) so the `docker` group applies.

Verify:

```bash
docker --version
docker compose version
```

---

## Part 4 — Upload the site to EC2

### Option A — Git (best if the repo is on GitHub)

```bash
cd ~
git clone https://github.com/YOUR_ORG/LadyMarcell-V1.git
cd LadyMarcell-V1
```

### Option B — WinSCP (no Git remote)

1. Install [WinSCP](https://winscp.net/)
2. New session: **SFTP**, host = EC2 IP, user = **`ec2-user`** (Amazon Linux) or **`ubuntu`**
3. **Advanced** → **SSH** → **Authentication** → private key file = your `.ppk`
4. Upload the whole project folder to `/home/ec2-user/LadyMarcell-V1`

Then on the server:

```bash
cd ~/LadyMarcell-V1
```

---

## Part 5 — Configure environment on the server

```bash
cd ~/LadyMarcell-V1
cp .env.example .env
nano .env
```

Set real values (same as local):

```env
PORT=3000
MAIL_TO=your-inbox@company.com
ENQUIRY_TO_EMAIL=your-inbox@company.com
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@company.com
SMTP_PASS=your-app-password
SMTP_FROM="Lady Marcelle Website <your-email@company.com>"
```

Save: `Ctrl+O`, Enter, `Ctrl+X`.

---

## Part 6 — Build and run with Docker

```bash
cd ~/LadyMarcell-V1
docker compose up -d --build
docker compose ps
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/
```

You should see `200`. The site is running locally on the server.

Useful commands:

```bash
docker compose logs -f web    # view logs
docker compose restart web    # after .env changes
docker compose down && docker compose up -d --build   # redeploy after code update
```

---

## Part 7 — nginx reverse proxy

```bash
sudo cp ~/LadyMarcell-V1/deploy/nginx-ladymarcelle.conf /etc/nginx/sites-available/ladymarcelle
sudo nano /etc/nginx/sites-available/ladymarcelle
```

Replace `YOUR_DOMAIN.com` with your real domain in both `server_name` lines.

Enable the site:

```bash
sudo ln -sf /etc/nginx/sites-available/ladymarcelle /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Test: open `http://YOUR_EC2_IP` in a browser (may show nginx default or your site once DNS points here).

---

## Part 8 — Link your domain (DNS)

Point the domain to your **Elastic IP** (not a changing public IP).

### Domain on Route 53

1. **Route 53** → **Hosted zones** → your domain
2. Create records:

| Name | Type | Value |
|------|------|-------|
| `@` (or blank) | A | `YOUR_ELASTIC_IP` |
| `www` | A | `YOUR_ELASTIC_IP` |

### Domain elsewhere (GoDaddy, Namecheap, etc.)

In your registrar’s DNS panel:

| Host | Type | Value |
|------|------|-------|
| `@` | A | `YOUR_ELASTIC_IP` |
| `www` | A | `YOUR_ELASTIC_IP` |

DNS can take **5 minutes to 48 hours**; often under 30 minutes.

Check propagation:

```bash
# on your PC or server
nslookup YOUR_DOMAIN.com
```

---

## Part 9 — HTTPS (Let’s Encrypt)

**Wait until DNS resolves to your EC2 IP**, then on the server:

```bash
sudo certbot --nginx -d YOUR_DOMAIN.com -d www.YOUR_DOMAIN.com
```

Follow prompts (email, agree to terms). Certbot updates nginx for HTTPS automatically.

Renewal is automatic via systemd timer. Test renewal:

```bash
sudo certbot renew --dry-run
```

Visit `https://YOUR_DOMAIN.com`.

---

## Part 10 — Test forms

1. Open `https://YOUR_DOMAIN.com`
2. Submit a test **Enquire** and **Booking** form
3. On the server: `docker compose logs -f web` — check for SMTP errors

If Office 365 blocks SMTP, ask IT to enable **SMTP AUTH** for the mailbox.

---

## Updating the site later

```bash
cd ~/LadyMarcell-V1
git pull          # if using Git
# or re-upload changed files with WinSCP

docker compose up -d --build
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| PuTTY “Network error” | Check security group allows SSH from your IP; instance is running |
| “Permission denied (publickey)” | Wrong username (`ubuntu` vs `ec2-user`); wrong `.ppk`; key not paired with instance |
| Site not loading on domain | DNS not propagated; wrong A record; nginx not running: `sudo systemctl status nginx` |
| 502 Bad Gateway | App not running: `docker compose ps`; check `curl http://127.0.0.1:3000` |
| Forms fail | Check `.env` on server; `docker compose logs web`; SMTP credentials |
| IP changed after reboot | Assign and use an **Elastic IP** |

---

## Quick reference

```bash
# SSH (Windows OpenSSH alternative to PuTTY)
ssh -i "C:\path\to\key.pem" ubuntu@YOUR_EC2_IP

# On server
cd ~/LadyMarcell-V1
docker compose up -d --build
docker compose logs -f web
sudo systemctl reload nginx
```
