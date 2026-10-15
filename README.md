# Focus Dashboard — Node.js version

This version uses plain Node.js only: no Express and no database.

## Storage

Calendar entries are saved by the Node server as real JSON files under:

```text
data/calendar/YYYY-MM-DD.json
```

Dates stay empty until you add a block. If a date has no blocks, no JSON file is required and the API returns `[]`.

Top 3, quick tasks, assignments, and Pomodoro counts still use browser localStorage.

## Run

```bash
npm start
```

Equivalent command:

```bash
node server.js
```

The server listens on `process.env.PORT` when provided (for Coolify) and otherwise uses port 3000.

## Coolify

Deploy this repository as a Node application, not as a Static site. The start command is already defined in `package.json` as `node server.js`.

For persistent calendar data across redeploys, mount persistent storage to the application's `data/calendar` directory.
