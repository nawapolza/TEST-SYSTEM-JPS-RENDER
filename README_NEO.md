# TEST SYSTEM — JPS | Neo Experience 2026

## Redesign
- Rebuilt main navigation as desktop sidebar with optional compact mode, a mobile bottom dock and accessible mobile drawer.
- Redesigned global toolbar, breadcrumb, primary action, page headings, login shell, cards, forms, tables, dialogs and receipt display.
- Added an authoritative JPS navy / azure / white theme layer loaded last.
- Converted old red/pink utility colors in JSX components to blue variants. Destructive actions still need contextual wording and confirmation; they are no longer visually red per request.
- Preserved existing backend API contracts, authentication checks, permissions, MongoDB, file uploads, business calculations and transaction forms.

## Deploy Render
Backend service: root `backend`, build `npm ci --no-audit --no-fund`, start `npm start`.
Frontend static site: root `frontend`, build `npm ci && npm run build`, publish `dist`.
Set `VITE_API_URL` to your actual backend URL on the frontend static site. Keep `MONGODB_URI`, `JWT_SECRET` and credentials only in backend environment settings. Never commit .env files.

## Verification
Source structure and JSX syntax should be tested with `npm ci && npm run build` from frontend. Test menu and role permissions, financial forms, uploads, receipts and responsive widths 360px, 768px, 1280px in browser before business-critical use. Live Render/database deployment not performed here.
