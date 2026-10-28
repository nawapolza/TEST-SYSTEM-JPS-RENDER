# TEST SYSTEM JPS — UX/UI Contrast Fix

## Changes in this patch
- Fixed mobile navigation drawer contrast: the drawer previously had a white background while legacy CSS left inactive menu labels/icons pale, making them nearly invisible.
- Unified desktop sidebar and mobile drawer to a white surface with a strong blue brand header, dark navy labels, readable section captions, clear active state, and high-contrast close control.
- Removed opacity/filter/text-shadow inheritance from navigation elements that could reduce readability.
- Kept the existing React pages, API routes, auth flow, and MongoDB integration intact.
- Kept lazy-loaded page components for smaller initial frontend bundles.

## Deploy
1. Replace the project files in the Git repository with this source.
2. Commit and push to the branch used by Render.
3. Let Render deploy the frontend.
4. On mobile, refresh the site and reopen the menu to confirm inactive labels are dark and readable.

## Validation note
A local production build was attempted, but this working copy's `frontend/node_modules` did not contain the Vite executable and reinstalling packages timed out. The CSS/source patch is included, but run `npm install` and `npm run build` in a normal development environment or let Render build it before treating the release as production-verified.
