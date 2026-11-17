# -*- coding: utf-8 -*-
"""Retail Sales 5,000 rows — analysis pipeline.

Run this first. It validates the raw CSV, writes the enriched dataset used by
the report builders, and generates every KPI, summary CSV and chart.

Usage:
    python run_analysis.py
"""
from __future__ import annotations

import os
import sys

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as mt
import numpy as np
import pandas as pd

import analysis_common as ac

BLUE, GREEN, ORANGE, RED, PURPLE, CYAN = (
    "#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2",
)
PALETTE = [BLUE, GREEN, ORANGE, RED, PURPLE, CYAN, "#db2777", "#65a30d", "#ea580c", "#4f46e5"]


def setup_style() -> None:
    plt.rcParams.update({
        "figure.facecolor": "white",
        "axes.facecolor": "white",
        "axes.grid": True,
        "grid.color": "#e5e7eb",
        "grid.linewidth": 0.8,
        "axes.axisbelow": True,
        "axes.spines.top": False,
        "axes.spines.right": False,
        "font.size": 10,
    })


def save(fig: plt.Figure, name: str) -> None:
    fig.tight_layout()
    fig.savefig(os.path.join(ac.CHARTS, name), dpi=130, bbox_inches="tight")
    plt.close(fig)


FMT_K = mt.FuncFormatter(
    lambda value, _pos: f"{value / 1e6:.1f}M" if abs(value) >= 1e6 else f"{value / 1e3:.0f}K"
)
FMT_PCT = mt.FuncFormatter(lambda value, _pos: f"{value:.0f}%")


# ------------------------------------------------------------------ 01 monthly
def chart_monthly(tables: dict[str, pd.DataFrame]) -> None:
    monthly = tables["monthly"]
    fig, ax = plt.subplots(figsize=(11, 4.5))
    x = np.arange(len(monthly))
    ax.plot(x, monthly["Sales"], marker="o", ms=4, color=BLUE, lw=2, label="Sales")
    ax.plot(x, monthly["Profit"], marker="s", ms=3, color=GREEN, lw=1.6, label="Profit")
    step = max(1, len(monthly) // 9)
    ax.set_xticks(x[::step])
    ax.set_xticklabels(monthly["YearMonth"][::step], rotation=45, ha="right")
    ax.yaxis.set_major_formatter(FMT_K)
    ax.set_title("Monthly Sales & Profit Trend", fontweight="bold")
    ax.legend()
    save(fig, "01_monthly_trend.png")


# ------------------------------------------------------------------ 02 yearly
def chart_yearly(tables: dict[str, pd.DataFrame]) -> None:
    yearly = tables["yearly"]
    fig, axes = plt.subplots(1, 3, figsize=(12, 3.8))
    columns = ["Sales", "Orders", "Margin_%"]
    colors = [BLUE, ORANGE, GREEN]
    for axis, column, color in zip(axes, columns, colors):
        axis.bar(yearly["Year"].astype(str), yearly[column], color=color, width=0.55)
        axis.set_title(column, fontweight="bold")
        for index, value in enumerate(yearly[column]):
            label = (
                f"{value / 1e6:.1f}M" if column == "Sales"
                else f"{value:.0f}" if column == "Orders"
                else f"{value:.1f}%"
            )
            axis.text(index, value, label, ha="center", va="bottom", fontsize=9, fontweight="bold")
        axis.set_ylim(0, max(yearly[column].max() * 1.2, 1))
    save(fig, "02_yearly.png")


# ---------------------------------------------------------------- 03 category
def chart_category(tables: dict[str, pd.DataFrame]) -> None:
    category = tables["category"].sort_values("Sales")
    fig, ax = plt.subplots(figsize=(8.5, 4.2))
    ax.barh(category["Category"], category["Sales"], color=BLUE, label="Sales")
    ax.barh(category["Category"], category["Profit"], color=GREEN, height=0.45, label="Profit")
    ax.xaxis.set_major_formatter(FMT_K)
    for index, (sales, margin) in enumerate(zip(category["Sales"], category["Margin_%"])):
        ax.text(sales, index, f"  margin {margin:.1f}%", va="center", fontsize=9)
    ax.legend(loc="lower right")
    ax.set_title("Sales & Profit by Category", fontweight="bold")
    save(fig, "03_category.png")


# ------------------------------------------------------------------ 04 region
def chart_region(tables: dict[str, pd.DataFrame]) -> None:
    region = tables["region"].sort_values("Sales", ascending=False)
    fig, axes = plt.subplots(1, 2, figsize=(11, 4))
    axes[0].bar(region["Region"], region["Sales"], color=BLUE, width=0.55)
    axes[0].yaxis.set_major_formatter(FMT_K)
    axes[0].set_title("Sales by Region", fontweight="bold")
    axes[1].bar(region["Region"], region["Margin_%"], color=ORANGE, width=0.55)
    for index, value in enumerate(region["Margin_%"]):
        axes[1].text(index, value, f"{value:.1f}%", ha="center", va="bottom",
                     fontweight="bold", fontsize=9)
    axes[1].set_title("Profit Margin % by Region", fontweight="bold")
    axes[1].set_ylim(0, region["Margin_%"].max() * 1.2)
    save(fig, "04_region.png")


# ----------------------------------------------------------------- 05 segment
def chart_segment(tables: dict[str, pd.DataFrame]) -> None:
    segment = tables["segment"].sort_values("Sales", ascending=False)
    fig, ax = plt.subplots(figsize=(7, 4))
    ax.pie(
        segment["Sales"],
        labels=segment["Customer_Segment"],
        autopct="%1.1f%%",
        colors=PALETTE[: len(segment)],
        startangle=90,
        wedgeprops=dict(width=0.45),
    )
    ax.set_title("Sales Share by Customer Segment", fontweight="bold")
    save(fig, "05_segment.png")


# ------------------------------------------------------------------ 06 top products
def chart_top_products(tables: dict[str, pd.DataFrame]) -> None:
    top = tables["product"]
    fig, ax = plt.subplots(figsize=(9.5, 5))
    ax.barh(top["Product_Name"], top["Sales"], color=BLUE)
    ax.xaxis.set_major_formatter(FMT_K)
    ax.invert_yaxis()
    ax.set_title("Top 12 Products by Sales", fontweight="bold")
    save(fig, "06_top_products.png")


# ----------------------------------------------------------------- 07 discount
def chart_discount(tables: dict[str, pd.DataFrame]) -> None:
    discount = tables["discount"]
    fig, axes = plt.subplots(1, 2, figsize=(11.5, 4))
    axes[0].bar(discount["Discount_Band"].astype(str), discount["Orders"], color=BLUE, width=0.55)
    axes[0].set_title("Orders by Discount Band", fontweight="bold")
    axes[1].bar(discount["Discount_Band"].astype(str), discount["Margin_%"], color=RED, width=0.55)
    for index, value in enumerate(discount["Margin_%"]):
        axes[1].text(index, value, f"{value:.1f}%", ha="center", va="bottom",
                     fontweight="bold", fontsize=9)
    axes[1].yaxis.set_major_formatter(FMT_PCT)
    axes[1].set_title("Profit Margin % by Discount Band", fontweight="bold")
    axes[1].set_ylim(0, discount["Margin_%"].max() * 1.2)
    save(fig, "07_discount.png")


# ------------------------------------------------------------ 08 payment/shipping
def chart_payment_shipping(tables: dict[str, pd.DataFrame]) -> None:
    payment, shipping = tables["payment"], tables["shipping"]
    fig, axes = plt.subplots(1, 2, figsize=(12, 4))
    axes[0].bar(payment["Payment_Mode"], payment["Sales"], color=PURPLE, width=0.55)
    axes[0].yaxis.set_major_formatter(FMT_K)
    axes[0].tick_params(axis="x", rotation=20)
    axes[0].set_title("Sales by Payment Mode", fontweight="bold")
    axes[1].bar(shipping["Shipping_Mode"], shipping["Orders"], color=BLUE, width=0.55)
    for index, (orders, rating) in enumerate(zip(shipping["Orders"], shipping["Rating"])):
        axes[1].text(index, orders, f"{orders:,.0f}\n★{rating:.2f}", ha="center",
                     va="bottom", fontsize=9, fontweight="bold")
    axes[1].set_ylim(0, shipping["Orders"].max() * 1.25)
    axes[1].set_title("Orders by Shipping Mode (with avg rating)", fontweight="bold")
    save(fig, "08_payment_shipping.png")


# ------------------------------------------------------------- 09 status/rating
def chart_status_rating(tables: dict[str, pd.DataFrame]) -> None:
    status, rating = tables["status"], tables["rating"]
    fig, axes = plt.subplots(1, 2, figsize=(11.5, 4))
    axes[0].bar(status["Order_Status"], status["Orders"], color=GREEN, width=0.55)
    for index, (orders, share) in enumerate(zip(status["Orders"], status["Share_%"])):
        axes[0].text(index, orders, f"{orders:,}\n({share:.1f}%)", ha="center", va="bottom",
                     fontsize=9, fontweight="bold")
    axes[0].set_ylim(0, status["Orders"].max() * 1.2)
    axes[0].set_title("Order Status", fontweight="bold")
    axes[1].bar(rating["Customer_Rating"].astype(int).astype(str), rating["Orders"],
                color=ORANGE, width=0.55)
    axes[1].set_title("Orders by Customer Rating (delivered only)", fontweight="bold")
    axes[1].set_xlabel("Rating")
    save(fig, "09_status_rating.png")


# ----------------------------------------------------------------- 10 scatter
def chart_scatter(df: pd.DataFrame) -> None:
    fig, ax = plt.subplots(figsize=(8.5, 4.5))
    scatter = ax.scatter(
        df["Unit_Price"], df["Sales"], c=df["Profit_Margin_%"], cmap="RdYlGn",
        s=12, alpha=0.5, vmin=0, vmax=60,
    )
    ax.set_xscale("log")
    ax.set_yscale("log")
    ax.set_xlabel("Unit Price (log)")
    ax.set_ylabel("Sales (log)")
    ax.set_title("Unit Price vs Sales (color = profit margin %)", fontweight="bold")
    fig.colorbar(scatter, ax=ax, label="Margin %")
    save(fig, "10_price_scatter.png")


# -------------------------------------------------------------- 11 top customers
def chart_customers(tables: dict[str, pd.DataFrame]) -> None:
    top = tables["customer"].head(10)
    fig, ax = plt.subplots(figsize=(9, 4))
    ax.bar(top["Customer_ID"], top["Sales"], color=BLUE, width=0.55)
    ax.yaxis.set_major_formatter(FMT_K)
    ax.tick_params(axis="x", rotation=30)
    ax.set_title("Top 10 Customers by Sales", fontweight="bold")
    save(fig, "11_top_customers.png")


# ------------------------------------------------------------ 12 distributions
def chart_distributions(df: pd.DataFrame, tables: dict[str, pd.DataFrame]) -> None:
    quantity = tables["quantity"]
    fig, axes = plt.subplots(1, 2, figsize=(11.5, 3.8))
    axes[0].bar(quantity["Quantity"], quantity["Orders"], color=BLUE)
    axes[0].set_title("Orders by Quantity", fontweight="bold")
    axes[0].set_xlabel("Qty per order")
    ratings = df["Customer_Rating"].dropna()
    axes[1].hist(ratings, bins=[1, 2, 3, 4, 5, 6], color=GREEN,
                 edgecolor="white", align="left", rwidth=0.85)
    axes[1].set_title("Rating Distribution (delivered only)", fontweight="bold")
    axes[1].set_xlabel("Rating")
    axes[1].set_xticks([1, 2, 3, 4, 5])
    save(fig, "12_qty_rating_dist.png")


# ----------------------------------------------------------------- 13 weekday
def chart_weekday(tables: dict[str, pd.DataFrame]) -> None:
    weekday = tables["weekday"]
    fig, ax = plt.subplots(figsize=(9, 3.8))
    ax.bar(weekday["Weekday"], weekday["Sales"], color=BLUE, width=0.55)
    ax.yaxis.set_major_formatter(FMT_K)
    ax.set_title("Sales by Weekday", fontweight="bold")
    save(fig, "13_weekday.png")


# ---------------------------------------------------------------- 14 heatmap
def chart_heatmap(df: pd.DataFrame) -> None:
    pivot = df.pivot_table(index="Region", columns="Category", values="Sales",
                           aggfunc="sum", fill_value=0)
    pivot = pivot.loc[pivot.sum(axis=1).sort_values(ascending=False).index]
    pivot = pivot[pivot.sum(axis=0).sort_values(ascending=False).index]
    fig, ax = plt.subplots(figsize=(9, max(3.2, 0.55 * len(pivot) + 1.4)))
    image = ax.imshow(pivot.values, cmap="Blues", aspect="auto")
    ax.set_xticks(range(len(pivot.columns)))
    ax.set_xticklabels(pivot.columns, rotation=25, ha="right")
    ax.set_yticks(range(len(pivot.index)))
    ax.set_yticklabels(pivot.index)
    threshold = pivot.values.max() * 0.6 if pivot.values.size else 0
    for row in range(pivot.shape[0]):
        for column in range(pivot.shape[1]):
            value = pivot.values[row, column]
            ax.text(column, row, f"{value / 1e6:.2f}M", ha="center", va="center",
                    fontsize=8.5, color="white" if value > threshold else "#111827")
    ax.set_title("Sales Heatmap: Region x Category", fontweight="bold")
    ax.grid(False)
    fig.colorbar(image, ax=ax, label="Sales (₹)")
    save(fig, "14_heatmap.png")


# ------------------------------------------------------- 15 gross vs net sales
def chart_status_sales(tables: dict[str, pd.DataFrame]) -> None:
    status = tables["status"].sort_values("Sales", ascending=False)
    fig, ax = plt.subplots(figsize=(8.5, 3.8))
    bars = ax.bar(status["Order_Status"], status["Sales"], color=[GREEN, RED, ORANGE], width=0.5)
    ax.yaxis.set_major_formatter(FMT_K)
    for bar, value in zip(bars, status["Sales"]):
        ax.text(bar.get_x() + bar.get_width() / 2, value,
                f"₹{value / 1e6:.2f}M", ha="center", va="bottom",
                fontsize=9, fontweight="bold")
    ax.set_ylim(0, status["Sales"].max() * 1.18)
    ax.set_title("Gross Sales by Order Status (cancelled/returned are not net revenue)",
                 fontweight="bold", fontsize=10)
    save(fig, "15_sales_by_status.png")


# ------------------------------------------------------------------- insights
def build_insight_lines(kpis: dict, tables: dict[str, pd.DataFrame]) -> list[str]:
    category = tables["category"]
    region = tables["region"]
    status = tables["status"]
    shipping = tables["shipping"]
    yearly = tables["yearly"]
    best_category = category.iloc[0]
    worst_margin_category = category.sort_values("Margin_%").iloc[0]
    best_region = region.iloc[0]
    known_region = region[region["Region"] != ac.UNKNOWN]
    worst_margin_region = (
        known_region.sort_values("Margin_%").iloc[0] if len(known_region) else best_region
    )
    best_shipping = shipping.sort_values("Rating").iloc[0]

    lines = [
        f"Date range: {kpis['date_min']} to {kpis['date_max']} "
        f"({kpis['months_covered']} months, {kpis['total_records']:,} orders)",
        f"Gross sales: {ac.inr(kpis['total_sales'])} | profit {ac.inr(kpis['total_profit'])} "
        f"({ac.pct(kpis['profit_margin_pct'])})",
        f"Net delivered sales: {ac.inr(kpis['net_sales_delivered'])} | profit "
        f"{ac.inr(kpis['net_profit_delivered'])} ({ac.pct(kpis['net_margin_delivered_pct'])})",
        f"Cancelled/returned: {kpis['cancelled_returned_orders']} orders "
        f"({ac.pct(kpis['cancelled_returned_pct'])}) = {ac.inr(kpis['leakage_sales'])} gross sales",
        f"Best month (sales): {kpis['best_month']} = {ac.inr(kpis['best_month_sales'])} | "
        f"weakest: {kpis['worst_month']} = {ac.inr(kpis['worst_month_sales'])}",
        f"Best category: {best_category['Category']} ({ac.inr(best_category['Sales'])}, "
        f"{best_category['Margin_%']:.1f}% margin) | lowest margin: "
        f"{worst_margin_category['Category']} ({worst_margin_category['Margin_%']:.1f}%)",
        f"Top region: {best_region['Region']} ({ac.inr(best_region['Sales'])}) | lowest margin: "
        f"{worst_margin_region['Region']} ({worst_margin_region['Margin_%']:.1f}%)",
        f"Top product: {kpis['top_product']} = {ac.inr(kpis['top_product_sales'])} "
        f"({ac.pct(kpis['top_product_share_pct'])} of sales)",
        f"Loss-making orders: {kpis['loss_orders']} of {kpis['total_records']} "
        f"({ac.pct(kpis['loss_orders_pct'])}) | total loss {ac.inr(abs(kpis['loss_value']))}",
        f"Discount margin: 0% band {ac.pct(kpis['margin_0pct'])} vs >20% band "
        f"{ac.pct(kpis['margin_gt20pct'])} | recovery if capped at 11-20%: "
        f"{ac.inr(kpis['discount_recovery'] or 0)}",
        f"Top 10 customers = {ac.pct(kpis['top10_customer_share_pct'])} of sales | "
        f"{kpis['pareto_customers']} customers ({ac.pct(kpis['pareto_pct_of_customers'])}) make 80%",
        f"Avg rating: {kpis['avg_rating']:.2f} from {kpis['rated_orders']:,} rated (delivered) orders; "
        f"{kpis['low_rating_orders']} low ratings ({ac.pct(kpis['low_rating_pct_of_rated'])} of rated)",
        f"Lowest shipping rating: {best_shipping['Shipping_Mode']} ({best_shipping['Rating']:.2f})",
        f"Data quality: {kpis['sales_mismatch_records']} sales-formula mismatches | "
        f"{kpis['unknown_region_orders']} unknown region orders ({ac.inr(kpis['unknown_region_sales'])}) | "
        f"{kpis['unknown_payment_orders']} unknown payment orders",
        f"2025 growth: {kpis['yoy_growth_2025_pct']:.1f}% | 2026 annualized: "
        f"{ac.inr(kpis['annualized_2026'] or 0)}",
        f"Yearly rows: {len(yearly)} | status rows: {len(status)}",
    ]
    return lines


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    ac.ensure_dirs()
    setup_style()

    print("Loading and validating raw data...")
    raw = ac.load_raw()
    for warning in ac.validate_raw(raw):
        print(f"  WARNING: {warning}")

    print("Cleaning and enriching...")
    df = ac.enrich(raw)
    quality = ac.data_quality_table(raw, df)

    print("Computing KPIs and summary tables...")
    kpis = ac.compute_kpis(df)
    tables = ac.compute_tables(df)

    # Write the dataset *after* enrichment so Discount_Band and flags exist.
    df.to_csv(ac.CLEAN_CSV, index=False)
    ac.write_summary_csvs(tables)
    ac.write_kpis(kpis)
    quality.to_csv(ac.QUALITY_CSV, index=False)

    print("Building charts...")
    chart_monthly(tables)
    chart_yearly(tables)
    chart_category(tables)
    chart_region(tables)
    chart_segment(tables)
    chart_top_products(tables)
    chart_discount(tables)
    chart_payment_shipping(tables)
    chart_status_rating(tables)
    chart_scatter(df)
    chart_customers(tables)
    chart_distributions(df, tables)
    chart_weekday(tables)
    chart_heatmap(df)
    chart_status_sales(tables)

    insights = build_insight_lines(kpis, tables)
    with open(os.path.join(ac.OUT, "Key_Insights_Data.txt"), "w", encoding="utf-8") as handle:
        handle.write("\n".join(insights))

    print("\n=== KPIs ===")
    for key, value in kpis.items():
        print(f"{key}: {value}")
    print("\n=== Yearly ===")
    print(tables["yearly"].to_string(index=False))
    print("\n=== Category ===")
    print(tables["category"].to_string(index=False))
    print("\n=== Region ===")
    print(tables["region"].to_string(index=False))
    print("\n=== Discount ===")
    print(tables["discount"].to_string(index=False))
    print("\n=== Status ===")
    print(tables["status"].to_string(index=False))
    print("\n=== INSIGHTS ===")
    print("\n".join(insights))
    print(f"\nDone. Outputs in: {ac.OUT}")
    print(f"Cleaned CSV: {ac.CLEAN_CSV}")


if __name__ == "__main__":
    main()
