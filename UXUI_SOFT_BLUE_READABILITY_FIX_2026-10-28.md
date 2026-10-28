# JPS UX/UI — Soft Blue Readability Fix (2026-10-28)

This patch refines the existing blue/white theme to a lower-glare palette and adds explicit contrast rules for legacy page headers, form controls, menus, and buttons.

## Changes
- Replaced saturated gradient header blocks with white/light-blue surfaces where dark text is used.
- Standardized primary buttons to a solid medium blue with white text.
- Standardized secondary buttons and tabs to pale blue/white with dark-blue text.
- Removed text-shadow and opacity effects that reduce label readability.
- Tightened mobile layout for the user-management header, add button, and account tabs.
- Kept application routes, API calls, authentication, and database configuration unchanged.

## Deployment
1. Replace the repository files with this source tree.
2. Commit and push to the branch connected to Render.
3. Wait for the build to complete, then hard-refresh the site (`Ctrl+F5`).

Note: This is a source-level CSS patch. Run the frontend build and verify key pages in the deployed environment before using it in production.
