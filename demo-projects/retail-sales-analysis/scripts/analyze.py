"""Run every business query in sql/02_analysis_queries.sql and save results.

Loads the CSV files in data/ into an in-memory SQLite database, parses the
"-- Q<n> name" blocks from the SQL file, executes each one, and writes:

  results/<name>.csv            one file per query
  charts/monthly_revenue.svg    bar chart of the monthly trend

Standard library only — no pip installs needed.
"""

from __future__ import annotations

import csv
import re
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
SQL_FILE = ROOT / "sql" / "02_analysis_queries.sql"
RESULTS = ROOT / "results"
CHARTS = ROOT / "charts"

QUERY_MARKER = re.compile(r"^-- Q\d+\s+([a-z_]+)\s*$", re.MULTILINE)

CUSTOMER_COLUMNS = ["customer_id", "customer_name", "region", "signup_date"]
PRODUCT_COLUMNS = ["product_id", "product_name", "category", "unit_price"]
ORDER_COLUMNS = [
    "order_id", "order_date", "customer_id", "region",
    "product_id", "product_name", "category", "quantity", "unit_price",
]


def load_csv(conn: sqlite3.Connection, table: str, columns: list[str]) -> None:
    with (DATA / f"{table}.csv").open(newline="", encoding="utf-8") as f:
        rows = list(csv.reader(f))
    placeholders = ", ".join("?" for _ in columns)
    column_list = ", ".join(columns)
    conn.executemany(
        f"INSERT INTO {table} ({column_list}) VALUES ({placeholders})",
        rows[1:],
    )


def parse_queries() -> list[tuple[str, str]]:
    """Split the SQL file on "-- Q<n> name" markers."""
    text = SQL_FILE.read_text(encoding="utf-8")
    matches = list(QUERY_MARKER.finditer(text))
    queries = []
    for i, match in enumerate(matches):
        name = match.group(1)
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        queries.append((name, text[start:end].strip()))
    return queries


def monthly_revenue_chart(rows: list[tuple]) -> str:
    """Hand-rolled SVG bar chart — no plotting library needed."""
    months = [row[0] for row in rows]
    values = [row[1] for row in rows]
    width, height, pad = 960, 340, 46
    inner_w, inner_h = width - 2 * pad, height - 2 * pad - 14
    peak = max(values)
    bar_w = inner_w / len(values)
    parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="0 0 {width} {height}" role="img" '
        'aria-label="Monthly revenue, 24 months">',
        f'<text x="{pad}" y="24" font-family="sans-serif" font-size="15" '
        'fill="#374151">Monthly revenue (INR)</text>',
    ]
    for i, (month, value) in enumerate(zip(months, values)):
        x = pad + i * bar_w
        bar_h = value / peak * (inner_h - 10)
        parts.append(
            f'<rect x="{x + 1:.1f}" y="{height - pad - bar_h:.1f}" '
            f'width="{bar_w - 2:.1f}" height="{bar_h:.1f}" fill="#4b5563">'
            f"<title>{month}: {value}</title></rect>"
        )
        if i % 3 == 0:
            parts.append(
                f'<text x="{x + bar_w / 2:.1f}" y="{height - 16}" '
                'font-family="sans-serif" font-size="10" fill="#6b7280" '
                f'text-anchor="middle">{month[2:]}</text>'
            )
    parts.append("</svg>")
    return "\n".join(parts)


def main() -> None:
    RESULTS.mkdir(exist_ok=True)
    CHARTS.mkdir(exist_ok=True)

    conn = sqlite3.connect(":memory:")
    conn.executescript((ROOT / "sql" / "01_create_schema.sql").read_text(encoding="utf-8"))
    load_csv(conn, "customers", CUSTOMER_COLUMNS)
    load_csv(conn, "products", PRODUCT_COLUMNS)
    load_csv(conn, "orders", ORDER_COLUMNS)

    for name, sql in parse_queries():
        cursor = conn.execute(sql)
        headers = [column[0] for column in cursor.description]
        rows = cursor.fetchall()
        with (RESULTS / f"{name}.csv").open("w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            writer.writerows(rows)
        print(f"{name}: {len(rows)} rows")

    monthly = conn.execute(
        "SELECT month, revenue FROM ("
        "  SELECT strftime('%Y-%m', order_date) AS month,"
        "         SUM(quantity * unit_price) AS revenue"
        "  FROM orders GROUP BY 1 ORDER BY 1)"
    ).fetchall()
    (CHARTS / "monthly_revenue.svg").write_text(monthly_revenue_chart(monthly), encoding="utf-8")
    print(f"charts/monthly_revenue.svg written ({len(monthly)} months)")

    conn.close()


if __name__ == "__main__":
    main()
