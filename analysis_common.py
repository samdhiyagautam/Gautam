# -*- coding: utf-8 -*-
"""Shared data loading, validation, cleaning, KPI and summary-table logic.

Every report builder imports this module so that the numbers in the HTML,
Excel and Power BI outputs always come from the same computation.

Run ``run_analysis.py`` first; it writes the enriched dataset consumed here.
"""
from __future__ import annotations

import json
import os
from typing import Any

import numpy as np
import pandas as pd

BASE = os.path.dirname(os.path.abspath(__file__))
RAW_CSV = os.path.join(BASE, "retail_sales_5000_rows.csv")
CLEAN_CSV = os.path.join(BASE, "Retail_Sales_Cleaned_For_PowerBI.csv")
OUT = os.path.join(BASE, "analysis_outputs")
CHARTS = os.path.join(OUT, "charts")
KPI_JSON = os.path.join(OUT, "KPIs.json")
KPI_CSV = os.path.join(OUT, "KPIs.csv")
QUALITY_CSV = os.path.join(OUT, "Data_Quality.csv")

UNKNOWN = "Unknown"

REQUIRED_COLUMNS = [
    "Order_ID", "Order_Date", "Customer_ID", "Customer_Segment", "Region",
    "Category", "Product_Name", "Quantity", "Unit_Price", "Discount", "Sales",
    "Profit", "Payment_Mode", "Shipping_Mode", "Order_Status", "Customer_Rating",
]

DISCOUNT_BINS = [-0.0001, 0.0, 0.05, 0.10, 0.20, 1.0]
DISCOUNT_LABELS = ["0%", "1-5%", "6-10%", "11-20%", ">20%"]
WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

SUMMARY_FILES = {
    "monthly": "Monthly_Trend.csv",
    "yearly": "Yearly_Summary.csv",
    "category": "Category_Summary.csv",
    "region": "Region_Summary.csv",
    "segment": "Segment_Summary.csv",
    "product": "Top_Products_by_Sales.csv",
    "product_bottom": "Lowest_Revenue_Products.csv",
    "product_worst": "Worst_Products_by_Profit.csv",
    "discount": "Discount_Impact.csv",
    "payment": "Payment_Mode_Summary.csv",
    "shipping": "Shipping_Mode_Summary.csv",
    "status": "Order_Status_Summary.csv",
    "rating": "Rating_Summary.csv",
    "customer": "Customer_Ranked.csv",
    "quantity": "Quantity_Distribution.csv",
    "weekday": "Weekday_Summary.csv",
}


# --------------------------------------------------------------------- helpers
def ensure_dirs() -> None:
    """Create the output folders if they do not exist yet."""
    os.makedirs(CHARTS, exist_ok=True)


def safe_div(numerator: float, denominator: float, default: float = 0.0) -> float:
    """Divide without raising on zero/NaN."""
    if denominator in (0, 0.0) or pd.isna(denominator) or pd.isna(numerator):
        return default
    return numerator / denominator


def excel_value(value: Any) -> Any:
    """Convert numpy scalars to native Python types for openpyxl/json."""
    if isinstance(value, np.generic):
        return value.item()
    return value


def inr(value: float, decimals: int = 0) -> str:
    return f"₹{value:,.{decimals}f}"


def cr(value: float, decimals: int = 2) -> str:
    return f"₹{value / 1e7:.{decimals}f} Cr"


def mn(value: float, decimals: int = 2) -> str:
    return f"₹{value / 1e6:.{decimals}f}M"


def pct(value: float, decimals: int = 1) -> str:
    return f"{value:.{decimals}f}%"


def _require_columns(df: pd.DataFrame, columns: list[str]) -> None:
    missing = [c for c in columns if c not in df.columns]
    if missing:
        raise ValueError(
            "Input CSV is missing required column(s): " + ", ".join(missing)
            + f"\nExpected columns: {', '.join(columns)}"
        )


# --------------------------------------------------------------------- loading
def load_raw(path: str = RAW_CSV) -> pd.DataFrame:
    """Load and type-coerce the raw order CSV, failing loudly on bad input."""
    if not os.path.exists(path):
        raise FileNotFoundError(f"Raw data file not found: {path}")
    df = pd.read_csv(path)
    df.columns = [str(c).strip() for c in df.columns]
    _require_columns(df, REQUIRED_COLUMNS)

    df["Order_Date"] = pd.to_datetime(df["Order_Date"], errors="coerce")
    invalid_dates = int(df["Order_Date"].isna().sum())
    if invalid_dates:
        raise ValueError(f"{invalid_dates} row(s) have an invalid Order_Date; fix the source CSV first.")
    return df


def load_clean(path: str = CLEAN_CSV) -> pd.DataFrame:
    """Load the enriched dataset written by run_analysis.py."""
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Enriched dataset not found: {path}\nRun 'python run_analysis.py' first."
        )
    df = pd.read_csv(path, parse_dates=["Order_Date"])
    # Keep the same band ordering as the enriched dataset even after a CSV round-trip.
    if "Discount_Band" not in df.columns:
        df["Discount_Band"] = discount_band(df["Discount"])
    else:
        df["Discount_Band"] = pd.Categorical(
            df["Discount_Band"], categories=DISCOUNT_LABELS, ordered=True
        )
    return df


def discount_band(discount: pd.Series) -> pd.Series:
    """Map a 0-1 discount column to the five reporting bands."""
    return pd.cut(
        discount,
        bins=DISCOUNT_BINS,
        labels=DISCOUNT_LABELS,
        include_lowest=True,
        ordered=True,
    )


# --------------------------------------------------------------------- cleaning
def validate_raw(df: pd.DataFrame) -> list[str]:
    """Return non-fatal data-quality warnings (the pipeline still runs)."""
    warnings: list[str] = []
    if df["Order_ID"].duplicated().any():
        warnings.append(f"{int(df['Order_ID'].duplicated().sum())} duplicate Order_ID value(s)")
    if (df["Quantity"] <= 0).any():
        warnings.append(f"{int((df['Quantity'] <= 0).sum())} row(s) with Quantity <= 0")
    if not df["Discount"].between(0, 1).all():
        warnings.append("Discount column has values outside the 0-1 range")
    if (df["Sales"] < 0).any():
        warnings.append(f"{int((df['Sales'] < 0).sum())} row(s) with negative Sales")
    rated = df["Customer_Rating"].dropna()
    if ((rated < 1) | (rated > 5)).any():
        warnings.append("Customer_Rating has values outside 1-5")
    for col in ("Region", "Payment_Mode", "Customer_Rating"):
        n = int(df[col].isna().sum())
        if n:
            warnings.append(f"{n} missing value(s) in {col}")
    return warnings


def enrich(df: pd.DataFrame) -> pd.DataFrame:
    """Add derived columns and resolve missing dimension values explicitly.

    Missing Region/Payment_Mode become 'Unknown' so every total reconciles;
    the original missingness is preserved in *_Was_Missing flags.
    Customer_Rating stays blank because averaging a blank is different from
    averaging a zero.
    """
    out = df.copy()
    region_missing = out["Region"].isna()
    payment_missing = out["Payment_Mode"].isna()

    out["Region"] = out["Region"].fillna(UNKNOWN).astype(str).str.strip()
    out["Payment_Mode"] = out["Payment_Mode"].fillna(UNKNOWN).astype(str).str.strip()
    out["Customer_Segment"] = out["Customer_Segment"].fillna(UNKNOWN)
    out["Category"] = out["Category"].fillna(UNKNOWN)
    out["Product_Name"] = out["Product_Name"].fillna(UNKNOWN)
    out["Order_Status"] = out["Order_Status"].fillna(UNKNOWN)

    out["Year"] = out["Order_Date"].dt.year
    out["Month"] = out["Order_Date"].dt.month
    out["Month_Name"] = out["Order_Date"].dt.strftime("%b")
    out["YearMonth"] = out["Order_Date"].dt.strftime("%Y-%m")
    out["Quarter"] = "Q" + out["Order_Date"].dt.quarter.astype(str)
    out["Year_Quarter"] = out["Year"].astype(str) + "-" + out["Quarter"]
    out["Weekday"] = out["Order_Date"].dt.day_name()

    out["Profit_Margin_%"] = np.where(
        out["Sales"] > 0, out["Profit"] / out["Sales"] * 100, 0.0
    )
    out["Discount_%"] = out["Discount"] * 100
    out["Revenue_per_Unit"] = np.where(
        out["Quantity"] > 0, out["Sales"] / out["Quantity"], 0.0
    )
    out["Effective_Price"] = out["Unit_Price"] * (1 - out["Discount"])
    out["Expected_Sales"] = (out["Quantity"] * out["Effective_Price"]).round(2)
    out["Sales_Mismatch"] = (out["Expected_Sales"] - out["Sales"]).abs() > 1
    out["Loss_Flag"] = out["Profit"] < 0
    out["Is_Delivered"] = out["Order_Status"].eq("Delivered")
    out["Discount_Band"] = discount_band(out["Discount"])
    out["Region_Was_Missing"] = region_missing
    out["Payment_Was_Missing"] = payment_missing
    return out


# --------------------------------------------------------------------- metrics
def compute_kpis(df: pd.DataFrame) -> dict[str, Any]:
    """Compute every headline metric used by the reports."""
    total_sales = float(df["Sales"].sum())
    total_profit = float(df["Profit"].sum())
    delivered = df[df["Is_Delivered"]]
    cancelled_returned = df[df["Order_Status"].isin(["Cancelled", "Returned"])]

    rated = df["Customer_Rating"].dropna()
    low_rating = int((rated <= 2).sum())

    monthly = df.groupby("YearMonth")["Sales"].sum()
    yearly = df.groupby("Year").agg(Sales=("Sales", "sum"))

    products = df.groupby("Product_Name")["Sales"].sum().sort_values(ascending=False)
    customers = df.groupby("Customer_ID")["Sales"].sum().sort_values(ascending=False)
    cumulative = customers.cumsum() / customers.sum() * 100 if len(customers) else pd.Series(dtype=float)
    pareto_n = int((cumulative <= 80).sum()) + 1 if len(cumulative) else 0

    band = df.groupby("Discount_Band", observed=True).agg(
        Sales=("Sales", "sum"), Profit=("Profit", "sum")
    )
    band_margin = band["Profit"] / band["Sales"].replace(0, np.nan) * 100

    years = sorted(int(y) for y in yearly.index)
    growth_2025 = None
    if 2024 in yearly.index and 2025 in yearly.index:
        growth_2025 = safe_div(yearly.loc[2025, "Sales"] - yearly.loc[2024, "Sales"],
                               yearly.loc[2024, "Sales"]) * 100

    annualized_2026 = None
    if 2026 in yearly.index:
        months_2026 = int(df.loc[df["Year"] == 2026, "YearMonth"].nunique())
        if months_2026:
            annualized_2026 = float(yearly.loc[2026, "Sales"]) / months_2026 * 12

    def band_value(label: str, column: pd.Series) -> float:
        return float(column.get(label, 0.0))

    unknown_region = df[df["Region"] == UNKNOWN]
    unknown_payment = df[df["Payment_Mode"] == UNKNOWN]

    kpis: dict[str, Any] = {
        # coverage
        "total_records": int(len(df)),
        "date_min": str(df["Order_Date"].min().date()),
        "date_max": str(df["Order_Date"].max().date()),
        "months_covered": int(df["YearMonth"].nunique()),
        "years": years,
        # headline
        "total_sales": round(total_sales, 2),
        "total_profit": round(total_profit, 2),
        "profit_margin_pct": round(safe_div(total_profit, total_sales) * 100, 2),
        "avg_order_value": round(float(df["Sales"].mean()), 2),
        "median_order_value": round(float(df["Sales"].median()), 2),
        "total_quantity": int(df["Quantity"].sum()),
        "unique_customers": int(df["Customer_ID"].nunique()),
        "unique_products": int(df["Product_Name"].nunique()),
        "categories": int(df["Category"].nunique()),
        "regions": int(df.loc[df["Region"] != UNKNOWN, "Region"].nunique()),
        "segments": int(df["Customer_Segment"].nunique()),
        # delivered / net
        "net_sales_delivered": round(float(delivered["Sales"].sum()), 2),
        "net_profit_delivered": round(float(delivered["Profit"].sum()), 2),
        "net_margin_delivered_pct": round(
            safe_div(delivered["Profit"].sum(), delivered["Sales"].sum()) * 100, 2
        ),
        # leakage
        "cancelled_orders": int((df["Order_Status"] == "Cancelled").sum()),
        "returned_orders": int((df["Order_Status"] == "Returned").sum()),
        "cancelled_returned_orders": int(len(cancelled_returned)),
        "cancelled_returned_pct": round(len(cancelled_returned) / len(df) * 100, 2),
        "leakage_sales": round(float(cancelled_returned["Sales"].sum()), 2),
        "leakage_profit": round(float(cancelled_returned["Profit"].sum()), 2),
        # discounts and ratings
        "avg_discount_pct": round(float(df["Discount_%"].mean()), 2),
        "avg_rating": round(float(rated.mean()), 2),
        "rated_orders": int(len(rated)),
        "unrated_orders": int(df["Customer_Rating"].isna().sum()),
        "low_rating_orders": low_rating,
        "low_rating_pct_of_rated": round(safe_div(low_rating, len(rated)) * 100, 2),
        "margin_0pct": round(band_value("0%", band_margin), 2),
        "margin_gt20pct": round(band_value(">20%", band_margin), 2),
        "margin_11_20pct": round(band_value("11-20%", band_margin), 2),
        "sales_gt20pct": round(band_value(">20%", band["Sales"]), 2),
        "profit_gt20pct": round(band_value(">20%", band["Profit"]), 2),
        # risk / concentration
        "loss_orders": int(df["Loss_Flag"].sum()),
        "loss_orders_pct": round(df["Loss_Flag"].mean() * 100, 2),
        "loss_value": round(float(df.loc[df["Loss_Flag"], "Profit"].sum()), 2),
        "sales_mismatch_records": int(df["Sales_Mismatch"].sum()),
        "top_product": str(products.index[0]) if len(products) else "",
        "top_product_sales": round(float(products.iloc[0]), 2) if len(products) else 0.0,
        "top_product_share_pct": round(safe_div(products.iloc[0], total_sales) * 100, 2) if len(products) else 0.0,
        "top10_customer_share_pct": round(safe_div(customers.head(10).sum(), total_sales) * 100, 2),
        "pareto_customers": pareto_n,
        "pareto_pct_of_customers": round(safe_div(pareto_n, len(customers)) * 100, 2),
        # timing
        "best_month": str(monthly.idxmax()) if len(monthly) else "",
        "best_month_sales": round(float(monthly.max()), 2) if len(monthly) else 0.0,
        "worst_month": str(monthly.idxmin()) if len(monthly) else "",
        "worst_month_sales": round(float(monthly.min()), 2) if len(monthly) else 0.0,
        "yoy_growth_2025_pct": round(growth_2025, 2) if growth_2025 is not None else None,
        "annualized_2026": round(annualized_2026, 2) if annualized_2026 is not None else None,
        # missing dimensions (explicit, so reports can disclose them)
        "unknown_region_orders": int(len(unknown_region)),
        "unknown_region_sales": round(float(unknown_region["Sales"].sum()), 2),
        "unknown_payment_orders": int(len(unknown_payment)),
        "unknown_payment_sales": round(float(unknown_payment["Sales"].sum()), 2),
    }

    # If the >20% band were priced like the 11-20% band (sales held constant).
    if kpis["margin_11_20pct"]:
        kpis["discount_recovery"] = round(
            kpis["sales_gt20pct"] * kpis["margin_11_20pct"] / 100 - kpis["profit_gt20pct"], 2
        )
    else:
        kpis["discount_recovery"] = None
    return kpis


def compute_tables(df: pd.DataFrame) -> dict[str, pd.DataFrame]:
    """Build every aggregate table used by the reports."""
    total_sales = float(df["Sales"].sum())

    monthly = (
        df.groupby(["YearMonth", "Year", "Month", "Month_Name"], as_index=False)
        .agg(Sales=("Sales", "sum"), Profit=("Profit", "sum"), Orders=("Order_ID", "count"))
        .sort_values(["Year", "Month"])
    )
    monthly["Margin_%"] = monthly["Profit"] / monthly["Sales"].replace(0, np.nan) * 100

    yearly = df.groupby("Year", as_index=False).agg(
        Sales=("Sales", "sum"), Profit=("Profit", "sum"),
        Orders=("Order_ID", "count"), AOV=("Sales", "mean"),
    )
    yearly["Margin_%"] = yearly["Profit"] / yearly["Sales"].replace(0, np.nan) * 100
    yearly["Months"] = yearly["Year"].map(df.groupby("Year")["YearMonth"].nunique())

    def dim_summary(column: str, extra: dict | None = None) -> pd.DataFrame:
        aggregations: dict[str, Any] = {
            "Sales": ("Sales", "sum"),
            "Profit": ("Profit", "sum"),
            "Orders": ("Order_ID", "count"),
            "Rating": ("Customer_Rating", "mean"),
        }
        if extra:
            aggregations.update(extra)
        table = df.groupby(column, as_index=False).agg(**aggregations)
        table["Margin_%"] = table["Profit"] / table["Sales"].replace(0, np.nan) * 100
        table["Sales_Share_%"] = table["Sales"] / total_sales * 100
        table["Rating"] = table["Rating"].round(2)
        return table

    category = dim_summary("Category").sort_values("Sales", ascending=False)
    region = dim_summary("Region", {"Customers": ("Customer_ID", "nunique")})
    region["AOV"] = region["Sales"] / region["Orders"].replace(0, np.nan)
    region = region.sort_values("Sales", ascending=False)
    segment = dim_summary("Customer_Segment", {"Customers": ("Customer_ID", "nunique")})
    segment = segment.sort_values("Sales", ascending=False)

    product = dim_summary("Product_Name", {"Category": ("Category", "first"),
                                          "Qty": ("Quantity", "sum")})
    product = product.sort_values("Sales", ascending=False)
    product_top = product.head(12)
    product_bottom = product.sort_values("Sales").head(10)
    product_worst = product.sort_values("Profit").head(10)

    discount = (
        df.groupby("Discount_Band", observed=True, as_index=False)
        .agg(
            Orders=("Order_ID", "count"),
            Sales=("Sales", "sum"),
            Profit=("Profit", "sum"),
            AOV=("Sales", "mean"),
            Rating=("Customer_Rating", "mean"),
        )
        .sort_values("Discount_Band")
    )
    discount["Margin_%"] = discount["Profit"] / discount["Sales"].replace(0, np.nan) * 100
    discount["Rating"] = discount["Rating"].round(2)

    payment = (
        df.groupby("Payment_Mode", as_index=False)
        .agg(Sales=("Sales", "sum"), Orders=("Order_ID", "count"))
        .sort_values("Sales", ascending=False)
    )
    payment["Share_%"] = payment["Orders"] / len(df) * 100

    shipping = (
        df.groupby("Shipping_Mode", as_index=False)
        .agg(Sales=("Sales", "sum"), Orders=("Order_ID", "count"),
             Rating=("Customer_Rating", "mean"))
        .sort_values("Orders", ascending=False)
    )
    shipping["Rating"] = shipping["Rating"].round(2)

    status = (
        df.groupby("Order_Status", as_index=False)
        .agg(Orders=("Order_ID", "count"), Sales=("Sales", "sum"), Profit=("Profit", "sum"))
        .sort_values("Orders", ascending=False)
    )
    status["Share_%"] = status["Orders"] / len(df) * 100

    rated_df = df.dropna(subset=["Customer_Rating"])
    rating = (
        rated_df.groupby("Customer_Rating", as_index=False)
        .agg(Orders=("Order_ID", "count"), Sales=("Sales", "sum"), Profit=("Profit", "sum"))
        .sort_values("Customer_Rating")
    )
    rating["Share_of_All_%"] = rating["Orders"] / len(df) * 100
    rating["Share_of_Rated_%"] = rating["Orders"] / len(rated_df) * 100

    customers = (
        df.groupby("Customer_ID", as_index=False)
        .agg(Sales=("Sales", "sum"), Orders=("Order_ID", "count"), Profit=("Profit", "sum"))
        .sort_values("Sales", ascending=False)
    )
    customers["Rank"] = range(1, len(customers) + 1)
    customers["Cum_Sales_%"] = customers["Sales"].cumsum() / total_sales * 100

    quantity = (
        df.groupby("Quantity", as_index=False)
        .agg(Orders=("Order_ID", "count"), Sales=("Sales", "sum"))
        .sort_values("Quantity")
    )

    weekday = (
        df.groupby("Weekday", as_index=False)
        .agg(Sales=("Sales", "sum"), Orders=("Order_ID", "count"))
        .set_index("Weekday")
        .reindex(WEEKDAYS)
        .fillna(0)
        .reset_index()
    )

    return {
        "monthly": monthly,
        "yearly": yearly,
        "category": category,
        "region": region,
        "segment": segment,
        "product": product_top,
        "product_all": product,
        "product_bottom": product_bottom,
        "product_worst": product_worst,
        "discount": discount,
        "payment": payment,
        "shipping": shipping,
        "status": status,
        "rating": rating,
        "customer": customers,
        "quantity": quantity,
        "weekday": weekday,
    }


# --------------------------------------------------------------------- outputs
def write_summary_csvs(tables: dict[str, pd.DataFrame]) -> None:
    for key, filename in SUMMARY_FILES.items():
        tables[key].to_csv(os.path.join(OUT, filename), index=False)


def write_kpis(kpis: dict[str, Any]) -> None:
    pd.DataFrame(
        [{"Metric": k, "Value": v} for k, v in kpis.items()]
    ).to_csv(KPI_CSV, index=False)
    with open(KPI_JSON, "w", encoding="utf-8") as handle:
        json.dump(kpis, handle, indent=2, ensure_ascii=False, default=str)


def load_kpis() -> dict[str, Any]:
    if not os.path.exists(KPI_JSON):
        raise FileNotFoundError(
            f"KPI file not found: {KPI_JSON}\nRun 'python run_analysis.py' first."
        )
    with open(KPI_JSON, encoding="utf-8") as handle:
        return json.load(handle)


def data_quality_table(raw: pd.DataFrame, clean: pd.DataFrame) -> pd.DataFrame:
    """One row per check, suitable for a CSV or an Excel sheet."""
    rated = raw["Customer_Rating"].notna()
    non_delivered = ~raw["Order_Status"].eq("Delivered")
    computed = raw["Quantity"] * raw["Unit_Price"] * (1 - raw["Discount"])
    mismatch = (computed - raw["Sales"]).abs() > 1

    checks = [
        ("Rows", len(raw), "Expected 5,000"),
        ("Duplicate Order_IDs", int(raw["Order_ID"].duplicated().sum()), "Must be 0"),
        ("Missing Order_Date", int(raw["Order_Date"].isna().sum()), "Fatal if > 0"),
        ("Missing Region", int(raw["Region"].isna().sum()), "Filled as 'Unknown' in reports"),
        ("Missing Payment_Mode", int(raw["Payment_Mode"].isna().sum()), "Filled as 'Unknown' in reports"),
        ("Missing Customer_Rating", int(raw["Customer_Rating"].isna().sum()), "Left blank; excluded from averages"),
        ("Non-delivered orders without rating", int((non_delivered & ~rated).sum()),
         "Ratings exist only for delivered orders"),
        ("Quantity <= 0", int((raw["Quantity"] <= 0).sum()), "Must be 0"),
        ("Discount outside 0-1", int((~raw["Discount"].between(0, 1)).sum()), "Must be 0"),
        ("Rating outside 1-5", int(((raw["Customer_Rating"].dropna() < 1) |
                                    (raw["Customer_Rating"].dropna() > 5)).sum()), "Must be 0"),
        ("Negative Sales", int((raw["Sales"] < 0).sum()), "Must be 0"),
        ("Sales != Qty x Price x (1-Discount)", int(mismatch.sum()),
         "Tolerance: ₹1 per row"),
        ("Loss-making orders", int((raw["Profit"] < 0).sum()), "Expected; see KPI"),
        ("Unknown region sales", round(float(clean.loc[clean["Region"] == UNKNOWN, "Sales"].sum()), 2),
         "Included in totals"),
        ("Unknown payment sales", round(float(clean.loc[clean["Payment_Mode"] == UNKNOWN, "Sales"].sum()), 2),
         "Included in totals"),
    ]
    return pd.DataFrame(checks, columns=["Check", "Value", "Rule"])


def load_context() -> tuple[pd.DataFrame, dict[str, Any], dict[str, pd.DataFrame]]:
    """Convenience loader for report builders."""
    df = load_clean()
    kpis = load_kpis()
    tables = compute_tables(df)
    return df, kpis, tables
