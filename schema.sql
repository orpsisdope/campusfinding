CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('lost', 'found'))
);



INSERT INTO items
(title, type, category, location, item_date, description, contact)
SELECT
    'Black backpack',
    'lost'


INSERT INTO items
(title, type, category, location, item_date, description, contact)
SELECT
    'Keys with blue keychain',
    'found',
    'Keys'