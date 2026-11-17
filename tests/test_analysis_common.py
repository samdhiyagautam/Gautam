# -*- coding: utf-8 -*-
"""Regression tests for the shared retail-sales analysis engine."""
from __future__ import annotations

import unittest

import pandas as pd

import analysis_common as ac


class AnalysisCommonTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.raw = ac.load_raw()
        cls.df = ac.enrich(cls.raw)
        cls.kpis = ac.compute_kpis(cls.df)

    # ---------------------------------------------------------------- data audit
    def test_row_count_and_dates(self) -> None:
        self.assertEqual(len(self.df), 5000)
        self.assertEqual(str(self.df["Order_Date"].min().date()), "2024-01-01")
        self.assertEqual(str(self.df["Order_Date"].max().date()), "2026-10-31")

    def test_no_duplicate_order_ids(self) -> None:
        self.assertEqual(int(self.df["Order_ID"].duplicated().sum()), 0)

    def test_sales_formula_holds(self) -> None:
        expected = self.df["Quantity"] * self.df["Unit_Price"] * (1 - self.df["Discount"])
        self.assertLess(float((expected - self.df["Sales"]).abs().max()), 0.01)
        self.assertEqual(int(self.df["Sales_Mismatch"].sum()), 0)

    def test_missing_dimensions_are_unknown_not_dropped(self) -> None:
        self.assertEqual(int(self.df["Region_Was_Missing"].sum()), 40)
        self.assertEqual(int(self.df["Payment_Was_Missing"].sum()), 60)
        self.assertEqual(int((self.df["Region"] == "Unknown").sum()), 40)
        self.assertEqual(int((self.df["Payment_Mode"] == "Unknown").sum()), 60)
        self.assertEqual(len(self.df), 5000)

    def test_all_blank_ratings_are_non_delivered(self) -> None:
        blank = self.df["Customer_Rating"].isna()
        self.assertEqual(int(blank.sum()), 583)
        self.assertTrue((self.df.loc[blank, "Order_Status"] != "Delivered").all())
        self.assertEqual(int((~blank).sum()), 4417)

    # --------------------------------------------------------------------- KPIs
    def test_headline_kpis(self) -> None:
        k = self.kpis
        self.assertAlmostEqual(k["total_sales"], 121_379_792.00, places=2)
        self.assertAlmostEqual(k["total_profit"], 32_820_560.84, places=2)
        self.assertAlmostEqual(k["profit_margin_pct"], 27.04, places=2)
        self.assertAlmostEqual(k["avg_order_value"], 24_275.96, places=2)
        self.assertEqual(k["total_records"], 5000)
        self.assertEqual(k["unique_customers"], 2167)
        self.assertEqual(k["unique_products"], 24)
        self.assertEqual(k["categories"], 4)
        self.assertEqual(k["regions"], 5)

    def test_delivered_split_reconciles(self) -> None:
        k = self.kpis
        leakage = k["leakage_sales"]
        net = k["net_sales_delivered"]
        self.assertAlmostEqual(net + leakage, k["total_sales"], places=2)
        self.assertAlmostEqual(k["net_profit_delivered"] + k["leakage_profit"],
                               k["total_profit"], places=2)
        self.assertAlmostEqual(k["net_margin_delivered_pct"], 26.92, places=2)
        self.assertAlmostEqual(k["cancelled_returned_pct"], 11.66, places=2)
        self.assertEqual(k["cancelled_returned_orders"], 583)

    def test_rating_kpis_use_rated_denominator(self) -> None:
        k = self.kpis
        self.assertAlmostEqual(k["avg_rating"], 4.00, places=2)
        self.assertEqual(k["rated_orders"], 4417)
        self.assertEqual(k["unrated_orders"], 583)
        self.assertEqual(k["low_rating_orders"], 463)
        self.assertAlmostEqual(k["low_rating_pct_of_rated"], 10.48, places=2)

    def test_discount_bands_and_margin(self) -> None:
        k = self.kpis
        order = ["0%", "1-5%", "6-10%", "11-20%", ">20%"]
        band = self.df.groupby("Discount_Band", observed=True).agg(
            Sales=("Sales", "sum"), Profit=("Profit", "sum")
        ).reindex(order)
        self.assertTrue(band["Sales"].notna().all())
        self.assertAlmostEqual(float(band["Sales"].sum()), k["total_sales"], places=2)
        margins = (band["Profit"] / band["Sales"] * 100).round(2).tolist()
        self.assertEqual(margins, sorted(margins, reverse=True))
        self.assertAlmostEqual(k["margin_0pct"], 32.71, places=2)
        self.assertAlmostEqual(k["margin_gt20pct"], 10.13, places=2)
        self.assertAlmostEqual(k["discount_recovery"], 387_358.67, places=2)

    def test_tables_reconcile_to_kpis(self) -> None:
        tables = ac.compute_tables(self.df)
        self.assertAlmostEqual(float(tables["category"]["Sales"].sum()),
                               self.kpis["total_sales"], places=2)
        self.assertAlmostEqual(float(tables["region"]["Sales"].sum()),
                               self.kpis["total_sales"], places=2)
        self.assertAlmostEqual(float(tables["monthly"]["Sales"].sum()),
                               self.kpis["total_sales"], places=2)
        self.assertAlmostEqual(float(tables["status"]["Sales"].sum()),
                               self.kpis["total_sales"], places=2)

    def test_data_quality_table_covers_known_issues(self) -> None:
        quality = ac.data_quality_table(ac.load_raw(), self.df)
        text = " ".join(quality.astype(str).values.flatten())
        self.assertIn("40", text)
        self.assertIn("60", text)
        self.assertIn("583", text)
        self.assertTrue(pd.api.types.is_numeric_dtype(quality["Value"]))

    def test_validate_raw_is_clean_except_documented_missing(self) -> None:
        warnings = ac.validate_raw(ac.load_raw())
        self.assertFalse(any("duplicate" in w.lower() for w in warnings))
        self.assertFalse(any("negative" in w.lower() for w in warnings))
        self.assertFalse(any("outside" in w.lower() for w in warnings))


if __name__ == "__main__":
    unittest.main()
