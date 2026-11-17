#!/usr/bin/env python3
"""Run every analysis query in sql/02_analysis_queries.sql and export results.

Pipeline (standard library only, SQLite via Python's built-in sqlite3):
  1. load data/matches.csv and data/deliveries.csv into an in-memory SQLite
     database using sql/01_create_schema.sql
  2. split sql/02_analysis_queries.sql on its "-- Q<n> name" markers
  3. run each query and write results/<name>.csv
  4. write charts/season_runs.svg (total runs per season, innings <= 2)

Usage:
    python scripts/analyze.py
"""

import csv
import os
import re
import sqlite3

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "data")
RESULTS_DIR = os.path.join(ROOT, "results")
CHARTS_DIR = os.path.join(ROOT, "charts")
SCHEMA = os.path.join(ROOT, "sql", "01_create_schema.sql")
QUERIES = os.path.join(ROOT, "sql", "02_analysis_queries.sql")


def load_csv(db, table, file_name):
    with open(os.path.join(DATA_DIR, file_name), newline="", encoding="utf-8") as fh:
        rows = list(csv.reader(fh))
    placeholders = ",".join("?" * len(rows[0]))
    db.executemany(f"INSERT INTO {table} VALUES ({placeholders})", rows[1:])
    return len(rows) - 1


def split_queries(text):
    """Yield (name, sql) pairs, split on '-- Q<n> name' markers."""
    markers = list(re.finditer(r"^-- Q\d+\s+([a-z_]+)\s*$", text, re.MULTILINE))
    for i, marker in enumerate(markers):
        start = marker.end()
        end = markers[i + 1].start() if i + 1 < len(markers) else len(text)
        yield marker.group(1), text[start:end].strip()


def write_season_chart(db):
    rows = db.execute(
        "SELECT season, SUM(runs_off_bat + extras) AS runs "
        "FROM deliveries WHERE innings <= 2 GROUP BY season ORDER BY season"
    ).fetchall()
    width, height, pad = 960, 340, 46
    inner_h = height - 2 * pad - 14
    peak = max(runs for _, runs in rows)
    bar_w = (width - 2 * pad) / len(rows)
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" '
        'role="img" aria-label="Total runs per IPL season">',
        f'  <text x="{pad}" y="24" font-family="sans-serif" font-size="15" '
        'fill="#374151">Total runs per IPL season</text>',
    ]
    for i, (season, runs) in enumerate(rows):
        x = pad + i * bar_w
        bar_h = runs / peak * (inner_h - 10)
        parts.append(
            f'  <rect x="{x + 1:.1f}" y="{height - pad - bar_h:.1f}" '
            f'width="{bar_w - 2:.1f}" height="{bar_h:.1f}" fill="#4b5563">'
            f"<title>{season}: {runs}</title></rect>"
        )
        if i % 2 == 0:
            parts.append(
                f'  <text x="{x + bar_w / 2:.1f}" y="{height - 16}" '
                'font-family="sans-serif" font-size="10" fill="#6b7280" '
                f'text-anchor="middle">{season[-2:]}</text>'
            )
    parts.append("</svg>")
    with open(os.path.join(CHARTS_DIR, "season_runs.svg"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(parts) + "\n")
    return len(rows)


def main():
    os.makedirs(RESULTS_DIR, exist_ok=True)
    os.makedirs(CHARTS_DIR, exist_ok=True)
    db = sqlite3.connect(":memory:")
    with open(SCHEMA, encoding="utf-8") as fh:
        db.executescript(fh.read())
    n_matches = load_csv(db, "matches", "matches.csv")
    n_deliveries = load_csv(db, "deliveries", "deliveries.csv")
    print(f"loaded {n_matches} matches, {n_deliveries} deliveries")

    with open(QUERIES, encoding="utf-8") as fh:
        queries = list(split_queries(fh.read()))
    for name, sql in queries:
        cursor = db.execute(sql)
        headers = [d[0] for d in cursor.description]
        rows = cursor.fetchall()
        with open(os.path.join(RESULTS_DIR, f"{name}.csv"), "w",
                  newline="", encoding="utf-8") as fh:
            writer = csv.writer(fh)
            writer.writerow(headers)
            writer.writerows(["" if v is None else v for v in row] for row in rows)
        print(f"{name}: {len(rows)} rows")

    seasons = write_season_chart(db)
    print(f"charts/season_runs.svg written ({seasons} seasons)")


if __name__ == "__main__":
    main()
