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



###### API_ROUTES
## GET `/api/items`
Returns all lost and found reports.

## POST `/api/items`
Creates a new report.

## Example for JSON body:

json
{
  "title": "Black backpack",
  "type": "lost",
  "category": "Bag",
  "location": "University Library",
  "item_date": "2026-08-17",
  "description": "Black backpack with a bottle inside.",
  "contact": "student@example.com"
}


## PATCH `/api/items/:id/resolve`
Marks one report as resolved.

## GET `/api/health`
Checks whether the web server can reach the database.




###### TO RUN LOCALLY
## 1. Install Node.js

Use Node.js 18 or newer.

Check the installation:

bash
node --version
npm --version
