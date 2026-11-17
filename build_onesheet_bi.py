# -*- coding: utf-8 -*-
"""Single-sheet Excel report + interactive filtered HTML BI dashboard."""
import os
import json
import pandas as pd
import numpy as np
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.chart import BarChart, LineChart, PieChart, Reference
from openpyxl.chart.label import DataLabelList
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import DataBarRule
from openpyxl.drawing.fill import PatternFillProperties
from openpyxl.chart.marker import Marker

import analysis_common as ac

BASE = ac.BASE
OUT = ac.OUT

df = ac.load_clean()
kpis = ac.load_kpis()

BLUE = "2563EB"; GREEN = "16A34A"; ORANGE = "F59E0B"; RED = "DC2626"
PURPLE = "7C3AED"; INK = "0F172A"; MUTED = "64748B"
hf = PatternFill("solid", fgColor=BLUE)
hfont = Font(bold=True, color="FFFFFF", size=10)
thin = Side(style="thin", color="E2E8F0")
border = Border(left=thin, right=thin, top=thin, bottom=thin)
center = Alignment(horizontal="center", vertical="center")
MONEY = '#,##0'; PCT = '0.0"%"'

wb = Workbook()
ws = wb.active
ws.title = "Sales Report"
ws.sheet_view.showGridLines = False

# ---------------------------------------------------------------- hidden data sheet
d = wb.create_sheet("Data")
raw = df.drop(columns=["Expected_Sales"], errors="ignore")
for j, col in enumerate(raw.columns, start=1):
    d.cell(row=1, column=j, value=col)
for i, vals in enumerate(raw.itertuples(index=False), start=2):
    for j, v in enumerate(vals, start=1):
        d.cell(row=i, column=j, value=ac.excel_value(v))
N = 1 + len(raw)
COL = {name: get_column_letter(i + 1) for i, name in enumerate(raw.columns)}
_missing = [key for key in ("Order_ID", "Customer_ID", "Customer_Segment", "Region", "Category",
                            "Product_Name", "Quantity", "Sales", "Profit", "Payment_Mode",
                            "Shipping_Mode", "Order_Status", "Customer_Rating", "Year",
                            "Month_Name", "Quarter", "Discount_%") if key not in COL]
if _missing:
    raise KeyError(f"Data sheet is missing column(s): {_missing}")

def put_table(ds, start_col, header, rows):
    c0 = start_col
    for j, h in enumerate(header):
        cell = ds.cell(row=1, column=c0 + j, value=h)
        cell.font = Font(bold=True, size=9)
    for i, r in enumerate(rows, start=2):
        for j, v in enumerate(r):
            cell = ds.cell(row=i, column=c0 + j, value=ac.excel_value(v))
            cell.font = Font(size=9)
            if isinstance(v, float):
                cell.number_format = '#,##0.00'
    return c0, c0 + len(header) - 1, 1 + len(rows)

mon = df.groupby("YearMonth").agg(Sales=("Sales", "sum"), Profit=("Profit", "sum"), Orders=("Order_ID", "count")).reset_index()
m1 = put_table(d, 31, ["Month", "Sales", "Profit", "Orders"], mon.values.tolist())
cat = df.groupby("Category").agg(Sales=("Sales", "sum"), Profit=("Profit", "sum"), Orders=("Order_ID", "count")).reset_index()
cat["Margin"] = cat["Profit"] / cat["Sales"] * 100
cat = cat.sort_values("Sales", ascending=False)
c1 = put_table(d, 36, ["Category", "Sales", "Profit", "Margin", "Orders"], cat.values.tolist())
reg = df.groupby("Region").agg(Sales=("Sales", "sum"), Profit=("Profit", "sum"), Orders=("Order_ID", "count")).reset_index()
reg["Margin"] = reg["Profit"] / reg["Sales"] * 100
reg = reg.sort_values("Sales", ascending=False)
r1 = put_table(d, 43, ["Region", "Sales", "Profit", "Margin", "Orders"], reg.values.tolist())
seg = df.groupby("Customer_Segment").agg(Sales=("Sales", "sum"), Orders=("Order_ID", "count")).reset_index().sort_values("Sales", ascending=False)
s1 = put_table(d, 49, ["Segment", "Sales", "Orders"], seg.values.tolist())
disc = df.groupby("Discount_Band", observed=True).agg(Orders=("Order_ID", "count"), Profit=("Profit", "sum"), Sales=("Sales", "sum")).reset_index()
disc["Margin"] = disc["Profit"] / disc["Sales"] * 100
d1 = put_table(d, 53, ["Band", "Orders", "Margin"], disc[["Discount_Band", "Orders", "Margin"]].values.tolist())
rt = df.groupby("Customer_Rating").agg(Orders=("Order_ID", "count")).reset_index()
t1 = put_table(d, 57, ["Rating", "Orders"], rt.values.tolist())
st = df.groupby("Order_Status").agg(Orders=("Order_ID", "count")).reset_index().sort_values("Orders", ascending=False)
st1 = put_table(d, 60, ["Status", "Orders"], st.values.tolist())
prod = df.groupby("Product_Name").agg(Sales=("Sales", "sum")).reset_index().sort_values("Sales", ascending=False).head(10)
p1 = put_table(d, 63, ["Product", "Sales"], prod.values.tolist())

d.column_dimensions.group("AA", "BP", hidden=True)
d.sheet_state = "hidden"

# ---------------------------------------------------------------- report sheet layout
ws["B2"] = "RETAIL SALES — EXECUTIVE REPORT"
ws["B2"].font = Font(bold=True, size=22, color=INK)
ws.merge_cells("B2:P2")
ws["B3"] = (f"{kpis['total_records']:,} orders  •  "
            f"{pd.Timestamp(kpis['date_min']):%b %Y} – {pd.Timestamp(kpis['date_max']):%b %Y}  •  "
            f"₹ INR  •  Filters below (B5:M5) — KPIs update live")
ws["B3"].font = Font(color=MUTED, size=10)
ws.merge_cells("B3:P3")
ws.row_dimensions[2].height = 32
ws.column_dimensions["A"].width = 2
for col in "BCDEFGHIJKLMNOP":
    ws.column_dimensions[col].width = 13.5

# ---- filters
fd = [("Year", "B", ["All"] + [str(int(x)) for x in sorted(df["Year"].unique())]),
      ("Month", "D", ["All"] + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]),
      ("Region", "F", ["All"] + sorted(df["Region"].unique().tolist())),
      ("Category", "H", ["All"] + sorted(df["Category"].unique().tolist())),
      ("Segment", "J", ["All"] + sorted(df["Customer_Segment"].unique().tolist())),
      ("Status", "L", ["All"] + sorted(df["Order_Status"].unique().tolist()))]
for label, col, vals in fd:
    cidx = ord(col) - 64
    lab = ws.cell(row=4, column=cidx - 1, value=label)
    lab.fill = PatternFill("solid", fgColor=ORANGE); lab.font = Font(bold=True, color="FFFFFF", size=9)
    lab.alignment = center
    ws.merge_cells(start_row=4, start_column=cidx - 1, end_row=4, end_column=cidx)
    v = ws.cell(row=5, column=cidx - 1, value="All")
    v.font = Font(bold=True, size=10); v.alignment = center
    v.fill = PatternFill("solid", fgColor="FFF7ED"); v.border = border
    ws.merge_cells(start_row=5, start_column=cidx - 1, end_row=5, end_column=cidx)
    dv = DataValidation(type="list", formula1='"' + ",".join(vals) + '"', allow_blank=False)
    ws.add_data_validation(dv); dv.add(v)

# condition string over Data sheet
def conds(exclude=None, boolean=False):
    parts = []
    fmap = {"Year": ("B", "Year"), "Month": ("D", "Month_Name"), "Region": ("F", "Region"),
            "Category": ("H", "Category"), "Segment": ("J", "Customer_Segment"), "Status": ("L", "Order_Status")}
    for name, (cellcol, dc) in fmap.items():
        if name == exclude:
            continue
        ref = f"${cellcol}$5"
        rng = f"Data!${COL[dc]}$2:${COL[dc]}${N}"
        if name == "Year":  # dropdown text vs numeric year -> text compare
            parts.append(f'((({ref}="All")+(({rng}&"")={ref}))>0)')
        else:
            parts.append(f'((({ref}="All")+(({rng})={ref}))>0)')
    expression = "*".join(parts)
    return f"({expression})=1" if boolean else expression


COND = conds()
_sales_ref = f"Data!${COL['Sales']}$2:${COL['Sales']}${N}"
_profit_ref = f"Data!${COL['Profit']}$2:${COL['Profit']}${N}"
_customer_ref = f"Data!${COL['Customer_ID']}$2:${COL['Customer_ID']}${N}"

# ---- KPI cards
kpi_cards = [
    ("TOTAL SALES", f"=SUMPRODUCT({_sales_ref}*{COND})", MONEY, BLUE),
    ("TOTAL PROFIT", f"=SUMPRODUCT({_profit_ref}*{COND})", MONEY, GREEN),
    ("MARGIN %", "=IFERROR(D8/B8,0)", '0.0%', PURPLE),
    ("ORDERS", f"=SUMPRODUCT({COND})", '#,##0', ORANGE),
    ("AVG ORDER VALUE", "=IFERROR(B8/H8,0)", MONEY, "0891B2"),
    ("CUSTOMERS", f'=IFERROR(ROWS(UNIQUE(FILTER({_customer_ref},{conds(boolean=True)}))),"—")',
     '#,##0', RED),
]
kcols = ["B", "D", "F", "H", "J", "L"]   # merged pairs -> B:C, D:E, F:G, H:I, J:K, L:M
for (label, formula, fmt, color), kc in zip(kpi_cards, kcols):
    ci = ord(kc) - 64
    lab = ws.cell(row=7, column=ci, value=label)
    lab.fill = PatternFill("solid", fgColor=color)
    lab.font = Font(bold=True, color="FFFFFF", size=9); lab.alignment = center
    ws.merge_cells(start_row=7, start_column=ci, end_row=7, end_column=ci + 1)
    v = ws.cell(row=8, column=ci, value=formula)
    v.number_format = fmt; v.font = Font(bold=True, size=16, color=color); v.alignment = center
    ws.merge_cells(start_row=8, start_column=ci, end_row=8, end_column=ci + 1)
    for rr in (7, 8):
        for cc in (ci, ci + 1):
            ws.cell(row=rr, column=cc).border = border
ws.row_dimensions[7].height = 18; ws.row_dimensions[8].height = 24

# ---- charts
def style_chart(ch, title, w, h):
    ch.title = title; ch.height = h; ch.width = w
    ch.style = 10
    ch.legend.position = "b" if ch.__class__ is not PieChart else "r"

# monthly line
lc = LineChart(); style_chart(lc, "Monthly Sales & Profit", 17, 8.2)
data = Reference(d, min_col=32, max_col=33, min_row=1, max_row=m1[2])
cats = Reference(d, min_col=31, min_row=2, max_row=m1[2])
lc.add_data(data, titles_from_data=True); lc.set_categories(cats)
lc.y_axis.numFmt = '#,##0,,."M"'
ws.add_chart(lc, "B10")

# category bar
bc = BarChart(); bc.type = "bar"; style_chart(bc, "Sales by Category", 12.5, 8.2)
bc.add_data(Reference(d, min_col=37, min_row=1, max_row=c1[2]), titles_from_data=True)
bc.set_categories(Reference(d, min_col=36, min_row=2, max_row=c1[2]))
bc.dataLabels = DataLabelList(); bc.dataLabels.showVal = True
ws.add_chart(bc, "J10")

# segment pie
pc = PieChart(); style_chart(pc, "Segment Share", 9, 8.2)
pc.add_data(Reference(d, min_col=50, min_row=1, max_row=s1[2]), titles_from_data=True)
pc.set_categories(Reference(d, min_col=49, min_row=2, max_row=s1[2]))
pc.dataLabels = DataLabelList(); pc.dataLabels.showPercent = True
ws.add_chart(pc, "R10")

# region column
bc2 = BarChart(); bc2.type = "col"; style_chart(bc2, "Sales by Region", 12.5, 8.2)
bc2.add_data(Reference(d, min_col=44, min_row=1, max_row=r1[2]), titles_from_data=True)
bc2.set_categories(Reference(d, min_col=43, min_row=2, max_row=r1[2]))
bc2.dataLabels = DataLabelList(); bc2.dataLabels.showVal = True
ws.add_chart(bc2, "B30")

# discount margin
bc3 = BarChart(); bc3.type = "col"; style_chart(bc3, "Margin % by Discount Band", 12.5, 8.2)
bc3.add_data(Reference(d, min_col=55, min_row=1, max_row=d1[2]), titles_from_data=True)
bc3.set_categories(Reference(d, min_col=53, min_row=2, max_row=d1[2]))
bc3.dataLabels = DataLabelList(); bc3.dataLabels.showVal = True
ws.add_chart(bc3, "J30")

# rating column
bc4 = BarChart(); bc4.type = "col"; style_chart(bc4, "Orders by Rating", 9, 8.2)
bc4.add_data(Reference(d, min_col=58, min_row=1, max_row=t1[2]), titles_from_data=True)
bc4.set_categories(Reference(d, min_col=57, min_row=2, max_row=t1[2]))
ws.add_chart(bc4, "R30")

# ---- live filter breakdown table (rows 50..)
tr = 50
ws.cell(row=tr, column=2, value="FILTERED BREAKDOWN (live, follows the filters)").font = Font(bold=True, size=11, color=INK)
hdr = ["Category", "Sales", "Profit", "Margin %", "Orders"]
for j, h in enumerate(hdr, start=2):
    c = ws.cell(row=tr + 1, column=j, value=h)
    c.fill = hf; c.font = hfont; c.alignment = center; c.border = border
cats_list = cat["Category"].tolist()
for i, cn in enumerate(cats_list, start=1):
    rr = tr + 1 + i
    safe_cn = str(cn).replace('"', '""')
    cc = (conds(exclude="Category")
          + f'*(Data!${COL["Category"]}$2:${COL["Category"]}${N}="{safe_cn}")')
    ws.cell(row=rr, column=2, value=cn)
    ws.cell(row=rr, column=3, value=f"=SUMPRODUCT({_sales_ref}*{cc})").number_format = MONEY
    ws.cell(row=rr, column=4, value=f"=SUMPRODUCT({_profit_ref}*{cc})").number_format = MONEY
    ws.cell(row=rr, column=5, value=f"=IFERROR(D{rr}/C{rr},0)").number_format = '0.0%'
    ws.cell(row=rr, column=6, value=f"=SUMPRODUCT({cc})").number_format = '#,##0'
    for c2 in range(2, 7):
        ws.cell(row=rr, column=c2).border = border
end_row = tr + 1 + len(cats_list)
ws.conditional_formatting.add(f"C{tr+2}:C{end_row}",
    DataBarRule(start_type="num", start_value=0, end_type="max", color=BLUE, showValue=True))

# ---- static tables right side (rows 50..)
def table_block(start_col, title, hdr, rows, money=()):
    ci = ord(start_col) - 64
    t = ws.cell(row=tr, column=ci, value=title)
    t.font = Font(bold=True, size=11, color=INK)
    for j, h in enumerate(hdr):
        c = ws.cell(row=tr + 1, column=ci + j, value=h)
        c.fill = hf; c.font = hfont; c.alignment = center; c.border = border
    for i, row_vals in enumerate(rows, start=2):
        for j, v in enumerate(row_vals):
            c = ws.cell(row=tr + i, column=ci + j, value=v)
            c.border = border
            if hdr[j] in money:
                c.number_format = MONEY
            if i % 2 == 0:
                c.fill = PatternFill("solid", fgColor="F8FAFC")

ym = df.groupby(["Year", "Month_Name"]).agg(Sales=("Sales", "sum"), Profit=("Profit", "sum"), Orders=("Order_ID", "count")).reset_index()
yearly = df.groupby("Year").agg(Sales=("Sales", "sum"), Profit=("Profit", "sum"), Orders=("Order_ID", "count")).reset_index()
yearly["Margin"] = yearly["Profit"] / yearly["Sales"] * 100
table_block("H", "YEARLY PERFORMANCE", ["Year", "Sales", "Profit", "Margin %", "Orders"],
            yearly.values.tolist(), money=("Sales", "Profit"))
table_block("N", "TOP 10 PRODUCTS", ["Product", "Sales"],
            prod.values.tolist(), money=("Sales",))

# ---- insights block
ir = end_row + 2
ws.cell(row=ir, column=2, value="KEY INSIGHTS").font = Font(bold=True, size=12, color=INK)
known_reg = reg[reg["Region"] != "Unknown"].sort_values("Margin", ascending=False)
best_reg, worst_reg = known_reg.iloc[0], known_reg.iloc[-1]
cat_share = cat.iloc[0]["Sales"] / cat["Sales"].sum() * 100
insights = [
    (f"Discounts don't buy satisfaction (rating ~{kpis['avg_rating']:.2f} at all levels), "
     f"but the >20% band earns {kpis['margin_gt20pct']:.1f}% margin vs "
     f"{kpis['margin_0pct']:.1f}% at 0% discount."),
    (f"2025 grew +{kpis['yoy_growth_2025_pct']:.1f}% YoY; 2026 annualizes to "
     f"{ac.cr(kpis['annualized_2026'] or 0)} (roughly flat). {cat.iloc[0]['Category']} = "
     f"{cat_share:.1f}% of sales; {kpis['top_product']} alone = "
     f"{kpis['top_product_share_pct']:.1f}%."),
    (f"{best_reg['Region']} has the best margin "
     f"({best_reg['Margin']:.1f}%), {worst_reg['Region']} the weakest ({worst_reg['Margin']:.1f}%). "
     f"{kpis['cancelled_returned_pct']:.1f}% of orders were cancelled/returned = "
     f"{ac.cr(kpis['leakage_sales'])} gross sales."),
    (f"Top-10 customers are only {kpis['top10_customer_share_pct']:.1f}% of sales (low risk); "
     f"{kpis['pareto_pct_of_customers']:.1f}% of customers generate 80% of revenue. "
     f"Data quality: {kpis['unknown_region_orders']} missing regions and "
     f"{kpis['unknown_payment_orders']} missing payment modes are shown as Unknown."),
]
for i, txt in enumerate(insights):
    r0 = ir + 1 + i
    ws.merge_cells(start_row=r0, start_column=2, end_row=r0, end_column=16)
    c = ws.cell(row=r0, column=2, value=f"{i+1}. {txt}")
    c.font = Font(size=10, color=INK)
    c.fill = PatternFill("solid", fgColor="FFFBEB")
    c.alignment = Alignment(wrap_text=True, vertical="center")
    ws.row_dimensions[r0].height = 18

ws.freeze_panes = "A6"
xl1 = os.path.join(BASE, "Retail_Sales_Report_OneSheet.xlsx")
wb.save(xl1)
print("Saved:", xl1)

# ================================================================ INTERACTIVE HTML BI
sub = df[["Order_Date", "Year", "Month_Name", "Region", "Category", "Customer_Segment",
          "Product_Name", "Quantity", "Sales", "Profit", "Discount_%", "Payment_Mode",
          "Shipping_Mode", "Order_Status", "Customer_Rating"]].copy()
sub["ym"] = df["Order_Date"].dt.strftime("%Y-%m")
sub["Order_Date"] = sub["Order_Date"].dt.strftime("%Y-%m-%d")
cols = ["d", "y", "m", "reg", "cat", "seg", "prod", "qty", "sales", "profit", "disc", "pay", "ship", "status", "rating", "ym"]
rows = []
for d, y, m, reg, cat, seg, prod, qty, sales, profit, disc, pay, ship, status, rating, ym in sub.itertuples(index=False, name=None):
    rows.append([d, int(y), m, reg, cat, seg, prod, int(qty), round(float(sales), 2),
                 round(float(profit), 2), round(float(disc), 2), pay,
                 ship, status, None if pd.isna(rating) else float(rating), ym])
# json.dumps would emit NaN (invalid JSON); the None above keeps it valid.
data_json = json.dumps({"c": cols, "r": rows}, separators=(",", ":"), allow_nan=False)
# Prevent a product/category name from closing the inline <script> block.
data_json = data_json.replace("<", "\\u003c").replace(">", "\\u003e").replace("&", "\\u0026")

HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Retail Sales BI Dashboard</title>
<style>
:root{--blue:#2563eb;--green:#16a34a;--orange:#f59e0b;--red:#dc2626;--purple:#7c3aed;--cyan:#0891b2;
--ink:#0f172a;--muted:#64748b;--bg:#eef2f7;--card:#fff;}
*{box-sizing:border-box;margin:0;padding:0;font-family:'Segoe UI',system-ui,sans-serif}
body{background:var(--bg);color:var(--ink)}
.top{background:linear-gradient(100deg,#0f2a63,#2563eb 60%,#3b82f6);padding:16px 26px;color:#fff;
display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px}
.top h1{font-size:20px;letter-spacing:.2px}
.top .sub{font-size:12px;opacity:.85;margin-top:2px}
.chip{background:rgba(255,255,255,.16);padding:6px 12px;border-radius:999px;font-size:11.5px}
.wrap{max-width:1500px;margin:0 auto;padding:16px 22px 40px}
.filters{background:var(--card);border-radius:14px;padding:12px 14px;box-shadow:0 1px 5px rgba(15,23,42,.09);
display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-bottom:14px;position:sticky;top:8px;z-index:5}
.f{display:flex;flex-direction:column;gap:3px}
.f label{font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);font-weight:700}
.f select{appearance:none;border:1px solid #d8e0ea;border-radius:8px;padding:7px 26px 7px 9px;font-size:12px;
background:#fff url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6'><path d='M0 0l5 6 5-6z' fill='%2364748b'/></svg>") no-repeat right 8px center;
font-weight:600;color:var(--ink);min-width:105px;cursor:pointer}
.f select:focus{outline:2px solid #93c5fd;border-color:#93c5fd}
.reset{border:none;background:#0f172a;color:#fff;border-radius:8px;padding:8px 16px;font-size:12px;
font-weight:700;cursor:pointer;transition:.15s}
.reset:hover{background:#1e293b}
.active{display:flex;gap:6px;flex-wrap:wrap;align-items:center;flex:1;justify-content:flex-end}
.tag{background:#dbeafe;color:#1e40af;border-radius:999px;padding:3px 10px;font-size:11px;font-weight:700;
display:flex;gap:5px;align-items:center}
.tag b{cursor:pointer;color:#1d4ed8}
.kpis{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-bottom:14px}
.kpi{background:var(--card);border-radius:13px;padding:13px 15px;box-shadow:0 1px 5px rgba(15,23,42,.09);
border-left:4px solid var(--blue);transition:transform .12s}
.kpi:hover{transform:translateY(-2px)}
.kpi .l{font-size:10px;letter-spacing:.5px;color:var(--muted);font-weight:700;text-transform:uppercase}
.kpi .v{font-size:20px;font-weight:800;margin-top:3px}
.kpi .d{font-size:10.5px;color:var(--muted);margin-top:2px}
.grid{display:grid;grid-template-columns:repeat(12,1fr);gap:12px}
.card{background:var(--card);border-radius:13px;padding:12px 14px;box-shadow:0 1px 5px rgba(15,23,42,.09)}
.card h3{font-size:12.5px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center}
.card h3 span{font-size:10px;color:var(--muted);font-weight:500}
.s4{grid-column:span 4}.s5{grid-column:span 5}.s6{grid-column:span 6}.s7{grid-column:span 7}.s8{grid-column:span 8}.s12{grid-column:span 12}
canvas{width:100%;display:block}
table{width:100%;border-collapse:collapse;font-size:11.5px}
th{background:#eff6ff;color:#1e40af;text-align:left;padding:5px 8px;font-size:10.5px;text-transform:uppercase;letter-spacing:.3px}
td{padding:4px 8px;border-bottom:1px solid #eef2f7}
tr:hover td{background:#f8fafc}
.num{text-align:right;font-variant-numeric:tabular-nums}
.pos{color:var(--green);font-weight:700}.neg{color:var(--red);font-weight:700}
.empty{color:var(--muted);font-size:12px;text-align:center;padding:14px}
footer{text-align:center;color:var(--muted);font-size:11px;padding:20px}
@media(max-width:1100px){.kpis{grid-template-columns:repeat(3,1fr)}.s4,.s5,.s6,.s7,.s8{grid-column:span 12}}
</style>
</head>
<body>
<div class="top">
  <div><h1>&#128202; Retail Sales — BI Dashboard</h1>
  <div class="sub">__ROWS__ orders &bull; __DATE_MIN__ – __DATE_MAX__ &bull; live filters &bull; ₹ INR</div></div>
  <div class="chip" id="rowsChip">__ROWS__ rows</div>
</div>
<div class="wrap">
<div class="filters" id="filterBar">
  <div class="f"><label>Year</label><select id="fYear"></select></div>
  <div class="f"><label>Month</label><select id="fMonth"></select></div>
  <div class="f"><label>Region</label><select id="fRegion"></select></div>
  <div class="f"><label>Category</label><select id="fCategory"></select></div>
  <div class="f"><label>Segment</label><select id="fSegment"></select></div>
  <div class="f"><label>Payment</label><select id="fPayment"></select></div>
  <div class="f"><label>Shipping</label><select id="fShipping"></select></div>
  <div class="f"><label>Status</label><select id="fStatus"></select></div>
  <div class="f"><label>Rating</label><select id="fRating"></select></div>
  <button class="reset" id="resetBtn">Reset</button>
  <div class="active" id="activeTags"></div>
</div>

<div class="kpis" id="kpis"></div>

<div class="grid">
  <div class="card s7"><h3>Monthly Sales &amp; Profit <span id="trendNote"></span></h3><canvas id="cTrend" height="215"></canvas></div>
  <div class="card s5"><h3>Sales by Category</h3><canvas id="cCat" height="215"></canvas></div>
  <div class="card s4"><h3>Margin % by Discount Band</h3><canvas id="cDisc" height="195"></canvas></div>
  <div class="card s4"><h3>Sales by Region</h3><canvas id="cReg" height="195"></canvas></div>
  <div class="card s4"><h3>Segment Share</h3><canvas id="cSeg" height="195"></canvas></div>
  <div class="card s6"><h3>Top 10 Products <span>by sales</span></h3><div id="tblProd"></div></div>
  <div class="card s6"><h3>Order Status &amp; Ratings</h3>
     <canvas id="cStatus" height="110" style="margin-bottom:6px"></canvas>
     <div id="tblStatus"></div>
  </div>
  <div class="card s12"><h3>Category × Region &mdash; Sales Heatmap <span>₹ in millions</span></h3><div id="heat"></div></div>
</div>
<footer>Filters recompute the whole dataset live &bull; Generated from retail_sales_5000_rows.csv</footer>
</div>

<script>
const D = __DATA__;
const COLS = D.c, ROWS = D.r;
const idx = {}; COLS.forEach((c,i)=>idx[c]=i);
const get = (r,k)=>r[idx[k]];
const fmtM = v => (v>=1e7?(v/1e7).toFixed(2)+" Cr": (v/1e6).toFixed(2)+" M");
const fmtN = v => v.toLocaleString('en-IN',{maximumFractionDigits:0});
const fmtP = v => (isFinite(v)?v.toFixed(1):"0")+"%";
const uniq = a => [...new Set(a)].filter(x=>x!==undefined&&x!==null&&x!=="");
const esc = s => String(s).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const sel = id => document.getElementById(id);

const FILTERS = [
  ["fYear","y", r=>String(get(r,"y"))],
  ["fMonth","m", r=>get(r,"m")],
  ["fRegion","reg", r=>get(r,"reg")],
  ["fCategory","cat", r=>get(r,"cat")],
  ["fSegment","seg", r=>get(r,"seg")],
  ["fPayment","pay", r=>get(r,"pay")],
  ["fShipping","ship", r=>get(r,"ship")],
  ["fStatus","status", r=>get(r,"status")],
  ["fRating","rating", r=>get(r,"rating")===null||get(r,"rating")===undefined?"":String(get(r,"rating"))],
];
const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
FILTERS.forEach(([id,key,fn])=>{
  const s=sel(id); let vals=uniq(ROWS.map(fn));
  if(key==="m") vals=MONTHS.filter(m=>vals.includes(m));
  if(key==="rating") vals.sort((a,b)=>Number(a)-Number(b));
  s.innerHTML='<option value="">All</option>'+vals.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join("");
});
function state(){const o={};FILTERS.forEach(([id,key])=>{o[key]=sel(id).value});return o}
function filtered(){
  const s=state();
  return ROWS.filter(r=>FILTERS.every(([id,key,fn])=>!s[key]||String(fn(r))===s[key]));
}

function color(i){return ["#2563eb","#16a34a","#f59e0b","#dc2626","#7c3aed","#0891b2","#db2777","#65a30d","#ea580c","#4f46e5"][i%10]}

// ---------------- drawing helpers (pure canvas)
function prep(cv,h){
  const dpr=window.devicePixelRatio||1, w=cv.clientWidth||cv.parentElement.clientWidth;
  cv.width=w*dpr; cv.height=h*dpr; cv.style.height=h+"px";
  const ctx=cv.getContext("2d"); ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
  return {ctx,w,h};
}
function axis(ctx,x1,y1,x2,y2,labels,vals,fmt){
  ctx.strokeStyle="#e2e8f0"; ctx.lineWidth=1;
  for(let i=0;i<=4;i++){const y=y2-(y2-y1)*i/4;ctx.beginPath();ctx.moveTo(x1,y);ctx.lineTo(x2,y);ctx.stroke();}
  ctx.fillStyle="#64748b"; ctx.font="10px Segoe UI"; ctx.textAlign="right";
  for(let i=0;i<=4;i++){const y=y2-(y2-y1)*i/4;const v=vals.max*i/4;ctx.fillText(fmt?fmt(v):fmtN(v),x1-6,y+3);}
}
function lineChart(cv,labels,series){
  const {ctx,w,h}=prep(cv,215);
  const pad={l:52,r:12,t:10,b:34}, x1=pad.l,y1=pad.t,x2=w-pad.r,y2=h-pad.b;
  let max=0; series.forEach(s=>s.data.forEach(v=>max=Math.max(max,v))); max=max||1;
  axis(ctx,x1,y1,x2,y2,null,{max},v=>fmtM(v));
  const n=labels.length, step=(x2-x1)/Math.max(n-1,1);
  series.forEach((s,si)=>{
    ctx.strokeStyle=s.color;ctx.lineWidth=2;ctx.beginPath();
    s.data.forEach((v,i)=>{const x=x1+i*step,y=y2-(v/max)*(y2-y1);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();
    ctx.fillStyle=s.color;
    s.data.forEach((v,i)=>{const x=x1+i*step,y=y2-(v/max)*(y2-y1);ctx.beginPath();ctx.arc(x,y,1.8,0,7);ctx.fill();});
  });
  ctx.fillStyle="#64748b";ctx.font="10px Segoe UI";ctx.textAlign="center";
  const every=Math.ceil(n/8);
  labels.forEach((lb,i)=>{if(i%every===0||i===n-1){const x=x1+i*step;ctx.fillText(lb,x,y2+16)}});
  // legend
  let lx=x1;
  series.forEach(s=>{ctx.fillStyle=s.color;ctx.fillRect(lx,y2+22,8,8);ctx.fillStyle="#64748b";ctx.textAlign="left";ctx.fillText(s.name,lx+12,y2+30);lx+=ctx.measureText(s.name).width+30;});
}
function barChart(cv,labels,values,color2,h=195,fmt){
  const {ctx,w,h:hh}=prep(cv,h);
  const pad={l:52,r:10,t:8,b:26}, x1=pad.l,y1=pad.t,x2=w-pad.r,y2=hh-pad.b;
  const max=Math.max(...values,1);
  const f=fmt||fmtM;
  axis(ctx,x1,y1,x2,y2,null,{max},v=>f(v));
  const n=labels.length, bw=(x2-x1)/n*0.58, gap=(x2-x1)/n;
  labels.forEach((lb,i)=>{
    const bh=(values[i]/max)*(y2-y1), x=x1+gap*i+(gap-bw)/2, y=y2-bh;
    const g=ctx.createLinearGradient(0,y,0,y2); g.addColorStop(0,color2); g.addColorStop(1,color2+"aa");
    ctx.fillStyle=g; ctx.beginPath();
    const r=3; ctx.moveTo(x,y2);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.lineTo(x+bw-r,y);
    ctx.quadraticCurveTo(x+bw,y,x+bw,y+r);ctx.lineTo(x+bw,y2);ctx.closePath();ctx.fill();
    ctx.fillStyle="#475569";ctx.font="10px Segoe UI";ctx.textAlign="center";
    const txt=fmt?f(values[i]):(values[i]>=1e5?fmtM(values[i]):fmtN(values[i]));
    ctx.fillText(txt,x+bw/2,y-4);
    ctx.save();ctx.translate(x+bw/2,y2+12);ctx.rotate(-0.12);
    ctx.fillStyle="#64748b";ctx.fillText(String(lb).length>14?String(lb).slice(0,13)+"…":lb,0,0);ctx.restore();
  });
}
function hbarChart(cv,labels,values,h=215){
  const {ctx,w,h:hh}=prep(cv,h);
  const pad={l:118,r:46,t:6,b:8}, x1=pad.l,y1=pad.t,x2=w-pad.r,y2=hh-pad.b;
  const max=Math.max(...values,1), rowH=(y2-y1)/labels.length, bh=rowH*0.55;
  labels.forEach((lb,i)=>{
    const y=y1+rowH*i+(rowH-bh)/2, bw=(values[i]/max)*(x2-x1);
    ctx.fillStyle="#eef2f7"; ctx.fillRect(x1,y,x2-x1,bh);
    const g=ctx.createLinearGradient(x1,0,x1+bw,0);g.addColorStop(0,"#3b82f6");g.addColorStop(1,"#2563eb");
    ctx.fillStyle=g; ctx.fillRect(x1,y,bw,bh);
    ctx.fillStyle="#334155";ctx.font="10.5px Segoe UI";ctx.textAlign="right";
    ctx.fillText(String(lb).length>18?String(lb).slice(0,17)+"…":lb,x1-8,y+bh/2+4);
    ctx.fillStyle="#1e40af";ctx.textAlign="left";ctx.font="bold 10px Segoe UI";
    ctx.fillText(fmtM(values[i]),x1+bw+6,y+bh/2+4);
  });
}
function donut(cv,labels,values,h=195){
  const {ctx,w,h:hh}=prep(cv,h);
  const total=values.reduce((a,b)=>a+b,0)||1;
  const cx=w*0.34, cy=hh/2, r=Math.min(hh*0.38, w*0.22), ir=r*0.58;
  let ang=-Math.PI/2;
  values.forEach((v,i)=>{
    const a=v/total*Math.PI*2;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,ang,ang+a);ctx.closePath();
    ctx.fillStyle=color(i);ctx.fill();
    ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.stroke();
    ang+=a;
  });
  ctx.beginPath();ctx.arc(cx,cy,ir,0,7);ctx.fillStyle="#fff";ctx.fill();
  ctx.fillStyle="#0f172a";ctx.font="bold 15px Segoe UI";ctx.textAlign="center";
  ctx.fillText(fmtM(total),cx,cy+2);
  ctx.fillStyle="#64748b";ctx.font="9.5px Segoe UI";ctx.fillText("TOTAL",cx,cy+14);
  let ly=hh*0.18;
  labels.forEach((lb,i)=>{
    ctx.fillStyle=color(i);ctx.fillRect(w*0.66,ly,9,9);
    ctx.fillStyle="#334155";ctx.font="10px Segoe UI";ctx.textAlign="left";
    ctx.fillText((lb+"  "+fmtP(values[i]/total*100)).slice(0,24),w*0.66+13,ly+8);
    ly+=17;
  });
}
function stackedBars(cv,labels,values,h=110){
  const {ctx,w,h:hh}=prep(cv,h);
  const total=values.reduce((a,b)=>a+b,0)||1;
  let x=0, y=10, barH=26, wgt=w;
  values.forEach((v,i)=>{const bw=v/total*wgt;
    ctx.fillStyle=color(i);ctx.fillRect(x,y,bw,barH);
    if(bw>46){ctx.fillStyle="#fff";ctx.font="bold 9.5px Segoe UI";ctx.textAlign="center";ctx.fillText(v,x+bw/2,y+16);}
    x+=bw;});
  let lx=0;
  labels.forEach((lb,i)=>{ctx.fillStyle=color(i);ctx.fillRect(lx,y+barH+10,8,8);
    ctx.fillStyle="#64748b";ctx.font="9.5px Segoe UI";ctx.textAlign="left";
    const t=lb+" ("+fmtP(values[i]/total*100)+")";ctx.fillText(t,lx+11,y+barH+18);lx+=ctx.measureText(t).width+24;});
}

// ---------------- aggregation + render
function agg(rows){
  const k={sales:0,profit:0,orders:rows.length,qty:0,cust:new Set(),ratingSum:0,ratingCount:0};
  const byYM={},byCat={},byReg={},bySeg={},byDisc={},byRating={},byStatus={},byProd={};
  rows.forEach(r=>{
    const s=+get(r,"sales"), p=+get(r,"profit"), d=+get(r,"disc"), ra=+get(r,"rating");
    k.sales+=s;k.profit+=p;k.qty+=get(r,"qty"); if(ra>0){k.ratingSum+=ra;k.ratingCount++}
    byYM[get(r,"ym")]=(byYM[get(r,"ym")]||{s:0,p:0}); byYM[get(r,"ym")].s+=s; byYM[get(r,"ym")].p+=p;
    const c=get(r,"cat"); byCat[c]=(byCat[c]||0)+s;
    const rg=get(r,"reg"); byReg[rg]=(byReg[rg]||0)+s;
    const sg=get(r,"seg"); bySeg[sg]=(bySeg[sg]||0)+s;
    const band = d===0?"0%": d<=5?"1-5%": d<=10?"6-10%": d<=20?"11-20%":">20%";
    byDisc[band]=byDisc[band]||{s:0,p:0}; byDisc[band].s+=s; byDisc[band].p+=p;
    byRating[ra]=(byRating[ra]||0)+1;
    const st=get(r,"status"); byStatus[st]=(byStatus[st]||0)+1;
    const pr=get(r,"prod"); byProd[pr]=(byProd[pr]||0)+s;
  });
  return {k,byYM,byCat,byReg,bySeg,byDisc,byRating,byStatus,byProd};
}

function render(){
  const rows=filtered(), A=agg(rows), k=A.k;
  sel("rowsChip").textContent = fmtN(rows.length)+" / "+fmtN(ROWS.length)+" rows";
  // KPIs
  const margin = k.sales? k.profit/k.sales*100:0;
  const aov = k.orders? k.sales/k.orders:0;
  const rating = k.ratingCount? k.ratingSum/k.ratingCount:0;
  const kp=[
    ["TOTAL SALES","₹ "+fmtM(k.sales),fmtN(k.sales),"--blue"],
    ["TOTAL PROFIT","₹ "+fmtM(k.profit),fmtN(k.profit),"--green"],
    ["MARGIN %",fmtP(margin),"profit / sales","--purple"],
    ["ORDERS",fmtN(k.orders),"avg ₹"+fmtN(aov),"--orange"],
    ["UNITS",fmtN(k.qty),"qty sold","--cyan"],
    ["AVG RATING","★ "+rating.toFixed(2),"customer rating","--red"],
  ];
  sel("kpis").innerHTML=kp.map(([l,v,d,c])=>`<div class="kpi" style="border-left-color:var(${c})"><div class="l">${l}</div><div class="v">${v}</div><div class="d">${d}</div></div>`).join("");

  // trend
  const ymKeys=Object.keys(A.byYM).sort();
  sel("trendNote").textContent = ymKeys.length? ymKeys[0]+" → "+ymKeys[ymKeys.length-1]:"no data";
  if(ymKeys.length){
    lineChart(sel("cTrend"),ymKeys,[
      {name:"Sales",color:"#2563eb",data:ymKeys.map(x=>A.byYM[x].s)},
      {name:"Profit",color:"#16a34a",data:ymKeys.map(x=>A.byYM[x].p)}]);
  }
  // category
  const catL=Object.keys(A.byCat).sort((a,b)=>A.byCat[b]-A.byCat[a]);
  if(catL.length) hbarChart(sel("cCat"),catL,catL.map(c=>A.byCat[c]));
  // discount
  const dOrder=["0%","1-5%","6-10%","11-20%",">20%"];
  const dL=dOrder.filter(b=>A.byDisc[b]);
  if(dL.length) barChart(sel("cDisc"),dL,dL.map(b=>A.byDisc[b].s?A.byDisc[b].p/A.byDisc[b].s*100:0),"#dc2626",195,fmtP);
  // region
  const regL=Object.keys(A.byReg).sort((a,b)=>A.byReg[b]-A.byReg[a]);
  if(regL.length) barChart(sel("cReg"),regL,regL.map(r=>A.byReg[r]),"#2563eb",195);
  // segment
  const segL=Object.keys(A.bySeg).sort((a,b)=>A.bySeg[b]-A.bySeg[a]);
  if(segL.length) donut(sel("cSeg"),segL,segL.map(s=>A.bySeg[s]),195);
  // products table
  const prodL=Object.entries(A.byProd).sort((a,b)=>b[1]-a[1]).slice(0,10);
  if(prodL.length){
    sel("tblProd").innerHTML=`<table><tr><th>#</th><th>Product</th><th class="num">Sales</th></tr>`+
    prodL.map(([p,v],i)=>`<tr><td>${i+1}</td><td>${esc(p)}</td><td class="num">₹${fmtN(v)}</td></tr>`).join("")+`</table>`;
  } else sel("tblProd").innerHTML='<div class="empty">No data</div>';
  // status
  const stL=Object.entries(A.byStatus).sort((a,b)=>b[1]-a[1]);
  if(stL.length){
    stackedBars(sel("cStatus"),stL.map(x=>x[0]),stL.map(x=>x[1]),110);
    const t=stL.reduce((a,b)=>a+b[1],0);
    sel("tblStatus").innerHTML=`<table><tr><th>Status</th><th class="num">Orders</th><th class="num">Share</th></tr>`+
      stL.map(([s,v])=>`<tr><td>${esc(s)}</td><td class="num">${fmtN(v)}</td><td class="num">${(v/t*100).toFixed(1)}%</td></tr>`).join("")+`</table>`;
  }
  // heatmap
  buildHeat(rows);
  // active tags
  const s=state();
  const tags=FILTERS.filter(([id,key])=>s[key]).map(([id,key])=>
     `<span class="tag">${esc(key)}: ${esc(s[key])} <b onclick="clearOne('${id}')">×</b></span>`).join("");
  sel("activeTags").innerHTML=tags;
}
function clearOne(id){sel(id).value="";render()}
// heatmap
function buildHeat(rows){
  const cats=uniq(rows.map(r=>get(r,"cat"))).sort();
  const regs=uniq(rows.map(r=>get(r,"reg"))).sort();
  const m={};
  rows.forEach(r=>{const key=get(r,"reg")+"|"+get(r,"cat");m[key]=(m[key]||0)+ +get(r,"sales")});
  let mx=0; Object.values(m).forEach(v=>mx=Math.max(mx,v));
  let h='<table><tr><th>Region</th>'+cats.map(c=>`<th class="num">${esc(c)}</th>`).join("")+'</tr>';
  regs.forEach(rg=>{
    h+=`<tr><td><b>${esc(rg)}</b></td>`;
    cats.forEach(c=>{
      const v=m[rg+"|"+c]||0, a=mx?v/mx:0;
      const bg=`rgba(37,99,235,${0.08+a*0.75})`;
      const fg=a>0.55?"#fff":"#0f172a";
      h+=`<td class="num" style="background:${bg};color:${fg};font-weight:600">${v?(v/1e6).toFixed(2):"—"}</td>`;
    });
    h+='</tr>';
  });
  h+='</table>';
  sel("heat").innerHTML=h;
}
// wire
FILTERS.forEach(([id])=>sel(id).addEventListener("change",render));
sel("resetBtn").addEventListener("click",()=>{FILTERS.forEach(([id])=>sel(id).value="");render()});
window.addEventListener("resize",()=>{clearTimeout(window.__rz);window.__rz=setTimeout(render,150)});
render();
</script>
</body>
</html>"""

html = (HTML.replace("__DATA__", data_json)
            .replace("__ROWS__", f"{int(kpis['total_records']):,}")
            .replace("__DATE_MIN__", pd.Timestamp(kpis["date_min"]).strftime("%b %Y"))
            .replace("__DATE_MAX__", pd.Timestamp(kpis["date_max"]).strftime("%b %Y")))
html_path = os.path.join(BASE, "Retail_Sales_BI_Interactive.html")
with open(html_path, "w", encoding="utf-8") as f:
    f.write(html)
print("Saved:", html_path)
print("Data JSON size: %.1f KB" % (len(data_json) / 1024))
