# Retail Sales Analysis — 5,000 Orders (2024–2026)

An end-to-end analysis of a 5,000-row retail sales dataset: data audit, KPI engine,
static dashboard, Excel report, single-sheet Excel report, interactive browser BI
dashboard, charts, and Power BI starter assets — all generated from one source of truth.

**Dataset:** `retail_sales_5000_rows.csv` — 5,000 orders, 24 products, 4 categories,
5 known regions, 2,167 customers, 01-Jan-2024 → 31-Oct-2026, ₹ INR.

---

## Headline numbers

| KPI | Value |
|---|---:|
| Gross sales | **₹121,379,792** (₹12.14 Cr) |
| Net delivered sales | **₹107,326,781** (88.34% of gross) |
| Profit | **₹32,820,561** (27.04% margin) |
| Delivered margin | **26.92%** |
| Orders | 5,000 |
| Unique customers | 2,167 |
| Avg order value | ₹24,276 |
| Avg rating | **4.00** (4,417 rated orders) |
| Cancelled/Returned | 583 orders (**11.66%**) — ₹14.05M gross |
| Deep-discount (>20%) margin | **10.13%** vs 32.71% at 0% |

### Biggest findings

1. **Discounts don't buy satisfaction, but they destroy margin.** Ratings are flat
   (~4.0) in every discount band while margin falls from 32.71% (0%) to 10.13% (>20%).
   Capping the >20% band at 11–20% would recover about **₹387,359** in profit.
2. **Product concentration.** 4K Monitor alone is **24.89%** of sales; the top two
   products are **41.2%** of revenue.
3. **Order leakage.** 11.66% of orders are cancelled/returned, representing ₹14.05M
   of gross sales and ₹3.92M of profit.
4. **Customer base is healthy.** Top-10 customers are only 3.37% of sales; 39.32% of
   customers generate 80% of revenue.
5. **2026 is flattening.** 2025 grew +8.60% YoY; 2026 annualizes to ~₹42.7M.

---

## Quick start

```powershell
python -m pip install -r requirements.txt
python run_all.py
```

`run_all.py` rebuilds every output in order:

1. `run_analysis.py` — validates the raw CSV, writes `Retail_Sales_Cleaned_For_PowerBI.csv`,
   `analysis_outputs/KPIs.json`, all summary CSVs and 15 PNG charts.
2. `build_reports.py` — `Retail_Sales_Dashboard.html` (3D scroll dashboard) and
   `Retail_Sales_PowerBI_Source.xlsx`.
3. `build_excel_report.py` — `Retail_Sales_Excel_Report.xlsx` (16 sheets).
4. `build_onesheet_bi.py` — `Retail_Sales_Report_OneSheet.xlsx` and
   `Retail_Sales_BI_Interactive.html` (9 live filters, canvas charts).

Run the regression tests:

```powershell
python -m unittest discover -s tests -v
```

---

## Outputs

| File | What it is |
|---|---|
| `Retail_Sales_Dashboard.html` | Static visual dashboard with 3D scroll-reveal + parallax (respects reduced motion) |
| `Retail_Sales_BI_Interactive.html` | Browser BI dashboard — 9 working filters, live KPIs, canvas charts, heatmap |
| `Retail_Sales_Excel_Report.xlsx` | Client-ready workbook: Dashboard, 11 analysis sheets, Filter Dashboard, Data Quality, raw table |
| `Retail_Sales_Report_OneSheet.xlsx` | Single-sheet executive report with dropdown filters + charts + insights |
| `Retail_Sales_Cleaned_For_PowerBI.csv` | Enriched dataset (dates, year/month/quarter, margins, discount bands, loss flag) |
| `Retail_Sales_PowerBI_Source.xlsx` | Enriched data + 5 pre-aggregated sheets + Data Quality |
| `PowerBI_DAX_Measures.txt` | Ready-to-paste DAX measures (gross, net delivered, leakage, Pareto) |
| `PowerBI_Report_Guide.md` | Step-by-step Power BI build guide (5 pages) |
| `PowerBI_Theme.json` | Power BI colour theme |
| `Retail_Sales_Analysis_Report.md` | Full written analysis with tables and recommendations |
| `analysis_outputs/` | `KPIs.json`, `KPIs.csv`, `Data_Quality.csv`, summary CSVs, 15 charts |

---

## Data quality

| Check | Result | Handling |
|---|---|---|
| Duplicate `Order_ID` | 0 | — |
| Sales = Qty × Price × (1 − Discount) | 0 mismatches | `Sales_Mismatch` flag added |
| Missing `Region` | 40 orders / ₹830,248.59 | Labelled **Unknown**, kept in totals |
| Missing `Payment_Mode` | 60 orders / ₹1,039,274.49 | Labelled **Unknown**, kept in totals |
| Missing `Customer_Rating` | 583 orders | Left blank — these are exactly the Cancelled/Returned orders |
| Discount range | 0–25% | Banded 0%, 1–5%, 6–10%, 11–20%, >20% |

Because missing dimension values are labelled `Unknown` instead of dropped, every
report reconciles to the full 5,000 rows and ₹121.38M gross sales.

---

## Project structure

```
analysis_common.py            shared validation / enrichment / KPIs / tables
run_analysis.py               pipeline step 1 — data + KPIs + charts
build_reports.py              HTML dashboard + Power BI source workbook
build_excel_report.py         formatted 16-sheet Excel report
build_onesheet_bi.py          one-sheet Excel + interactive BI HTML
run_all.py                    run the whole pipeline
requirements.txt              Python dependencies
tests/test_analysis_common.py regression tests for the KPI engine
analysis_outputs/             generated CSVs, JSON and charts
```

All report builders read `analysis_outputs/KPIs.json` and the generated summary
tables, so numbers are never hardcoded in the presentation layer. Re-run the
pipeline after changing the raw CSV and every output updates consistently.

---

## Notes

- Margin in discount analysis is **aggregate** Profit ÷ Sales per band, not the mean
  of row-level margins. Row-level averaging overweights small orders and does not
  reconcile to the company margin.
- `Avg Rating` ignores blanks automatically (4,417 rated orders). Replacing blanks
  with 0 would wrongly imply dissatisfaction on cancelled/returned orders.
- The `Unknown` rows are disclosed in every report rather than hidden; do not filter
  them out if you need totals to match the source.
