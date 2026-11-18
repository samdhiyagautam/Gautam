/**
 * Cross-checks every retail workbook aggregate against the verified SQL results
 * in results/*.csv. Run with: npm run verify:data
 */
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readCsvObjects, num, close } from "./lib/csv.mjs";
import { computeAll } from "./lib/compute.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const projectDir = join(here, "..");
const data = computeAll(projectDir);
const failures = [];
let checks = 0;

function expect(condition, label, detail) {
  checks += 1;
  if (!condition) failures.push(`${label}${detail ? ` — ${detail}` : ""}`);
}

function eq(actual, expected, label, dp = 2) {
  expect(close(num(actual), num(expected), dp), label, `expected ${expected}, got ${actual}`);
}

function eqStr(actual, expected, label) {
  expect(String(actual) === String(expected), label, `expected "${expected}", got "${actual}"`);
}

const readResult = (name) => readCsvObjects(join(projectDir, "results", `${name}.csv`));

// --- Q1 KPI summary --------------------------------------------------------
const kpiCsv = readResult("kpi_summary")[0];
eq(data.kpi.total_revenue, kpiCsv.total_revenue, "KPI total revenue", 0);
eq(data.kpi.total_orders, kpiCsv.total_orders, "KPI total orders", 0);
eq(data.kpi.unique_customers, kpiCsv.unique_customers, "KPI unique customers", 0);
eq(data.kpi.units_sold, kpiCsv.units_sold, "KPI units sold", 0);
eq(data.kpi.avg_order_value, kpiCsv.avg_order_value, "KPI average order value", 2);

// --- Q2 Monthly revenue ----------------------------------------------------
const monthlyCsv = readResult("monthly_revenue");
expect(data.monthlyRevenue.length === monthlyCsv.length, "Monthly row count");
data.monthlyRevenue.forEach((row, i) => {
  const expected = monthlyCsv[i];
  if (!expected) return;
  eqStr(row.month, expected.month, `Month #${i + 1} label`);
  eq(row.revenue, expected.revenue, `Month ${row.month} revenue`, 0);
  eq(row.orders, expected.orders, `Month ${row.month} orders`, 0);
});

// --- Q3 YoY growth ---------------------------------------------------------
const yoyCsv = readResult("yoy_growth");
expect(data.yoyGrowth.length === yoyCsv.length, "YoY row count");
data.yoyGrowth.forEach((row, i) => {
  const expected = yoyCsv[i];
  if (!expected) return;
  eqStr(row.month_2025, expected.month_2025, `YoY #${i + 1} month`);
  eq(row.revenue_2025, expected.revenue_2025, `YoY ${row.month_2025} revenue 2025`, 0);
  eq(row.revenue_2024, expected.revenue_2024, `YoY ${row.month_2025} revenue 2024`, 0);
  eq(row.yoy_change_pct, expected.yoy_change_pct, `YoY ${row.month_2025} change`, 1);
});

// --- Q4 MoM growth ---------------------------------------------------------
const momCsv = readResult("mom_growth");
expect(data.momGrowth.length === momCsv.length, "MoM row count");
data.momGrowth.forEach((row, i) => {
  const expected = momCsv[i];
  if (!expected) return;
  eqStr(row.month, expected.month, `MoM #${i + 1} month`);
  eq(row.revenue, expected.revenue, `MoM ${row.month} revenue`, 0);
  if (i === 0) {
    expect(row.mom_change_pct === null, "MoM first month is blank", String(row.mom_change_pct));
  } else {
    eq(row.mom_change_pct, expected.mom_change_pct, `MoM ${row.month} change`, 1);
  }
});

// --- Q5 Category revenue ---------------------------------------------------
const categoryCsv = readResult("category_revenue");
expect(data.categoryRevenue.length === categoryCsv.length, "Category row count");
data.categoryRevenue.forEach((row, i) => {
  const expected = categoryCsv[i];
  if (!expected) return;
  eqStr(row.category, expected.category, `Category #${i + 1} name`);
  eq(row.revenue, expected.revenue, `${row.category} revenue`, 0);
  eq(row.units_sold, expected.units_sold, `${row.category} units`, 0);
});

// --- Q6 Top products -------------------------------------------------------
const productsCsv = readResult("top_products");
expect(data.topProducts.length === productsCsv.length, "Top products row count");
data.topProducts.forEach((row, i) => {
  const expected = productsCsv[i];
  if (!expected) return;
  eqStr(row.product_name, expected.product_name, `Product #${i + 1} name`);
  eqStr(row.category, expected.category, `Product #${i + 1} category`);
  eq(row.units_sold, expected.units_sold, `${row.product_name} units`, 0);
  eq(row.revenue, expected.revenue, `${row.product_name} revenue`, 0);
});

// --- Q7 Region revenue -----------------------------------------------------
const regionCsv = readResult("region_revenue");
expect(data.regionRevenue.length === regionCsv.length, "Region row count");
data.regionRevenue.forEach((row, i) => {
  const expected = regionCsv[i];
  if (!expected) return;
  eqStr(row.region, expected.region, `Region #${i + 1} name`);
  eq(row.revenue, expected.revenue, `${row.region} revenue`, 0);
  eq(row.unique_customers, expected.unique_customers, `${row.region} customers`, 0);
});

// --- Q8 Top customers ------------------------------------------------------
const customersCsv = readResult("top_customers");
expect(data.topCustomers.length === customersCsv.length, "Top customers row count");
data.topCustomers.forEach((row, i) => {
  const expected = customersCsv[i];
  if (!expected) return;
  eqStr(row.customer_id, expected.customer_id, `Customer #${i + 1} id`);
  eqStr(row.customer_name, expected.customer_name, `Customer #${i + 1} name`);
  eqStr(row.region, expected.region, `Customer #${i + 1} region`);
  eq(row.revenue, expected.revenue, `${row.customer_name} revenue`, 0);
});

// --- Q9 Repeat vs one-time -------------------------------------------------
const repeatCsv = readResult("repeat_vs_onetime");
expect(data.repeatVsOnetime.length === repeatCsv.length, "Repeat mix row count");
data.repeatVsOnetime.forEach((row, i) => {
  const expected = repeatCsv[i];
  if (!expected) return;
  eqStr(row.customer_type, expected.customer_type, `Repeat mix #${i + 1} type`);
  eq(row.customers, expected.customers, `${row.customer_type} customers`, 0);
  eq(row.pct_of_base, expected.pct_of_base, `${row.customer_type} share`, 1);
});

// --- Q10 Category x region matrix -----------------------------------------
const matrixCsv = readResult("category_region_matrix");
expect(data.categoryRegionMatrix.length === matrixCsv.length, "Matrix row count");
const matrixColumns = [
  ["electronics", "Electronics"],
  ["apparel", "Apparel"],
  ["home_kitchen", "Home & Kitchen"],
  ["beauty", "Beauty"],
  ["sports", "Sports"],
];
data.categoryRegionMatrix.forEach((row, i) => {
  const expected = matrixCsv[i];
  if (!expected) return;
  eqStr(row.region, expected.region, `Matrix #${i + 1} region`);
  for (const [key, label] of matrixColumns) {
    eq(row[label], expected[key], `${row.region} ${label}`, 0);
  }
  eq(row.total_revenue, expected.total_revenue, `${row.region} total`, 0);
});

// --- Q11 Best quarters -----------------------------------------------------
const quartersCsv = readResult("best_quarters");
expect(data.bestQuarters.length === quartersCsv.length, "Quarter row count");
data.bestQuarters.forEach((row, i) => {
  const expected = quartersCsv[i];
  if (!expected) return;
  eqStr(row.quarter, expected.quarter, `Quarter #${i + 1} label`);
  eq(row.avg_order_value, expected.avg_order_value, `${row.quarter} AOV`, 0);
  eq(row.revenue, expected.revenue, `${row.quarter} revenue`, 0);
});

// --- Sanity checks ---------------------------------------------------------
eq(data.totals.lineItems, 2701, "Order line items", 0);
eq(data.totals.orders, 1687, "Distinct orders", 0);
eq(data.totals.customers, 378, "Ordering customers", 0);
eq(data.totals.customerRecords, 400, "Customer records", 0);
eq(data.totals.products, 20, "Product records", 0);
eq(data.totals.months, 24, "Months covered", 0);
eq(data.totals.categories, 5, "Categories", 0);
eq(data.totals.regions, 4, "Regions", 0);
eq(
  data.customerTable.reduce((sum, c) => sum + c.revenue, 0),
  data.totals.revenue,
  "Customer table revenue reconciles",
  0
);
eq(
  data.productTable.reduce((sum, p) => sum + p.revenue, 0),
  data.totals.revenue,
  "Product table revenue reconciles",
  0
);
eq(
  data.repeatVsOnetime.reduce((sum, r) => sum + r.customers, 0),
  data.totals.customers,
  "Repeat mix customer count reconciles",
  0
);
eq(
  data.repeatVsOnetime.reduce((sum, r) => sum + r.revenue, 0),
  data.totals.revenue,
  "Repeat mix revenue reconciles",
  0
);
eq(
  data.categoryRevenue.reduce((sum, c) => sum + c.revenue, 0),
  data.totals.revenue,
  "Category revenue reconciles",
  0
);
eq(
  data.regionRevenue.reduce((sum, r) => sum + r.revenue, 0),
  data.totals.revenue,
  "Region revenue reconciles",
  0
);
eq(
  data.monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0),
  data.totals.revenue,
  "Monthly revenue reconciles",
  0
);
eq(
  data.extended.revenue2024 + data.extended.revenue2025,
  data.totals.revenue,
  "Year totals reconcile",
  0
);

const summary = {
  checks,
  failures: failures.length,
  lineItems: data.totals.lineItems,
  orders: data.totals.orders,
  customers: data.totals.customers,
  customerRecords: data.totals.customerRecords,
  products: data.totals.products,
  months: data.totals.months,
  revenue: data.totals.revenue,
  revenue2024: data.extended.revenue2024,
  revenue2025: data.extended.revenue2025,
  yoy: Number((data.extended.yoyGrowth * 100).toFixed(2)),
  aov: data.kpi.avg_order_value,
  repeatShare: Number((data.extended.repeatCustomerShare * 100).toFixed(2)),
  repeatRevenueShare: Number((data.extended.repeatRevenueShare * 100).toFixed(2)),
  apparelShare: Number((data.extended.apparelShare * 100).toFixed(2)),
  electronicsShare: Number((data.extended.electronicsShare * 100).toFixed(2)),
  northWestShare: Number((data.extended.northWestShare * 100).toFixed(2)),
  top10ProductShare: Number((data.extended.top10ProductShare * 100).toFixed(2)),
  top10CustomerShare: Number((data.extended.top10CustomerShare * 100).toFixed(2)),
  avgRevenuePerCustomer: Number(data.extended.avgRevenuePerCustomer.toFixed(2)),
  avgUnitsPerOrder: Number(data.extended.avgUnitsPerOrder.toFixed(2)),
  avgUnitPrice: Number(data.extended.avgUnitPrice.toFixed(2)),
};

console.log(JSON.stringify(summary, null, 2));
if (failures.length) {
  console.error(`\nFAIL — ${failures.length} of ${checks} checks failed:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`\nPASS — all ${checks} data checks match results/*.csv`);
