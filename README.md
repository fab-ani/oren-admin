# Oren Admin Dashboard

Modern, responsive management dashboard for **Oren Delivery**.

- **Desktop & Mobile Responsive**: Fixed sidebar for desktop, top hamburger menu & slide-in drawer for mobile (tested down to 375px).
- **Shipments Analytics**: SVG daily volume trend and delivery pipeline charts.
- **Rider Onboarding**: Register riders, issue `RD-XXXX` claim tokens with one-click copy & WhatsApp sharing, reset test riders.
- **Chats & Customer Calls**: View customer phone numbers, Swahili consent indicators (*Ndiyo*, *Hapana*, *Haijaulizwa*), direct 📞 Call & 💬 WhatsApp links, and call logger.
- **Customer Conversion Tracking**: Priority follow-up queue, 15 lost-sale categories, founder KPI cards.
- **Push Broadcast Center**: Audience-filtered push notifications targeting **All Users**, **Buyers**, **Sellers**, or **Riders**.

---

## Deploying to Vercel

### Option A: Via GitHub (Recommended)

1. Create a repository on GitHub (e.g., `oren-admin`).
2. Add your GitHub remote and push:
   ```bash
   git remote add origin https://github.com/<YOUR-USERNAME>/oren-admin.git
   git push -u origin main
   ```
3. Go to [vercel.com](https://vercel.com) and click **"Add New..."** ➔ **"Project"**.
4. Import your `oren-admin` repository.
5. In the **Environment Variables** section, add the following 4 variables:

| Variable Name | Description | Example / Value |
|---|---|---|
| `ADMIN_PASSWORD` | Password to log into this admin dashboard | *(Choose your secure password)* |
| `SESSION_SECRET` | 32-byte hex string used to sign session cookies | `0bfc8de19e280a6c5874722f39c23d6e2941f7716d810e54dd2fa3a7f5ed17ef` |
| `FLASK_API_URL` | Production Railway backend API URL | `https://readdata-production.up.railway.app` |
| `FLASK_ADMIN_TOKEN` | Railway backend admin token | `2mB6IowUbqwIfmuYWLRgPlI4XeRLVeOaNirfiKmoqbM` |

6. Click **Deploy**. Vercel will build and assign you a live HTTPS domain (e.g. `oren-admin.vercel.app`).

---

### Option B: Via Vercel CLI

1. Run:
   ```bash
   npx vercel
   ```
2. Follow the prompts to log in and select your Vercel team/account.
3. Add the 4 environment variables above in your project settings on the Vercel dashboard.
4. Run `npx vercel --prod` to deploy to production.

---

## Local Development

```bash
npm install
npm run dev
```

Build verification:
```bash
npm run lint
npm run build
```
