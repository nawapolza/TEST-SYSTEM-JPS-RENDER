# JPS Full System Review / Deployment Notes (TH)

## Included in this update
- Added `frontend/src/jps-quality-pass.css` as the last stylesheet layer for shared blue/white tokens, accessible focus rings, 44px mobile touch targets, responsive form/table handling, modal sizing, reduced-motion support, and common legacy utility color normalization.
- Existing API routes, MongoDB schema, authentication and business logic are intentionally preserved to avoid breaking production data.
- Upload middleware currently limits file size using `UPLOAD_MAX_MB` and accepts image-like extensions / PDF. Review storage persistence before production: local disk uploads on Render can be ephemeral. MongoDB `uploaded_files` support exists in the current backend for some paths, but verify each upload route and restore/download path end-to-end.

## Important validation still required on Render
1. Frontend build: from `frontend`, run `npm ci && npm run build`.
2. Backend start: from `backend`, run `npm ci && npm start`; verify `/health` and `/health-ready`.
3. MongoDB: verify `MONGODB_DB=test_system_jps`, seed only with the documented demo script, and inspect Atlas collections.
4. Roles: test user tokens against every write/admin endpoint. Hiding a menu is not authorization; the API must enforce roles.
5. Uploads: test image/PDF type rejection, size limits, permission to view files, and persistence after a Render redeploy/restart.
6. Financial calculations: test a cycle with 4 trips and another with a different number of trips; verify fuel allocation, driver pay, duplicate prevention, and monthly totals against known sample calculations before using for payroll.
7. Backups: take a MongoDB Atlas backup before importing demo data or migrating production records.

## Security notes
- Never commit `.env`, MongoDB URI, JWT secrets, or production passwords.
- Rotate any database password or JWT secret that has been shared in chat/logs, then update Render Environment Variables.
- Use a dedicated least-privilege MongoDB database user.
- Do not claim production-ready until build, API, role, upload and financial acceptance tests pass.
