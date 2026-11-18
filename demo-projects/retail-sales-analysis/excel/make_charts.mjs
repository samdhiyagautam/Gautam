/**
 * Generates the retail dashboard chart images as SVG and renders them to PNG
 * with headless Edge. ExcelJS has no native chart API, so the workbook embeds
 * these PNGs while every KPI cell beside them stays a live formula.
 *
 * Run with: npm run charts
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { computeAll } from "./lib/compute.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const projectDir = join(here, "..");
const srcDir = join(here, ".chart-src");
const outDir = join(here, "assets");
const profileDir = join(here, ".edge-profile");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const W = 960;
const H = 340;
const C = {
  ink: "#0f172a",
  muted: "#64748b",
  grid: "#e2e8f0",
  bar: "#334155",
  barSoft: "#94a3b8",
  accent: "#0d9488",
  amber: "#f59e0b",
  red: "#dc2626",
  soft: "#f8fafc",
};

const data = computeAll(projectDir);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fmt = (n) => n.toLocaleString("en-US");
const lakh = (n, dp = 1) => `₹${(n / 100000).toFixed(dp)}L`;
const monthLabel = (m) => {
  const [year, month] = m.split("-");
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${names[Number(month) - 1]} ${year.slice(2)}`;
};

function frame(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W * 2}" height="${H * 2}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="#ffffff"/>
${body}
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="#e2e8f0"/>
</svg>`;
}

function titleBlock(title, subtitle) {
  return `<text x="26" y="30" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="600" fill="${C.ink}">${esc(title)}</text>
<text x="26" y="49" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" fill="${C.muted}">${esc(subtitle)}</text>`;
}

/* ------------------------------------------------------------------ */
/* Monthly revenue line                                                */
/* ------------------------------------------------------------------ */
function monthlyChart() {
  const rows = data.monthlyRevenue;
  const left = 66;
  const right = 26;
  const top = 78;
  const bottom = 54;
  const plotW = W - left - right;
  const plotH = H - top - bottom;
  const maxY = 550000;
  const x = (i) => left + (plotW * i) / (rows.length - 1);
  const y = (v) => top + plotH - (v / maxY) * plotH;

  const grid = [0, 100000, 200000, 300000, 400000, 500000]
    .map(
      (v) =>
        `<line x1="${left}" y1="${y(v)}" x2="${W - right}" y2="${y(v)}" stroke="${C.grid}" stroke-width="1"/>
<text x="${left - 10}" y="${y(v) + 4}" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="10.5" fill="${C.muted}">₹${v / 100000}L</text>`
    )
    .join("");

  const points = rows.map((r, i) => `${x(i).toFixed(1)},${y(r.revenue).toFixed(1)}`).join(" ");
  const area = `${left},${top + plotH} ${points} ${W - right},${top + plotH}`;

  const labelEvery = 3;
  const labels = rows
    .map((r, i) =>
      i % labelEvery === 0 || i === rows.length - 1
        ? `<text x="${x(i).toFixed(1)}" y="${H - bottom + 18}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="10" fill="${C.muted}">${monthLabel(r.month)}</text>`
        : ""
    )
    .join("");

  const peak = data.extended.peakMonth;
  const peakIndex = rows.findIndex((r) => r.month === peak.month);
  const dots = rows
    .map(
      (r, i) =>
        `<circle cx="${x(i).toFixed(1)}" cy="${y(r.revenue).toFixed(1)}" r="${i === peakIndex ? 4.6 : 2.6}" fill="${i === peakIndex ? C.accent : "#ffffff"}" stroke="${C.accent}" stroke-width="1.6"/>`
    )
    .join("");

  return frame(`${titleBlock(
    "Monthly revenue — 24 months",
    "Synthetic sample data (seed 42) · Jan 2024 – Dec 2025 · peak Dec 2024 at ₹5.02L"
  )}
${grid}
<polygon points="${area}" fill="${C.accent}" opacity="0.10"/>
<polyline points="${points}" fill="none" stroke="${C.accent}" stroke-width="2.4" stroke-linejoin="round"/>
${dots}
<text x="${x(peakIndex)}" y="${y(peak.revenue) - 14}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="700" fill="${C.ink}">${lakh(peak.revenue, 2)}</text>
${labels}
<text x="${W - right}" y="${H - 12}" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="10" fill="${C.muted}">Low: Feb 2025 at ₹2.34L · total ₹82.62L</text>`);
}

/* ------------------------------------------------------------------ */
/* Horizontal bars: categories, regions, products                      */
/* ------------------------------------------------------------------ */
function hbarChart({ title, subtitle, rows, display, labelWidth = 220, x0 = 244, x1 = 790, accentTop = 1, note, rowFont = 12.5 }) {
  const top = 74;
  const bottom = note ? 40 : 30;
  const rowH = (H - top - bottom) / rows.length;
  const barH = Math.min(18, rowH * 0.62);
  const max = Math.max(...rows.map((r) => r.value));

  const bars = rows
    .map((r, i) => {
      const cy = top + rowH * i + rowH / 2;
      const bw = Math.max(2, (r.value / max) * (x1 - x0));
      const fill = i < accentTop ? C.accent : C.bar;
      const valueText = display(r);
      return `<text x="${labelWidth}" y="${cy + 4}" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="${rowFont}" fill="${C.ink}">${esc(r.label)}</text>
<rect x="${x0}" y="${(cy - barH / 2).toFixed(1)}" width="${bw.toFixed(1)}" height="${barH.toFixed(1)}" rx="2" fill="${fill}"/>
<text x="${(x0 + bw + 8).toFixed(1)}" y="${cy + 4}" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="600" fill="${C.ink}">${esc(valueText)}</text>`;
    })
    .join("");

  const footer = note
    ? `<text x="${x0}" y="${H - 12}" font-family="Segoe UI, Arial, sans-serif" font-size="10.5" fill="${C.muted}">${esc(note)}</text>`
    : "";

  return frame(`${titleBlock(title, subtitle)}${bars}${footer}`);
}

/* ------------------------------------------------------------------ */
/* Repeat vs one-time donut                                            */
/* ------------------------------------------------------------------ */
function repeatChart() {
  const repeat = data.repeatVsOnetime.find((r) => r.customer_type === "Repeat");
  const oneTime = data.repeatVsOnetime.find((r) => r.customer_type === "One-time");
  const total = repeat.customers + oneTime.customers;
  const repeatShare = repeat.customers / total;
  const cx = 246;
  const cy = 188;
  const r = 98;
  const stroke = 46;
  const circ = 2 * Math.PI * r;
  const repeatLen = circ * repeatShare;

  const legendX = 430;
  return frame(`${titleBlock(
    "Repeat vs one-time customers",
    `${(repeatShare * 100).toFixed(1)}% of ordering customers are repeat buyers and they drive ${(data.extended.repeatRevenueShare * 100).toFixed(1)}% of revenue`
  )}
<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.amber}" stroke-width="${stroke}"/>
<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.accent}" stroke-width="${stroke}" stroke-dasharray="${repeatLen.toFixed(1)} ${circ.toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"/>
<text x="${cx}" y="${cy + 4}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="34" font-weight="700" fill="${C.ink}">${(repeatShare * 100).toFixed(1)}%</text>
<text x="${cx}" y="${cy + 28}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" fill="${C.muted}">repeat buyers</text>
<text x="${cx}" y="${cy + 44}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="10.5" fill="${C.muted}">${repeat.customers} of ${total} buyers</text>
<rect x="${legendX}" y="104" width="16" height="16" rx="3" fill="${C.accent}"/>
<text x="${legendX + 28}" y="117" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="600" fill="${C.ink}">Repeat · ${repeat.customers} customers</text>
<text x="${legendX + 28}" y="137" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" fill="${C.muted}">${(repeatShare * 100).toFixed(1)}% of customers · ${lakh(repeat.revenue, 2)} revenue (${((repeat.revenue / data.totals.revenue) * 100).toFixed(1)}%)</text>
<rect x="${legendX}" y="168" width="16" height="16" rx="3" fill="${C.amber}"/>
<text x="${legendX + 28}" y="181" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="600" fill="${C.ink}">One-time · ${oneTime.customers} customers</text>
<text x="${legendX + 28}" y="201" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" fill="${C.muted}">${((oneTime.customers / total) * 100).toFixed(1)}% of customers · ${lakh(oneTime.revenue, 2)} revenue (${((oneTime.revenue / data.totals.revenue) * 100).toFixed(1)}%)</text>
<text x="${legendX}" y="246" font-family="Segoe UI, Arial, sans-serif" font-size="10.5" fill="${C.muted}">${data.totals.customerRecords} customer records; ${data.totals.customerRecords - total} never ordered.</text>
<text x="${legendX}" y="264" font-family="Segoe UI, Arial, sans-serif" font-size="10.5" fill="${C.muted}">Repeat = more than one distinct order_id.</text>`);
}

/* ------------------------------------------------------------------ */
/* YoY growth bars                                                     */
/* ------------------------------------------------------------------ */
function yoyChart() {
  const rows = data.yoyGrowth;
  const left = 66;
  const right = 26;
  const top = 84;
  const bottom = 54;
  const plotW = W - left - right;
  const plotH = H - top - bottom;
  const minY = -20;
  const maxY = 32;
  const y = (pct) => top + plotH - ((pct - minY) / (maxY - minY)) * plotH;
  const slot = plotW / rows.length;
  const barW = Math.min(46, slot * 0.62);
  const zero = y(0);

  const grid = [-20, -10, 0, 10, 20, 30]
    .map(
      (p) =>
        `<line x1="${left}" y1="${y(p)}" x2="${W - right}" y2="${y(p)}" stroke="${p === 0 ? C.barSoft : C.grid}" stroke-width="${p === 0 ? 1.4 : 1}"/>
<text x="${left - 10}" y="${y(p) + 4}" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="10.5" fill="${C.muted}">${p}%</text>`
    )
    .join("");

  const bars = rows
    .map((r, i) => {
      const cx = left + slot * i + slot / 2;
      const value = r.yoy_change_pct;
      const yTop = value >= 0 ? y(value) : zero;
      const height = Math.abs(y(value) - zero);
      const fill = value >= 0 ? C.accent : C.red;
      const labelY = value >= 0 ? y(value) - 7 : y(value) + 14;
      return `<rect x="${(cx - barW / 2).toFixed(1)}" y="${yTop.toFixed(1)}" width="${barW.toFixed(1)}" height="${height.toFixed(1)}" rx="2" fill="${fill}"/>
<text x="${cx.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="9.5" font-weight="600" fill="${value >= 0 ? C.ink : C.red}">${value >= 0 ? "+" : ""}${value.toFixed(1)}%</text>
<text x="${cx.toFixed(1)}" y="${H - bottom + 18}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="10" fill="${C.muted}">${monthLabel(r.month_2025).slice(0, 3)}</text>`;
    })
    .join("");

  return frame(`${titleBlock(
    "Year-over-year growth by month",
    "2025 vs 2024 · overall +0.7% · Jan +29.1%, Jul -16.9% · synthetic sample data"
  )}
${grid}
${bars}
<text x="${W - right}" y="${H - 12}" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="10" fill="${C.muted}">YoY % = (2025 revenue - 2024 revenue) / 2024 revenue</text>`);
}

/* ------------------------------------------------------------------ */
/* Render                                                              */
/* ------------------------------------------------------------------ */
const charts = [
  { file: "chart_monthly_revenue", svg: monthlyChart() },
  {
    file: "chart_category_revenue",
    svg: hbarChart({
      title: "Revenue by category",
      subtitle: "Apparel leads at ₹24.9L (30.2% of ₹82.6L) · Electronics sells the most units",
      rows: data.categoryRevenue.map((r) => ({
        label: r.category,
        value: r.revenue,
        share: r.revenue / data.totals.revenue,
      })),
      display: (r) => `${lakh(r.value, 1)} · ${(r.share * 100).toFixed(1)}%`,
      labelWidth: 210,
      x0: 232,
      x1: 742,
      note: "Revenue = quantity × unit_price across 2,701 order lines.",
    }),
  },
  {
    file: "chart_region_revenue",
    svg: hbarChart({
      title: "Revenue and reach by region",
      subtitle: "North + West = ₹43.97L (53.2% of revenue) · 196 of 378 customers",
      rows: data.regionRevenue.map((r) => ({
        label: r.region,
        value: r.revenue,
        customers: r.unique_customers,
      })),
      display: (r) => `${lakh(r.value, 1)} · ${r.customers} customers`,
      labelWidth: 150,
      x0: 172,
      x1: 690,
      note: "Unique customers counts distinct buying customers per region.",
      rowFont: 13.5,
    }),
  },
  {
    file: "chart_top_products",
    svg: hbarChart({
      title: "Top 10 products by revenue",
      subtitle: "Running Shoes is #1 at ₹10.99L · the top 10 drive 78.4% of revenue",
      rows: data.topProducts.map((r) => ({
        label: r.product_name,
        value: r.revenue,
        units: r.units_sold,
      })),
      display: (r) => `${lakh(r.value, 2)} · ${r.units}u`,
      labelWidth: 218,
      x0: 240,
      x1: 760,
      note: "u = units sold. Product revenue is summed across all order lines.",
      rowFont: 11.5,
    }),
  },
  { file: "chart_repeat_mix", svg: repeatChart() },
  { file: "chart_yoy_growth", svg: yoyChart() },
];

mkdirSync(outDir, { recursive: true });
mkdirSync(srcDir, { recursive: true });

const svgFiles = [];
for (const chart of charts) {
  const svgPath = join(srcDir, `${chart.file}.svg`);
  writeFileSync(svgPath, chart.svg, "utf8");
  svgFiles.push({ ...chart, svgPath, pngPath: join(outDir, `${chart.file}.png`) });
}

if (!existsSync(EDGE)) {
  console.error(`FAIL — Microsoft Edge not found at ${EDGE}`);
  process.exit(1);
}

for (const chart of svgFiles) {
  execFileSync(
    EDGE,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-first-run",
      "--disable-extensions",
      `--user-data-dir=${profileDir}`,
      "--force-device-scale-factor=1",
      "--default-background-color=FFFFFFFF",
      "--window-size=1920,680",
      `--screenshot=${chart.pngPath}`,
      pathToFileURL(chart.svgPath).href,
    ],
    { stdio: "ignore", timeout: 120000 }
  );
  console.log(`OK  ${chart.file}.png`);
}

rmSync(profileDir, { recursive: true, force: true });
