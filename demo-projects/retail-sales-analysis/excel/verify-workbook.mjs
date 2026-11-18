/**
 * Reads Retail-Sales-Analysis-Workbook.xlsx back and verifies structure,
 * formulas and key values. This does not open Excel's UI — it validates the
 * file ExcelJS produced, the sheet contents, and every cross-sheet reference.
 *
 * Notes on what is checked and why:
 *   - Cells written with a cached `result` are compared with a small tolerance
 *     (percentages are stored as full-precision floats).
 *   - Cells written as formulas only are checked by formula text, because
 *     ExcelJS does not recalculate. The workbook sets fullCalcOnLoad, so Excel
 *     and Google Sheets compute them on open.
 *   - Data-row counts use explicit ranges so TOTAL and note rows are excluded.
 *
 * Run with: npm run verify:workbook
 */
import ExcelJS from "exceljs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { computeAll } from "./lib/compute.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const projectDir = join(here, "..");
const file = join(projectDir, "Retail-Sales-Analysis-Workbook.xlsx");
const data = computeAll(projectDir);

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(file);

const failures = [];
let checks = 0;

function expect(condition, label, detail) {
  checks += 1;
  if (!condition) failures.push(`${label}${detail ? ` — ${detail}` : ""}`);
}

function eq(actual, expected, label) {
  expect(actual === expected, label, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function near(actual, expected, tolerance, label) {
  expect(
    typeof actual === "number" && Math.abs(actual - expected) <= tolerance,
    label,
    `expected ~${expected} (±${tolerance}), got ${actual}`
  );
}

const raw = (ws, ref) => ws.getCell(ref).value;
const value = (ws, ref) => {
  const v = raw(ws, ref);
  if (v && typeof v === "object" && "result" in v) return v.result;
  return v;
};
const formula = (ws, ref) => {
  const v = raw(ws, ref);
  return v && typeof v === "object" && typeof v.formula === "string" ? v.formula : null;
};
const hasFormula = (ws, ref, needle, label) => {
  const text = formula(ws, ref);
  expect(typeof text === "string" && text.includes(needle), label, `formula at ${ref} is ${JSON.stringify(text)}`);
};

const expectedSheets = [
  "Dashboard",
  "KPI Summary",
  "Monthly Revenue",
  "YoY Growth",
  "MoM Growth",
  "Category Revenue",
  "Top Products",
  "Region Revenue",
  "Top Customers",
  "Repeat vs One-time",
  "Category x Region",
  "Best Quarters",
  "Orders",
  "Customers",
  "Products",
  "How To Use",
];

eq(workbook.worksheets.length, expectedSheets.length, "Sheet count");
expectedSheets.forEach((name, i) => {
  eq(workbook.worksheets[i]?.name, name, `Sheet ${i + 1} name`);
});

const ws = (name) => workbook.getWorksheet(name);
const countRows = (sheet, start, end, col = 1) => {
  let n = 0;
  for (let row = start; row <= end; row += 1) {
    const v = sheet.getCell(row, col).value;
    if (v !== null && v !== undefined && String(v).trim() !== "") n += 1;
  }
  return n;
};

// --- Dashboard -------------------------------------------------------------
const dash = ws("Dashboard");
eq(value(dash, "A1"), "RETAIL SALES ANALYSIS", "Dashboard title");
expect(String(value(dash, "A3") ?? "").includes("Synthetic data"), "Dashboard synthetic-data note");
eq(dash.getImages().length, 6, "Dashboard chart images");
near(value(dash, "B7"), data.extended.repeatCustomerShare, 0.0001, "Dashboard repeat customer share");
near(value(dash, "B8"), 1 - data.extended.repeatCustomerShare, 0.0001, "Dashboard one-time customer share");
near(value(dash, "B9"), data.extended.repeatRevenueShare, 0.0001, "Dashboard repeat revenue share");
near(value(dash, "B10"), data.extended.apparelShare, 0.0001, "Dashboard Apparel share");
near(value(dash, "B11"), data.extended.electronicsShare, 0.0001, "Dashboard Electronics share");
near(value(dash, "B12"), data.extended.northWestShare, 0.0001, "Dashboard North + West share");
near(value(dash, "B13"), data.extended.top10ProductShare, 0.0001, "Dashboard top-10 product share");
near(value(dash, "B14"), data.extended.top10CustomerShare, 0.0001, "Dashboard top-10 customer share");
hasFormula(dash, "B7", "'Repeat vs One-time'!C5", "Dashboard repeat formula");
hasFormula(dash, "B10", "'Category Revenue'!D5", "Dashboard category formula");
hasFormula(dash, "B12", "'Region Revenue'!B5", "Dashboard region formula");
hasFormula(dash, "B14", "'Top Customers'!G14", "Dashboard customer formula");
hasFormula(dash, "C7", "REPT", "Dashboard visual bar formula");
eq(value(dash, "B18"), 8262058, "Dashboard revenue");
eq(value(dash, "B19"), 1687, "Dashboard orders");
eq(value(dash, "B20"), 378, "Dashboard ordering customers");
eq(value(dash, "B21"), 6792, "Dashboard units");
near(value(dash, "B22"), 4897.49, 0.01, "Dashboard AOV");
eq(value(dash, "B23"), 400, "Dashboard customer records");
eq(value(dash, "B24"), 20, "Dashboard products");
eq(value(dash, "B25"), 24, "Dashboard months");
eq(value(dash, "B26"), 4, "Dashboard regions");
eq(value(dash, "A30"), "Apparel", "Dashboard top category");
eq(value(dash, "B30"), 2492471, "Dashboard Apparel revenue");
near(value(dash, "C30"), 0.301677, 0.0001, "Dashboard Apparel share cell");
eq(value(dash, "D30"), 1329, "Dashboard Apparel units");
eq(value(dash, "A34"), "Beauty", "Dashboard last category");
eq(value(dash, "A38"), "North", "Dashboard top region");
eq(value(dash, "B38"), 2227809, "Dashboard North revenue");
near(value(dash, "C38"), 0.26963, 0.0001, "Dashboard North share");
eq(value(dash, "D38"), 99, "Dashboard North customers");
eq(value(dash, "A41"), "South", "Dashboard last region");
eq(value(dash, "D41"), 87, "Dashboard South customers");
expect(String(value(dash, "A44") ?? "").startsWith("Repeat buyers dominate"), "Dashboard finding 1");
expect(String(value(dash, "A48") ?? "").includes("Feb 2025"), "Dashboard finding 5 mentions Feb 2025");
eq(dash.conditionalFormattings.length, 1, "Dashboard data bar present");
eq(dash.conditionalFormattings[0]?.ref, "B7:B14", "Dashboard data bar range");

// --- KPI Summary -----------------------------------------------------------
const kpi = ws("KPI Summary");
eq(value(kpi, "B6"), 8262058, "KPI total revenue");
eq(value(kpi, "B7"), 1687, "KPI total orders");
eq(value(kpi, "B8"), 378, "KPI ordering customers");
eq(value(kpi, "B9"), 6792, "KPI units sold");
near(value(kpi, "B10"), 4897.49, 0.01, "KPI AOV cached");
hasFormula(kpi, "B10", "B6/B7", "KPI AOV formula");
eq(value(kpi, "B14"), 4116242, "KPI revenue 2024");
eq(value(kpi, "B15"), 4145816, "KPI revenue 2025");
near(value(kpi, "B16"), 0.0071847, 0.0001, "KPI overall YoY");
hasFormula(kpi, "B16", "(B15-B14)/B14", "KPI YoY formula");
near(value(kpi, "B17"), 21857.3, 0.1, "KPI revenue per customer");
near(value(kpi, "B18"), 4.02608, 0.0001, "KPI units per order");
near(value(kpi, "B19"), 1216.44, 0.01, "KPI average unit price");
eq(value(kpi, "B20"), 319, "KPI repeat customers");
near(value(kpi, "B21"), 0.843915, 0.0001, "KPI repeat customer share");
eq(value(kpi, "B22"), 59, "KPI one-time customers");
near(value(kpi, "B23"), 0.156085, 0.0001, "KPI one-time customer share");
eq(value(kpi, "B24"), 7920161, "KPI repeat revenue");
near(value(kpi, "B25"), 0.958618, 0.0001, "KPI repeat revenue share");
eq(value(kpi, "B26"), 341897, "KPI one-time revenue");
near(value(kpi, "B27"), 0.041382, 0.0001, "KPI one-time revenue share");
near(value(kpi, "B28"), 0.301677, 0.0001, "KPI Apparel share");
near(value(kpi, "B29"), 0.268232, 0.0001, "KPI Electronics share");
near(value(kpi, "B30"), 0.532159, 0.0001, "KPI North + West share");
near(value(kpi, "B31"), 0.783944, 0.0001, "KPI top-10 product share");
near(value(kpi, "B32"), 0.107885, 0.0001, "KPI top-10 customer share");
eq(value(kpi, "B33"), 502175, "KPI peak month revenue");
hasFormula(kpi, "B20", "'Repeat vs One-time'!B5", "KPI repeat customers formula");
hasFormula(kpi, "B28", "'Category Revenue'!D5", "KPI Apparel formula");
hasFormula(kpi, "B31", "'Top Products'!G14", "KPI product formula");
hasFormula(kpi, "B33", "'Monthly Revenue'!B16", "KPI peak month formula");
expect(String(value(kpi, "A36") ?? "").includes("quantity"), "KPI definitions present");
expect(String(value(kpi, "A43") ?? "").includes("synthetic"), "KPI source note present");

// --- Monthly Revenue -------------------------------------------------------
const monthly = ws("Monthly Revenue");
eq(countRows(monthly, 5, 28), 24, "Monthly data rows");
eq(value(monthly, "A5"), "2024-01", "First month");
eq(value(monthly, "A16"), "2024-12", "Dec 2024 row");
eq(value(monthly, "A17"), "2025-01", "Jan 2025 row");
eq(value(monthly, "A28"), "2025-12", "Last month");
eq(value(monthly, "B5"), 310226, "Jan 2024 revenue");
eq(value(monthly, "B16"), 502175, "Dec 2024 peak revenue");
eq(value(monthly, "B29"), 8262058, "Monthly total revenue");
eq(value(monthly, "C29"), 1687, "Monthly total orders");
near(value(monthly, "D5"), data.monthlyRevenue[0].revenue / data.monthlyRevenue[0].orders, 0.01, "Monthly AOV cached");
hasFormula(monthly, "D5", "B5/C5", "Monthly AOV formula");
hasFormula(monthly, "E5", "$B$29", "Monthly share formula");
hasFormula(monthly, "F5", "SUM($E$5:E5)", "Monthly cumulative formula");
near(value(monthly, "F28"), 1, 0.000001, "Monthly cumulative total");
eq(monthly.conditionalFormattings[0]?.ref, "B5:B28", "Monthly data bar range");

// --- YoY Growth ------------------------------------------------------------
const yoy = ws("YoY Growth");
eq(countRows(yoy, 5, 16), 12, "YoY data rows");
eq(value(yoy, "A5"), "2025-01", "YoY first month");
eq(value(yoy, "B5"), 400523, "Jan 2025 revenue");
eq(value(yoy, "C5"), 310226, "Jan 2024 revenue");
near(value(yoy, "E5"), 0.29107, 0.0001, "Jan YoY cached");
eq(value(yoy, "A16"), "2025-12", "YoY last month");
eq(value(yoy, "B17"), 4145816, "YoY 2025 total");
eq(value(yoy, "C17"), 4116242, "YoY 2024 total");
near(value(yoy, "E17"), 0.0071847, 0.0001, "YoY overall cached");
hasFormula(yoy, "E5", "D5/C5", "YoY monthly formula");
hasFormula(yoy, "E17", "D17/C17", "YoY total formula");
hasFormula(yoy, "F5", "$B$17", "YoY share formula");
eq(yoy.conditionalFormattings[0]?.ref, "B5:B16", "YoY data bar range");

// --- MoM Growth ------------------------------------------------------------
const mom = ws("MoM Growth");
eq(countRows(mom, 5, 28), 24, "MoM data rows");
eq(value(mom, "A5"), "2024-01", "MoM first month");
eq(value(mom, "D5"), "—", "MoM first change blank");
eq(value(mom, "E5"), "—", "MoM first percent blank");
hasFormula(mom, "D6", "B6-B5", "MoM change formula");
hasFormula(mom, "E6", "D6/B5", "MoM percent formula");
near(value(mom, "E21"), -0.038391, 0.0001, "May 2025 MoM cached");
eq(value(mom, "B29"), 8262058, "MoM total revenue");
eq(value(mom, "C29"), 1687, "MoM total orders");
near(value(mom, "G28"), 1, 0.000001, "MoM cumulative total");
eq(mom.conditionalFormattings[0]?.ref, "B5:B28", "MoM data bar range");

// --- Category Revenue ------------------------------------------------------
const category = ws("Category Revenue");
eq(countRows(category, 5, 9), 5, "Category rows");
eq(value(category, "A5"), "Apparel", "Top category");
eq(value(category, "B5"), 2492471, "Apparel revenue");
eq(value(category, "C5"), 1329, "Apparel units");
near(value(category, "D5"), 0.301677, 0.0001, "Apparel share");
near(value(category, "E5"), 2492471 / 1329, 0.01, "Apparel revenue per unit");
eq(value(category, "A9"), "Beauty", "Last category");
eq(value(category, "B10"), 8262058, "Category total revenue");
eq(value(category, "C10"), 6792, "Category total units");
near(value(category, "D10"), 1, 0.000001, "Category shares total");
hasFormula(category, "D5", "$B$10", "Category share formula");
hasFormula(category, "F5", "RANK", "Category rank formula");
eq(category.conditionalFormattings[0]?.ref, "B5:B9", "Category data bar range");

// --- Top Products ----------------------------------------------------------
const topProducts = ws("Top Products");
eq(countRows(topProducts, 5, 14), 10, "Top products rows");
eq(value(topProducts, "B5"), "Running Shoes", "Top product");
eq(value(topProducts, "E5"), 1098686, "Top product revenue");
eq(value(topProducts, "D5"), 314, "Top product units");
near(value(topProducts, "G14"), 0.783944, 0.0001, "Top-10 cumulative share");
near(value(topProducts, "H5"), 1098686 / 314, 0.01, "Product revenue per unit");
eq(value(topProducts, "E15"), 6476993, "Top-10 product revenue total");
eq(value(topProducts, "D15"), 3507, "Top-10 product units total");
hasFormula(topProducts, "F5", "'KPI Summary'!B6", "Product share formula");
hasFormula(topProducts, "G5", "SUM($F$5:F5)", "Product cumulative formula");
eq(topProducts.conditionalFormattings[0]?.ref, "E5:E14", "Top products data bar range");

// --- Region Revenue --------------------------------------------------------
const region = ws("Region Revenue");
eq(countRows(region, 5, 8), 4, "Region rows");
eq(value(region, "A5"), "North", "Top region");
eq(value(region, "B5"), 2227809, "North revenue");
eq(value(region, "C5"), 99, "North customers");
near(value(region, "D5"), 0.26963, 0.0001, "North share");
near(value(region, "E5"), 2227809 / 99, 0.01, "North revenue per customer");
eq(value(region, "B9"), 8262058, "Region total revenue");
eq(value(region, "C9"), 378, "Region total customers");
near(value(region, "D9"), 1, 0.000001, "Region shares total");
hasFormula(region, "D5", "$B$9", "Region share formula");
eq(region.conditionalFormattings[0]?.ref, "B5:B8", "Region data bar range");

// --- Top Customers ---------------------------------------------------------
const topCustomers = ws("Top Customers");
eq(countRows(topCustomers, 5, 14), 10, "Top customers rows");
eq(value(topCustomers, "A5"), 1, "Top customer rank");
eq(value(topCustomers, "B5"), "C091", "Top customer id");
eq(value(topCustomers, "C5"), "Diya Mehta", "Top customer name");
eq(value(topCustomers, "D5"), "South", "Top customer region");
eq(value(topCustomers, "E5"), 102979, "Top customer revenue");
near(value(topCustomers, "F5"), 102979 / 8262058, 0.000001, "Top customer share");
eq(value(topCustomers, "C14"), "Kavya Nair", "10th customer");
eq(value(topCustomers, "E15"), 891355, "Top-10 customer revenue total");
near(value(topCustomers, "F15"), 0.107885, 0.0001, "Top-10 customer share");
hasFormula(topCustomers, "F5", "'KPI Summary'!B6", "Customer share formula");
eq(topCustomers.conditionalFormattings[0]?.ref, "E5:E14", "Top customers data bar range");

// --- Repeat vs One-time ----------------------------------------------------
const repeat = ws("Repeat vs One-time");
eq(value(repeat, "A5"), "Repeat", "Repeat row label");
eq(value(repeat, "B5"), 319, "Repeat customers");
near(value(repeat, "C5"), 0.843915, 0.0001, "Repeat customer share");
eq(value(repeat, "D5"), 7920161, "Repeat revenue");
near(value(repeat, "E5"), 0.958618, 0.0001, "Repeat revenue share");
eq(value(repeat, "A6"), "One-time", "One-time row label");
eq(value(repeat, "B6"), 59, "One-time customers");
eq(value(repeat, "D6"), 341897, "One-time revenue");
eq(value(repeat, "B7"), 378, "Repeat mix total customers");
eq(value(repeat, "D7"), 8262058, "Repeat mix total revenue");
near(value(repeat, "C7"), 1, 0.000001, "Repeat mix shares total");
hasFormula(repeat, "C5", "B5/$B$7", "Repeat customer share formula");
hasFormula(repeat, "E5", "D5/$D$7", "Repeat revenue share formula");
hasFormula(repeat, "F5", "D5/B5", "Revenue per customer formula");

// --- Category x Region -----------------------------------------------------
const matrix = ws("Category x Region");
eq(countRows(matrix, 5, 8), 4, "Matrix rows");
eq(value(matrix, "A5"), "North", "Matrix first region");
eq(value(matrix, "B5"), 594885, "North Electronics");
eq(value(matrix, "C5"), 680454, "North Apparel");
eq(value(matrix, "G5"), 2227809, "North total revenue");
near(value(matrix, "H5"), 0.26963, 0.0001, "North share");
eq(value(matrix, "B9"), 2216150, "Matrix Electronics total");
eq(value(matrix, "G9"), 8262058, "Matrix grand total");
near(value(matrix, "H9"), 1, 0.000001, "Matrix shares total");
hasFormula(matrix, "G5", "SUM(B5:F5)", "Matrix row total formula");
eq(matrix.conditionalFormattings[0]?.ref, "G5:G8", "Matrix data bar range");

// --- Best Quarters ---------------------------------------------------------
const quarters = ws("Best Quarters");
eq(countRows(quarters, 5, 12), 8, "Quarter rows");
eq(value(quarters, "A5"), "2024-Q4", "Best quarter");
eq(value(quarters, "B5"), 1323717, "Best quarter revenue");
eq(value(quarters, "C5"), 270, "Best quarter orders");
near(value(quarters, "D5"), 1323717 / 270, 0.01, "Best quarter AOV");
eq(value(quarters, "A12"), "2024-Q1", "Worst quarter");
eq(value(quarters, "B13"), 8262058, "Quarter total revenue");
eq(value(quarters, "C13"), 1687, "Quarter total orders");
hasFormula(quarters, "D5", "B5/C5", "Quarter AOV formula");
eq(quarters.conditionalFormattings[0]?.ref, "B5:B12", "Quarter data bar range");

// --- Orders ----------------------------------------------------------------
const orders = ws("Orders");
eq(countRows(orders, 5, 2705), 2701, "Order data rows");
eq(value(orders, "A5"), "O0001", "First order id");
const firstDate = value(orders, "B5");
expect(firstDate instanceof Date, "First order date is a Date");
eq(firstDate instanceof Date ? firstDate.toISOString().slice(0, 10) : null, "2024-01-01", "First order date value");
eq(value(orders, "C5"), "C081", "First order customer");
eq(value(orders, "D5"), "East", "First order region");
eq(value(orders, "E5"), "P016", "First order product id");
eq(value(orders, "F5"), "Herbal Hair Oil", "First order product");
eq(value(orders, "H5"), 3, "First order quantity");
eq(value(orders, "I5"), 299, "First order unit price");
eq(value(orders, "J5"), 897, "First order revenue");
eq(value(orders, "K5"), "2024-01", "First order month");
eq(value(orders, "L5"), "2024-Q1", "First order quarter");
hasFormula(orders, "J5", "H5*I5", "Order revenue formula");
hasFormula(orders, "K5", 'TEXT(B5,"yyyy-mm")', "Order month formula");
hasFormula(orders, "L5", "ROUNDUP(MONTH(B5)/3,0)", "Order quarter formula");
eq(value(orders, "A2705"), "O1687", "Last order id");
eq(value(orders, "J2705"), 2397, "Last order revenue");
eq(value(orders, "K2705"), "2025-12", "Last order month");
eq(value(orders, "L2705"), "2025-Q4", "Last order quarter");
eq(value(orders, "H2706"), 6792, "Order total units");
eq(value(orders, "J2706"), 8262058, "Order total revenue");
hasFormula(orders, "J2706", "SUM(J5:J2705)", "Order total formula");

// --- Customers -------------------------------------------------------------
const customers = ws("Customers");
eq(countRows(customers, 5, 404), 400, "Customer data rows");
eq(value(customers, "A5"), "C091", "Top customer id");
eq(value(customers, "B5"), "Diya Mehta", "Top customer name");
eq(value(customers, "E5"), 19, "Top customer orders");
eq(value(customers, "F5"), 102979, "Top customer revenue");
eq(value(customers, "G5"), "Repeat", "Top customer type");
near(value(customers, "H5"), 102979 / 8262058, 0.000001, "Top customer share cell");
hasFormula(customers, "H5", "'KPI Summary'!B6", "Customer share formula");
const typeCounts = { Repeat: 0, "One-time": 0, "No orders": 0 };
for (let row = 5; row <= 404; row += 1) {
  const t = customers.getCell(row, 7).value;
  if (t in typeCounts) typeCounts[t] += 1;
}
eq(typeCounts.Repeat, 319, "Customer table repeat count");
eq(typeCounts["One-time"], 59, "Customer table one-time count");
eq(typeCounts["No orders"], 22, "Customer table no-order count");

// --- Products --------------------------------------------------------------
const products = ws("Products");
eq(countRows(products, 5, 24), 20, "Product data rows");
eq(value(products, "A5"), "P008", "Top product id");
eq(value(products, "B5"), "Running Shoes", "Top product name");
eq(value(products, "D5"), 3499, "Top product list price");
eq(value(products, "E5"), 314, "Top product units");
eq(value(products, "F5"), 1098686, "Top product revenue");
near(value(products, "G5"), 1098686 / 8262058, 0.000001, "Top product share");
eq(value(products, "H5"), 1, "Top product rank");
eq(value(products, "E25"), 6792, "Product total units");
eq(value(products, "F25"), 8262058, "Product total revenue");
near(value(products, "G25"), 1, 0.000001, "Product shares total");
hasFormula(products, "G5", "$F$25", "Product share formula");
eq(products.conditionalFormattings[0]?.ref, "F5:F24", "Products data bar range");

// --- How To Use ------------------------------------------------------------
const guide = ws("How To Use");
eq(value(guide, "A1"), "How To Use This Workbook", "Guide title");
const guideText = [];
guide.eachRow((row) => {
  row.eachCell((cell) => {
    if (typeof cell.value === "string") guideText.push(cell.value);
  });
});
const guideBody = guideText.join("\n");
const guideLower = guideBody.toLowerCase();
expect(guideLower.includes("google sheets"), "Guide covers Google Sheets");
expect(guideLower.includes("power query"), "Guide covers Power Query");
expect(guideBody.includes("PIVOT TABLES"), "Guide covers pivot tables");
expect(guideBody.includes("DEFINITIONS"), "Guide covers definitions");
expect(guideBody.includes("HONEST LIMITATIONS"), "Guide covers limitations");
expect(guideLower.includes("rebuild"), "Guide covers rebuild steps");
expect(guideLower.includes("synthetic"), "Guide labels data as synthetic");

// --- Global checks ---------------------------------------------------------
const sheetNames = new Set(workbook.worksheets.map((s) => s.name));
let formulaCount = 0;
let dataBarCount = 0;
let placeholderCount = 0;
const references = new Set();
const badParens = [];

for (const sheet of workbook.worksheets) {
  dataBarCount += sheet.conditionalFormattings.length;
  sheet.eachRow({ includeEmpty: false }, (row) => {
    row.eachCell({ includeEmpty: false }, (cell) => {
      const v = cell.value;
      if (typeof v === "string" && v.includes("[ADD")) placeholderCount += 1;
      if (v && typeof v === "object" && typeof v.formula === "string") {
        formulaCount += 1;
        const formulaText = v.formula;
        const open = (formulaText.match(/\(/g) ?? []).length;
        const close = (formulaText.match(/\)/g) ?? []).length;
        if (open !== close) badParens.push(`${sheet.name}!${cell.address}`);
        for (const match of formulaText.matchAll(/(?:'([^']+)'|([A-Za-z][A-Za-z0-9_]*))!/g)) {
          references.add(match[1] ?? match[2]);
        }
      }
    });
  });
}

expect(formulaCount >= 8000, "Live formula count", `found ${formulaCount}`);
expect(dataBarCount >= 12, "Data bars preserved", `found ${dataBarCount}`);
expect(placeholderCount === 0, "No [ADD ...] placeholders", `found ${placeholderCount}`);
expect(badParens.length === 0, "All formulas have balanced parentheses", badParens.slice(0, 3).join(", "));
const expectedRefs = [
  "Category Revenue",
  "Customers",
  "KPI Summary",
  "Monthly Revenue",
  "Products",
  "Region Revenue",
  "Repeat vs One-time",
  "Top Customers",
  "Top Products",
];
const missingRefs = expectedRefs.filter((name) => !references.has(name));
expect(missingRefs.length === 0, "All expected cross-sheet references present", missingRefs.join(", "));
const missingSheets = [...references].filter((name) => !sheetNames.has(name));
expect(missingSheets.length === 0, "Every formula sheet reference exists", missingSheets.join(", "));

console.log(
  JSON.stringify(
    {
      sheets: workbook.worksheets.length,
      formulas: formulaCount,
      crossSheetReferences: references.size,
      dataBars: dataBarCount,
      orderRows: 2701,
      customerRows: 400,
      productRows: 20,
      dashboardImages: dash.getImages().length,
      file: file.replace(projectDir, ".."),
    },
    null,
    2
  )
);

if (failures.length) {
  console.error(`\nFAIL — ${failures.length} of ${checks} checks failed:`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log(`\nPASS — all ${checks} workbook checks passed`);
