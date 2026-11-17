# -*- coding: utf-8 -*-
"""Client-ready formatted Excel report: Retail_Sales_Excel_Report.xlsx"""
import datetime as dt
import os

import pandas as pd
import numpy as np
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.chart import BarChart, LineChart, PieChart, Reference, Series
from openpyxl.chart.label import DataLabelList
from openpyxl.utils import get_column_letter
from openpyxl.formatting.rule import DataBarRule, ColorScaleRule
from openpyxl.worksheet.datavalidation import DataValidation

import analysis_common as ac

BASE = ac.BASE
OUT = ac.OUT
xl_path = os.path.join(BASE, "Retail_Sales_Excel_Report.xlsx")

BLUE = "2563EB"; GREEN = "16A34A"; ORANGE = "F59E0B"; RED = "DC2626"
PURPLE = "7C3AED"; INK = "0F172A"; MUTED = "64748B"; BG = "F1F5F9"
LIGHT = "EFF6FF"

hf = PatternFill("solid", fgColor=BLUE)
hfont = Font(bold=True, color="FFFFFF", size=11)
ink_font = Font(bold=True, color=INK, size=11)
title_font = Font(bold=True, color=INK, size=16)
sub_font = Font(color=MUTED, size=10)
thin = Side(style="thin", color="E2E8F0")
border = Border(left=thin, right=thin, top=thin, bottom=thin)
center = Alignment(horizontal="center", vertical="center")
left = Alignment(horizontal="left", vertical="center")
MONEY = '#,##0'
MONEY_M = '#,##0,,"M"'
PCT = '0.0"%"'

wb = Workbook()

# ------------------------------------------------------------------ helpers
def style_table(ws, r1, c1, r2, c2, banded=True):
    for r in range(r1, r2 + 1):
        for c in range(c1, c2 + 1):
            cell = ws.cell(row=r, column=c)
            cell.border = border
            if r == r1:
                cell.fill = hf; cell.font = hfont; cell.alignment = center
            elif banded and (r - r1) % 2 == 0:
                cell.fill = PatternFill("solid", fgColor="F8FAFC")

def sheet_head(ws, title, subtitle):
    ws["B2"] = title; ws["B2"].font = title_font
    ws["B3"] = subtitle; ws["B3"].font = sub_font
    ws.sheet_view.showGridLines = False

def write_df(ws, df, start_row, money_cols=(), pct_cols=(), rating_cols=()):
    r = start_row
    for j, col in enumerate(df.columns, start=2):
        ws.cell(row=r, column=j, value=str(col))
    for i, (_, row) in enumerate(df.iterrows(), start=1):
        for j, col in enumerate(df.columns, start=2):
            v = ac.excel_value(row[col])
            cell = ws.cell(row=r + i, column=j, value=v)
            if col in money_cols: cell.number_format = MONEY
            elif col in pct_cols: cell.number_format = PCT
            elif col in rating_cols: cell.number_format = '0.00'
    style_table(ws, r, 2, r + len(df), 1 + len(df.columns))
    return r + len(df) + 2

def col_widths(ws, widths, start=1):
    for i, w in enumerate(widths, start=start):
        ws.column_dimensions[get_column_letter(i)].width = w

df = ac.load_clean()
kpis = ac.load_kpis()
tables = ac.compute_tables(df)
category = tables["category"]
region = tables["region"]
segment = tables["segment"]
product_all = tables["product_all"]
shipping = tables["shipping"]
electronics = category[category["Category"] == "Electronics"].iloc[0]
best_region_margin = region[region["Region"] != ac.UNKNOWN].sort_values("Margin_%", ascending=False).iloc[0]
worst_region_margin = region[region["Region"] != ac.UNKNOWN].sort_values("Margin_%").iloc[0]

# ================================================================ 1. DASHBOARD
ws = wb.active; ws.title = "Dashboard"
ws.sheet_view.showGridLines = False
ws["B2"] = "RETAIL SALES REPORT — CLIENT VERSION"; ws["B2"].font = Font(bold=True, size=20, color=INK)
ws["B3"] = (f"{kpis['total_records']:,} orders  •  "
            f"{dt.date.fromisoformat(kpis['date_min']):%b %Y} – "
            f"{dt.date.fromisoformat(kpis['date_max']):%b %Y}  •  "
            f"Currency: ₹ (INR)  •  Source: retail_sales_5000_rows.csv")
ws["B3"].font = sub_font
ws["B4"] = f"Prepared: {dt.date.today():%b %Y}"; ws["B4"].font = sub_font
col_widths(ws, [3, 26, 20, 20, 20, 22, 22, 22])

kpis_cards = [
    ("Total Sales", kpis["total_sales"], MONEY, BLUE),
    ("Total Profit", kpis["total_profit"], MONEY, GREEN),
    ("Profit Margin", kpis["profit_margin_pct"] / 100, '0.0%', GREEN),
    ("Total Orders", kpis["total_records"], '#,##0', ORANGE),
    ("Customers", kpis["unique_customers"], '#,##0', PURPLE),
    ("Avg Order Value", kpis["avg_order_value"], MONEY, BLUE),
]
r, c0 = 6, 2
for i, (label, val, fmt, color) in enumerate(kpis_cards):
    rr = r + (i // 3) * 4
    cc = c0 + (i % 3) * 2
    ws.merge_cells(start_row=rr, start_column=cc, end_row=rr, end_column=cc + 1)
    ws.merge_cells(start_row=rr + 1, start_column=cc, end_row=rr + 1, end_column=cc + 1)
    lab = ws.cell(row=rr, column=cc, value=label)
    lab.fill = PatternFill("solid", fgColor=color); lab.font = Font(bold=True, color="FFFFFF", size=11)
    lab.alignment = center
    v = ws.cell(row=rr + 1, column=cc, value=val)
    v.number_format = fmt; v.font = Font(bold=True, size=18, color=color); v.alignment = center
    for rr2 in (rr, rr + 1):
        for cc2 in range(cc, cc + 2):
            ws.cell(row=rr2, column=cc2).border = border

row = 14
ws.cell(row=row, column=2, value="KEY HIGHLIGHTS").font = Font(bold=True, size=13, color=INK)
hl = [
    ("📈 Growth", f"2025 grew +{kpis['yoy_growth_2025_pct']:.1f}% over 2024. "
                  f"2026 ({dt.date.fromisoformat(kpis['date_max']).month} months) annualizes to "
                  f"{ac.cr(kpis['annualized_2026'] or 0)} — roughly flat vs 2025."),
    ("🛒 Top category", f"{electronics['Category']} = {ac.cr(electronics['Sales'])} "
                        f"({electronics['Sales_Share_%']:.1f}% share, {electronics['Margin_%']:.1f}% margin). "
                        f"{kpis['top_product']} alone = {kpis['top_product_share_pct']:.1f}% of company sales."),
    ("⚠️ Discount alert", f"Ratings stay ~{kpis['avg_rating']:.2f} at every discount level; >20% discount cuts "
                           f"margin {kpis['margin_0pct']:.1f}% → {kpis['margin_gt20pct']:.1f}%. "
                           f"Recoverable ≈ {ac.inr(kpis['discount_recovery'] or 0)}."),
    ("🗺️ Regions", f"{region.iloc[0]['Region']} = highest sales ({ac.cr(region.iloc[0]['Sales'])}). "
                    f"{best_region_margin['Region']} = best margin ({best_region_margin['Margin_%']:.1f}%). "
                    f"{worst_region_margin['Region']} = weakest margin ({worst_region_margin['Margin_%']:.1f}%)."),
    ("👥 Customers", f"{kpis['unique_customers']:,} customers; top-10 only "
                     f"{kpis['top10_customer_share_pct']:.1f}% of sales (low risk). "
                     f"{kpis['pareto_pct_of_customers']:.1f}% of customers = 80% of revenue."),
    ("🚚 Leakage", f"{kpis['cancelled_returned_pct']:.1f}% orders cancelled/returned = "
                   f"{ac.cr(kpis['leakage_sales'])} gross sales. "
                   f"{shipping.sort_values('Rating').iloc[0]['Shipping_Mode']} shipping has the lowest rating "
                   f"({shipping['Rating'].min():.2f})."),
    ("⭐ Quality", f"Avg rating ★{kpis['avg_rating']:.2f} ({kpis['rated_orders']:,} delivered orders). "
                   f"Only {kpis['loss_orders_pct']:.1f}% orders loss-making. "
                   f"{kpis['sales_mismatch_records']} sales-formula mismatches; "
                   f"{kpis['unknown_region_orders']} missing region / {kpis['unknown_payment_orders']} missing payment values."),
]
row += 1
for title, text in hl:
    ws.cell(row=row, column=2, value=title).font = Font(bold=True, size=11, color=BLUE)
    ws.merge_cells(start_row=row, start_column=4, end_row=row, end_column=8)
    t = ws.cell(row=row, column=4, value=text); t.font = Font(size=11, color=INK); t.alignment = Alignment(wrap_text=True, vertical="center")
    ws.row_dimensions[row].height = 22
    for cc in range(2, 9):
        ws.cell(row=row, column=cc).fill = PatternFill("solid", fgColor="FFFBEB" if "⚠" in title else "F8FAFC")
        ws.cell(row=row, column=cc).border = border
    row += 1

row += 1
ws.cell(row=row, column=2, value="RECOMMENDATIONS").font = Font(bold=True, size=13, color=INK)
recs = [
    ("R1", "Cap discounts at 10–20%; approval gate for >20% discounts.",
     f"+{ac.inr(kpis['discount_recovery'] or 0)} profit"),
    ("R2", "Bundle the top products; protect 4K Monitor and Standing Desk revenue.",
     f"AOV ₹{kpis['avg_order_value']:,.0f} → ₹{kpis['avg_order_value'] * 1.1:,.0f}"),
    ("R3", f"Audit {worst_region_margin['Region']} region's discount/mix; copy "
           f"{best_region_margin['Region']}'s playbook.",
     f"+{best_region_margin['Margin_%'] - worst_region_margin['Margin_%']:.1f} pt margin potential"),
    ("R4", "Reduce cancellations/returns: QC on Apparel, address checks on COD.",
     f"up to {ac.cr(kpis['leakage_profit'])} profit at stake"),
    ("R5", f"Fix {shipping.sort_values('Rating').iloc[0]['Shipping_Mode']} shipping SLA or re-price it.",
     f"rating {shipping['Rating'].min():.2f} → 4.0+"),
    ("R6", f"Loyalty program for the {kpis['pareto_customers']:,} customers driving 80% revenue.",
     "retention + AOV"),
]
row += 1
ws.cell(row=row, column=2, value="#").fill = hf; ws.cell(row=row, column=2).font = hfont
ws.cell(row=row, column=3, value="Action").fill = hf; ws.cell(row=row, column=3).font = hfont
ws.merge_cells(start_row=row, start_column=3, end_row=row, end_column=6)
ws.cell(row=row, column=7, value="Impact").fill = hf; ws.cell(row=row, column=7).font = hfont
for i, (n, a, imp) in enumerate(recs, start=1):
    rr = row + i
    ws.cell(row=rr, column=2, value=n)
    ws.merge_cells(start_row=rr, start_column=3, end_row=rr, end_column=6)
    ws.cell(row=rr, column=3, value=a)
    ws.cell(row=rr, column=7, value=imp).font = Font(bold=True, color=GREEN, size=10)
    if i % 2 == 0:
        for cc in range(2, 8):
            ws.cell(row=rr, column=cc).fill = PatternFill("solid", fgColor="F8FAFC")
    for cc in range(2, 8):
        ws.cell(row=rr, column=cc).border = border
col_widths(ws, [3, 26, 20, 20, 20, 22, 22, 22])

# ================================================================ 2. SUMMARY sheets + charts
def make_summary_sheet(name, title, dframe, money_cols=(), pct_cols=(), rating_cols=()):
    w = wb.create_sheet(name)
    sheet_head(w, title, "All figures in ₹ (INR)")
    end = write_df(w, dframe, 5, money_cols, pct_cols, rating_cols)
    return w, end

# --- Monthly trend
mon = pd.read_csv(os.path.join(OUT, "Monthly_Trend.csv"))[
    ["YearMonth", "Sales", "Profit", "Orders", "Margin_%"]
]
w, _ = make_summary_sheet("Monthly Trend", "Monthly Sales & Profit Trend", mon,
                          money_cols=("Sales", "Profit"), pct_cols=("Margin_%",))
lc = LineChart(); lc.title = "Monthly Sales & Profit"; lc.style = 12
lc.height, lc.width = 9, 24
data = Reference(w, min_col=3, max_col=4, min_row=5, max_row=5 + len(mon))
cats = Reference(w, min_col=2, min_row=6, max_row=5 + len(mon))
lc.add_data(data, titles_from_data=True); lc.set_categories(cats)
for s in lc.series: s.smooth = False
lc.y_axis.title = "₹"; lc.x_axis.title = "Month"
w.add_chart(lc, "I5")

# --- Yearly
ydf = pd.read_csv(os.path.join(OUT, "Yearly_Summary.csv"))
w, _ = make_summary_sheet("Yearly", "Year-over-Year Performance", ydf,
                          money_cols=("Sales", "Profit", "AOV"))
bc = BarChart(); bc.type = "col"; bc.title = "Sales by Year"; bc.style = 10
bc.height, bc.width = 9, 12
data = Reference(w, min_col=3, min_row=5, max_row=5 + len(ydf))
cats = Reference(w, min_col=2, min_row=6, max_row=5 + len(ydf))
bc.add_data(data, titles_from_data=True); bc.set_categories(cats)
bc.dataLabels = DataLabelList(); bc.dataLabels.showVal = True
w.add_chart(bc, "I5")

# --- Category
cat = pd.read_csv(os.path.join(OUT, "Category_Summary.csv"))
w, _ = make_summary_sheet("Category", "Category Performance", cat,
                          money_cols=("Sales", "Profit"), pct_cols=("Margin_%",),
                          rating_cols=("Rating",))
bc = BarChart(); bc.type = "bar"; bc.title = "Sales by Category"; bc.style = 11
bc.height, bc.width = 9, 14
data = Reference(w, min_col=3, min_row=5, max_row=5 + len(cat))
cats = Reference(w, min_col=2, min_row=6, max_row=5 + len(cat))
bc.add_data(data, titles_from_data=True); bc.set_categories(cats)
bc.dataLabels = DataLabelList(); bc.dataLabels.showVal = True
w.add_chart(bc, "I5")
pc = PieChart(); pc.title = "Sales Share by Category"; pc.height, pc.width = 9, 10
data = Reference(w, min_col=3, min_row=5, max_row=5 + len(cat))
cats = Reference(w, min_col=2, min_row=6, max_row=5 + len(cat))
pc.add_data(data, titles_from_data=True); pc.set_categories(cats)
w.add_chart(pc, "I24")

# --- Region
reg = pd.read_csv(os.path.join(OUT, "Region_Summary.csv"))
w, _ = make_summary_sheet("Region", "Regional Performance", reg,
                          money_cols=("Sales", "Profit", "AOV"), pct_cols=("Margin_%",))
bc = BarChart(); bc.type = "col"; bc.title = "Sales by Region"; bc.style = 10
bc.height, bc.width = 10, 13
data = Reference(w, min_col=3, min_row=5, max_row=5 + len(reg))
cats = Reference(w, min_col=2, min_row=6, max_row=5 + len(reg))
bc.add_data(data, titles_from_data=True); bc.set_categories(cats)
bc.dataLabels = DataLabelList(); bc.dataLabels.showVal = True
w.add_chart(bc, "I5")

# --- Segment
seg = pd.read_csv(os.path.join(OUT, "Segment_Summary.csv"))
w, _ = make_summary_sheet("Segment", "Customer Segment Performance", seg,
                          money_cols=("Sales", "Profit"), pct_cols=("Margin_%",),
                          rating_cols=("Rating",))
pc = PieChart(); pc.title = "Sales Share by Segment"; pc.height, pc.width = 10, 12
data = Reference(w, min_col=3, min_row=5, max_row=5 + len(seg))
cats = Reference(w, min_col=2, min_row=6, max_row=5 + len(seg))
pc.add_data(data, titles_from_data=True); pc.set_categories(cats)
pc.dataLabels = DataLabelList(); pc.dataLabels.showPercent = True
w.add_chart(pc, "I5")

# --- Products
prod = pd.read_csv(os.path.join(OUT, "Top_Products_by_Sales.csv"))
w, _ = make_summary_sheet("Products", "Products Ranked by Sales (top 12)", prod,
                          money_cols=("Sales", "Profit"), pct_cols=("Margin_%",), rating_cols=("Rating",))
bc = BarChart(); bc.type = "bar"; bc.title = "Top 12 Products by Sales"; bc.style = 11
bc.height, bc.width = 12, 15
data = Reference(w, min_col=3, min_row=5, max_row=5 + len(prod))
cats = Reference(w, min_col=2, min_row=6, max_row=5 + len(prod))
bc.add_data(data, titles_from_data=True); bc.set_categories(cats)
w.add_chart(bc, "I5")

worst = pd.read_csv(os.path.join(OUT, "Lowest_Revenue_Products.csv"))
w2 = wb.create_sheet("Low Revenue Products")
sheet_head(w2, "Lowest-Revenue Products", "Small-ticket, high-frequency items — watch list")
write_df(w2, worst, 5, money_cols=("Sales", "Profit"), pct_cols=("Margin_%",), rating_cols=("Rating",))

# --- Discount
disc = pd.read_csv(os.path.join(OUT, "Discount_Impact.csv"))
disc.columns = [str(c) for c in disc.columns]
w, _ = make_summary_sheet("Discount Impact", "⚠ Discount Impact on Margin — KEY FINDING", disc,
                          money_cols=("Sales", "Profit"), pct_cols=("Margin_%",), rating_cols=("Rating",))
bc = BarChart(); bc.type = "col"; bc.title = "Profit Margin % by Discount Band"; bc.style = 10
bc.height, bc.width = 10, 13
data = Reference(w, min_col=8, min_row=5, max_row=5 + len(disc))
cats = Reference(w, min_col=2, min_row=6, max_row=5 + len(disc))
bc.add_data(data, titles_from_data=True); bc.set_categories(cats)
bc.dataLabels = DataLabelList(); bc.dataLabels.showVal = True
w.add_chart(bc, "J5")
# insight box
ir = 5 + len(disc) + 2
w.merge_cells(start_row=ir, start_column=2, end_row=ir + 2, end_column=9)
c = w.cell(row=ir, column=2, value=(
    f"INSIGHT: Customer rating is flat (~{kpis['avg_rating']:.2f}) at every discount level — discounts do not buy satisfaction. "
    f"Deep discounts (>20%) cut margin from {kpis['margin_0pct']:.1f}% to {kpis['margin_gt20pct']:.1f}%. "
    f"Capping discounts at 10–20% recovers ~{ac.inr(kpis['discount_recovery'] or 0)} profit."
))
c.font = Font(bold=True, color="92400E", size=11); c.fill = PatternFill("solid", fgColor="FFFBEB")
c.alignment = Alignment(wrap_text=True, vertical="center")
col_widths(w, [3, 16, 14, 16, 14, 14, 12, 14, 12])

# --- Payment & Shipping
pay = pd.read_csv(os.path.join(OUT, "Payment_Mode_Summary.csv"))
ship = pd.read_csv(os.path.join(OUT, "Shipping_Mode_Summary.csv"))
w = wb.create_sheet("Payment & Shipping")
sheet_head(w, "Payment & Shipping Analysis", "All figures in ₹ (INR)")
w.cell(row=5, column=2, value="Payment Modes").font = Font(bold=True, size=12, color=INK)
end = write_df(w, pay, 6, money_cols=("Sales",))
w.cell(row=end, column=2, value="Shipping Modes").font = Font(bold=True, size=12, color=INK)
write_df(w, ship, end + 1, money_cols=("Sales",), rating_cols=("Rating",))
bc = BarChart(); bc.type = "col"; bc.title = "Sales by Payment Mode"; bc.style = 10
bc.height, bc.width = 9, 12
data = Reference(w, min_col=3, min_row=6, max_row=6 + len(pay))
cats = Reference(w, min_col=2, min_row=7, max_row=6 + len(pay))
bc.add_data(data, titles_from_data=True); bc.set_categories(cats)
w.add_chart(bc, "G5")

# --- Status & Rating
st = pd.read_csv(os.path.join(OUT, "Order_Status_Summary.csv"))
rt = pd.read_csv(os.path.join(OUT, "Rating_Summary.csv"))
w = wb.create_sheet("Status & Ratings")
sheet_head(w, "Order Status & Customer Ratings", "Delivery quality view")
w.cell(row=5, column=2, value="Order Status").font = Font(bold=True, size=12, color=INK)
end = write_df(w, st, 6, money_cols=("Sales",), pct_cols=("Share_%",))
w.cell(row=end, column=2, value="Ratings").font = Font(bold=True, size=12, color=INK)
write_df(w, rt, end + 1, money_cols=("Sales", "Profit"),
         pct_cols=("Share_of_All_%", "Share_of_Rated_%"))
pc = PieChart(); pc.title = "Order Status Mix"; pc.height, pc.width = 10, 11
data = Reference(w, min_col=3, min_row=6, max_row=6 + len(st))
cats = Reference(w, min_col=2, min_row=7, max_row=6 + len(st))
pc.add_data(data, titles_from_data=True); pc.set_categories(cats)
pc.dataLabels = DataLabelList(); pc.dataLabels.showPercent = True
w.add_chart(pc, "G5")

# --- Top customers
cust = pd.read_csv(os.path.join(OUT, "Customer_Ranked.csv")).head(15)
w, _ = make_summary_sheet("Top Customers", "Top 15 Customers by Sales", cust,
                          money_cols=("Sales", "Profit"), pct_cols=("Cum_Sales_%",))
bc = BarChart(); bc.type = "bar"; bc.title = "Top 15 Customers"; bc.style = 11
bc.height, bc.width = 12, 13
data = Reference(w, min_col=3, min_row=5, max_row=5 + len(cust))
cats = Reference(w, min_col=2, min_row=6, max_row=5 + len(cust))
bc.add_data(data, titles_from_data=True); bc.set_categories(cats)
w.add_chart(bc, "J5")

# ================================================================ 3. Filter Lists sheet (dropdown sources)
fl = wb.create_sheet("Filter Lists")
fl.sheet_view.showGridLines = False
fl["B2"] = "Filter dropdown source lists (used by Filter Dashboard)"; fl["B2"].font = Font(bold=True, color=INK)
raw = df.drop(columns=["Expected_Sales"], errors="ignore")
filters = {
    "Year": [int(v) for v in sorted(raw["Year"].dropna().unique().tolist())],
    "Month_Name": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    "Quarter": sorted(raw["Quarter"].dropna().unique().tolist()),
    "Region": sorted(raw["Region"].dropna().unique().tolist()),
    "Category": sorted(raw["Category"].dropna().unique().tolist()),
    "Customer_Segment": sorted(raw["Customer_Segment"].dropna().unique().tolist()),
    "Payment_Mode": sorted(raw["Payment_Mode"].dropna().unique().tolist()),
    "Shipping_Mode": sorted(raw["Shipping_Mode"].dropna().unique().tolist()),
    "Order_Status": sorted(raw["Order_Status"].dropna().unique().tolist()),
    "Discount_Band": ["0%", "1-5%", "6-10%", "11-20%", ">20%"],
    "Rating": [1.0, 2.0, 3.0, 4.0, 5.0],
}
# Rebuild in one pass: header row 4, then "All" + values from row 5.
for j, (name, values) in enumerate(filters.items(), start=2):
    header = fl.cell(row=4, column=j, value=name)
    header.fill = hf
    header.font = hfont
    header.alignment = center
    fl.column_dimensions[get_column_letter(j)].width = 14
    for i, value in enumerate(["All"] + values, start=5):
        cell = fl.cell(row=i, column=j, value=ac.excel_value(value))
        cell.border = border

LIST_COL = {name: get_column_letter(j) for j, name in enumerate(filters, start=2)}

# ================================================================ 4. Interactive Filter Dashboard
wsf = wb.create_sheet("Filter Dashboard")
wsf.sheet_view.showGridLines = False
wsf["B2"] = "INTERACTIVE FILTER DASHBOARD"; wsf["B2"].font = Font(bold=True, size=18, color=INK)
wsf["B3"] = ("Choose values from the dropdowns below (or keep 'All') — KPIs update live. "
             "For native slicers, select the Excel Table 'SalesTable' and use Insert ▸ Slicer.")
wsf["B3"].font = sub_font
col_widths(wsf, [3, 16, 12, 4, 14, 12, 4, 12, 12, 4, 12, 12, 4, 14, 12, 4, 14, 12, 4, 14, 12])

# raw data refs (Raw sheet built below; row layout: header row3, data rows 4..)
R = "'Raw Data (5000 rows)'"
N = 3 + len(raw)
COLMAP = {name: get_column_letter(i + 1) for i, name in enumerate(raw.columns)}
# filter dropdowns: label row4, value row5 — 9 filters
fd = [  # (label, filter-key, label_col, value_col)
    ("Year", "Year", 2, 3), ("Month", "Month_Name", 5, 6), ("Quarter", "Quarter", 8, 9),
    ("Region", "Region", 11, 12), ("Category", "Category", 14, 15), ("Segment", "Customer_Segment", 17, 18),
    ("Payment", "Payment_Mode", 20, 21), ("Shipping", "Shipping_Mode", 23, 24), ("Status", "Order_Status", 26, 27),
]
missing_keys = [key for _, key, _, _ in fd if key not in COLMAP]
if missing_keys:
    raise KeyError(f"Filter Dashboard column(s) missing from dataset: {missing_keys}")
for label, key, lc, vc in fd:
    lab = wsf.cell(row=4, column=lc, value=label)
    lab.fill = PatternFill("solid", fgColor=ORANGE); lab.font = Font(bold=True, color="FFFFFF", size=10); lab.alignment = center
    val = wsf.cell(row=5, column=vc, value="All")
    val.font = Font(bold=True, size=11, color=INK); val.alignment = center
    val.fill = PatternFill("solid", fgColor="FFF7ED"); val.border = border
    wsf.merge_cells(start_row=4, start_column=lc, end_row=4, end_column=vc)
    wsf.merge_cells(start_row=5, start_column=lc, end_row=5, end_column=vc)
    wsf.column_dimensions[get_column_letter(vc)].width = 12
    dv = DataValidation(type="list", formula1=f"='Filter Lists'!${LIST_COL[key]}$5:${LIST_COL[key]}${4 + len(filters[key]) + 1}", allow_blank=False)
    wsf.add_data_validation(dv)
    dv.add(wsf.cell(row=5, column=vc))

# Build filter conditions once; every KPI/breakdown formula reuses them.
def cond_all(numeric: bool = True) -> str:
    parts = []
    for _label, key, _label_col, value_col in fd:
        ref = f"${get_column_letter(value_col)}$5"
        rng = f"{R}!${COLMAP[key]}$4:${COLMAP[key]}${N}"
        part = f'((({ref}="All")+(({rng})={ref}))>0)'
        parts.append(part if not numeric else f"{part}*1")
    expression = "*".join(parts)
    return expression if numeric else f"({expression})=1"


def cond_category(name: str) -> str:
    safe_name = str(name).replace('"', '""')
    parts = []
    for _label, key, _label_col, value_col in fd:
        ref = f"${get_column_letter(value_col)}$5"
        rng = f"{R}!${COLMAP[key]}$4:${COLMAP[key]}${N}"
        if key == "Category":
            parts.append(f'({rng}="{safe_name}")')
        else:
            parts.append(f'((({ref}="All")+(({rng})={ref}))>0)*1')
    return "*".join(parts)


sales_ref = f"{R}!${COLMAP['Sales']}$4:${COLMAP['Sales']}${N}"
profit_ref = f"{R}!${COLMAP['Profit']}$4:${COLMAP['Profit']}${N}"
customer_ref = f"{R}!${COLMAP['Customer_ID']}$4:${COLMAP['Customer_ID']}${N}"

kpis_fd = [
    ("Total Sales", f"=SUMPRODUCT({sales_ref}*{cond_all()})", MONEY, BLUE),
    ("Total Profit", f"=SUMPRODUCT({profit_ref}*{cond_all()})", MONEY, GREEN),
    ("Margin %", "=IFERROR(D10/B10,0)", '0.0%', PURPLE),
    ("Orders", f"=SUMPRODUCT({cond_all()})", '#,##0', ORANGE),
    ("Avg Order Value", "=IFERROR(B10/H10,0)", MONEY, BLUE),
    ("Customers",
     f'=IFERROR(ROWS(UNIQUE(FILTER({customer_ref},{cond_all(numeric=False)}))),"—")',
     '#,##0', RED),
]
wsf.cell(row=7, column=2, value="LIVE KPIs (update with the filters)").font = Font(bold=True, size=12, color=INK)
kpi_cols = [2, 4, 6, 8, 10, 12]
for (label, formula, fmt, color), kc in zip(kpis_fd, kpi_cols):
    wsf.merge_cells(start_row=9, start_column=kc, end_row=9, end_column=kc + 1)
    wsf.merge_cells(start_row=10, start_column=kc, end_row=10, end_column=kc + 1)
    lab = wsf.cell(row=9, column=kc, value=label)
    lab.fill = PatternFill("solid", fgColor=color); lab.font = Font(bold=True, color="FFFFFF", size=10); lab.alignment = center
    v = wsf.cell(row=10, column=kc, value=formula)
    v.number_format = fmt; v.font = Font(bold=True, size=15, color=color); v.alignment = center
    for rr in (9, 10):
        for cc in (kc, kc + 1):
            wsf.cell(row=rr, column=cc).border = border

# filtered breakdown by category
br = 13
wsf.cell(row=br, column=2, value="FILTERED BREAKDOWN — Category-wise (live)").font = Font(bold=True, size=12, color=INK)
hdr = ["Category", "Sales", "Profit", "Margin %", "Orders", "Share of Sales"]
for j, h in enumerate(hdr, start=2):
    c = wsf.cell(row=br + 1, column=j, value=h)
    c.fill = hf; c.font = hfont; c.alignment = center; c.border = border
cats = sorted(raw["Category"].dropna().unique().tolist())
for i, catname in enumerate(cats, start=1):
    rr = br + 1 + i
    cond_cat = cond_category(catname)
    wsf.cell(row=rr, column=2, value=catname)
    wsf.cell(row=rr, column=3, value=f"=SUMPRODUCT({sales_ref}*{cond_cat})").number_format = MONEY
    wsf.cell(row=rr, column=4, value=f"=SUMPRODUCT({profit_ref}*{cond_cat})").number_format = MONEY
    wsf.cell(row=rr, column=5, value=f"=IFERROR(D{rr}/C{rr},0)").number_format = '0.0%'
    wsf.cell(row=rr, column=6, value=f"=SUMPRODUCT({cond_cat})").number_format = '#,##0'
    wsf.cell(row=rr, column=7, value=f"=IFERROR(C{rr}/SUM($C${br+2}:$C${br+1+len(cats)}),0)").number_format = '0.0%'
    for cc in range(2, 8):
        wsf.cell(row=rr, column=cc).border = border
        if i % 2 == 0:
            wsf.cell(row=rr, column=cc).fill = PatternFill("solid", fgColor="F8FAFC")
last_cat_row = br + 1 + len(cats)
wsf.conditional_formatting.add(
    f"C{br+2}:C{last_cat_row}",
    DataBarRule(start_type="num", start_value=0, end_type="max", color=BLUE, showValue=True))

nr = last_cat_row + 2
wsf.merge_cells(start_row=nr, start_column=2, end_row=nr, end_column=14)
note = wsf.cell(row=nr, column=2, value=(
    "ℹ For native slicers: select the 'SalesTable' Excel Table on the 'Raw Data (5000 rows)' sheet, "
    "then Insert ▸ Slicer (Year, Region, Category, Segment, Payment, Shipping, Status, Rating are available). "
    "This dashboard uses dropdown filters so it works in every Excel version; the Customers KPI uses "
    "dynamic arrays (Excel 365)."))
note.font = Font(color=MUTED, size=10); note.alignment = Alignment(wrap_text=True, vertical="center")

# ================================================================ 5. Data quality
quality = ac.data_quality_table(ac.load_raw(), df)
wq = wb.create_sheet("Data Quality")
sheet_head(wq, "Data Quality Report", "Checks run against retail_sales_5000_rows.csv")
write_df(wq, quality, 5)
col_widths(wq, [3, 46, 18, 46])

# ================================================================ 6. Raw data sheet (Excel Table = slicer-ready)
ws = wb.create_sheet("Raw Data (5000 rows)")
ws.cell(row=1, column=1, value="Full cleaned dataset — Table 'SalesTable' (filters built-in; Insert ▸ Slicer for slicers)").font = Font(bold=True, color=BLUE)
for j, col in enumerate(raw.columns, start=1):
    ws.cell(row=3, column=j, value=col)
style_table(ws, 3, 1, 3, len(raw.columns), banded=False)
for i, row_vals in enumerate(raw.itertuples(index=False), start=4):
    for j, v in enumerate(row_vals, start=1):
        cell = ws.cell(row=i, column=j, value=ac.excel_value(v))
        colname = raw.columns[j - 1]
        if colname in ("Sales", "Profit", "Unit_Price", "Effective_Price"):
            cell.number_format = '#,##0.00'
ws.freeze_panes = "A4"
from openpyxl.worksheet.table import Table, TableStyleInfo
tab_ref = f"A3:{get_column_letter(len(raw.columns))}{3 + len(raw)}"
s_table = Table(displayName="SalesTable", ref=tab_ref)
s_table.tableStyleInfo = TableStyleInfo(name="TableStyleMedium2", showRowStripes=True, showColumnStripes=False)
ws.add_table(s_table)
col_widths(ws, [12] + [14] * (len(raw.columns) - 1))

# save
for sheet in wb.worksheets:
    sheet.sheet_properties.tabColor = BLUE
wb.save(xl_path)
print("Saved:", xl_path)
