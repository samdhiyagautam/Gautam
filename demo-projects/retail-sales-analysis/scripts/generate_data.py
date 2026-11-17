"""Generate the synthetic retail dataset (seeded, reproducible).

Writes data/customers.csv, data/products.csv, data/orders.csv.
Standard library only — no pip installs needed.

The dataset is SYNTHETIC sample data for skill demonstration — it is not
real business data. A fixed linear-congruential PRNG seed (42) keeps every
regeneration byte-identical, so the committed files and the analysis
results always agree.
"""

from __future__ import annotations

import csv
import datetime as dt
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"

FIRST_NAMES = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh",
    "Krishna", "Ishaan", "Rohit", "Priya", "Ananya", "Diya", "Aadhya",
    "Sneha", "Kavya", "Meera", "Pooja", "Neha", "Riya", "Nisha", "Tara",
    "Isha", "Rhea",
]
LAST_NAMES = [
    "Sharma", "Verma", "Patel", "Mehta", "Kapoor", "Malhotra", "Reddy",
    "Rao", "Iyer", "Nair", "Das", "Bose", "Khan", "Ansari", "Gupta",
    "Joshi",
]
REGIONS = ["North", "South", "East", "West"]

# (product_name, category, unit_price in INR) — id is assigned in order.
PRODUCT_SOURCE = [
    ("Wireless Mouse", "Electronics", 799),
    ("Mechanical Keyboard", "Electronics", 2499),
    ("Bluetooth Speaker", "Electronics", 1999),
    ("Smart LED Bulb", "Electronics", 599),
    ("USB-C Charging Cable", "Electronics", 349),
    ("Cotton T-Shirt", "Apparel", 499),
    ("Denim Jacket", "Apparel", 2999),
    ("Running Shoes", "Apparel", 3499),
    ("Woolen Scarf", "Apparel", 699),
    ("Electric Kettle", "Home & Kitchen", 1299),
    ("Non-Stick Pan", "Home & Kitchen", 999),
    ("Storage Container Set", "Home & Kitchen", 649),
    ("Table Lamp", "Home & Kitchen", 1499),
    ("Face Serum", "Beauty", 899),
    ("Sunscreen SPF 50", "Beauty", 549),
    ("Herbal Hair Oil", "Beauty", 299),
    ("Lip Balm Set", "Beauty", 399),
    ("Yoga Mat", "Sports", 899),
    ("Dumbbell Set", "Sports", 2499),
    ("Jump Rope", "Sports", 449),
]


class LCG:
    """Small deterministic PRNG — identical sequence in any language."""

    def __init__(self, seed: int = 42) -> None:
        self.state = seed & 0xFFFFFFFF

    def next(self) -> float:
        self.state = (self.state * 1664525 + 1013904223) & 0xFFFFFFFF
        return self.state / 4294967296.0

    def pick(self, seq):
        return seq[int(self.next() * len(seq))]

    def chance(self, p: float) -> bool:
        return self.next() < p


def main() -> None:
    rng = LCG(42)
    DATA.mkdir(exist_ok=True)

    # --- customers: 400, all signed up during 2023 -------------------------
    customers = []
    for i in range(1, 401):
        day_of_year = 1 + int(rng.next() * 365)
        signup = (dt.date(2023, 1, 1) + dt.timedelta(days=day_of_year - 1)).isoformat()
        customers.append({
            "customer_id": f"C{i:03d}",
            "customer_name": f"{rng.pick(FIRST_NAMES)} {rng.pick(LAST_NAMES)}",
            "region": rng.pick(REGIONS),
            "signup_date": signup,
        })

    # --- products: fixed catalogue ----------------------------------------
    products = [
        {
            "product_id": f"P{n:03d}",
            "product_name": name,
            "category": category,
            "unit_price": price,
        }
        for n, (name, category, price) in enumerate(PRODUCT_SOURCE, start=1)
    ]

    # --- customer activity tiers: a realistic mix of frequent shoppers,
    # --- regulars and one-time-style occasional buyers. The expanded pool
    # --- makes frequent customers proportionally more likely per order.
    pool = []
    for customer in customers:
        r = rng.next()
        copies = 5 if r < 0.20 else (2 if r < 0.50 else 1)
        pool.extend([customer] * copies)

    # --- orders: 2 years of line items with festive-season lift -----------
    rows = []
    order_seq = 0
    day = dt.date(2024, 1, 1)
    end = dt.date(2025, 12, 31)
    while day <= end:
        n_orders = 2
        if day.weekday() >= 5 and rng.chance(0.4):   # weekends busier
            n_orders += 1
        if day.month in (11, 12):                    # festive lift, no draw
            n_orders += 1
        if day.month == 10 and rng.chance(0.5):      # October pre-festive
            n_orders += 1
        for _ in range(n_orders):
            order_seq += 1
            order_id = f"O{order_seq:04d}"
            customer = rng.pick(pool)
            r = rng.next()
            items = 1 if r < 0.55 else (2 if r < 0.85 else 3)
            for _ in range(items):
                product = rng.pick(products)
                qty = 1 + int(rng.next() * 4)
                rows.append([
                    order_id,
                    day.isoformat(),
                    customer["customer_id"],
                    customer["region"],
                    product["product_id"],
                    product["product_name"],
                    product["category"],
                    qty,
                    product["unit_price"],
                ])
        day += dt.timedelta(days=1)

    with (DATA / "customers.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["customer_id", "customer_name", "region", "signup_date"])
        writer.writeheader()
        writer.writerows(customers)

    with (DATA / "products.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["product_id", "product_name", "category", "unit_price"])
        writer.writeheader()
        writer.writerows(products)

    with (DATA / "orders.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "order_id", "order_date", "customer_id", "region",
            "product_id", "product_name", "category", "quantity", "unit_price",
        ])
        writer.writerows(rows)

    revenue = sum(q * p for *_, q, p in rows)
    print(f"customers: {len(customers)}")
    print(f"products:  {len(products)}")
    print(f"orders:    {order_seq} ({len(rows)} line items)")
    print(f"revenue:   {revenue}")


if __name__ == "__main__":
    main()
