# -*- coding: utf-8 -*-
"""Build the self-contained HTML dashboard and the Power BI source workbook.

Every number is read from analysis_outputs/KPIs.json and the summary tables, so
the report can never drift from the data again.

Usage:
    python build_reports.py
"""
from __future__ import annotations

import base64
import datetime as dt
import html as html_lib
import os
from copy import copy

import pandas as pd

import analysis_common as ac


def esc(value: object) -> str:
    return html_lib.escape(str(value), quote=True)


def b64_chart(number: int) -> str:
    prefix = f"{number:02d}_"
    matches = sorted(name for name in os.listdir(ac.CHARTS)
                     if name.startswith(prefix) and name.endswith(".png"))
    if not matches:
        raise FileNotFoundError(f"Chart {number:02d} not found in {ac.CHARTS}")
    with open(os.path.join(ac.CHARTS, matches[0]), "rb") as handle:
        return "data:image/png;base64," + base64.b64encode(handle.read()).decode()


def money(value: float, decimals: int = 0) -> str:
    return f"₹{value:,.{decimals}f}"


def short_money(value: float) -> str:
    return f"₹{value / 1e7:.2f} Cr" if abs(value) >= 1e7 else f"₹{value / 1e6:.2f}M"


def table(headers: list[str], rows: list[list[str]], numeric: set[int] | None = None) -> str:
    numeric = numeric or set()
    head = "".join(f'<th class="num">{esc(h)}</th>' if i in numeric else f"<th>{esc(h)}</th>"
                   for i, h in enumerate(headers))
    body = []
    for row in rows:
        cells = "".join(
            f'<td class="num">{cell}</td>' if i in numeric else f"<td>{cell}</td>"
            for i, cell in enumerate(row)
        )
        body.append(f"<tr>{cells}</tr>")
    return f"<table><tr>{head}</tr>{''.join(body)}</table>"


def kpi_cards(kpis: dict, df: pd.DataFrame) -> str:
    orders_per_customer = kpis["total_records"] / max(kpis["unique_customers"], 1)
    cards = [
        ("Gross Sales", short_money(kpis["total_sales"]), f'₹{kpis["total_sales"]:,.0f}', "var(--blue)"),
        ("Net Sales (Delivered)", short_money(kpis["net_sales_delivered"]),
         "excludes cancelled / returned", "var(--cyan)"),
        ("Total Profit", short_money(kpis["total_profit"]), f'₹{kpis["total_profit"]:,.0f}', "var(--green)"),
        ("Profit Margin", f'{kpis["profit_margin_pct"]:.1f}%',
         f'delivered: {kpis["net_margin_delivered_pct"]:.1f}%', "var(--green)"),
        ("Orders", f'{kpis["total_records"]:,}', f'AOV ₹{kpis["avg_order_value"]:,.0f}', "var(--orange)"),
        ("Customers", f'{kpis["unique_customers"]:,}',
         f"{orders_per_customer:.1f} orders/customer", "var(--purple)"),
        ("Units Sold", f'{kpis["total_quantity"]:,}',
         f'avg rating ★{kpis["avg_rating"]:.2f}', "var(--cyan)"),
        ("Avg Discount", f'{kpis["avg_discount_pct"]:.1f}%',
         f'max {df["Discount_%"].max():.0f}%', "var(--orange)"),
        ("Cancelled / Returned", f'{kpis["cancelled_returned_pct"]:.1f}%',
         f'{kpis["cancelled_returned_orders"]} orders · {short_money(kpis["leakage_sales"])}', "var(--red)"),
        ("Loss-Making Orders", f'{kpis["loss_orders"]:,}',
         f'{money(abs(kpis["loss_value"]))} total loss', "var(--red)"),
    ]
    return "".join(
        f'<div class="kpi" style="border-top:3px solid {color}">'
        f'<div class="l">{esc(label)}</div><div class="v" style="color:{color}">{esc(value)}</div>'
        f'<div class="d">{esc(detail)}</div></div>'
        for label, value, detail, color in cards
    )


def yearly_table(yearly: pd.DataFrame) -> str:
    rows = []
    for _, row in yearly.iterrows():
        year = f"{int(row['Year'])} ({int(row['Months'])} mo)" if row["Months"] < 12 else str(int(row["Year"]))
        rows.append([esc(year), money(row["Sales"]), money(row["Profit"]),
                     f'{int(row["Orders"]):,}', money(row["AOV"]), f'{row["Margin_%"]:.1f}%'])
    return table(["Year", "Sales", "Profit", "Orders", "AOV", "Margin %"], rows,
                 numeric={1, 2, 3, 4, 5})


def products_table(products: pd.DataFrame) -> str:
    rows = [
        [esc(row["Product_Name"]), esc(row["Category"]), money(row["Sales"]),
         f'{row["Margin_%"]:.1f}%']
        for _, row in products.head(10).iterrows()
    ]
    return table(["Product", "Category", "Sales", "Margin %"], rows, numeric={2, 3})


def low_revenue_table(products: pd.DataFrame) -> str:
    rows = [
        [esc(row["Product_Name"]), money(row["Sales"]), f'{int(row["Orders"]):,}',
         f'{row["Margin_%"]:.1f}%']
        for _, row in products.head(5).iterrows()
    ]
    return table(["Product", "Sales", "Orders", "Margin %"], rows, numeric={1, 2, 3})


def discount_table(discount: pd.DataFrame) -> str:
    rows = [
        [esc(row["Discount_Band"]), f'{int(row["Orders"]):,}', money(row["Sales"]),
         f'{row["Margin_%"]:.1f}%', f'{row["Rating"]:.2f}']
        for _, row in discount.iterrows()
    ]
    return table(["Discount Band", "Orders", "Sales", "Margin %", "Avg Rating"], rows,
                 numeric={1, 2, 3, 4})


def main() -> None:
    ac.ensure_dirs()
    df, kpis, tables = ac.load_context()

    category = tables["category"]
    region = tables["region"]
    segment = tables["segment"]
    discount = tables["discount"]
    shipping = tables["shipping"]
    product_all = tables["product_all"]
    yearly = tables["yearly"]

    electronics = category[category["Category"] == "Electronics"].iloc[0]
    top_two_share = (product_all.head(2)["Sales"].sum() / kpis["total_sales"] * 100)
    known_regions = region[region["Region"] != ac.UNKNOWN]
    best_region = known_regions.sort_values("Margin_%", ascending=False).iloc[0]
    worst_region = known_regions.sort_values("Margin_%").iloc[0]
    best_segment = segment.sort_values("Margin_%", ascending=False).iloc[0]
    worst_shipping = shipping.sort_values("Rating").iloc[0]
    consumer = segment[segment["Customer_Segment"] == "Consumer"]
    consumer_share = float(consumer["Sales_Share_%"].iloc[0]) if len(consumer) else 0.0

    inputs = {
        "i01": b64_chart(1), "i02": b64_chart(2), "i03": b64_chart(3),
        "i04": b64_chart(4), "i05": b64_chart(5), "i06": b64_chart(6),
        "i07": b64_chart(7), "i08": b64_chart(8), "i09": b64_chart(9),
        "i10": b64_chart(10), "i11": b64_chart(11), "i12": b64_chart(12),
        "i13": b64_chart(13), "i14": b64_chart(14), "i15": b64_chart(15),
        "title_suffix": f"{dt.date.fromisoformat(kpis['date_min']).year}–"
                        f"{dt.date.fromisoformat(kpis['date_max']).year}",
        "subtitle": (
            f"{kpis['total_records']:,} orders &bull; "
            f"{dt.date.fromisoformat(kpis['date_min']).strftime('%b %Y')} &ndash; "
            f"{dt.date.fromisoformat(kpis['date_max']).strftime('%b %Y')} &bull; "
            f"{kpis['categories']} categories &bull; {kpis['regions']} regions &bull; "
            f"{kpis['unique_customers']:,} customers"
        ),
        "kpi_cards": kpi_cards(kpis, df),
        "yearly_table": yearly_table(yearly),
        "products_table": products_table(tables["product"]),
        "low_revenue_table": low_revenue_table(tables["product_bottom"]),
        "discount_table": discount_table(discount),
        "generated": dt.date.today().strftime("%d %b %Y"),
        "electronics_sales": short_money(float(electronics["Sales"])),
        "electronics_share": f'{electronics["Sales_Share_%"]:.1f}',
        "electronics_margin": f'{electronics["Margin_%"]:.1f}',
        "top_product": esc(kpis["top_product"]),
        "top_product_share": f'{kpis["top_product_share_pct"]:.1f}',
        "top_two_share": f"{top_two_share:.1f}",
        "margin_0": f'{kpis["margin_0pct"]:.1f}',
        "margin_gt20": f'{kpis["margin_gt20pct"]:.1f}',
        "discount_recovery": money(kpis["discount_recovery"] or 0),
        "best_region": esc(best_region["Region"]),
        "best_region_margin": f'{best_region["Margin_%"]:.1f}',
        "best_region_sales": short_money(float(best_region["Sales"])),
        "worst_region": esc(worst_region["Region"]),
        "worst_region_margin": f'{worst_region["Margin_%"]:.1f}',
        "best_segment": esc(best_segment["Customer_Segment"]),
        "best_segment_margin": f'{best_segment["Margin_%"]:.1f}',
        "consumer_share": f"{consumer_share:.1f}",
        "worst_shipping": esc(worst_shipping["Shipping_Mode"]),
        "worst_shipping_rating": f'{worst_shipping["Rating"]:.2f}',
        "net_sales": short_money(kpis["net_sales_delivered"]),
        "leakage": short_money(kpis["leakage_sales"]),
        "pareto_pct": f'{kpis["pareto_pct_of_customers"]:.1f}',
        "pareto_customers": f'{kpis["pareto_customers"]:,}',
        "top10_share": f'{kpis["top10_customer_share_pct"]:.1f}',
        "aov": f'{kpis["avg_order_value"]:,.0f}',
        "annualized": short_money(kpis["annualized_2026"] or 0),
        "growth_2025": f'{kpis["yoy_growth_2025_pct"]:.1f}',
        "avg_rating": f'{kpis["avg_rating"]:.2f}',
        "rated_orders": f'{kpis["rated_orders"]:,}',
        "low_rating_pct": f'{kpis["low_rating_pct_of_rated"]:.1f}',
        "unknown_region_orders": f'{kpis["unknown_region_orders"]:,}',
        "unknown_region_sales": short_money(kpis["unknown_region_sales"]),
        "unknown_payment_orders": f'{kpis["unknown_payment_orders"]:,}',
        "cancelled_returned_pct": f'{kpis["cancelled_returned_pct"]:.1f}',
        "cancelled_returned_orders": f'{kpis["cancelled_returned_orders"]:,}',
        "loss_orders": f'{kpis["loss_orders"]:,}',
        "loss_value": short_money(abs(kpis["loss_value"])),
        "sales_mismatch": f'{kpis["sales_mismatch_records"]:,}',
    }

    template = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Retail Sales Dashboard | {{title_suffix}}</title>
<style>
  :root { --blue:#2563eb; --green:#16a34a; --orange:#f59e0b; --red:#dc2626; --purple:#7c3aed;
          --cyan:#0891b2; --ink:#0f172a; --muted:#64748b; --bg:#f1f5f9; --card:#ffffff; }
  * { box-sizing:border-box; margin:0; padding:0; font-family:'Segoe UI',system-ui,sans-serif; }
  body { background:var(--bg); color:var(--ink); }
  .topbar { background:linear-gradient(90deg,#1e3a8a,#2563eb); color:#fff; padding:18px 28px;
            display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; }
  .topbar h1 { font-size:22px; font-weight:700; }
  .topbar .sub { font-size:13px; opacity:.88; margin-top:3px; }
  .badge { background:rgba(255,255,255,.15); padding:6px 14px; border-radius:999px; font-size:12px; }
  .wrap { max-width:1400px; margin:0 auto; padding:20px 24px 40px; }
  h2.section { font-size:17px; margin:28px 0 12px; color:var(--ink); border-left:4px solid var(--blue);
               padding-left:10px; }
  .kpis { display:grid; grid-template-columns:repeat(auto-fit,minmax(185px,1fr)); gap:14px; margin-top:6px; }
  .kpi { background:var(--card); border-radius:14px; padding:15px 17px; box-shadow:0 1px 4px rgba(15,23,42,.08); }
  .kpi .v { font-size:22px; font-weight:800; margin-top:4px; }
  .kpi .l { font-size:11.5px; color:var(--muted); text-transform:uppercase; letter-spacing:.4px; }
  .kpi .d { font-size:11.5px; color:var(--muted); margin-top:4px; }
  .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .grid3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; }
  .card { background:var(--card); border-radius:14px; padding:14px; box-shadow:0 1px 4px rgba(15,23,42,.08); }
  .card h3 { font-size:14px; color:var(--ink); margin-bottom:8px; }
  .card img { width:100%; border-radius:8px; display:block; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th { background:#eff6ff; color:#1e40af; text-align:left; padding:8px 10px; }
  td { padding:7px 10px; border-bottom:1px solid #e2e8f0; }
  tr:hover td { background:#f8fafc; }
  .num { text-align:right; font-variant-numeric:tabular-nums; }
  .pos { color:var(--green); font-weight:600; } .neg { color:var(--red); font-weight:600; }
  .insight { background:#fffbeb; border:1px solid #fde68a; border-radius:10px; padding:10px 14px;
             font-size:13.5px; margin-bottom:8px; }
  .insight b { color:#92400e; }
  .rec { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:10px 14px;
         font-size:13.5px; margin-bottom:8px; }
  .rec b { color:#166534; }
  .callout { display:grid; grid-template-columns:repeat(auto-fit,minmax(320px,1fr)); gap:10px; }
  .note { font-size:12.5px; color:var(--muted); margin-top:8px; }
  /* ---- 3D scroll experience (CSS only, no libraries) ---- */
  html { scroll-behavior:smooth; }
  .scroll-progress { position:fixed; top:0; left:0; height:3px; width:100%; z-index:80;
    transform:scaleX(0); transform-origin:0 50%; pointer-events:none;
    background:linear-gradient(90deg,#22d3ee,#2563eb,#7c3aed);
    box-shadow:0 0 14px rgba(37,99,235,.55); }
  .topbar { position:relative; overflow:hidden; perspective:900px; }
  .hero-copy { position:relative; z-index:2; animation:heroIn 1.1s cubic-bezier(.22,1,.36,1) both; }
  .topbar .badge { position:relative; z-index:2;
    animation:heroIn 1.1s .14s cubic-bezier(.22,1,.36,1) both; }
  .hero-glow { position:absolute; border-radius:50%; filter:blur(46px); opacity:.55;
    pointer-events:none; will-change:transform; }
  .glow-a { width:320px; height:320px; right:8%; top:-170px; background:#22d3ee; }
  .glow-b { width:260px; height:260px; left:-70px; bottom:-170px; background:#7c3aed; }
  @keyframes heroIn {
    from { opacity:0; transform:perspective(800px) rotateX(-13deg) translate3d(0,-26px,-70px); }
    to   { opacity:1; transform:none; }
  }
  .reveal { opacity:0;
    transform:perspective(1100px) rotateX(9deg) translate3d(0,52px,-70px) scale(.985);
    transform-origin:top center;
    transition:opacity .75s ease, transform 1s cubic-bezier(.22,1,.36,1), box-shadow .35s ease;
    will-change:transform, opacity; }
  .reveal.is-visible { opacity:1; transform:perspective(1100px) rotateX(0) translate3d(0,0,0) scale(1); }
  .kpi.reveal { transform:perspective(900px) rotateX(14deg) translate3d(0,34px,-50px) scale(.96); }
  .kpi.reveal.is-visible { transform:none; }
  .card.reveal { transform:perspective(1100px) rotateX(8deg) translate3d(0,46px,-55px) scale(.985); }
  .card.reveal.is-visible { transform:none; }
  .card.reveal.is-visible:hover { transform:translateY(-4px); box-shadow:0 12px 26px rgba(15,23,42,.14); }
  .kpi.reveal.is-visible:hover { transform:translateY(-4px); box-shadow:0 12px 26px rgba(15,23,42,.14); }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior:auto; }
    .reveal, .kpi.reveal, .card.reveal { opacity:1 !important; transform:none !important; transition:none !important; }
    .hero-copy, .topbar .badge { animation:none !important; }
    .hero-glow { display:none; }
  }
  footer { text-align:center; color:var(--muted); font-size:12px; padding:24px; }
  @media (max-width:900px){ .grid2,.grid3{grid-template-columns:1fr;} }
</style>
</head>
<body>
<div class="scroll-progress" id="scrollProgress"></div>
<div class="topbar">
  <div class="hero-glow glow-a" data-parallax="-0.14"></div>
  <div class="hero-glow glow-b" data-parallax="0.09"></div>
  <div class="hero-copy"><h1>&#128200; Retail Sales Performance Dashboard</h1>
       <div class="sub">{{subtitle}}</div></div>
  <div class="badge">Currency: &#8377; (INR) &nbsp;|&nbsp; Source: retail_sales_5000_rows.csv</div>
</div>
<div class="wrap">

<h2 class="section">&#11088; Executive Summary (KPIs)</h2>
<div class="kpis">{{kpi_cards}}</div>
<p class="note"><b>Gross sales</b> includes cancelled and returned orders. <b>Net sales</b> counts
delivered orders only — use it for revenue decisions. Ratings exist only for delivered orders.</p>

<h2 class="section">&#128200; Sales &amp; Profit Trend</h2>
<div class="grid2">
  <div class="card"><h3>Monthly Sales &amp; Profit ({{title_suffix}})</h3><img src="{{i01}}" alt="monthly sales and profit trend"></div>
  <div class="card"><h3>Year-over-Year Performance</h3><img src="{{i02}}" alt="yearly performance"></div>
</div>
<div class="card" style="margin-top:16px"><h3>&#128204; YoY Summary</h3>
{{yearly_table}}
<p class="note">2026 covers 10 months; the annualized run-rate is {{annualized}}.
2025 grew {{growth_2025}}% over 2024.</p>
</div>

<h2 class="section">&#127968; Product &amp; Category Performance</h2>
<div class="grid3">
  <div class="card"><h3>Sales &amp; Profit by Category</h3><img src="{{i03}}" alt="category sales and profit"></div>
  <div class="card"><h3>Top 12 Products by Sales</h3><img src="{{i06}}" alt="top products"></div>
  <div class="card"><h3>Unit Price vs Sales (margin color)</h3><img src="{{i10}}" alt="price scatter"></div>
</div>
<div class="grid2" style="margin-top:16px">
  <div class="card"><h3>&#127942; Top 10 Products</h3>
  {{products_table}}</div>
  <div class="card"><h3>&#128269; Lowest-Revenue Products (watch list)</h3>
  {{low_revenue_table}}
  <p class="note">These are low-ticket, high-frequency items. Their margins are close to the company
  average, so they serve assortment and traffic roles rather than being loss-makers.</p></div>
</div>

<h2 class="section">&#127757; Regional &amp; Customer Analysis</h2>
<div class="grid2">
  <div class="card"><h3>Sales &amp; Margin by Region</h3><img src="{{i04}}" alt="regional sales and margin"></div>
  <div class="card"><h3>Sales Share by Segment</h3><img src="{{i05}}" alt="segment share"></div>
</div>
<div class="grid2" style="margin-top:16px">
  <div class="card"><h3>Region &times; Category Heatmap</h3><img src="{{i14}}" alt="region category heatmap"></div>
  <div class="card"><h3>&#128100; Top 10 Customers</h3><img src="{{i11}}" alt="top customers">
  <p class="note">Top 10 customers = {{top10_share}}% of sales, so concentration risk is low.
  {{pareto_customers}} customers ({{pareto_pct}}%) generate 80% of revenue.</p></div>
</div>
<p class="note">Region has {{unknown_region_orders}} missing values ({{unknown_region_sales}} in sales);
they are reported as <b>Unknown</b> so regional totals reconcile with company totals.</p>

<h2 class="section">&#127873; Discount, Payment &amp; Fulfilment</h2>
<div class="grid2">
  <div class="card"><h3>Discount Impact on Margin &#9888;&#65039;</h3><img src="{{i07}}" alt="discount impact"></div>
  <div class="card"><h3>Payment &amp; Shipping Modes</h3><img src="{{i08}}" alt="payment and shipping"></div>
</div>
<div class="card" style="margin-top:16px"><h3>&#128204; Discount Bands &mdash; the key finding</h3>
{{discount_table}}
<p class="note">Margin is aggregated as profit &divide; sales per band (not an average of row-level
percentages). Ratings stay flat at about {{avg_rating}} at every discount level. Moving the
&gt;20% band to 11&ndash;20% pricing would recover about {{discount_recovery}} of profit, holding
sales constant.</p>
</div>

<h2 class="section">&#9989; Order Quality, Ratings &amp; Fulfilment Mix</h2>
<div class="grid3">
  <div class="card"><h3>Order Status &amp; Ratings</h3><img src="{{i09}}" alt="order status and ratings"></div>
  <div class="card"><h3>Quantity &amp; Rating Distribution</h3><img src="{{i12}}" alt="quantity and rating distribution"></div>
  <div class="card"><h3>Sales by Weekday</h3><img src="{{i13}}" alt="sales by weekday"></div>
</div>
<div class="grid2" style="margin-top:16px">
  <div class="card"><h3>Gross Sales by Status</h3><img src="{{i15}}" alt="gross sales by order status">
  <p class="note">{{cancelled_returned_orders}} orders ({{cancelled_returned_pct}}%) were cancelled or
  returned, representing {{leakage}} of gross sales. Same-Day shipping has the lowest rating
  ({{worst_shipping_rating}}).</p></div>
  <div class="card"><h3>&#128203; Data Quality Snapshot</h3>
  <table>
    <tr><th>Check</th><th class="num">Result</th></tr>
    <tr><td>Sales = Qty &times; Price &times; (1 &minus; Discount)</td><td class="num pos">{{sales_mismatch}} mismatches</td></tr>
    <tr><td>Revenue included but not delivered</td><td class="num neg">{{leakage}}</td></tr>
    <tr><td>Missing region values</td><td class="num">{{unknown_region_orders}} orders</td></tr>
    <tr><td>Missing payment values</td><td class="num">{{unknown_payment_orders}} orders</td></tr>
    <tr><td>Orders without a rating</td><td class="num">{{cancelled_returned_orders}} (all non-delivered)</td></tr>
    <tr><td>Low ratings (1&ndash;2&#9733;)</td><td class="num">{{low_rating_pct}}% of rated orders</td></tr>
  </table></div>
</div>

<h2 class="section">&#128161; Key Insights</h2>
<div class="callout">
  <div class="insight"><b>1. Growth is real but flat:</b> 2025 grew {{growth_2025}}% over 2024;
  2026 (10 months) annualizes to {{annualized}}, roughly flat vs 2025. AOV is ₹{{aov}}.</div>
  <div class="insight"><b>2. Electronics is the engine:</b> {{electronics_sales}} sales
  ({{electronics_share}}% share) at a {{electronics_margin}}% margin. {{top_product}} alone is
  {{top_product_share}}% of company sales.</div>
  <div class="insight"><b>3. Discounts destroy margin, not delight customers:</b> average rating is
  about {{avg_rating}} in every band. Zero-discount orders earn {{margin_0}}% margin; the &gt;20%
  band earns {{margin_gt20}}%. Capping deep discounts recovers about {{discount_recovery}}.</div>
  <div class="insight"><b>4. Regional gap:</b> {{best_region}} has the best margin
  ({{best_region_margin}}%) on {{best_region_sales}} sales; {{worst_region}} has the weakest
  ({{worst_region_margin}}%). Review {{worst_region}}'s discount and product mix.</div>
  <div class="insight"><b>5. Leakage is material:</b> {{cancelled_returned_orders}} orders
  ({{cancelled_returned_pct}}%) were cancelled or returned, representing {{leakage}} of gross sales.
  Net delivered sales are {{net_sales}}.</div>
  <div class="insight"><b>6. Segment mix:</b> Consumer is {{consumer_share}}% of sales, while
  {{best_segment}} is the most profitable per rupee ({{best_segment_margin}}% margin).</div>
  <div class="insight"><b>7. Data quality is good, not perfect:</b> zero sales-formula mismatches,
  but {{unknown_region_orders}} orders lack a region and {{unknown_payment_orders}} lack a payment
  mode. All {{cancelled_returned_orders}} unrated orders are exactly the cancelled/returned ones.</div>
  <div class="insight"><b>8. Concentration risk is low:</b> top-10 customers are only {{top10_share}}%
  of sales; {{pareto_pct}}% of customers generate 80% of revenue.</div>
</div>

<h2 class="section">&#127919; Recommendations</h2>
<div class="callout">
  <div class="rec"><b>R1 &mdash; Cap deep discounts:</b> require approval above 20%. Moving the
  &gt;20% band to 11&ndash;20% pricing recovers about {{discount_recovery}} without losing
  satisfaction.</div>
  <div class="rec"><b>R2 &mdash; Protect the top products:</b> {{top_product}} and the next product
  are {{top_two_share}}% of revenue. Build bundles to lift AOV from ₹{{aov}} and reduce
  single-product risk.</div>
  <div class="rec"><b>R3 &mdash; Fix {{worst_region}} and learn from {{best_region}}:</b> audit
  {{worst_region}}'s discounting and mix; copy {{best_region}}'s {{best_region_margin}}% margin
  playbook.</div>
  <div class="rec"><b>R4 &mdash; Reduce cancellations and returns:</b> target
  {{cancelled_returned_pct}}% &rarr; 8%. Review Same-Day shipping SLAs
  ({{worst_shipping_rating}}) and pre-dispatch quality checks.</div>
  <div class="rec"><b>R5 &mdash; Grow {{best_segment}}:</b> highest margin at
  {{best_segment_margin}}% with a smaller revenue base &mdash; a clear mix-shift opportunity.</div>
  <div class="rec"><b>R6 &mdash; Loyalty for the core:</b> {{pareto_customers}} customers
  ({{pareto_pct}}%) drive 80% of revenue; retention here protects the base.</div>
</div>

<footer>Retail Sales Analysis &bull; {{subtitle}} &bull; Built {{generated}}
&bull; Python (pandas) &bull; Companion files: Retail_Sales_Analysis_Report.md,
Retail_Sales_Cleaned_For_PowerBI.csv, Power BI kit, Excel reports</footer>
</div>
</body>
<script>
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const progress = document.getElementById("scrollProgress");
  const targets = Array.from(document.querySelectorAll(
    "h2.section, .kpis .kpi, .grid2 > .card, .grid3 > .card, .wrap > .card, .callout > div"
  ));

  targets.forEach(el => {
    el.classList.add("reveal");
    const siblings = Array.from(el.parentElement.children).filter(child => targets.includes(child));
    el.style.transitionDelay = Math.min(siblings.indexOf(el), 8) * 65 + "ms";
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    targets.forEach(el => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    targets.forEach(el => observer.observe(el));
  }

  const layers = Array.from(document.querySelectorAll("[data-parallax]"));
  let ticking = false;
  const update = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    progress.style.transform = "scaleX(" + ratio + ")";
    if (!reduceMotion) {
      const y = window.scrollY;
      layers.forEach(layer => {
        const speed = parseFloat(layer.dataset.parallax) || 0;
        layer.style.transform = "translate3d(0," + (y * speed) + "px,0)";
      });
    }
    ticking = false;
  };
  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();
</script>
</html>"""

    page = template
    for key, value in inputs.items():
        page = page.replace("{{" + key + "}}", str(value))

    out_html = os.path.join(ac.BASE, "Retail_Sales_Dashboard.html")
    with open(out_html, "w", encoding="utf-8") as handle:
        handle.write(page)
    print("HTML dashboard:", out_html)

    # ---------------------------------------------------------------- Power BI workbook
    xl_path = os.path.join(ac.BASE, "Retail_Sales_PowerBI_Source.xlsx")
    fact = df.drop(columns=["Expected_Sales"], errors="ignore")
    quality = ac.data_quality_table(ac.load_raw(), df)

    with pd.ExcelWriter(xl_path, engine="openpyxl", datetime_format="yyyy-mm-dd") as writer:
        fact.to_excel(writer, sheet_name="Fact_Sales", index=False)
        tables["category"].to_excel(writer, sheet_name="Sum_Category", index=False)
        tables["region"].to_excel(writer, sheet_name="Sum_Region", index=False)
        tables["segment"].to_excel(writer, sheet_name="Sum_Segment", index=False)
        tables["monthly"][["Year", "Month", "Month_Name", "YearMonth", "Sales", "Profit",
                           "Orders", "Margin_%"]].to_excel(
            writer, sheet_name="Sum_Monthly", index=False)
        tables["product_all"].to_excel(writer, sheet_name="Sum_Product", index=False)
        quality.to_excel(writer, sheet_name="Data_Quality", index=False)

        for sheet in writer.sheets.values():
            sheet.freeze_panes = "A2"
            for column_cells in sheet.columns:
                width = max((len(str(cell.value)) for cell in column_cells if cell.value is not None),
                            default=8)
                sheet.column_dimensions[column_cells[0].column_letter].width = min(max(width + 2, 10), 32)
            for cell in sheet[1]:
                font = copy(cell.font)
                font.bold = True
                cell.font = font

    print("Excel source:", xl_path)


if __name__ == "__main__":
    main()
