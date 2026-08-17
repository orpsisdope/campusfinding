CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('lost', 'found'))
    category VARCHAR(50) NOT NULL,
    location VARCHAR(100) NOT NULL,
    item_date DATE NOT NULL,
    description TEXT NOT NULL,
    contact VARCHAR(120) NOT NULL,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);



INSERT INTO items
(title, type, category, location, item_date, description, contact)
SELECT
    'Black backpack',
    'lost'
    'Bag',
    'University Library',
    CURRENT_DATE,
    'Black backpack with a water bottle in the side pocket.',
    'student@example.com'
WHERE NOT EXISTS (
    SELECT 1 FROM items WHERE title = 'Black backpack'
);


INSERT INTO items
(title, type, category, location, item_date, description, contact)
SELECT
    'Keys with blue keychain',
    'found',
    'Keys'