# Oren Admin

Internal, password-protected panel for manually registering shops for the
Oren app's Shop feature. Not customer-facing — no roles, single shared
password, matches the "just you" scope in the shop feature spec.

## Setup

```
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:
- `ADMIN_PASSWORD` — whatever password you want to log in with here.
- `SESSION_SECRET` — any long random string (`openssl rand -hex 32`).
- `FLASK_API_URL` — the existing backend's URL.
- `FLASK_ADMIN_TOKEN` — must match the `ADMIN_TOKEN` env var already set on
  that backend (Railway). This site calls `/api/admin/shops` server-side
  with that token — it never reaches the browser.

```
npm run dev
```

## What it does

- Lists registered shops (name, phone, a short copyable token, claimed/pending status)
- Registers a new shop, generating that token server-side
- Deletes a shop

The generated token is meant to be handed to the shop owner. What it's
eventually used for (linking their account) isn't built yet — the shop's
`status` will just read "Inasubiri" (pending) until that exists.

## Backend

New Flask model (`Shop`) + endpoints live in the existing server at
`D:\Work\HARDWARE\read_data\server` — `models.py` (Shop model) and `app.py`
(`/api/admin/shops` GET/POST, `/api/admin/shops/<id>` DELETE), gated by the
same `@require_admin` decorator every other admin route uses. A new
migration (`0b78d6939313_add_shops_table.py`) needs `flask db upgrade` run
against production before this site will work — it hasn't been deployed yet.
