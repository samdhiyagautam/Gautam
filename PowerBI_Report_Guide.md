# 🟡 Power BI Report Banana — Step-by-Step Guide

Data: `retail_sales_5000_rows.csv` (5,000 orders, Jan 2024 – Oct 2026)

> **Note:** `.pbix` file sirf Power BI Desktop app ke andar se hi ban sakta hai (koi bhi bahar ka tool uske compressed data-model format ko generate nahi kar sakta). Isliye main ne aapko **sab kuch ready kar diya hai** — bas neeche ke steps follow karo, report ~10 minute me ready ho jayegi, bilkul waise jaise design ki hai.

---

## 📁 Ready-made files (jo maine banaye)

| File | Kaam |
|---|---|
| `Retail_Sales_Cleaned_For_PowerBI.csv` | Cleaned data + extra columns (Year, Month_Name, Quarter, YearMonth, Weekday, Profit_Margin_%, Discount_%, Discount_Band, Loss_Flag...) — **isko import karo** |
| `Retail_Sales_PowerBI_Source.xlsx` | Wahi data Excel me + 5 pre-aggregated summary sheets + Data Quality sheet (backup option) |
| `PowerBI_DAX_Measures.txt` | Saare DAX measures copy-paste ke liye |
| `PowerBI_Theme.json` | Color theme (View ▸ Themes ▸ Browse for theme) |
| `Retail_Sales_Excel_Report.xlsx` | ⭐ Client-ready Excel report: Dashboard + 11 analysis sheets + **interactive Filter Dashboard (9 dropdown filters)** + Data Quality + slicer-ready raw table (16 sheets) |
| `Retail_Sales_Report_OneSheet.xlsx` | ⭐ **Single-sheet** Excel report (filters + KPIs + 6 charts + tables + insights ek hi sheet me) |
| `Retail_Sales_BI_Interactive.html` | ⭐ Browser BI dashboard — 9 working filters, live KPIs & charts |

---

## STEP 1 — Data Import (5 min)

1. **Power BI Desktop kholo** → `Blank Report`
2. **Get Data ▸ Text/CSV** → `Retail_Sales_Cleaned_For_PowerBI.csv` → **Load**
   - (Ya Excel wali file lo agar summaries chahiye)
3. **Transform Data** (Power Query) check karo:
   - `Order_Date` ka type **Date** hona chahiye
   - `Customer_Rating`, `Discount`, `Profit_Margin_%` → **Decimal**
   - Sab column names me extra space na ho
4. **Date table banao** (optional but recommended, YoY ke liye):
   ```powerquery
   // Modeling ▸ New Table
   Date_Table =
   ADDCOLUMNS (
       CALENDAR ( DATE(2024,1,1), DATE(2026,12,31) ),
       "Year", YEAR ( [Date] ),
       "Month Name", FORMAT ( [Date], "MMM" ),
       "Month Num", MONTH ( [Date] ),
       "Quarter", "Q" & QUARTER ( [Date] ),
       "YearMonth", FORMAT ( [Date], "YYYY-MM" )
   )
   ```
   Phir: Table view ▸ `Date_Table` pe right-click ▸ **Mark as date table** ▸ `Date` column.
   Relationships me `Fact_Sales[Order_Date]` → `Date_Table[Date]` (Many-to-one) link karo.

## STEP 2 — Measures paste karo (3 min)

`PowerBI_DAX_Measures.txt` kholo → ek-ek measure copy karo → **Modeling ▸ New Measure** → paste → Enter.

Pehle ye 9 zaroori wale paste karo:
`Total Sales`, `Total Profit`, `Total Orders`, `Total Customers`, `Profit Margin %`, `Avg Order Value`, `Avg Rating`, `Cancelled or Returned %`, `Net Sales (Delivered)`

Formatting: har money measure pe right-click ▸ Display units = **Millions**, 2 decimals; % measures ko **Percentage** format.

## STEP 3 — Theme lagao (30 sec)

**View ribbon ▸ Themes ▸ ▼ ▸ Browse for theme** → `PowerBI_Theme.json` select karo. Pura report brand colors (#2563eb blue, #16a34a green) me aa jayega.

---

## 🖼️ STEP 4 — 5 Pages ki Design (jo maine plan ki hai)

### PAGE 1 — "Executive Overview" 🎯
**Slicers (top strip):** Year (dropdown), Region, Category, Customer_Segment

| KPI Cards (row of 5) | Chart (below) |
|---|---|
| Total Sales \| Total Profit \| Profit Margin % \| Total Orders \| Avg Rating | **Line chart**: X = YearMonth, Y = Total Sales aur Total Profit (secondary) |
| | **Map/Filled map**: Region (location) ▸ Total Sales (size) |

### PAGE 2 — "Category & Products" 📦
- **Bar chart:** Category ▸ Total Sales + Total Profit
- **Treemap:** Product_Name ▸ Total Sales (top products dikhte hain)
- **Table:** Top 10 products — columns: Product, Sales, Profit, Margin %, Rating (visual level filter: Top 10 by Total Sales)
- **Matrix:** Rows = Category ▸ Product, Values = Sales, Profit, Margin %

### PAGE 3 — "Regional & Customers" 🗺️
- **Filled map:** Region ▸ Total Sales
- **100% stacked bar:** Region ▸ Customer_Segment share
- **Bar chart:** Customer_Segment ▸ Sales & Margin %
- **Table:** Top 10 customers (`Customer Rank` measure use karo)

### PAGE 4 — "Discount & Margin Analysis" ⚠️ (sabse important)
- **Column chart:** Discount_Band ▸ Total Orders
- **Line+column combo:** X = Discount_Band, Column = Sales, Line = Profit Margin %
- **Scatter:** X = Avg Discount %, Y = Profit Margin %, Size = Sales, Legend = Category
- Insight text box: *"Ratings discount ke saath nahi badhti — >20% discount margin 32.7% → 10.1% kar deta hai"*

### PAGE 5 — "Order Quality & Fulfilment" ✅
- **Donut:** Order_Status ▸ Orders (Delivered/Returned/Cancelled)
- **Column:** Payment_Mode ▸ Sales
- **Bar:** Shipping_Mode ▸ Orders + Avg Rating (tooltip)
- **Column:** Customer_Rating (axis) ▸ Orders
- **Gauge:** `Cancelled or Returned %` target 8% (abhi 11.7%)

## STEP 5 — Interactivity polish

1. **Cross-filtering on rakho** (default) — ek chart pe click dusre me filter karega
2. **Edit interactions** se Page-1 cards ko sirf slicers se filter karo
3. Har page pe **Bookmarks** (Reset filters button) bana sakte ho
4. **Publish:** File ▸ Publish ▸ Power BI Service (login chahiye) → dashboard share

---

## 🎛️ STEP 6 — ALL TYPES OF FILTERS (complete setup)

### A) Slicers — har type (Page 1 aur naye "Filters Panel" page pe)

Visual select karke **Format ▸ Edit interactions** bhi set karo. Ye slicers add karo:

| Slicer type | Field | Style | Kahan |
|---|---|---|---|
| Dropdown slicer | `Year` | Dropdown | Page 1 top strip |
| List slicer | `Region` | Tiles/Vertical list | Filters Panel |
| List slicer | `Category` | Tiles (horizontal) | Filters Panel |
| Hierarchy slicer | Year ▸ Quarter ▸ Month_Name | Expand/collapse | Filters Panel |
| Date range slicer | `Date_Table[Date]` | Between (calendar) | Filters Panel |
| Numeric range slicer | `Discount_%` | Between (slider) | Discount page |
| Numeric range slicer | `Sales` | Greater than | Filters Panel |
| List slicer | `Payment_Mode`, `Shipping_Mode`, `Order_Status`, `Discount_Band` | Dropdown | Filters Panel |
| List slicer | `Customer_Rating` | Tiles ★1-★5 | Status & Ratings page |
| N-free filter | `Customer_ID` | Dropdown + search | Top Customers |

**Slicer best practices:**
- Saare slicers select karke → **View ▸ Sync slicers** → sab pages pe same filter chalega
- Slicer header on, "Select all" option ON (dropdown style me auto hota hai)
- `Single select` ON karo jahan multiple selection confusion kare

### B) Filter Pane — 3 levels (Filters ▸ open karke)

1. **Visual-level filter:** sirf ek visual pe — e.g. Products table pe `Total Sales` filter → **Top N = 10 by Total Sales**
2. **Page-level filter:** poore page pe — e.g. Page 5 pe `Order_Status is not Cancelled` (ya jo chaho)
3. **Report-level filter:** poore report pe — e.g. `Order_Status = "Delivered"` default (ya `Loss_Flag = FALSE`)
4. **Drillthrough filter:** Top Customers table pe right-click ▸ Drillthrough → "Customer Detail" page banao (customer ke saare orders)

### C) Interactivity controls

- **Format ▸ Edit interactions:** har visual pe Filter / Highlight / None set karo (KPI cards ko usually **None** rakho)
- **Bookmarks:** "Reset Filters" button banao — saare slicers `All` karke bookmark save karo, ek button se reset
- **Buttons ▸ Action:** Clear selection, Back (drillthrough), Bookmark navigation

### D) "Filters Panel" PAGE design (naya page 0)

Left side (1/3 width): saare slicers upar wale table ke hisaab se stacked
Right side: ek **Card** with "Filtered KPIs" + note box
Ye page ko **Hide** mat karo — users ke liye filter hub ban jayega. Ya har page pe sync kiya hua ek mini Year+Region slicer rakho.

---

## ⚠️ Data quality — pehle ye jaan lo

| Issue | Count | Report me kaise handle hua |
|---|---|---|
| Missing `Region` | 40 orders (₹830,248.59 sales) | `Unknown` label, totals me included |
| Missing `Payment_Mode` | 60 orders (₹1,039,274.49 sales) | `Unknown` label, totals me included |
| Missing `Customer_Rating` | 583 orders | Blank rakha — ye exactly wahi orders hain jo Cancelled/Returned hain |
| Duplicate `Order_ID` | 0 | — |
| Sales formula mismatches | 0 | — |

Isliye Power BI me `Region`/`Payment_Mode` ke slicers me **Unknown** bhi dikhega — use hide mat karo, warna totals kam ho jayenge. Rating visuals 4,417 rated orders par based hain, 5,000 par nahi.

## ✅ Report kholne ke baad verify karo (numbers match hone chahiye)

| Check | Sahi value |
|---|---|
| Total Sales card | **₹121,379,792** (₹121.38M / ₹12.14 Cr) |
| Net Sales (Delivered) | **₹107,326,781** (88.4% of gross) |
| Total Orders | **5,000** |
| Customers | **2,167** |
| Margin % | **27.04%** (delivered: 26.92%) |
| Cancelled or Returned % | **11.66%** (583 orders) |
| Avg Rating | **4.00** (from 4,417 rated orders) |
| Date range | 2024-01-01 → 2026-10-31 |

Agar ye match kar gaye → Power BI report sahi bana hai. 🎉
