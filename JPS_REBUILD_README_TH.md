# TEST SYSTEM JPS — Deploy & Database Notes

## What this package preserves
This is an update of the uploaded project, not a blank demo. Existing transport ledger, trip finance, deliveries, vehicles, users, monthly reports, fuel records, receipts and upload workflows are retained. The final CSS layer enforces the JPS blue/white theme across legacy screens and improves mobile overflow behavior. The JPS logo is served from `frontend/public/jps-logo.png`.

## Database
- New default database name: `test_system_jps` (`MONGODB_DB`). MongoDB Atlas creates it after the first successful write; there is no separate “create database” button required.
- Collections and indexes are initialized by the existing backend startup/maintenance logic.
- Do not paste the Atlas URI or password into frontend variables or GitHub. Add them only to Render Backend > Environment.
- The URI password must be URL-encoded if it contains reserved characters. In Atlas, Network Access must allow Render to connect; for a short connection test, Atlas allows `0.0.0.0/0`, but this is broader than ideal and should be paired with a strong DB password. Prefer a narrower allowlist when possible.

## Roles and accounts
The existing backend permission checks use internal role values `owner` and `employee`; they map to **Admin** and **User** in the UI. This preserves compatibility with all existing authorization checks and data. Do not rename the stored values without migrating every route and permission guard.

Seed missing initial accounts (run from the repository root after installing backend dependencies):

```bash
cd backend
npm ci
node seed_owner.js
```

Default credentials if the corresponding environment variables are not set, and only if those usernames do not already exist:
- Admin: `admin` / `admim.admim`
- User: `test` / `test`

The seed script never resets passwords or overwrites existing accounts. Change these defaults immediately after first login. For production, set `SEED_ADMIN_PASSWORD` and `SEED_USER_PASSWORD` in the backend environment before running the seed script.

## Render
### Backend Web Service
- Root Directory: `backend`
- Build Command: `npm ci --no-audit --no-fund`
- Start Command: `npm start`
- Health Check Path: `/health-ready`
- Required Environment: `MONGODB_URI`, `MONGODB_DB=test_system_jps`, `JWT_SECRET` (long random secret), `JWT_EXPIRE_SECONDS=604800`, `UPLOAD_MAX_MB=5`, `CORS_ALLOW_ALL=false`, `CORS_ALLOWED_ORIGINS=<frontend URL>`, `APP_TIMEZONE=Asia/Bangkok`.

### Frontend Static Site
- Root Directory: `frontend`
- Build Command: `npm ci --include=dev --no-audit --no-fund && npm run build`
- Publish Directory: `dist`
- Environment: `VITE_API_URL=<backend web service URL>` (no trailing slash preferred).

Deploy backend first, then frontend. Check `https://<backend-host>/health-ready` and then log in. A successful health response alone is not enough; verify that it reports the database as connected.

## Important credential warning
If an Atlas URI/password has been pasted into a chat, screenshot, source file, or public Git repository, rotate that database user's password in Atlas and update Render Environment. Remove secrets from committed files and Git history if they were committed.
