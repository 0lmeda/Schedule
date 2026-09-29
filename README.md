# Focus Dashboard

A responsive ADHD-friendly personal dashboard built from the weekly schedule spreadsheet.

## Features
- Current / next schedule block with live countdown
- Today timeline + progress
- Editable Top 3 priorities (saved in your browser)
- Assignment/deadline tracker (saved in your browser)
- Bedtime countdown for a 10:50 PM sleep / 6:50 AM wake target
- Full weekly schedule view
- Mobile-friendly layout

## Publish free with GitHub Pages
1. Create a GitHub repository, e.g. `focus-dashboard`.
2. Upload `index.html`, `styles.css`, and `app.js` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Choose `main` and `/ (root)` and save.
6. GitHub will show your public URL.

## Update the fixed weekly schedule
Edit the `schedule` object at the top of `app.js`.

## Important: saved tasks
Top 3 priorities and assignments use browser `localStorage`. They stay saved on the browser/device where you entered them, but they do not sync across devices.
