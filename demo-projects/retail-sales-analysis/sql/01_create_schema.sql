-- Retail sales schema (SQLite).
--
-- Load with the sqlite3 CLI:
--   sqlite3 retail.db < sql/01_create_schema.sql
--   sqlite3 retail.db -cmd ".mode csv" \
--     -cmd ".import --skip 1 data/customers.csv customers" \
--     -cmd ".import --skip 1 data/products.csv products" \
--     -cmd ".import --skip 1 data/orders.csv orders" \
--     "SELECT 'loaded';"
--
-- scripts/analyze.py builds the same schema in memory automatically.

CREATE TABLE customers (
    customer_id  TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    region       TEXT NOT NULL,
    signup_date  TEXT NOT NULL
);

CREATE TABLE products (
    product_id   TEXT PRIMARY KEY,
    product_name TEXT NOT NULL,
    category     TEXT NOT NULL,
    unit_price   INTEGER NOT NULL
);

-- Line-item level: one row per product inside an order. `order_id` repeats
-- when a customer bought several products together. Region / product /
-- category are copied into the fact table so the CSV also loads directly
-- into Excel and Power BI without a join.
CREATE TABLE orders (
    order_id     TEXT NOT NULL,
    order_date   TEXT NOT NULL,
    customer_id  TEXT NOT NULL REFERENCES customers(customer_id),
    region       TEXT NOT NULL,
    product_id   TEXT NOT NULL REFERENCES products(product_id),
    product_name TEXT NOT NULL,
    category     TEXT NOT NULL,
    quantity     INTEGER NOT NULL,
    unit_price   INTEGER NOT NULL
);

CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_product ON orders(product_id);
