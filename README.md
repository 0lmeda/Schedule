# Focus Dashboard — Node.js version

This version uses **plain Node.js only**. There is no Express and no database.

## What Node does

- Serves the dashboard files.
- Provides a small calendar API.
- Uses Node's built-in `fs` module to save calendar days as JSON files.
- A day with no events has no file yet; requesting it returns `[]`.
- Adding the first event creates `data/calendar/YYYY-MM-DD.json`.
- Deleting the last event removes that day's file again.

## Project files

```text
focus-dashboard/
  server.js
  package.json
  index.html
  style.css
  app.js
  schedule.json
  data/
    calendar/
```

The `data/calendar` directory is created automatically when the server starts.

## Run it

Install Node.js, open a terminal in the project folder, and run:

```bash
npm start
```

or directly:

```bash
node server.js
```

Then open:

```text
http://localhost:3000
```

## Example

If you add an event on October 15, 2026, Node creates:

```text
data/calendar/2026-10-15.json
```

Example contents:

```json
[
  {
    "start": "14:00",
    "end": "15:00",
    "activity": "Web Programming",
    "category": "school"
  }
]
```

## Important

Do not open `index.html` directly with `file://`. Run `server.js` and access the dashboard through `http://localhost:3000`, because the calendar now uses the Node API.

Top 3, Tasks, Assignments, and Pomodoro counts still use browser `localStorage`. Calendar blocks are stored on the Node server as JSON files.
