# 📊 Retail Sales Data — Full Analysis Report

**Source file:** `retail_sales_5000_rows.csv` (5,000 orders)
**Date range:** 01-Jan-2024 → 31-Oct-2026 (34 months) | **Currency:** ₹ (INR)
**Companion files:** `Retail_Sales_Dashboard.html` (visual dashboard) · `Retail_Sales_Cleaned_For_PowerBI.csv` + `Retail_Sales_PowerBI_Source.xlsx` (Power BI sources) · `PowerBI_Report_Guide.md` (Power BI build steps)

---

## 1. Executive Summary (KPIs)

| KPI | Value | Note |
|---|---:|---|
| Total Sales | **₹121,379,792 (~₹12.14 Cr)** | 5,000 orders |
| Net Sales (Delivered only) | **₹107,326,781** | 88.34% of gross; excludes Cancelled/Returned |
| Total Profit | **₹32,820,561 (~₹3.28 Cr)** | Margin 27.04% (delivered: 26.92%) |
| Average Order Value | ₹24,276 | median ₹11,092 |
| Unique Customers | 2,167 | ≈2.3 orders/customer |
| Unique Products | 24 | across 4 categories |
| Units Sold | 28,104 | |
| Avg Discount | 7.67% | |
| Avg Customer Rating | ★4.00 / 5 | from 4,417 rated orders (583 blank) |
| Loss-making orders | 48 (0.96%) | total loss only ₹24,262 |
| Cancelled + Returned | 583 orders (11.66%) | ₹14.05M gross sales at risk |
| Data quality | ⚠️ Mostly clean | Sales formula holds in all 5,000 rows; 40 missing Region, 60 missing Payment_Mode, 583 missing ratings (all non-delivered) |

---

## 2. Yearly Performance

| Year | Sales | Profit | Orders | AOV | Margin % |
|---|---:|---:|---:|---:|---:|
| 2024 | ₹41.11M | ₹10.90M | 1,713 | ₹24,000 | 26.50% |
| 2025 | ₹44.65M | ₹12.18M | 1,780 | ₹25,082 | 27.29% |
| 2026 (10 months) | ₹35.62M | ₹9.74M | 1,507 | ₹23,637 | 27.34% |

**Findings:** 2025 grew **+8.6%** over 2024 with improving margin. 2026 annualizes to ~₹42.7M — roughly flat vs 2025, with a small AOV dip (₹25.1K → ₹23.6K). Margin keeps improving every year (26.5% → 27.3%) — pricing discipline is working.

## 3. Category Performance

| Category | Sales | Profit | Margin % | Orders | Avg Rating |
|---|---:|---:|---:|---:|---:|
| Electronics | ₹44.67M | ₹12.18M | 27.27% | 1,429 | ★4.02 |
| Office Supplies | ₹36.90M | ₹9.96M | 27.00% | 1,261 | ★3.99 |
| Home & Kitchen | ₹25.33M | ₹6.81M | 26.88% | 1,276 | ★3.98 |
| Apparel | ₹14.48M | ₹3.87M | 26.71% | 1,034 | ★4.01 |

**Findings:** Electronics is the engine (36.8% share). Margins are remarkably uniform (26.7–27.3%), so profitability is not category-driven — it's **discount-driven** (see §7). 4K Monitor alone = ₹30.2M = **24.9% of total company sales** (concentration risk at product level).

## 4. Regional Performance

| Region | Sales | Profit | Margin % | Orders | Customers | AOV |
|---|---:|---:|---:|---:|---:|---:|
| South | ₹28.62M | ₹7.72M | 26.97% | 1,214 | 961 | ₹23,573 |
| West | ₹26.33M | ₹7.09M | 26.92% | 1,032 | 843 | ₹25,510 |
| North | ₹26.14M | ₹6.86M | 26.25% | 1,053 | 869 | ₹24,824 |
| East | ₹21.07M | ₹5.94M | **28.20%** | 905 | 762 | ₹23,285 |
| Central | ₹18.39M | ₹5.01M | 27.25% | 756 | 642 | ₹24,330 |
| Unknown (missing region) | ₹0.83M | ₹0.20M | 24.12% | 40 | 39 | ₹20,756 |

**Findings:** South leads in volume; **East leads in margin (28.2%)**; **North lags in margin (26.3%)** despite mid-level volume → audit North's discounting/mix. Central is the smallest region and a growth headroom. The 40 orders with no region (₹0.83M, 0.68%) are kept as **Unknown** so totals reconcile with the raw file.

## 5. Customer Segments

| Segment | Sales | Share | Margin % | Customers | Orders |
|---|---:|---:|---:|---:|---:|
| Consumer | ₹63.79M | 52.6% | 26.73% | 1,644 | 2,620 |
| Corporate | ₹34.86M | 28.7% | 27.36% | 1,128 | 1,451 |
| Home Office | ₹22.72M | 18.7% | **27.41%** | 764 | 929 |

**Findings:** Consumer dominates volume; Home Office is the most profitable per rupee; Corporate delivers the strongest blend of volume + margin. Top-10 customers = only **3.4%** of sales → very low concentration risk. Pareto: **852 customers (39.3%) generate 80% of revenue.**

## 6. Products

**Top 5 by sales:** 4K Monitor (₹30.2M) · Standing Desk (₹19.8M) · Water Purifier (₹11.6M) · Ergonomic Chair (₹11.5M) · Smart Watch (₹6.1M)

**Bottom 5 by sales:** Notebook Pack (₹0.39M) · Printer Paper (₹0.51M) · Cotton T-Shirt (₹0.60M) · Desk Organizer (₹0.75M) · Storage Containers (₹0.95M)

**Findings:** Bottom products are low-ticket, high-frequency items — margins still ~26%, so they serve traffic/assortment roles rather than being problems. Only 48 orders (1%) are loss-making.

## 7. Discount Impact ⚠️ (biggest finding)

| Discount band | Orders | Sales | Avg Margin % | Avg Rating |
|---|---:|---:|---:|---:|
| 0% | 1,773 | ₹45.78M | **32.71%** | 3.97 |
| 1–5% | 993 | ₹26.01M | 29.46% | 4.07 |
| 6–10% | 955 | ₹23.16M | 24.06% | 4.03 |
| 11–20% | 1,022 | ₹22.03M | 18.93% | 3.96 |
| >20% | 257 | ₹4.40M | **10.13%** | 3.99 |

**Findings:** Customer rating is **flat (~4.0) at every discount level** — discounts are not buying satisfaction. Moving the 257 deep-discount (>20%) orders to the 11–20% band would recover roughly **₹0.39M profit** (₹387,359; sales held constant). Margin is the only thing that moves, and it falls by two-thirds. This is the single clearest margin lever in the dataset.

> Margin here is **aggregate** Profit ÷ Sales within each band, not the average of row-level margins — so the bands weight correctly and sum back to the 27.04% company margin.

## 8. Payment & Shipping

- **UPI dominates:** 1,913 orders (38.3%), ₹47.8M sales. Then Credit Card (23.6%), Debit Card (17.5%), Net Banking (9.9%), COD (9.6%), and **Unknown 1.2%** (60 orders with no payment mode, ₹1.04M — kept so totals reconcile).
- **Shipping:** Standard 3,232 orders (₹76.4M) · Express 1,279 (₹32.2M) · Same Day 489 (₹12.8M).
- **Same-Day has the worst rating (★3.91)** vs Express 4.03 / Standard 4.00 → the fastest promise is the least satisfied; check SLA breaches.

## 9. Order Status & Ratings

- Delivered 88.34% (4,417) · Returned 6.96% (348) · Cancelled 4.70% (235)
- Ratings: 5★ 35.2% · 4★ 30.7% · 3★ 13.2% · 2★ 5.9% · 1★ 3.3% → **463 orders (9.3% of all, 10.5% of rated) score 1–2★**
- All 583 cancelled/returned orders have a blank rating — rating is only collected on delivered orders, so rating stats cover 4,417 orders, not 5,000.
- Returned+Cancelled orders carry ₹14.05M of gross sales value — every 1-point reduction in that rate is worth ~₹1.2M recovered revenue.

## 10. Seasonality / Timing

- Best month: **Jan-2024 (₹4.26M)**; weakest: Nov-2024 (₹2.90M). Monthly band: ₹2.9M–4.3M, no strong seasonal spikes (uniform demand).
- Weekday: **Tuesday (₹18.77M) & Saturday (₹18.77M)** strongest; Thursday weakest (₹15.17M).

---

## 11. Key Insights (ranked)

1. **Discounts are the #1 margin lever** — flat ratings across all discount levels; >20% discounts cut margin 32.7%→10.1% (₹0.39M recoverable).
2. **Product concentration:** 4K Monitor + Standing Desk = **41.2% of revenue**.
3. **2026 is flattening** (~₹42.7M annualized) with an AOV dip → need AOV push (bundles).
4. **11.66% order leakage** (cancelled/returned) = ₹14.05M gross at risk, ₹11.58M of it never delivered.
5. **North region margin gap** (26.25% vs East 28.20%).
6. **Same-Day shipping under-delivers** on satisfaction despite being the premium option.
7. **Healthy customer base:** low concentration, broad Pareto (39.3% → 80%).
8. **Data is usable but not spotless:** zero Sales-vs-computed mismatches and zero duplicate Order_IDs, but 40 missing regions, 60 missing payment modes, and 583 blank ratings (all cancelled/returned). Reports label these as Unknown/blank instead of silently dropping rows.

## 12. Recommendations

| # | Action | Expected impact |
|---|---|---|
| R1 | Cap discounts at 10–20%; approval gate for >20% | +₹0.39M profit/period |
| R2 | Bundle 4K Monitor + Laptop Stand + Mechanical Keyboard; Standing Desk + Chair | AOV ₹24.3K → ₹27K+ |
| R3 | Audit North region discount/product mix; replicate East playbook in Central | +0.5–1.0 pt margin |
| R4 | Reduce cancels/returns: pre-dispatch QC on Apparel, address-verification on COD | up to ₹3.92M profit at stake (₹14.05M gross) |
| R5 | Fix Same-Day SLA or re-price it; communicate realistic windows | rating 3.91 → 4.0+ |
| R6 | Loyalty program for the 852 "80%-revenue" customers; corporate upsell for Corporate segment | retention + AOV |
| R7 | Push Home Office segment (highest margin 27.4%) with targeted offers | mix shift → margin |
| R8 | Fix data capture: make Region and Payment_Mode mandatory at order entry | removes 100 Unknown rows |

---

## 13. Files Generated

| File | Purpose |
|---|---|
| `Retail_Sales_Analysis_Report.md` | This report |
| `Retail_Sales_BI_Interactive.html` | ⭐ **Interactive BI dashboard** — 9 working filters (Year, Month, Region, Category, Segment, Payment, Shipping, Status, Rating); KPIs + all charts live update |
| `Retail_Sales_Report_OneSheet.xlsx` | ⭐ **One-sheet Excel report** — filters + KPIs + 6 charts + tables + insights, sab ek sheet me (Data sheet hidden) |
| `Retail_Sales_Dashboard.html` | Static visual dashboard with 3D scroll animations |
| `Retail_Sales_Excel_Report.xlsx` | 16-sheet formatted Excel report (dashboard, 11 analysis sheets, Filter Dashboard, Data Quality, raw table) |
| `Retail_Sales_Cleaned_For_PowerBI.csv` | Cleaned + enriched data (Year, Month, Margin%, Discount bands, flags) for Power BI import |
| `Retail_Sales_PowerBI_Source.xlsx` | Same data + 5 pre-aggregated sheets + Data Quality |
| `PowerBI_DAX_Measures.txt` | Ready-to-paste DAX measures |
| `PowerBI_Theme.json` | Power BI color theme |
| `PowerBI_Report_Guide.md` | Step-by-step Power BI report build guide (5 pages) |
| `analysis_outputs/` | All aggregate CSVs, `KPIs.json`, Data Quality, and 15 charts (PNG) |
| `analysis_common.py` | Shared data-validation + KPI engine (single source of truth) |
| `run_analysis.py` / `build_reports.py` / `build_excel_report.py` / `build_onesheet_bi.py` | Reproducible pipeline scripts |
| `run_all.py` | One command to rebuild every output |
| `tests/test_analysis_common.py` | Regression tests for the KPI engine |
