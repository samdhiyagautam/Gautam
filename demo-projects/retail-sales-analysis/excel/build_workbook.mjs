/**
 * Builds Retail-Sales-Analysis-Workbook.xlsx from the verified project data.
 *
 * Layout: Dashboard (% KPIs first) -> KPI Summary -> 9 analysis sheets ->
 * pivot-ready data sheets (Orders, Customers, Products) -> How To Use.
 *
 * Run with: npm run build
 */
import ExcelJS from "exceljs";
import { existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { computeAll } from "./lib/compute.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const projectDir = join(here, "..");
const outPath = join(projectDir, "Retail-Sales-Analysis-Workbook.xlsx");
const assets = join(here, "assets");

const data = computeAll(projectDir);
const totals = data.totals;
const ext = data.extended;

const num = (v) => Number(v);
const f = (formula, result) => (result === undefined ? { formula } : { formula, result });
const FONT = "Segoe UI";
const CUR = '"₹"#,##0';
const CUR2 = '"₹"#,##0.00';
const PCT = "0.0%";
const SIGNED_PCT = "+0.0%;-0.0%;0.0%";

const lakh = (n, dp = 2) => `₹${(n / 100000).toFixed(dp)}L`;
const pct1 = (x) => `${(x * 100).toFixed(1)}%`;
const n0 = (n) => Math.round(n).toLocaleString("en-US");

const repeatRow = data.repeatVsOnetime.find((r) => r.customer_type === "Repeat");
const oneTimeRow = data.repeatVsOnetime.find((r) => r.customer_type === "One-time");
const apparel = data.categoryRevenue.find((r) => r.category === "Apparel");
const electronics = data.categoryRevenue.find((r) => r.category === "Electronics");
const north = data.regionRevenue.find((r) => r.region === "North");
const west = data.regionRevenue.find((r) => r.region === "West");
const east = data.regionRevenue.find((r) => r.region === "East");
const south = data.regionRevenue.find((r) => r.region === "South");
const peak = ext.peakMonth;
const low = ext.lowMonth;

const COLORS = {
  ink: "FF0F172A",
  muted: "FF64748B",
  border: "FFE2E8F0",
  header: "FF0F172A",
  accent: "FF0D9488",
  accentDark: "FF0F766E",
  accentLight: "FFCCFBF1",
  zebra: "FFF8FAFC",
  total: "FFF1F5F9",
  white: "FFFFFFFF",
  amber: "FFF59E0B",
  amberLight: "FFFEF3C7",
  warn: "FFB45309",
};

const solid = (argb) => ({ type: "pattern", pattern: "solid", fgColor: { argb } });
const thinBorder = { style: "thin", color: { argb: COLORS.border } };

const workbook = new ExcelJS.Workbook();
workbook.creator = "Gautam Samdhiya";
workbook.lastModifiedBy = "Gautam Samdhiya";
workbook.created = new Date();
workbook.modified = new Date();
workbook.title = "Retail Sales Analysis Workbook";
workbook.subject =
  "Synthetic retail dataset (seed 42) - 400 customers, 20 products, 2,701 order lines, Jan 2024 - Dec 2025";
workbook.description =
  "Excel / Google Sheets workbook for the Retail Sales Analysis project. Percentages are live formulas; every aggregate is cross-checked against the 11 SQL result files.";
workbook.keywords = "retail, sales, analytics, SQL, Excel, Google Sheets, pivot";
workbook.calcProperties.fullCalcOnLoad = true;
workbook.views = [{ x: 0, y: 0, width: 26000, height: 16000, firstSheet: 0, activeTab: 0, visibility: "visible" }];

/* ------------------------------------------------------------------------- */
/* Shared styling helpers                                                    */
/* ------------------------------------------------------------------------- */

function setWidths(ws, widths) {
  widths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });
}

function sheetTitle(ws, text, subtitle, lastCol) {
  ws.mergeCells(1, 1, 1, lastCol);
  const title = ws.getCell(1, 1);
  title.value = text;
  title.font = { name: FONT, size: 20, bold: true, color: { argb: COLORS.ink } };
  title.alignment = { vertical: "middle" };
  ws.getRow(1).height = 36;

  ws.mergeCells(2, 1, 2, lastCol);
  const sub = ws.getCell(2, 1);
  sub.value = subtitle;
  sub.font = { name: FONT, size: 10.5, color: { argb: COLORS.muted } };
  sub.alignment = { vertical: "top", wrapText: true };
  ws.getRow(2).height = 30;

  ws.getRow(3).height = 8;
  ws.views = [{ state: "frozen", ySplit: 4, showGridLines: false }];
}

function writeHeaderRow(ws, row, headers, aligns) {
  const hr = ws.getRow(row);
  headers.forEach((h, i) => {
    const c = hr.getCell(i + 1);
    c.value = h;
    c.font = { name: FONT, size: 10.5, bold: true, color: { argb: COLORS.white } };
    c.fill = solid(COLORS.header);
    c.alignment = {
      vertical: "middle",
      horizontal: aligns?.[i] ?? (i === 0 ? "left" : "right"),
      wrapText: true,
    };
    c.border = { bottom: { style: "thin", color: { argb: COLORS.header } } };
  });
  hr.height = 30;
}

function writeDataRow(ws, row, values, formats, aligns, index) {
  const er = ws.getRow(row);
  values.forEach((v, i) => {
    const c = er.getCell(i + 1);
    c.value = v;
    c.font = { name: FONT, size: 10.5, color: { argb: COLORS.ink } };
    c.alignment = {
      vertical: "middle",
      horizontal: aligns?.[i] ?? (i === 0 ? "left" : "right"),
      wrapText: false,
    };
    if (formats?.[i]) c.numFmt = formats[i];
    c.border = { bottom: { style: "hair", color: { argb: COLORS.border } } };
    if (index % 2 === 1) c.fill = solid(COLORS.zebra);
  });
  er.height = 19;
}

function writeTotalRow(ws, row, values, formats, aligns, colCount) {
  const er = ws.getRow(row);
  for (let i = 1; i <= colCount; i += 1) {
    const c = er.getCell(i);
    const v = values[i - 1];
    if (v !== undefined) c.value = v;
    c.font = { name: FONT, size: 10.5, bold: true, color: { argb: COLORS.ink } };
    c.fill = solid(COLORS.total);
    c.border = {
      top: { style: "medium", color: { argb: COLORS.accent } },
      bottom: { style: "thin", color: { argb: COLORS.border } },
    };
    c.alignment = {
      vertical: "middle",
      horizontal: aligns?.[i - 1] ?? (i === 1 ? "left" : "right"),
    };
    if (formats?.[i - 1]) c.numFmt = formats[i - 1];
  }
  er.height = 22;
}

function writeTable(ws, opts) {
  const {
    title,
    subtitle,
    headers,
    rows,
    widths,
    formats = [],
    aligns = [],
    totalRow = null,
    note,
    headerRow = 4,
  } = opts;

  setWidths(ws, widths);
  sheetTitle(ws, title, subtitle, widths.length);
  writeHeaderRow(ws, headerRow, headers, aligns);

  rows.forEach((row, i) => writeDataRow(ws, headerRow + 1 + i, row, formats, aligns, i));

  let lastRow = headerRow + rows.length;
  if (totalRow) {
    writeTotalRow(ws, lastRow + 1, totalRow, formats, aligns, headers.length);
    lastRow += 1;
  }

  ws.autoFilter = {
    from: { row: headerRow, column: 1 },
    to: { row: headerRow + rows.length, column: headers.length },
  };
  ws.pageSetup = {
    paperSize: 9,
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
  };
  ws.headerFooter = {
    oddFooter: `&LRetail Sales Analysis&CPage &P of &N&RSynthetic sample data (seed 42)`,
  };

  if (note) {
    const nr = lastRow + 2;
    ws.mergeCells(nr, 1, nr, headers.length);
    const c = ws.getCell(nr, 1);
    c.value = note;
    c.font = { name: FONT, size: 9.5, italic: true, color: { argb: COLORS.muted } };
    c.alignment = { vertical: "top", wrapText: true };
    ws.getRow(nr).height = Math.max(18, Math.ceil(note.length / 140) * 14 + 4);
  }
}

function addDataBar(ws, ref, color = COLORS.accent) {
  ws.addConditionalFormatting({
    ref,
    rules: [
      {
        type: "dataBar",
        cfvo: [{ type: "min" }, { type: "max" }],
        color: { argb: color },
        showValue: true,
        gradient: true,
        border: false,
        minLength: 0,
        maxLength: 100,
      },
    ],
  });
}

/* ------------------------------------------------------------------------- */
/* 1. Dashboard                                                              */
/* ------------------------------------------------------------------------- */
const dash = workbook.addWorksheet("Dashboard", {
  properties: { tabColor: { argb: COLORS.accent } },
  views: [{ showGridLines: false }],
});
setWidths(dash, [38, 12, 20, 44, 3, 12, 12, 12, 12, 12, 12, 12, 12, 12]);

dash.mergeCells("A1:D1");
const dashTitle = dash.getCell("A1");
dashTitle.value = "RETAIL SALES ANALYSIS";
dashTitle.font = { name: FONT, size: 28, bold: true, color: { argb: COLORS.ink } };
dashTitle.alignment = { vertical: "middle" };
dash.getRow(1).height = 44;

dash.mergeCells("A2:D2");
const dashSub = dash.getCell("A2");
dashSub.value =
  "Synthetic sample data (seed 42) · Jan 2024 – Dec 2025 · 400 customers · 20 products · 2,701 order lines · ₹82.62L revenue";
dashSub.font = { name: FONT, size: 11, color: { argb: COLORS.muted } };
dash.getRow(2).height = 22;

dash.mergeCells("A3:D3");
const dashNote = dash.getCell("A3");
dashNote.value =
  "Synthetic data, not real business data. Percentages on this page are live formulas over the sheets in this workbook; charts are static images built from the same verified data.";
dashNote.font = { name: FONT, size: 9.5, italic: true, color: { argb: COLORS.muted } };
dashNote.alignment = { wrapText: true };
dash.getRow(3).height = 26;

function dashSection(row, text) {
  dash.mergeCells(row, 1, row, 4);
  const c = dash.getCell(row, 1);
  c.value = text;
  c.font = { name: FONT, size: 10.5, bold: true, color: { argb: COLORS.accentDark } };
  c.fill = solid(COLORS.accentLight);
  c.alignment = { vertical: "middle", indent: 1 };
  dash.getRow(row).height = 24;
}

function dashHeader(row, headers, aligns) {
  headers.forEach((h, i) => {
    const c = dash.getCell(row, i + 1);
    c.value = h;
    c.font = { name: FONT, size: 10, bold: true, color: { argb: COLORS.white } };
    c.fill = solid(COLORS.header);
    c.alignment = { vertical: "middle", horizontal: aligns[i], wrapText: true };
  });
  dash.getRow(row).height = 24;
}

dashSection(5, "HEADLINE METRICS — PERCENTAGES FIRST");

const pctRows = [
  {
    label: "Repeat customer share",
    formula: "'Repeat vs One-time'!C5",
    result: repeatRow.customers / totals.customers,
    basis: `${n0(repeatRow.customers)} of ${n0(totals.customers)} ordering customers bought more than once`,
  },
  {
    label: "One-time customer share",
    formula: "'Repeat vs One-time'!C6",
    result: oneTimeRow.customers / totals.customers,
    basis: `${n0(oneTimeRow.customers)} of ${n0(totals.customers)} ordering customers placed exactly one order`,
  },
  {
    label: "Repeat revenue share",
    formula: "'Repeat vs One-time'!E5",
    result: ext.repeatRevenueShare,
    basis: `${lakh(ext.repeatRevenue)} of ${lakh(totals.revenue)} revenue comes from repeat buyers`,
  },
  {
    label: "Apparel share of revenue",
    formula: "'Category Revenue'!D5",
    result: ext.apparelShare,
    basis: `${lakh(apparel.revenue)} of ${lakh(totals.revenue)} — Apparel is the largest category`,
  },
  {
    label: "Electronics share of revenue",
    formula: "'Category Revenue'!D6",
    result: ext.electronicsShare,
    basis: `${lakh(electronics.revenue)} — Electronics sells the most units (${n0(electronics.units_sold)})`,
  },
  {
    label: "North + West revenue share",
    formula: "('Region Revenue'!B5+'Region Revenue'!B6)/'KPI Summary'!B6",
    result: ext.northWestShare,
    basis: `${lakh(north.revenue + west.revenue)} of ${lakh(totals.revenue)} — North and West together`,
  },
  {
    label: "Top-10 product share",
    formula: "'Top Products'!G14",
    result: ext.top10ProductShare,
    basis: `${lakh(ext.top10ProductRevenue)} from the top 10 products; Running Shoes alone is ${lakh(ext.topProduct.revenue)}`,
  },
  {
    label: "Top-10 customer share",
    formula: "'Top Customers'!G14",
    result: ext.top10CustomerShare,
    basis: `${lakh(ext.top10CustomerRevenue)} from the top 10 customers — revenue is evenly spread`,
  },
];

dashHeader(6, ["Metric", "Rate", "Visual", "Basis"], ["left", "right", "left", "left"]);
pctRows.forEach((row, i) => {
  const rn = 7 + i;
  const label = dash.getCell(rn, 1);
  label.value = row.label;
  label.font = { name: FONT, size: 10.5, bold: true, color: { argb: COLORS.ink } };
  label.alignment = { vertical: "middle" };
  label.border = { bottom: thinBorder };

  const value = dash.getCell(rn, 2);
  value.value = f(row.formula, row.result);
  value.numFmt = PCT;
  value.font = { name: FONT, size: 11, bold: true, color: { argb: COLORS.accentDark } };
  value.alignment = { vertical: "middle", horizontal: "right" };
  value.border = { bottom: thinBorder };

  const bar = dash.getCell(rn, 3);
  bar.value = f(`REPT("█",ROUND(B${rn}*24,0))`);
  bar.font = { name: FONT, size: 10, color: { argb: COLORS.accent } };
  bar.alignment = { vertical: "middle", horizontal: "left" };
  bar.border = { bottom: thinBorder };

  const basis = dash.getCell(rn, 4);
  basis.value = row.basis;
  basis.font = { name: FONT, size: 9.5, color: { argb: COLORS.muted } };
  basis.alignment = { vertical: "middle", wrapText: false };
  basis.border = { bottom: thinBorder };
  dash.getRow(rn).height = 23;
});
addDataBar(dash, "B7:B14");

dashSection(16, "VOLUME & SCALE");
dashHeader(17, ["Metric", "Value", "Unit", "Note"], ["left", "right", "left", "left"]);
const volumeRows = [
  {
    label: "Revenue",
    value: f("'KPI Summary'!B6", totals.revenue),
    fmt: CUR,
    unit: "₹",
    note: "2,701 order lines; revenue = quantity × unit price",
  },
  {
    label: "Orders",
    value: f("'KPI Summary'!B7", totals.orders),
    fmt: "#,##0",
    unit: "orders",
    note: "Distinct order_id values across the 24 months",
  },
  {
    label: "Ordering customers",
    value: f("'KPI Summary'!B8", totals.customers),
    fmt: "#,##0",
    unit: "customers",
    note: "Distinct customer_id values; 400 customer records exist",
  },
  {
    label: "Units sold",
    value: f("'KPI Summary'!B9", totals.units),
    fmt: "#,##0",
    unit: "units",
    note: "SUM(quantity) across all order lines",
  },
  {
    label: "Average order value",
    value: f("'KPI Summary'!B10", totals.revenue / totals.orders),
    fmt: CUR2,
    unit: "₹ / order",
    note: "Revenue / distinct orders, not per line item",
  },
  {
    label: "Customer records",
    value: f("COUNTA(Customers!A5:A404)", totals.customerRecords),
    fmt: "#,##0",
    unit: "records",
    note: "22 never ordered and are excluded from customer metrics",
  },
  {
    label: "Products",
    value: f("COUNTA(Products!B5:B24)", totals.products),
    fmt: "#,##0",
    unit: "products",
    note: "Across five categories",
  },
  {
    label: "Months covered",
    value: f("COUNTA('Monthly Revenue'!A5:A28)", totals.months),
    fmt: "#,##0",
    unit: "months",
    note: "January 2024 to December 2025",
  },
  {
    label: "Regions",
    value: f("COUNTA('Region Revenue'!A5:A8)", totals.regions),
    fmt: "#,##0",
    unit: "regions",
    note: "North, West, East and South",
  },
];
volumeRows.forEach((row, i) => {
  const rn = 18 + i;
  const label = dash.getCell(rn, 1);
  label.value = row.label;
  label.font = { name: FONT, size: 10.5, color: { argb: COLORS.ink } };
  label.alignment = { vertical: "middle" };
  label.border = { bottom: thinBorder };

  const value = dash.getCell(rn, 2);
  value.value = row.value;
  value.numFmt = row.fmt;
  value.font = { name: FONT, size: 10.5, bold: true, color: { argb: COLORS.ink } };
  value.alignment = { vertical: "middle", horizontal: "right" };
  value.border = { bottom: thinBorder };

  const unit = dash.getCell(rn, 3);
  unit.value = row.unit;
  unit.font = { name: FONT, size: 9.5, color: { argb: COLORS.muted } };
  unit.alignment = { vertical: "middle", horizontal: "left" };
  unit.border = { bottom: thinBorder };

  const note = dash.getCell(rn, 4);
  note.value = row.note;
  note.font = { name: FONT, size: 9.5, color: { argb: COLORS.muted } };
  note.alignment = { vertical: "middle" };
  note.border = { bottom: thinBorder };
  dash.getRow(rn).height = 20;
});

dashSection(28, "REVENUE BY CATEGORY (share of total)");
dashHeader(29, ["Category", "Revenue", "Share", "Units"], ["left", "right", "right", "right"]);
data.categoryRevenue.forEach((cat, i) => {
  const rn = 30 + i;
  const name = dash.getCell(rn, 1);
  name.value = f(`'Category Revenue'!A${5 + i}`, cat.category);
  name.font = { name: FONT, size: 10.5, color: { argb: COLORS.ink } };
  name.alignment = { vertical: "middle" };
  name.border = { bottom: thinBorder };

  const revenue = dash.getCell(rn, 2);
  revenue.value = f(`'Category Revenue'!B${5 + i}`, cat.revenue);
  revenue.numFmt = CUR;
  revenue.font = { name: FONT, size: 10.5, bold: true, color: { argb: COLORS.ink } };
  revenue.alignment = { vertical: "middle", horizontal: "right" };
  revenue.border = { bottom: thinBorder };

  const share = dash.getCell(rn, 3);
  share.value = f(`'Category Revenue'!D${5 + i}`, cat.revenue / totals.revenue);
  share.numFmt = PCT;
  share.font = { name: FONT, size: 10.5, color: { argb: COLORS.accentDark } };
  share.alignment = { vertical: "middle", horizontal: "right" };
  share.border = { bottom: thinBorder };

  const units = dash.getCell(rn, 4);
  units.value = f(`'Category Revenue'!C${5 + i}`, cat.units_sold);
  units.numFmt = "#,##0";
  units.font = { name: FONT, size: 10.5, color: { argb: COLORS.muted } };
  units.alignment = { vertical: "middle", horizontal: "right" };
  units.border = { bottom: thinBorder };
  dash.getRow(rn).height = 20;
});

dashSection(36, "REVENUE BY REGION");
dashHeader(37, ["Region", "Revenue", "Share", "Customers"], ["left", "right", "right", "right"]);
data.regionRevenue.forEach((region, i) => {
  const rn = 38 + i;
  const name = dash.getCell(rn, 1);
  name.value = f(`'Region Revenue'!A${5 + i}`, region.region);
  name.font = { name: FONT, size: 10.5, color: { argb: COLORS.ink } };
  name.alignment = { vertical: "middle" };
  name.border = { bottom: thinBorder };

  const revenue = dash.getCell(rn, 2);
  revenue.value = f(`'Region Revenue'!B${5 + i}`, region.revenue);
  revenue.numFmt = CUR;
  revenue.font = { name: FONT, size: 10.5, bold: true, color: { argb: COLORS.ink } };
  revenue.alignment = { vertical: "middle", horizontal: "right" };
  revenue.border = { bottom: thinBorder };

  const share = dash.getCell(rn, 3);
  share.value = f(`'Region Revenue'!D${5 + i}`, region.revenue / totals.revenue);
  share.numFmt = PCT;
  share.font = { name: FONT, size: 10.5, color: { argb: COLORS.accentDark } };
  share.alignment = { vertical: "middle", horizontal: "right" };
  share.border = { bottom: thinBorder };

  const customers = dash.getCell(rn, 4);
  customers.value = f(`'Region Revenue'!C${5 + i}`, region.unique_customers);
  customers.numFmt = "#,##0";
  customers.font = { name: FONT, size: 10.5, color: { argb: COLORS.muted } };
  customers.alignment = { vertical: "middle", horizontal: "right" };
  customers.border = { bottom: thinBorder };
  dash.getRow(rn).height = 20;
});

dashSection(43, "HEADLINE FINDINGS (every number is verifiable in the sheets)");
const yoyText = `${ext.yoyGrowth >= 0 ? "+" : ""}${pct1(ext.yoyGrowth)}`;
const findings = [
  `Repeat buyers dominate: ${pct1(ext.repeatCustomerShare)} of buying customers and ${pct1(ext.repeatRevenueShare)} of revenue (${lakh(ext.repeatRevenue)} of ${lakh(totals.revenue)}).`,
  `Revenue is almost flat year over year: ${lakh(ext.revenue2024)} in 2024 vs ${lakh(ext.revenue2025)} in 2025, ${yoyText}.`,
  `Apparel leads categories at ${lakh(apparel.revenue)} (${pct1(ext.apparelShare)}); Electronics sells the most units (${n0(electronics.units_sold)}) but is second in revenue.`,
  `North + West generate ${pct1(ext.northWestShare)} of revenue; East and South split the rest almost evenly (${pct1(east.revenue / totals.revenue)} vs ${pct1(south.revenue / totals.revenue)}).`,
  `Demand is seasonal: Dec 2024 was the peak month (${lakh(peak.revenue)}), Feb 2025 the trough (${lakh(low.revenue)}).`,
];
findings.forEach((text, i) => {
  const rn = 44 + i;
  dash.mergeCells(rn, 1, rn, 4);
  const c = dash.getCell(rn, 1);
  c.value = text;
  c.font = { name: FONT, size: 10, color: { argb: COLORS.ink } };
  c.alignment = { vertical: "middle", indent: 1, wrapText: true };
  c.border = { bottom: thinBorder };
  dash.getRow(rn).height = 28;
});

dashSection(50, "CHARTS — generated from the same verified data (static images)");

const chartFiles = [
  "chart_monthly_revenue.png",
  "chart_category_revenue.png",
  "chart_region_revenue.png",
  "chart_top_products.png",
  "chart_repeat_mix.png",
  "chart_yoy_growth.png",
];
for (const file of chartFiles) {
  if (!existsSync(join(assets, file))) {
    throw new Error(`Missing chart ${file}. Run "npm run charts" first.`);
  }
}
const imageIds = chartFiles.map((file) =>
  workbook.addImage({ filename: join(assets, file), extension: "png" })
);
const chartRows = [50, 68, 86];
imageIds.forEach((id, i) => {
  const row = chartRows[Math.floor(i / 2)];
  const col = i % 2 === 0 ? 0 : 5;
  dash.addImage(id, {
    tl: { col, row },
    ext: { width: 700, height: 248 },
    editAs: "oneCell",
  });
});

/* ------------------------------------------------------------------------- */
/* 2. KPI Summary                                                            */
/* ------------------------------------------------------------------------- */
const kpi = workbook.addWorksheet("KPI Summary", {
  properties: { tabColor: { argb: COLORS.accentDark } },
  views: [{ showGridLines: false }],
});
setWidths(kpi, [36, 14, 12, 72]);

kpi.mergeCells("A1:D1");
kpi.getCell("A1").value = "KPI Summary";
kpi.getCell("A1").font = { name: FONT, size: 20, bold: true, color: { argb: COLORS.ink } };
kpi.getRow(1).height = 36;
kpi.mergeCells("A2:D2");
kpi.getCell("A2").value =
  "Q1 headline totals plus extended percentage metrics. Values come from data/orders.csv with the same definitions as sql/02_analysis_queries.sql.";
kpi.getCell("A2").font = { name: FONT, size: 10.5, color: { argb: COLORS.muted } };
kpi.getCell("A2").alignment = { vertical: "top", wrapText: true };
kpi.getRow(2).height = 30;
kpi.getRow(3).height = 8;

function kpiSection(row, text) {
  kpi.mergeCells(row, 1, row, 4);
  const c = kpi.getCell(row, 1);
  c.value = text;
  c.font = { name: FONT, size: 10.5, bold: true, color: { argb: COLORS.accentDark } };
  c.fill = solid(COLORS.accentLight);
  c.alignment = { vertical: "middle", indent: 1 };
  kpi.getRow(row).height = 24;
}

function kpiRows(startRow, rows) {
  rows.forEach((row, i) => {
    const rn = startRow + i;
    const label = kpi.getCell(rn, 1);
    label.value = row.label;
    label.font = { name: FONT, size: 10.5, color: { argb: COLORS.ink } };
    label.alignment = { vertical: "middle" };

    const value = kpi.getCell(rn, 2);
    value.value = row.value;
    value.font = { name: FONT, size: 10.5, bold: true, color: { argb: COLORS.ink } };
    value.alignment = { vertical: "middle", horizontal: "right" };
    if (row.fmt) value.numFmt = row.fmt;

    const unit = kpi.getCell(rn, 3);
    unit.value = row.unit;
    unit.font = { name: FONT, size: 9.5, color: { argb: COLORS.muted } };
    unit.alignment = { vertical: "middle", horizontal: "left" };

    const def = kpi.getCell(rn, 4);
    def.value = row.note;
    def.font = { name: FONT, size: 9.5, color: { argb: COLORS.muted } };
    def.alignment = { vertical: "middle" };

    [1, 2, 3, 4].forEach((c) => {
      kpi.getCell(rn, c).border = { bottom: { style: "hair", color: { argb: COLORS.border } } };
    });
    kpi.getRow(rn).height = 20;
  });
}

kpiSection(4, "A. HEADLINE TOTALS");
["Metric", "Value", "Unit", "Definition"].forEach((h, i) => {
  const c = kpi.getCell(5, i + 1);
  c.value = h;
  c.font = { name: FONT, size: 10.5, bold: true, color: { argb: COLORS.white } };
  c.fill = solid(COLORS.header);
  c.alignment = { vertical: "middle", horizontal: i === 0 ? "left" : i === 1 ? "right" : "left" };
});
kpi.getRow(5).height = 26;
kpiRows(6, [
  {
    label: "Total revenue",
    value: totals.revenue,
    fmt: CUR,
    unit: "₹",
    note: "SUM(quantity × unit_price) across 2,701 order lines",
  },
  {
    label: "Total orders",
    value: totals.orders,
    fmt: "#,##0",
    unit: "orders",
    note: "COUNT(DISTINCT order_id)",
  },
  {
    label: "Ordering customers",
    value: totals.customers,
    fmt: "#,##0",
    unit: "customers",
    note: "COUNT(DISTINCT customer_id)",
  },
  {
    label: "Units sold",
    value: totals.units,
    fmt: "#,##0",
    unit: "units",
    note: "SUM(quantity)",
  },
  {
    label: "Average order value",
    value: f("B6/B7", totals.revenue / totals.orders),
    fmt: CUR2,
    unit: "₹ / order",
    note: "Total revenue / distinct orders",
  },
]);

kpiSection(12, "B. EXTENDED METRICS — PERCENTAGES & RATES");
["Metric", "Value", "Unit", "Definition"].forEach((h, i) => {
  const c = kpi.getCell(13, i + 1);
  c.value = h;
  c.font = { name: FONT, size: 10.5, bold: true, color: { argb: COLORS.white } };
  c.fill = solid(COLORS.header);
  c.alignment = { vertical: "middle", horizontal: i === 0 ? "left" : i === 1 ? "right" : "left" };
});
kpi.getRow(13).height = 26;
kpiRows(14, [
  {
    label: "Revenue 2024",
    value: ext.revenue2024,
    fmt: CUR,
    unit: "₹",
    note: "Full-year revenue, Jan–Dec 2024",
  },
  {
    label: "Revenue 2025",
    value: ext.revenue2025,
    fmt: CUR,
    unit: "₹",
    note: "Full-year revenue, Jan–Dec 2025",
  },
  {
    label: "Overall YoY growth",
    value: f("(B15-B14)/B14", ext.yoyGrowth),
    fmt: SIGNED_PCT,
    unit: "%",
    note: "(2025 revenue − 2024 revenue) / 2024 revenue",
  },
  {
    label: "Revenue per customer",
    value: f("B6/B8", totals.revenue / totals.customers),
    fmt: CUR,
    unit: "₹ / customer",
    note: "Total revenue / 378 ordering customers",
  },
  {
    label: "Units per order",
    value: f("B9/B7", totals.units / totals.orders),
    fmt: "0.00",
    unit: "units / order",
    note: "6,792 units / 1,687 distinct orders",
  },
  {
    label: "Average unit price",
    value: f("B6/B9", totals.revenue / totals.units),
    fmt: CUR2,
    unit: "₹ / unit",
    note: "Revenue / units sold",
  },
  {
    label: "Repeat customers",
    value: f("'Repeat vs One-time'!B5", repeatRow.customers),
    fmt: "#,##0",
    unit: "customers",
    note: "More than one distinct order_id",
  },
  {
    label: "Repeat customer share",
    value: f("B20/B8", repeatRow.customers / totals.customers),
    fmt: PCT,
    unit: "% of customers",
    note: "Repeat customers / ordering customers",
  },
  {
    label: "One-time customers",
    value: f("'Repeat vs One-time'!B6", oneTimeRow.customers),
    fmt: "#,##0",
    unit: "customers",
    note: "Exactly one distinct order",
  },
  {
    label: "One-time customer share",
    value: f("B22/B8", oneTimeRow.customers / totals.customers),
    fmt: PCT,
    unit: "% of customers",
    note: "One-time customers / ordering customers",
  },
  {
    label: "Repeat revenue",
    value: f("'Repeat vs One-time'!D5", ext.repeatRevenue),
    fmt: CUR,
    unit: "₹",
    note: "Revenue from repeat customers",
  },
  {
    label: "Repeat revenue share",
    value: f("B24/B6", ext.repeatRevenueShare),
    fmt: PCT,
    unit: "% of revenue",
    note: "Repeat revenue / total revenue",
  },
  {
    label: "One-time revenue",
    value: f("'Repeat vs One-time'!D6", ext.oneTimeRevenue),
    fmt: CUR,
    unit: "₹",
    note: "Revenue from one-time customers",
  },
  {
    label: "One-time revenue share",
    value: f("B26/B6", ext.oneTimeRevenueShare),
    fmt: PCT,
    unit: "% of revenue",
    note: "One-time revenue / total revenue",
  },
  {
    label: "Apparel revenue share",
    value: f("'Category Revenue'!D5", ext.apparelShare),
    fmt: PCT,
    unit: "% of revenue",
    note: "Largest category by revenue (₹24.92L)",
  },
  {
    label: "Electronics revenue share",
    value: f("'Category Revenue'!D6", ext.electronicsShare),
    fmt: PCT,
    unit: "% of revenue",
    note: "Most units sold (1,750), second by revenue",
  },
  {
    label: "North + West revenue share",
    value: f("('Region Revenue'!B5+'Region Revenue'!B6)/B6", ext.northWestShare),
    fmt: PCT,
    unit: "% of revenue",
    note: "Two largest regions combined",
  },
  {
    label: "Top-10 product share",
    value: f("'Top Products'!G14", ext.top10ProductShare),
    fmt: PCT,
    unit: "% of revenue",
    note: "Top 10 of 20 products",
  },
  {
    label: "Top-10 customer share",
    value: f("'Top Customers'!G14", ext.top10CustomerShare),
    fmt: PCT,
    unit: "% of revenue",
    note: "Revenue is evenly spread across customers",
  },
  {
    label: "Peak month revenue",
    value: f("'Monthly Revenue'!B16", peak.revenue),
    fmt: CUR,
    unit: "₹",
    note: "Dec 2024; low was Feb 2025 at ₹2.34L",
  },
]);

kpiSection(35, "C. DEFINITIONS");
const definitions = [
  "Revenue = quantity × unit_price for every order line. 2,701 lines across 1,687 distinct orders.",
  "Average order value = total revenue / distinct orders, not per line item.",
  "Repeat customer = more than one distinct order_id; one-time = exactly one order.",
  "Share columns divide by the workbook total in 'KPI Summary'!B6 unless the header says otherwise.",
  "YoY % compares the same calendar month in 2025 and 2024; overall YoY uses full-year totals.",
  "The 400 customer records include 22 who never ordered; customer metrics use the 378 who did.",
];
definitions.forEach((text, i) => {
  const rn = 36 + i;
  kpi.mergeCells(rn, 1, rn, 4);
  const c = kpi.getCell(rn, 1);
  c.value = `•  ${text}`;
  c.font = { name: FONT, size: 9.5, color: { argb: COLORS.ink } };
  c.alignment = { vertical: "top", wrapText: true, indent: 1 };
  kpi.getRow(rn).height = Math.max(18, Math.ceil(text.length / 105) * 14 + 4);
});

kpi.mergeCells("A43:D43");
kpi.getCell("A43").value =
  "Source: synthetic sample data generated by scripts/generate_data.py (seed 42). Aggregates cross-checked against results/*.csv with 388 assertions.";
kpi.getCell("A43").font = { name: FONT, size: 9, italic: true, color: { argb: COLORS.muted } };

/* ------------------------------------------------------------------------- */
/* 3. Monthly Revenue (Q2)                                                   */
/* ------------------------------------------------------------------------- */
const monthlySheet = workbook.addWorksheet("Monthly Revenue", {
  properties: { tabColor: { argb: "FF475569" } },
  views: [{ showGridLines: false }],
});
const monthCount = data.monthlyRevenue.length;
const monthlyLast = monthCount + 4;
const monthlyTotal = monthlyLast + 1;
let runningMonth = 0;
writeTable(monthlySheet, {
  title: "Monthly Revenue — 24 months",
  subtitle:
    "Q2 · results/monthly_revenue.csv · Jan 2024 – Dec 2025 · AOV, share and cumulative share are live formulas",
  headers: ["Month", "Revenue", "Orders", "AOV", "Share of Revenue", "Cumulative Share"],
  rows: data.monthlyRevenue.map((row, i) => {
    const rn = 5 + i;
    runningMonth += row.revenue;
    return [
      row.month,
      row.revenue,
      row.orders,
      f(`B${rn}/C${rn}`, row.revenue / row.orders),
      f(`B${rn}/$B$${monthlyTotal}`, row.revenue / totals.revenue),
      f(`SUM($E$5:E${rn})`, runningMonth / totals.revenue),
    ];
  }),
  widths: [11, 13, 10, 13, 15, 16],
  formats: ["@", CUR, "#,##0", CUR2, PCT, PCT],
  aligns: ["left", "right", "right", "right", "right", "right"],
  totalRow: [
    "TOTAL",
    f(`SUM(B5:B${monthlyLast})`, totals.revenue),
    f(`SUM(C5:C${monthlyLast})`, totals.orders),
    f(`B${monthlyTotal}/C${monthlyTotal}`, totals.revenue / totals.orders),
    f(`SUM(E5:E${monthlyLast})`, 1),
    "—",
  ],
  note:
    "Month is a text key (YYYY-MM). Orders are distinct order_id values per month and add up to 1,687. Revenue adds up to ₹82.62L.",
});
addDataBar(monthlySheet, `B5:B${monthlyLast}`);

/* ------------------------------------------------------------------------- */
/* 4. YoY Growth (Q3)                                                        */
/* ------------------------------------------------------------------------- */
const yoySheet = workbook.addWorksheet("YoY Growth", {
  properties: { tabColor: { argb: "FF475569" } },
  views: [{ showGridLines: false }],
});
const yoyCount = data.yoyGrowth.length;
const yoyLast = yoyCount + 4;
const yoyTotal = yoyLast + 1;
const yoy2025Total = data.yoyGrowth.reduce((s, r) => s + num(r.revenue_2025), 0);
const yoy2024Total = data.yoyGrowth.reduce((s, r) => s + num(r.revenue_2024), 0);
writeTable(yoySheet, {
  title: "YoY Growth — 2025 vs 2024 by month",
  subtitle:
    "Q3 · results/yoy_growth.csv · 12 months · change and YoY % are live formulas; negative years use an explicit sign",
  headers: ["Month 2025", "Revenue 2025", "Revenue 2024", "Change", "YoY %", "2025 Share", "2024 Share"],
  rows: data.yoyGrowth.map((row, i) => {
    const rn = 5 + i;
    const rev25 = num(row.revenue_2025);
    const rev24 = num(row.revenue_2024);
    return [
      row.month_2025,
      rev25,
      rev24,
      f(`B${rn}-C${rn}`, rev25 - rev24),
      f(`IF(C${rn}=0,0,D${rn}/C${rn})`, rev24 === 0 ? 0 : (rev25 - rev24) / rev24),
      f(`B${rn}/$B$${yoyTotal}`, rev25 / yoy2025Total),
      f(`C${rn}/$C$${yoyTotal}`, rev24 / yoy2024Total),
    ];
  }),
  widths: [12, 14, 14, 13, 10, 11, 11],
  formats: ["@", CUR, CUR, CUR, SIGNED_PCT, PCT, PCT],
  aligns: ["left", "right", "right", "right", "right", "right", "right"],
  totalRow: [
    "TOTAL",
    f(`SUM(B5:B${yoyLast})`, yoy2025Total),
    f(`SUM(C5:C${yoyLast})`, yoy2024Total),
    f(`B${yoyTotal}-C${yoyTotal}`, yoy2025Total - yoy2024Total),
    f(`D${yoyTotal}/C${yoyTotal}`, (yoy2025Total - yoy2024Total) / yoy2024Total),
    f(`SUM(F5:F${yoyLast})`, 1),
    f(`SUM(G5:G${yoyLast})`, 1),
  ],
  note:
    "Overall 2025 revenue is ₹41.46L vs ₹41.16L in 2024, a +0.7% change. Monthly swings are much larger than the annual result.",
});
addDataBar(yoySheet, `B5:B${yoyLast}`);

/* ------------------------------------------------------------------------- */
/* 5. MoM Growth (Q4)                                                        */
/* ------------------------------------------------------------------------- */
const momSheet = workbook.addWorksheet("MoM Growth", {
  properties: { tabColor: { argb: "FF475569" } },
  views: [{ showGridLines: false }],
});
const momCount = data.momGrowth.length;
const momLast = momCount + 4;
const momTotal = momLast + 1;
let runningMom = 0;
writeTable(momSheet, {
  title: "MoM Growth — month over month",
  subtitle:
    "Q4 · results/mom_growth.csv · 24 months · MoM % is blank for the first month because there is no prior month",
  headers: ["Month", "Revenue", "Orders", "MoM Change", "MoM %", "Share of Revenue", "Cumulative Share"],
  rows: data.momGrowth.map((row, i) => {
    const rn = 5 + i;
    runningMom += row.revenue;
    return [
      row.month,
      row.revenue,
      row.orders,
      i === 0 ? "—" : f(`B${rn}-B${rn - 1}`, row.revenue - data.momGrowth[i - 1].revenue),
      i === 0
        ? "—"
        : f(
            `D${rn}/B${rn - 1}`,
            (row.revenue - data.momGrowth[i - 1].revenue) / data.momGrowth[i - 1].revenue
          ),
      f(`B${rn}/$B$${momTotal}`, row.revenue / totals.revenue),
      f(`SUM($F$5:F${rn})`, runningMom / totals.revenue),
    ];
  }),
  widths: [11, 13, 10, 13, 10, 15, 16],
  formats: ["@", CUR, "#,##0", CUR, SIGNED_PCT, PCT, PCT],
  aligns: ["left", "right", "right", "right", "right", "right", "right"],
  totalRow: [
    "TOTAL",
    f(`SUM(B5:B${momLast})`, totals.revenue),
    f(`SUM(C5:C${momLast})`, totals.orders),
    "—",
    "—",
    f(`SUM(F5:F${momLast})`, 1),
    "—",
  ],
  note:
    "MoM Change = this month − previous month. The strongest single-month jump and drop are visible in the conditional formatting bars on Revenue.",
});
addDataBar(momSheet, `B5:B${momLast}`, "FFB45309");

/* ------------------------------------------------------------------------- */
/* 6. Category Revenue (Q5)                                                  */
/* ------------------------------------------------------------------------- */
const catSheet = workbook.addWorksheet("Category Revenue", {
  properties: { tabColor: { argb: "FF475569" } },
  views: [{ showGridLines: false }],
});
const catCount = data.categoryRevenue.length;
const catLast = catCount + 4;
const catTotal = catLast + 1;
writeTable(catSheet, {
  title: "Revenue by Category",
  subtitle: `Q5 · results/category_revenue.csv · ${catCount} categories · share, revenue per unit and rank are live formulas`,
  headers: ["Category", "Revenue", "Units Sold", "Share of Revenue", "Revenue per Unit", "Rank"],
  rows: data.categoryRevenue.map((row, i) => {
    const rn = 5 + i;
    return [
      row.category,
      row.revenue,
      row.units_sold,
      f(`B${rn}/$B$${catTotal}`, row.revenue / totals.revenue),
      f(`B${rn}/C${rn}`, row.revenue / row.units_sold),
      f(`RANK(B${rn},$B$5:$B$${catLast})`, i + 1),
    ];
  }),
  widths: [18, 14, 11, 15, 15, 8],
  formats: ["@", CUR, "#,##0", PCT, CUR2, "#,##0"],
  aligns: ["left", "right", "right", "right", "right", "right"],
  totalRow: [
    "TOTAL",
    f(`SUM(B5:B${catLast})`, totals.revenue),
    f(`SUM(C5:C${catLast})`, totals.units),
    f(`SUM(D5:D${catLast})`, 1),
    f(`B${catTotal}/C${catTotal}`, totals.revenue / totals.units),
    "—",
  ],
  note:
    "Revenue = quantity × unit_price. Share divides by the all-category total in the TOTAL row, so the shares add to 100%.",
});
addDataBar(catSheet, `B5:B${catLast}`);

/* ------------------------------------------------------------------------- */
/* 7. Top Products (Q6)                                                      */
/* ------------------------------------------------------------------------- */
const prodTopSheet = workbook.addWorksheet("Top Products", {
  properties: { tabColor: { argb: "FF475569" } },
  views: [{ showGridLines: false }],
});
const prodTopCount = data.topProducts.length;
const topProdLast = prodTopCount + 4;
const topProdUnits = data.topProducts.reduce((sum, row) => sum + row.units_sold, 0);
let runningProd = 0;
writeTable(prodTopSheet, {
  title: "Top 10 Products by Revenue",
  subtitle: `Q6 · results/top_products.csv · ${prodTopCount} products · share of all revenue and cumulative share are live formulas`,
  headers: ["Rank", "Product", "Category", "Units Sold", "Revenue", "Share of Revenue", "Cumulative Share", "Revenue per Unit"],
  rows: data.topProducts.map((row, i) => {
    const rn = 5 + i;
    runningProd += row.revenue;
    return [
      i + 1,
      row.product_name,
      row.category,
      row.units_sold,
      row.revenue,
      f(`E${rn}/'KPI Summary'!B6`, row.revenue / totals.revenue),
      f(`SUM($F$5:F${rn})`, runningProd / totals.revenue),
      f(`IF(D${rn}=0,0,E${rn}/D${rn})`, row.revenue / row.units_sold),
    ];
  }),
  widths: [7, 24, 15, 10, 13, 14, 14, 14],
  formats: ["#,##0", "@", "@", "#,##0", CUR, PCT, PCT, CUR2],
  aligns: ["right", "left", "left", "right", "right", "right", "right", "right"],
  totalRow: [
    "TOTAL (top 10)",
    "—",
    "—",
    f(`SUM(D5:D${topProdLast})`, topProdUnits),
    f(`SUM(E5:E${topProdLast})`, ext.top10ProductRevenue),
    f(`SUM(F5:F${topProdLast})`, ext.top10ProductShare),
    "—",
    "—",
  ],
  note:
    "Top 10 of 20 products. Share divides by all revenue, so the cumulative column reaches 78.4% at row 14 — the top 10 drive most of the business.",
});
addDataBar(prodTopSheet, `E5:E${topProdLast}`);

/* ------------------------------------------------------------------------- */
/* 8. Region Revenue (Q7)                                                    */
/* ------------------------------------------------------------------------- */
const regionSheet = workbook.addWorksheet("Region Revenue", {
  properties: { tabColor: { argb: "FF475569" } },
  views: [{ showGridLines: false }],
});
const regionCount = data.regionRevenue.length;
const regionLast = regionCount + 4;
const regionTotal = regionLast + 1;
writeTable(regionSheet, {
  title: "Revenue by Region",
  subtitle: `Q7 · results/region_revenue.csv · ${regionCount} regions · share, revenue per customer and rank are live formulas`,
  headers: ["Region", "Revenue", "Unique Customers", "Share of Revenue", "Revenue per Customer", "Rank"],
  rows: data.regionRevenue.map((row, i) => {
    const rn = 5 + i;
    return [
      row.region,
      row.revenue,
      row.unique_customers,
      f(`B${rn}/$B$${regionTotal}`, row.revenue / totals.revenue),
      f(`B${rn}/C${rn}`, row.revenue / row.unique_customers),
      f(`RANK(B${rn},$B$5:$B$${regionLast})`, i + 1),
    ];
  }),
  widths: [12, 14, 15, 15, 17, 8],
  formats: ["@", CUR, "#,##0", PCT, CUR, "#,##0"],
  aligns: ["left", "right", "right", "right", "right", "right"],
  totalRow: [
    "TOTAL",
    f(`SUM(B5:B${regionLast})`, totals.revenue),
    f(`SUM(C5:C${regionLast})`, totals.customers),
    f(`SUM(D5:D${regionLast})`, 1),
    f(`B${regionTotal}/C${regionTotal}`, totals.revenue / totals.customers),
    "—",
  ],
  note:
    "Each buying customer belongs to one region, so the four regional customer counts add up to 378. This is customer reach, not population.",
});
addDataBar(regionSheet, `B5:B${regionLast}`);

/* ------------------------------------------------------------------------- */
/* 9. Top Customers (Q8)                                                     */
/* ------------------------------------------------------------------------- */
const custTopSheet = workbook.addWorksheet("Top Customers", {
  properties: { tabColor: { argb: "FF475569" } },
  views: [{ showGridLines: false }],
});
const topCustCount = data.topCustomers.length;
const topCustLast = topCustCount + 4;
const topCustTotal = topCustLast + 1;
let runningCust = 0;
writeTable(custTopSheet, {
  title: "Top 10 Customers by Revenue",
  subtitle: `Q8 · results/top_customers.csv · ${topCustCount} customers · share of all revenue and cumulative share are live formulas`,
  headers: ["Rank", "Customer ID", "Customer", "Region", "Revenue", "Share of Revenue", "Cumulative Share"],
  rows: data.topCustomers.map((row, i) => {
    const rn = 5 + i;
    runningCust += row.revenue;
    return [
      i + 1,
      row.customer_id,
      row.customer_name,
      row.region,
      row.revenue,
      f(`E${rn}/'KPI Summary'!B6`, row.revenue / totals.revenue),
      f(`SUM($F$5:F${rn})`, runningCust / totals.revenue),
    ];
  }),
  widths: [7, 11, 20, 10, 13, 14, 14],
  formats: ["#,##0", "@", "@", "@", CUR, PCT, PCT],
  aligns: ["right", "left", "left", "left", "right", "right", "right"],
  totalRow: [
    "TOTAL (top 10)",
    "—",
    "—",
    "—",
    f(`SUM(E5:E${topCustLast})`, ext.top10CustomerRevenue),
    f(`SUM(F5:F${topCustLast})`, ext.top10CustomerShare),
    "—",
  ],
  note:
    "Share divides by all revenue, not by the top-10 total. The top 10 customers account for 10.8% of revenue — demand is spread across many buyers.",
});
addDataBar(custTopSheet, `E5:E${topCustLast}`);

/* ------------------------------------------------------------------------- */
/* 10. Repeat vs One-time (Q9)                                               */
/* ------------------------------------------------------------------------- */
const repeatSheet = workbook.addWorksheet("Repeat vs One-time", {
  properties: { tabColor: { argb: "FF475569" } },
  views: [{ showGridLines: false }],
});
writeTable(repeatSheet, {
  title: "Repeat vs One-time Customers",
  subtitle:
    "Q9 · results/repeat_vs_onetime.csv · customers, revenue share and revenue per customer are live formulas",
  headers: ["Customer Type", "Customers", "Share of Customers", "Revenue", "Share of Revenue", "Revenue per Customer"],
  rows: data.repeatVsOnetime.map((row, i) => {
    const rn = 5 + i;
    return [
      row.customer_type,
      row.customers,
      f(`B${rn}/$B$7`, row.customers / totals.customers),
      row.revenue,
      f(`D${rn}/$D$7`, row.revenue / totals.revenue),
      f(`D${rn}/B${rn}`, row.revenue / row.customers),
    ];
  }),
  widths: [16, 11, 15, 14, 15, 17],
  formats: ["@", "#,##0", PCT, CUR, PCT, CUR],
  aligns: ["left", "right", "right", "right", "right", "right"],
  totalRow: [
    "TOTAL",
    f("SUM(B5:B6)", totals.customers),
    f("SUM(C5:C6)", 1),
    f("SUM(D5:D6)", totals.revenue),
    f("SUM(E5:E6)", 1),
    f("D7/B7", totals.revenue / totals.customers),
  ],
  note:
    "Repeat = more than one distinct order_id. 84.4% of buying customers are repeat customers and they generate 95.9% of revenue.",
});
addDataBar(repeatSheet, "D5:D6");

/* ------------------------------------------------------------------------- */
/* 11. Category x Region (Q10)                                               */
/* ------------------------------------------------------------------------- */
const matrixSheet = workbook.addWorksheet("Category x Region", {
  properties: { tabColor: { argb: "FF475569" } },
  views: [{ showGridLines: false }],
});
const MATRIX_CATEGORIES = ["Electronics", "Apparel", "Home & Kitchen", "Beauty", "Sports"];
const matrixCount = data.categoryRegionMatrix.length;
const matrixLast = matrixCount + 4;
const matrixTotal = matrixLast + 1;
writeTable(matrixSheet, {
  title: "Category × Region — ready-made pivot",
  subtitle: `Q10 · results/category_region_matrix.csv · ${matrixCount} regions × ${MATRIX_CATEGORIES.length} categories · row totals and share are live formulas`,
  headers: ["Region", ...MATRIX_CATEGORIES, "Total Revenue", "Share of Revenue"],
  rows: data.categoryRegionMatrix.map((row, i) => {
    const rn = 5 + i;
    return [
      row.region,
      ...MATRIX_CATEGORIES.map((category) => row[category]),
      f(`SUM(B${rn}:F${rn})`, row.total_revenue),
      f(`G${rn}/$G$${matrixTotal}`, row.total_revenue / totals.revenue),
    ];
  }),
  widths: [12, 13, 12, 16, 11, 11, 14, 15],
  formats: ["@", CUR, CUR, CUR, CUR, CUR, CUR, PCT],
  aligns: ["left", "right", "right", "right", "right", "right", "right", "right"],
  totalRow: [
    "TOTAL",
    ...MATRIX_CATEGORIES.map((category, i) => {
      const column = String.fromCharCode(66 + i);
      const columnTotal = data.categoryRegionMatrix.reduce((sum, row) => sum + row[category], 0);
      return f(`SUM(${column}5:${column}${matrixLast})`, columnTotal);
    }),
    f(`SUM(G5:G${matrixLast})`, totals.revenue),
    f(`SUM(H5:H${matrixLast})`, 1),
  ],
  note:
    "Categories are ordered by column, not by size. The matrix is already aggregated — use it directly for a heatmap or a pivot without touching the order lines.",
});
addDataBar(matrixSheet, `G5:G${matrixLast}`);

/* ------------------------------------------------------------------------- */
/* 12. Best Quarters (Q11)                                                   */
/* ------------------------------------------------------------------------- */
const quarterSheet = workbook.addWorksheet("Best Quarters", {
  properties: { tabColor: { argb: "FF475569" } },
  views: [{ showGridLines: false }],
});
const quarterCount = data.bestQuarters.length;
const quarterLast = quarterCount + 4;
const quarterTotal = quarterLast + 1;
writeTable(quarterSheet, {
  title: "Best Quarters — ranked by revenue",
  subtitle: `Q11 · results/best_quarters.csv · ${quarterCount} quarters · AOV and share are live formulas`,
  headers: ["Quarter", "Revenue", "Orders", "AOV", "Share of Revenue"],
  rows: data.bestQuarters.map((row, i) => {
    const rn = 5 + i;
    return [
      row.quarter,
      row.revenue,
      row.orders,
      f(`B${rn}/C${rn}`, row.revenue / row.orders),
      f(`B${rn}/$B$${quarterTotal}`, row.revenue / totals.revenue),
    ];
  }),
  widths: [11, 14, 10, 13, 15],
  formats: ["@", CUR, "#,##0", CUR2, PCT],
  aligns: ["left", "right", "right", "right", "right"],
  totalRow: [
    "TOTAL",
    f(`SUM(B5:B${quarterLast})`, totals.revenue),
    f(`SUM(C5:C${quarterLast})`, totals.orders),
    f(`B${quarterTotal}/C${quarterTotal}`, totals.revenue / totals.orders),
    f(`SUM(E5:E${quarterLast})`, 1),
  ],
  note:
    "Quarter labels are YYYY-Qn. AOV = quarterly revenue / distinct orders in that quarter. Q4 2024 is the best quarter at ₹13.24L.",
});
addDataBar(quarterSheet, `B5:B${quarterLast}`);

/* ------------------------------------------------------------------------- */
/* 13. Orders (full grain)                                                   */
/* ------------------------------------------------------------------------- */
const ordersSheet = workbook.addWorksheet("Orders", {
  properties: { tabColor: { argb: "FFB45309" } },
  views: [{ showGridLines: false }],
});
const orderCount = data.orders.length;
const orderLast = orderCount + 4;
writeTable(ordersSheet, {
  title: "Orders — every line item in the dataset",
  subtitle: `2,701 rows · data/orders.csv · Revenue, Month and Quarter are live formulas · pivot-ready`,
  headers: [
    "Order ID",
    "Date",
    "Customer ID",
    "Region",
    "Product ID",
    "Product",
    "Category",
    "Quantity",
    "Unit Price",
    "Revenue",
    "Month",
    "Quarter",
  ],
  rows: data.orders.map((order, i) => {
    const rn = 5 + i;
    return [
      order.orderId,
      new Date(`${order.orderDate}T00:00:00Z`),
      order.customerId,
      order.region,
      order.productId,
      order.productName,
      order.category,
      order.quantity,
      order.unitPrice,
      f(`H${rn}*I${rn}`, order.revenue),
      f(`TEXT(B${rn},"yyyy-mm")`, order.orderDate.slice(0, 7)),
      f(
        `YEAR(B${rn})&"-Q"&ROUNDUP(MONTH(B${rn})/3,0)`,
        `${order.orderDate.slice(0, 4)}-Q${Math.floor((Number(order.orderDate.slice(5, 7)) - 1) / 3) + 1}`
      ),
    ];
  }),
  widths: [9, 11, 11, 9, 10, 24, 15, 9, 10, 11, 10, 10],
  formats: ["@", "yyyy-mm-dd", "@", "@", "@", "@", "@", "#,##0", CUR, CUR, "@", "@"],
  aligns: ["left", "center", "left", "left", "left", "left", "left", "right", "right", "right", "center", "center"],
  totalRow: [
    "TOTAL",
    "—",
    "—",
    "—",
    "—",
    "—",
    "—",
    f(`SUM(H5:H${orderLast})`, totals.units),
    "—",
    f(`SUM(J5:J${orderLast})`, totals.revenue),
    "—",
    "—",
  ],
  note:
    "Full line-item grain: 2,701 rows, 1,687 distinct orders, 6,792 units and ₹82.62L revenue. Month and Quarter are derived from Date with live formulas.",
});

/* ------------------------------------------------------------------------- */
/* 14. Customers                                                             */
/* ------------------------------------------------------------------------- */
const customersSheet = workbook.addWorksheet("Customers", {
  properties: { tabColor: { argb: "FFB45309" } },
  views: [{ showGridLines: false }],
});
const customerCount = data.customerTable.length;
const customerLast = customerCount + 4;
writeTable(customersSheet, {
  title: "Customers — all 400 records",
  subtitle: `data/customers.csv + order counts · sorted by revenue · share is a live formula against total revenue`,
  headers: ["Customer ID", "Customer", "Region", "Signup Date", "Orders", "Revenue", "Customer Type", "Share of Revenue"],
  rows: data.customerTable.map((customer, i) => {
    const rn = 5 + i;
    return [
      customer.customer_id,
      customer.customer_name,
      customer.region,
      new Date(`${customer.signup_date}T00:00:00Z`),
      customer.orders,
      customer.revenue,
      customer.customer_type,
      f(`F${rn}/'KPI Summary'!B6`, customer.revenue / totals.revenue),
    ];
  }),
  widths: [11, 20, 10, 12, 9, 13, 13, 15],
  formats: ["@", "@", "@", "yyyy-mm-dd", "#,##0", CUR, "@", PCT],
  aligns: ["left", "left", "left", "center", "right", "right", "left", "right"],
  note:
    "400 customer records, 378 with at least one order. 'No orders' means exactly zero order lines; Customer Type is derived from the order count, not typed by hand.",
});

/* ------------------------------------------------------------------------- */
/* 15. Products                                                              */
/* ------------------------------------------------------------------------- */
const productsSheet = workbook.addWorksheet("Products", {
  properties: { tabColor: { argb: "FFB45309" } },
  views: [{ showGridLines: false }],
});
const productCount = data.productTable.length;
const productLast = productCount + 4;
const productTotal = productLast + 1;
writeTable(productsSheet, {
  title: "Products — all 20 products",
  subtitle: `data/products.csv + order aggregates · sorted by revenue · share and rank are live formulas`,
  headers: ["Product ID", "Product", "Category", "Unit Price", "Units Sold", "Revenue", "Share of Revenue", "Rank"],
  rows: data.productTable.map((product, i) => {
    const rn = 5 + i;
    return [
      product.product_id,
      product.product_name,
      product.category,
      product.unit_price,
      product.units_sold,
      product.revenue,
      f(`F${rn}/$F$${productTotal}`, product.revenue / totals.revenue),
      f(`RANK(F${rn},$F$5:$F$${productLast})`, i + 1),
    ];
  }),
  widths: [11, 24, 15, 11, 11, 14, 15, 8],
  formats: ["@", "@", "@", CUR, "#,##0", CUR, PCT, "#,##0"],
  aligns: ["left", "left", "left", "right", "right", "right", "right", "right"],
  totalRow: [
    "TOTAL",
    "—",
    "—",
    "—",
    f(`SUM(E5:E${productLast})`, totals.units),
    f(`SUM(F5:F${productLast})`, totals.revenue),
    f(`SUM(G5:G${productLast})`, 1),
    "—",
  ],
  note:
    "All 20 products across five categories. Unit Price is the list price from products.csv; Revenue is summed from the order lines.",
});
addDataBar(productsSheet, `F5:F${productLast}`);

/* ------------------------------------------------------------------------- */
/* 16. How To Use                                                            */
/* ------------------------------------------------------------------------- */
const guide = workbook.addWorksheet("How To Use", {
  properties: { tabColor: { argb: COLORS.muted } },
  views: [{ showGridLines: false }],
});
setWidths(guide, [27, 62, 38]);

guide.mergeCells("A1:C1");
guide.getCell("A1").value = "How To Use This Workbook";
guide.getCell("A1").font = { name: FONT, size: 20, bold: true, color: { argb: COLORS.ink } };
guide.getRow(1).height = 36;
guide.mergeCells("A2:C2");
guide.getCell("A2").value =
  "Retail Sales Analysis · synthetic sample data (seed 42) · Excel and Google Sheets · rebuild with: cd excel && npm run all";
guide.getCell("A2").font = { name: FONT, size: 10.5, color: { argb: COLORS.muted } };
guide.getCell("A2").alignment = { vertical: "top", wrapText: true };
guide.getRow(2).height = 24;

function guideSection(row, text) {
  guide.mergeCells(row, 1, row, 3);
  const c = guide.getCell(row, 1);
  c.value = text;
  c.font = { name: FONT, size: 10.5, bold: true, color: { argb: COLORS.accentDark } };
  c.fill = solid(COLORS.accentLight);
  c.alignment = { vertical: "middle", indent: 1 };
  guide.getRow(row).height = 24;
}

function guideHeader(row, values) {
  values.forEach((v, i) => {
    const c = guide.getCell(row, i + 1);
    c.value = v;
    c.font = { name: FONT, size: 10.5, bold: true, color: { argb: COLORS.white } };
    c.fill = solid(COLORS.header);
    c.alignment = { vertical: "middle", wrapText: true };
  });
  guide.getRow(row).height = 24;
}

function guideRow(row, values, { boldFirst = false, height } = {}) {
  const heights = [];
  values.forEach((v, i) => {
    const c = guide.getCell(row, i + 1);
    c.value = v;
    c.font = {
      name: FONT,
      size: 9.5,
      bold: boldFirst && i === 0,
      color: { argb: i === 0 ? COLORS.ink : COLORS.muted },
    };
    c.alignment = { vertical: "top", wrapText: true };
    c.border = { bottom: { style: "hair", color: { argb: COLORS.border } } };
    const charsPerLine = [27, 62, 38][i] * 1.15;
    heights.push(Math.ceil(String(v).length / charsPerLine));
  });
  const lines = Math.max(1, ...heights);
  guide.getRow(row).height = height ?? Math.max(18, lines * 13 + 5);
}

function guideBullet(row, text) {
  guide.mergeCells(row, 1, row, 3);
  const c = guide.getCell(row, 1);
  c.value = `•  ${text}`;
  c.font = { name: FONT, size: 9.5, color: { argb: COLORS.ink } };
  c.alignment = { vertical: "top", wrapText: true, indent: 1 };
  guide.getRow(row).height = Math.max(18, Math.ceil(text.length / 120) * 13 + 5);
}

let gr = 4;
guideSection(gr, "1. WHAT IS IN THE WORKBOOK");
gr += 1;
guideHeader(gr, ["Sheet", "What it answers", "Built from"]);
gr += 1;
const sheetGuide = [
  ["Dashboard", "Percentage KPIs first, volume KPIs, category/region splits and six charts", "Live formulas + static chart images"],
  ["KPI Summary", "Q1 totals plus 20 extended % metrics: YoY, repeat mix, category and region shares", "data/orders.csv"],
  ["Monthly Revenue", "Q2: 24 months of revenue, orders, AOV and cumulative share", "results/monthly_revenue.csv"],
  ["YoY Growth", "Q3: 2025 vs 2024 for each calendar month with signed change", "results/yoy_growth.csv"],
  ["MoM Growth", "Q4: month-over-month change and percentage", "results/mom_growth.csv"],
  ["Category Revenue", "Q5: revenue, units and share for each of the five categories", "results/category_revenue.csv"],
  ["Top Products", "Q6: top 10 products with cumulative concentration", "results/top_products.csv"],
  ["Region Revenue", "Q7: revenue, customers and share by region", "results/region_revenue.csv"],
  ["Top Customers", "Q8: top 10 customers with share of all revenue", "results/top_customers.csv"],
  ["Repeat vs One-time", "Q9: customer and revenue split for repeat buyers", "results/repeat_vs_onetime.csv"],
  ["Category x Region", "Q10: ready-made region × category matrix", "results/category_region_matrix.csv"],
  ["Best Quarters", "Q11: eight quarters ranked by revenue with AOV", "results/best_quarters.csv"],
  ["Orders", "All 2,701 line items with live Revenue, Month and Quarter columns", "data/orders.csv"],
  ["Customers", "All 400 records with order count, revenue and customer type", "data/customers.csv + Orders"],
  ["Products", "All 20 products with units, revenue, share and rank", "data/products.csv + Orders"],
];
sheetGuide.forEach((row) => {
  guideRow(gr, row, { boldFirst: true });
  gr += 1;
});

gr += 1;
guideSection(gr, "2. IMPORT INTO GOOGLE SHEETS (3 STEPS)");
gr += 1;
[
  ["Step 1", "Open sheets.google.com and create a blank spreadsheet.", "Any Google account."],
  ["Step 2", "File → Import → Upload → select Retail-Sales-Analysis-Workbook.xlsx → Import data.", "Choose Create new sheet (or Replace spreadsheet)."],
  ["Step 3", "Open Dashboard. Percentages recalculate automatically and the six charts appear as floating images.", "If a chart is missing: Insert → Image → Upload → pick excel/assets/*.png."],
].forEach((row) => {
  guideRow(gr, row);
  gr += 1;
});

gr += 1;
guideSection(gr, "3. BUILD PIVOT TABLES");
gr += 1;
guideHeader(gr, ["Question", "Rows / Columns", "Values"]);
gr += 1;
[
  ["Revenue by region × category", "Orders → Rows: Region; Columns: Category", "SUM of Revenue (or use the Category x Region sheet)"],
  ["Monthly revenue trend", "Orders → Rows: Month", "SUM of Revenue; for distinct orders use the Monthly Revenue sheet"],
  ["Top products", "Orders → Rows: Product", "SUM of Revenue, SUM of Quantity; sort revenue descending"],
  ["Repeat mix", "Customers → Rows: Customer Type", "COUNTA of Customer ID, SUM of Revenue"],
  ["Quarter performance", "Orders → Rows: Quarter", "SUM of Revenue, SUM of Quantity"],
  ["Category share of revenue", "Orders → Rows: Category", "SUM of Revenue; show as % of grand total"],
].forEach((row) => {
  guideRow(gr, row, { boldFirst: true });
  gr += 1;
});

gr += 1;
guideSection(gr, "4. EXCEL POWER QUERY — FULL ORDER-LINE GRAIN");
gr += 1;
[
  ["Step 1", "Data → Get Data → From File → From Text/CSV.", "Use data/orders.csv (2,701 rows), data/customers.csv (400) and data/products.csv (20)."],
  ["Step 2", "Load the three files and merge orders with customers on customer_id and with products on product_id.", "The workbook already includes the merged order table on the Orders sheet."],
  ["Step 3", "Apply the same definitions: revenue = quantity × unit_price; repeat = more than one distinct order_id.", "All definitions match sql/02_analysis_queries.sql."],
].forEach((row) => {
  guideRow(gr, row);
  gr += 1;
});

gr += 1;
guideSection(gr, "5. REBUILD THIS WORKBOOK");
gr += 1;
[
  ["Requirements", "Node.js 20+ and npm. Edge is only needed to regenerate chart images on Windows.", "npm install"],
  ["Charts", "Re-render the six dashboard PNGs into excel/assets/.", "npm run charts"],
  ["Build", "Regenerate Retail-Sales-Analysis-Workbook.xlsx from data/ + results/.", "npm run build"],
  ["Verify", "Re-check all data aggregates and the workbook itself.", "npm run verify"],
  ["Everything", "Charts → build → verify in one command.", "npm run all"],
].forEach((row) => {
  guideRow(gr, row, { boldFirst: true });
  gr += 1;
});

gr += 1;
guideSection(gr, "6. DEFINITIONS (MATCH THE SQL PROJECT)");
gr += 1;
[
  "Revenue = quantity × unit_price for every order line. There are 2,701 lines and 1,687 distinct orders.",
  "Average order value = total revenue / distinct orders, not per line item.",
  "Repeat customer = a customer with more than one distinct order_id. One-time = exactly one order.",
  "Monthly and quarterly aggregates use order_date; a month key is YYYY-MM and a quarter key is YYYY-Qn.",
  "Share columns divide by the workbook total in 'KPI Summary'!B6 unless the header says otherwise.",
  "The 400 customer records include 22 who never ordered. Customer metrics use the 378 who did.",
  "All money is in Indian rupees (₹) and the dataset is synthetic — seed 42, generated by scripts/generate_data.py.",
].forEach((text) => {
  guideBullet(gr, text);
  gr += 1;
});

gr += 1;
guideSection(gr, "7. HONEST LIMITATIONS");
gr += 1;
[
  "The six dashboard charts are embedded PNG images, not native Excel charts — ExcelJS has no chart API. Every number behind them is in the sheets, so they can be rebuilt.",
  "The dataset is synthetic sample data (seed 42), not real business data. It is designed to be realistic, not to represent any real retailer.",
  "The pattern is only 24 months long (Jan 2024 – Dec 2025), so YoY comparisons use one prior year and seasonality claims are limited to this sample.",
  "Aggregates were computed by excel/lib/compute.mjs and cross-checked against the 11 SQL result files with 388 assertions (npm run verify).",
  "The workbook was verified by reading the .xlsx back programmatically; it was not opened in desktop Excel in the build environment (Office activation was unavailable).",
  "The Orders sheet keeps the full 2,701-row line-item grain. The SQL project remains the source of truth for the queries.",
].forEach((text) => {
  guideBullet(gr, text);
  gr += 1;
});

guide.pageSetup = {
  paperSize: 9,
  orientation: "portrait",
  fitToPage: true,
  fitToWidth: 1,
  fitToHeight: 0,
};
guide.headerFooter = { oddFooter: `&LRetail Sales Analysis&CPage &P of &N&RSynthetic sample data (seed 42)` };

/* ------------------------------------------------------------------------- */
/* Write                                                                     */
/* ------------------------------------------------------------------------- */
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
const actualSheets = workbook.worksheets.map((ws) => ws.name);
if (actualSheets.join("|") !== expectedSheets.join("|")) {
  throw new Error(`Sheet order mismatch:\n${actualSheets.join(", ")}`);
}

await workbook.xlsx.writeFile(outPath);
const size = statSync(outPath).size;
console.log(`OK  ${outPath}`);
console.log(`    ${(size / 1024).toFixed(0)} KB · ${actualSheets.length} sheets`);
console.log(`    Orders: ${orderCount} · Customers: ${customerCount} · Products: ${productCount}`);
console.log(`    Dashboard images: ${dash.getImages().length}`);
