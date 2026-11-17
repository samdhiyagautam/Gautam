# IPL Cricket Analytics — SQL + Python

End-to-end analysis of **real Indian Premier League (IPL) match data** — 1,243 matches
and 295,732 ball-by-ball deliveries (2008–2026) — using SQL as the primary tool and a
zero-dependency Python pipeline to load, run, and export everything.

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
source, CSV/SVG export pipelines in dependency-free Python, and careful data
attribution + licensing.
