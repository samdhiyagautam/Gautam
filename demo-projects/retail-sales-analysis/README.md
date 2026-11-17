# Retail Sales Analysis — SQL + Python

End-to-end analytics demo: a synthetic retail dataset, 11 business questions
answered in SQL, a Python pipeline that runs them and exports results, plus
Excel / Power BI workflow notes.

> **About the data:** everything here is **synthetic sample data**, generated
> by a seeded PRNG (`scripts/generate_data.py`, seed 42). It is not real
> business data, and every number in this README comes from the committed
> sample run. Regenerating the data reproduces the same values.

![Monthly revenue](charts/monthly_revenue.svg)

## Why this project

It demonstrates the everyday skills of a data analyst on one coherent dataset:

- **SQL** — joins, CTEs, CASE pivots, window functions (`LAG`), date
  arithmetic, aggregation (`sql/02_analysis_queries.sql`)
- **Python** — CSV ingestion, SQLite, result exporting, zero-dependency SVG
  charting (`scripts/analyze.py`)
- **Data modelling** — a small star-like model (customers / products / orders)
  that also loads flat into Excel and Power BI
- **Business thinking** — each query answers a real stakeholder question

## Structure

```
retail-sales-analysis/
├── data/          # customers.csv, products.csv, orders.csv (committed)
├── sql/
│   ├── 01_create_schema.sql      # SQLite DDL + indexes
│   └── 02_analysis_queries.sql   # 11 business questions (single source of truth)
├── scripts/
│   ├── generate_data.py          # seeded synthetic data generator
│   └── analyze.py                # runs every query, writes results/ + charts/
├── results/       # one CSV per business question (committed)
└── charts/        # monthly_revenue.svg (committed)
```

## Quick start

**Option A — run the full pipeline (Python 3.10+, standard library only):**

```bash
python scripts/generate_data.py   # writes data/*.csv
python scripts/analyze.py         # writes results/*.csv + charts/monthly_revenue.svg
```

**Option B — SQLite CLI only:**

```bash
sqlite3 retail.db < sql/01_create_schema.sql
sqlite3 retail.db -cmd ".mode csv" \
  -cmd ".import --skip 1 data/customers.csv customers" \
  -cmd ".import --skip 1 data/products.csv products" \
  -cmd ".import --skip 1 data/orders.csv orders" \
  < sql/02_analysis_queries.sql
```

**Option C — no setup:** open any file in `results/` — each one is a finished
answer.

## Business questions

| # | Question | Result file |
|---|----------|-------------|
| Q1 | Headline KPIs (revenue, orders, customers, AOV) | `results/kpi_summary.csv` |
| Q2 | Monthly revenue trend | `results/monthly_revenue.csv` |
| Q3 | Year-over-year growth, 2025 vs 2024 | `results/yoy_growth.csv` |
| Q4 | Month-over-month momentum (window function) | `results/mom_growth.csv` |
| Q5 | Revenue and units by category | `results/category_revenue.csv` |
| Q6 | Top 10 products by revenue | `results/top_products.csv` |
| Q7 | Revenue and reach by region | `results/region_revenue.csv` |
| Q8 | Top 10 customers by revenue | `results/top_customers.csv` |
| Q9 | Repeat vs one-time customer mix | `results/repeat_vs_onetime.csv` |
| Q10 | Category × region revenue matrix | `results/category_region_matrix.csv` |
| Q11 | Best quarters by revenue | `results/best_quarters.csv` |

## Findings from the sample run

- **₹82.6 lakh revenue** across **1,687 orders** from **378 of 400 customers**
  (2 years, Jan 2024 – Dec 2025); average order value **₹4,897.49**.
- **Apparel leads by revenue (₹24.9 L)**, driven by Running Shoes
  (₹10.9 L, the #1 product); Electronics leads in units (1,750) but sits #2
  in revenue because of lower price points.
- **Clear festive seasonality:** Nov–Dec 2024 spiked to ₹4.8–5.0 L per month
  vs a ~₹3 L baseline; 2024-Q4 is the best quarter (₹13.2 L).
- **YoY growth is uneven** — strong Jan 2025 (+29.1%) but a soft Feb–Mar
  (−4.9%, −8.2%) — a realistic pattern the pipeline surfaces honestly.
- **Loyalty is the story:** 84.4% of ordering customers are repeat buyers,
  15.6% are one-time; the top customer (Diya Mehta, South) spent ₹1.03 L.
- **North and West regions** each contribute ~₹22 L, nearly identical reach
  (~97–99 customers) — marketing spend questions write themselves.

## Excel workflow

1. Open `data/orders.csv` in Excel (each line item is one row).
2. Insert → PivotTable. Useful pivots:
   - Rows: `region`, Columns: `category`, Values: Sum of `quantity × unit_price`
     (add a helper column `revenue = quantity * unit_price` first)
   - Rows: `order_date` grouped by month, Values: sum of `revenue`
   - Rows: `product_name`, Values: sum of `revenue`, sort descending, Top 10 filter
3. `results/*.csv` open directly for the finished answers.

## Power BI workflow

No `.pbix` is committed (binary files don't review well) — the model takes
about 20 minutes to build:

1. **Get Data → Text/CSV** for the three files in `data/`.
2. **Model view:** relate `orders[customer_id]` → `customers[customer_id]` and
   `orders[product_id]` → `products[product_id]` (one-to-many, single direction).
3. **Measures:**
   ```dax
   Total Revenue = SUMX(orders, orders[quantity] * orders[unit_price])
   Total Orders  = DISTINCTCOUNT(orders[order_id])
   Avg Order Value = DIVIDE([Total Revenue], [Total Orders])
   ```
4. **Visuals:** line chart (`order_date` month × Total Revenue), clustered bar
   (region × category), matrix (category × region), top-N products slicer.

## Regenerating the data

```bash
python scripts/generate_data.py
```

The generator is deterministic (seed 42), so the committed CSVs, the results,
and this README stay in sync. `scripts/analyze.py` then rewrites
`results/` and `charts/` from whatever is in `data/`.
