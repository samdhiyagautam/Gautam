# IPL Cricket Analytics — SQL + Python

End-to-end analysis of **real Indian Premier League (IPL) match data** — 1,243 matches
and 295,732 ball-by-ball deliveries (2008–2026) — using SQL as the primary tool, a
zero-dependency Python pipeline to load, run, and export everything, and a formula-driven
Excel / Google Sheets workbook for the full project.

This is **not sample data**. Every number below comes from real matches and can be
cross-checked against public scorecards (e.g. ESPNcricinfo).

## Source & license

- Data: [cricsheet.org](https://cricsheet.org/) — `ipl_csv2.zip` ball-by-ball data,
  licensed under the [ODC Attribution License (ODC-By)](https://opendatacommons.org/licenses/by/).
  You may share, modify, and use it freely with attribution.
- The repository ships the consolidated CSVs (`data/`) so everything is reproducible
  offline; `scripts/prepare_data.py` can re-download the latest source at any time.

## What's in the repository

| Path | What it is |
|---|---|
| `sql/01_create_schema.sql` | SQLite schema: `matches` (1,243 rows) + `deliveries` (295,732 rows) with indexes |
| `sql/02_analysis_queries.sql` | 12 business questions as SQL — the single source of truth |
| `scripts/prepare_data.py` | Downloads + consolidates cricsheet zip into the two CSVs (stdlib only) |
| `scripts/analyze.py` | Loads CSVs into SQLite, runs every query, exports `results/` + `charts/` (stdlib only) |
| `results/*.csv` | One result file per question (12 files) |
| `charts/season_runs.svg` | Total runs per season |
| `IPL-Analytics-Workbook.xlsx` | Excel / Google Sheets deliverable: 18 sheets, % dashboard first, 6 charts |
| `excel/` | Node builder: verified aggregates → workbook, chart renderer, verification scripts |
| `data/` | Committed real data: `matches.csv` (~0.2 MB), `deliveries.csv` (~28 MB) |

## How to run

```bash
# 1. Build the data files (skips the download if data/ already exists)
python scripts/prepare_data.py

# 2. Run all 12 queries + generate the chart
python scripts/analyze.py
```

Or do it by hand with the `sqlite3` CLI:

```bash
sqlite3 ipl.db < sql/01_create_schema.sql
sqlite3 ipl.db -cmd ".mode csv" \
  -cmd ".import --skip 1 data/matches.csv matches" \
  -cmd ".import --skip 1 data/deliveries.csv deliveries" \
  ""
# then run any query from sql/02_analysis_queries.sql
```

## Excel / Google Sheets workbook

[`IPL-Analytics-Workbook.xlsx`](IPL-Analytics-Workbook.xlsx) is the full project in one
workbook: **18 sheets, 6,814 live formulas, 6 dashboard charts and 15 in-cell data bars**,
built from the same verified aggregates as `results/`.

**Percentages first.** The Dashboard opens with eight live KPI rates — toss winner win %
(51.6%), field-first (54.7%), bat-first (45.3%), chase (54.2%), defend (45.8%), dot-ball
rate (35.6%), boundary share (57.9%) and extras share (5.0%) — followed by volume KPIs,
top-8 team win rates, five headline findings and six charts.

| Sheet group | Sheets |
|---|---|
| Dashboard | `Dashboard`, `KPI Summary` |
| Analysis sheets | `Season Summary`, `Top Run Scorers`, `Top Wicket Takers`, `Best Economy`, `Toss Impact`, `Chase vs Defend`, `Venue Averages`, `Team Wins`, `Head to Head`, `Highest Totals` |
| Pivot sources | `Team Season` (166 rows), `Batting Stats` (739), `Bowling Stats` (407), `Wicket Types` |
| Raw grain | `Matches` — all 1,243 matches with live Result / Toss Winner Won columns |
| Guide | `How To Use` — import steps, pivots, Power Query, definitions, limitations |

Strike rates, economies, win %, chase %, shares of totals, wickets in hand and every
percentage are **formulas**, not hard-coded values, so they recalculate when you edit a
cell. The workbook sets `fullCalcOnLoad`, so Excel and Google Sheets compute everything on
open.

### Import into Google Sheets

1. Open [sheets.google.com](https://sheets.google.com) and create a blank spreadsheet.
2. **File → Import → Upload** → choose `IPL-Analytics-Workbook.xlsx` → **Import data**.
3. Open the **Dashboard** tab. Percentages recalculate and the six charts appear as
   floating images. If an image is missing, insert it from `excel/assets/*.png`.

### Power Query — full ball-by-ball grain

The workbook keeps pre-aggregated batting, bowling and team tables so it stays fast; the
full 295,732-row delivery grain is in `data/deliveries.csv`. To query it in Excel:
**Data → Get Data → From File → From Text/CSV**, load the CSV, then apply the same
definitions as `sql/02_analysis_queries.sql` (innings ≤ 2, legal ball = no wide/no-ball,
bowler wickets = the six credited types).

### Rebuild and verify

```bash
cd excel
npm install
npm run all        # charts -> workbook -> 601 data checks + 208 workbook checks
```

`npm run charts` needs Microsoft Edge on Windows to rasterise the SVG charts; the chart
images are committed, so `npm run build` works without Edge.

**Honest notes**

- The six charts are embedded PNGs, not native Excel chart objects — ExcelJS has no chart
  API. Every number behind them is in the sheets, so they can be rebuilt.
- The workbook stores aggregated tables plus the 1,243-match table, not all 295,732
  deliveries (the CSV is 28 MB) — use Power Query or the CSV for that grain.
- Verification is programmatic: `excel/verify-data.mjs` cross-checks 601 values against
  `results/*.csv`, and `excel/verify-workbook.mjs` reads the saved `.xlsx` back and checks
  208 things (sheet order, formulas, totals, charts, data bars, cross-sheet references).
  The file was not opened in the Excel desktop UI during the build because Office
  activation was unavailable on the build machine; Excel and Google Sheets recalculate on
  open via `fullCalcOnLoad`.

## Key findings (all verifiable)

**Scale:** 1,243 matches · 401,423 runs · 14,674 dismissals · 284,465 legal balls ·
**8.47 runs per over** across 19 seasons (2008–2026).

- **Most runs:** V Kohli — 9,336 runs in 275 innings (SR 134.8), ahead of RG Sharma (7,329)
  and S Dhawan (6,769). Minimum 500 balls faced.
- **Most wickets:** YS Chahal — 233, ahead of B Kumar (226) and SP Narine (207).
  Bowler-credited dismissals only (bowled/caught/lbw/stumped/c&b/hit wicket).
- **Best economy** (min 30 overs): A Chandila 6.21, Sohail Tanvir 6.46, SMSM Senanayake 6.53 —
  small-sample bowlers from the early seasons top the list; A Kumble (6.58 over 160 overs)
  is the best among high-workload bowlers.
- **Toss:** teams chose to **field 810 times vs bat 408** — and toss winners who fielded
  won 54.7% of decided matches vs 45.3% for those who batted first.
- **Chasing keeps rising:** the 2026 season had **45 successful chases vs 27 defenses** —
  the highest chase count of any IPL season (previous high: 40 in 2012), after 36 (2024)
  and 37 (2025).
- **Biggest totals:** Sunrisers Hyderabad owns the top four — 287/3 (2024), 286 (2025),
  278/3 (2025), 277/3 (2024); KKR's 272/7 (2024) rounds out the top five.
- **Most team wins:** Mumbai Indians 155, Chennai Super Kings 148, Kolkata Knight Riders 140.

## Data conventions (documented in the SQL)

- A **legal ball** = `wides = 0 AND noballs = 0`.
- **Bowler-credited wickets** = bowled, caught, lbw, stumped, caught and bowled, hit wicket;
  run-outs and retirements are excluded.
- **Super overs excluded** from per-season and per-batter/bowler aggregates (`innings <= 2`).
- **Franchise names kept as in the source** — renamed franchises count under the name
  used at the time, so e.g. Royal Challengers **Bangalore** (114 wins) and Royal
  Challengers **Bengaluru** (29) appear separately, as do Delhi Daredevils/Delhi
  Capitals and Kings XI Punjab/Punjab Kings.
- Cricsheet labels three seasons with cross-year strings ("2007/08", "2009/10",
  "2020/21"); those source labels are preserved.

## Skills demonstrated

SQL analytics on 300k rows (aggregations, CTEs, CASE pivots, HAVING thresholds),
schema design with indexes, data cleaning and consolidation from a raw multi-file
source, CSV/SVG export pipelines in dependency-free Python, a formula-driven
Excel / Google Sheets workbook (6,814 formulas, pivot-ready tables, dashboard),
and careful data attribution + licensing.
