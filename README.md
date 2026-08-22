# CampusFind

CampusFind is a small fullstack web application for reporting lost and found items at a university campus.

A visitor can:

- view lost and found reports,
- submit a new report,
- store the report in PostgreSQL,
- mark an open report as resolved,
- read an About page explaining the project.

## Technologies used in CmapusFind

- HTML
- CSS
- JavaScript
- Node.js
- Express
- PostgreSQL
- `pg` for the database connection


## CampusFind structure

campusfind/
├── public/
│   ├── index.html
│   ├── about.html
│   ├── style.css
│   └── app.js
├── db.js
├── server.js
├── schema.sql
├── package.json
├── .env.example
├── .gitignore
└── README.md

## How CampusFind works

1. The browser loads HTML, CSS and JavaScript from the Express server.
2. Browser JavaScript sends requests to `/api/items`.
3. Express receives the request.
4. Express uses the PostgreSQL connection in `db.js`.
5. PostgreSQL returns data to Express.
6. Express returns JSON to the browser.
7. Browser JavaScript displays the data on the page.
