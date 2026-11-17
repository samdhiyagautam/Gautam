-- Business questions answered against the retail dataset (SQLite).
--
-- Each block starts with a "-- Q<n> name" marker; scripts/analyze.py parses
-- these markers and writes results/<name>.csv for every query, so the SQL
-- file stays the single source of truth.

-- Q1 kpi_summary
SELECT SUM(quantity * unit_price)                                AS total_revenue,
       COUNT(DISTINCT order_id)                                  AS total_orders,
       COUNT(DISTINCT customer_id)                               AS unique_customers,
       SUM(quantity)                                             AS units_sold,
       ROUND(SUM(quantity * unit_price) * 1.0
             / COUNT(DISTINCT order_id), 2)                      AS avg_order_value
FROM orders;

-- Q2 monthly_revenue
SELECT strftime('%Y-%m', order_date) AS month,
       SUM(quantity * unit_price)    AS revenue,
       COUNT(DISTINCT order_id)      AS orders
FROM orders
GROUP BY 1
ORDER BY 1;

-- Q3 yoy_growth
WITH monthly AS (
    SELECT strftime('%Y-%m', order_date) AS month,
           SUM(quantity * unit_price)    AS revenue
    FROM orders
    GROUP BY 1
)
SELECT cur.month                                   AS month_2025,
       cur.revenue                                 AS revenue_2025,
       prev.revenue                                AS revenue_2024,
       ROUND((cur.revenue - prev.revenue) * 100.0
             / prev.revenue, 1)                    AS yoy_change_pct
FROM monthly AS cur
JOIN monthly AS prev
  ON cur.month = '2025-' || substr(prev.month, 6)
 AND prev.month LIKE '2024-%'
ORDER BY cur.month;

-- Q4 mom_growth
WITH monthly AS (
    SELECT strftime('%Y-%m', order_date) AS month,
           SUM(quantity * unit_price)    AS revenue
    FROM orders
    GROUP BY 1
)
SELECT month,
       revenue,
       ROUND((revenue - LAG(revenue) OVER (ORDER BY month)) * 100.0
             / NULLIF(LAG(revenue) OVER (ORDER BY month), 0), 1)
             AS mom_change_pct
FROM monthly;

-- Q5 category_revenue
SELECT category,
       SUM(quantity * unit_price) AS revenue,
       SUM(quantity)              AS units_sold
FROM orders
GROUP BY category
ORDER BY revenue DESC;

-- Q6 top_products
SELECT product_name,
       category,
       SUM(quantity)              AS units_sold,
       SUM(quantity * unit_price) AS revenue
FROM orders
GROUP BY product_name, category
ORDER BY revenue DESC
LIMIT 10;

-- Q7 region_revenue
SELECT region,
       SUM(quantity * unit_price)   AS revenue,
       COUNT(DISTINCT customer_id)  AS unique_customers
FROM orders
GROUP BY region
ORDER BY revenue DESC;

-- Q8 top_customers
SELECT o.customer_id,
       c.customer_name,
       o.region,
       SUM(o.quantity * o.unit_price) AS revenue
FROM orders AS o
JOIN customers AS c ON c.customer_id = o.customer_id
GROUP BY o.customer_id, c.customer_name, o.region
ORDER BY revenue DESC
LIMIT 10;

-- Q9 repeat_vs_onetime
WITH per_customer AS (
    SELECT customer_id,
           COUNT(DISTINCT order_id) AS order_count
    FROM orders
    GROUP BY customer_id
)
SELECT CASE WHEN order_count = 1 THEN 'One-time' ELSE 'Repeat' END AS customer_type,
       COUNT(*)                                                     AS customers,
       ROUND(COUNT(*) * 100.0
             / (SELECT COUNT(DISTINCT customer_id) FROM orders), 1) AS pct_of_base
FROM per_customer
GROUP BY 1
ORDER BY customers DESC;

-- Q10 category_region_matrix
SELECT region,
       SUM(CASE WHEN category = 'Electronics'    THEN quantity * unit_price ELSE 0 END) AS electronics,
       SUM(CASE WHEN category = 'Apparel'        THEN quantity * unit_price ELSE 0 END) AS apparel,
       SUM(CASE WHEN category = 'Home & Kitchen' THEN quantity * unit_price ELSE 0 END) AS "home_kitchen",
       SUM(CASE WHEN category = 'Beauty'         THEN quantity * unit_price ELSE 0 END) AS beauty,
       SUM(CASE WHEN category = 'Sports'         THEN quantity * unit_price ELSE 0 END) AS sports,
       SUM(quantity * unit_price)                                                        AS total_revenue
FROM orders
GROUP BY region
ORDER BY total_revenue DESC;

-- Q11 best_quarters
SELECT strftime('%Y', order_date) || '-Q' ||
       ((CAST(strftime('%m', order_date) AS INTEGER) + 2) / 3) AS quarter,
       ROUND(SUM(quantity * unit_price) * 1.0
             / COUNT(DISTINCT order_id), 0)                    AS avg_order_value,
       SUM(quantity * unit_price)                              AS revenue
FROM orders
GROUP BY 1
ORDER BY revenue DESC;
