/**
 * Generates the dashboard chart images.
 *
 * Charts are authored as SVG (no chart library) and rendered to PNG with
 * headless Edge, because ExcelJS has no native chart API. The workbook embeds
 * the PNGs; the KPI cells next to them stay live formulas.
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
  accent2: "#f59e0b",
  soft: "#f8fafc",
};

const data = computeAll(projectDir);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fmt = (n) => n.toLocaleString("en-US");
const shortSeason = (s) => {
  const [a, b] = String(s).split("/");
  return b ? `${a.slice(2)}/${b}` : a;
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
/* Vertical bars: runs per season                                      */
/* ------------------------------------------------------------------ */
function seasonRunsChart() {
  const rows = data.seasonSummary;
  const max = Math.max(...rows.map((r) => r.runs));
  const left = 64;
  const right = 24;
  const top = 78;
  const bottom = 48;
  const plotW = W - left - right;
  const plotH = H - top - bottom;
  const slot = plotW / rows.length;
  const barW = slot * 0.62;
  const y = (v) => top + plotH - (v / max) * plotH;

  const grid = [0, 0.25, 0.5, 0.75, 1]
    .map((f) => {
      const gy = y(max * f);
      return `<line x1="${left}" y1="${gy}" x2="${W - right}" y2="${gy}" stroke="${C.grid}" stroke-width="1"/>
<text x="${left - 10}" y="${gy + 4}" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="10.5" fill="${C.muted}">${f === 0 ? "0" : `${Math.round((max * f) / 1000)}k`}</text>`;
    })
    .join("");

  const peak = rows.reduce((best, r) => (r.runs > best.runs ? r : best), rows[0]);
  const bars = rows
    .map((r, i) => {
      const bx = left + slot * i + (slot - barW) / 2;
      const by = y(r.runs);
      const isPeak = r === peak;
      return `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${barW.toFixed(1)}" height="${(top + plotH - by).toFixed(1)}" rx="2" fill="${isPeak ? C.accent : C.bar}"/>
<text x="${(bx + barW / 2).toFixed(1)}" y="${H - bottom + 16}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="10" fill="${C.muted}">${shortSeason(r.season)}</text>`;
    })
    .join("");

  return frame(`${titleBlock(
    "Runs per IPL season",
    `2008-2026 | ${peak.season}: ${fmt(peak.runs)} runs, the highest season total in the dataset`
  )}
${grid}${bars}
<text x="${W - right}" y="${H - 12}" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="10" fill="${C.muted}">Source: cricsheet.org (ODC-By)</text>`);
}

/* ------------------------------------------------------------------ */
/* Horizontal bars: rankings                                           */
/* ------------------------------------------------------------------ */
function hbarChart({ title, subtitle, rows, display, accentTop = 1, note }) {
  const labelW = 236;
  const x0 = 252;
  const x1 = 800;
  const top = 74;
  const bottom = 34;
  const rowH = (H - top - bottom) / rows.length;
  const barH = Math.min(16, rowH * 0.62);
  const max = Math.max(...rows.map((r) => r.value));

  const bars = rows
    .map((r, i) => {
      const cy = top + rowH * i + rowH / 2;
      const bw = Math.max(2, (r.value / max) * (x1 - x0));
      const fill = i < accentTop ? C.accent : C.bar;
      return `<text x="${labelW}" y="${cy + 4}" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="12.5" fill="${C.ink}">${esc(r.label)}</text>
<rect x="${x0}" y="${(cy - barH / 2).toFixed(1)}" width="${bw.toFixed(1)}" height="${barH.toFixed(1)}" rx="2" fill="${fill}"/>
<text x="${(x0 + bw + 8).toFixed(1)}" y="${cy + 4}" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="600" fill="${C.ink}">${esc(display(r))}</text>`;
    })
    .join("");

  const guide = note
    ? `<text x="${x0}" y="${H - 12}" font-family="Segoe UI, Arial, sans-serif" font-size="10.5" fill="${C.muted}">${esc(note)}</text>`
    : "";

  return frame(`${titleBlock(title, subtitle)}${bars}${guide}`);
}

/* ------------------------------------------------------------------ */
/* Toss impact: two bars vs 50% line                                   */
/* ------------------------------------------------------------------ */
function tossChart() {
  const bat = data.tossImpact.find((r) => r.toss_decision === "bat");
  const field = data.tossImpact.find((r) => r.toss_decision === "field");
  const rows = [
    { label: "Chose to bat", pct: bat.toss_winner_win_pct, wins: bat.toss_winner_won, n: bat.matches },
    { label: "Chose to field", pct: field.toss_winner_win_pct, wins: field.toss_winner_won, n: field.matches },
  ];
  const top = 92;
  const bottom = 62;
  const plotH = H - top - bottom;
  const gap = 54;
  const barW = 190;
  const x0 = 212;
  const yFor = (pct) => top + plotH - (pct / 100) * plotH;
  const y50 = yFor(50);

  const bars = rows
    .map((r, i) => {
      const x = x0 + i * (barW + gap);
      const yTop = yFor(r.pct);
      return `<rect x="${x}" y="${yTop.toFixed(1)}" width="${barW}" height="${(top + plotH - yTop).toFixed(1)}" rx="4" fill="${i === 1 ? C.accent : C.bar}"/>
<text x="${x + barW / 2}" y="${(yTop - 20).toFixed(1)}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="26" font-weight="700" fill="${C.ink}">${r.pct.toFixed(1)}%</text>
<text x="${x + barW / 2}" y="${H - bottom + 18}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="600" fill="${C.ink}">${r.label}</text>
<text x="${x + barW / 2}" y="${H - bottom + 35}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="11" fill="${C.muted}">${fmt(r.wins)} of ${fmt(r.n)} decided</text>`;
    })
    .join("");

  const yLabels = [0, 25, 50, 75, 100]
    .map((p) => {
      const gy = yFor(p);
      return `<line x1="${x0 - 14}" y1="${gy}" x2="${W - 28}" y2="${gy}" stroke="${C.grid}" stroke-width="1"/>
<text x="${x0 - 22}" y="${gy + 4}" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="10.5" fill="${C.muted}">${p}%</text>`;
    })
    .join("");

  return frame(`${titleBlock("Toss winner win rate by decision", "Share of decided matches won by the team that won the toss (1,218 matches)")}
${yLabels}
<line x1="${x0 - 14}" y1="${y50}" x2="${W - 28}" y2="${y50}" stroke="${C.accent2}" stroke-width="1.5" stroke-dasharray="5 4"/>
${bars}
<text x="${W - 28}" y="${y50 - 7}" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="10.5" fill="${C.accent2}">50% break-even</text>`);
}

/* ------------------------------------------------------------------ */
/* Chase success rate: line chart                                      */
/* ------------------------------------------------------------------ */
function chaseChart() {
  const rows = data.chaseDefend.map((r) => ({
    season: r.season,
    pct: r.chased + r.defended ? (r.chased * 100) / (r.chased + r.defended) : 0,
    chased: r.chased,
    decided: r.chased + r.defended,
  }));
  const left = 64;
  const right = 28;
  const top = 84;
  const bottom = 52;
  const plotW = W - left - right;
  const plotH = H - top - bottom;
  const minY = 25;
  const maxY = 75;
  const x = (i) => left + (plotW * i) / (rows.length - 1);
  const y = (pct) => top + plotH - ((pct - minY) / (maxY - minY)) * plotH;

  const grid = [25, 40, 50, 60, 75]
    .map(
      (p) =>
        `<line x1="${left}" y1="${y(p)}" x2="${W - right}" y2="${y(p)}" stroke="${p === 50 ? C.accent2 : C.grid}" stroke-width="${p === 50 ? 1.4 : 1}" ${p === 50 ? 'stroke-dasharray="5 4"' : ""}/>
<text x="${left - 10}" y="${y(p) + 4}" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="10.5" fill="${C.muted}">${p}%</text>`
    )
    .join("");

  const points = rows.map((r, i) => `${x(i).toFixed(1)},${y(r.pct).toFixed(1)}`).join(" ");
  const area = `${left},${top + plotH} ${points} ${W - right},${top + plotH}`;

  const dots = rows
    .map(
      (r, i) =>
        `<circle cx="${x(i).toFixed(1)}" cy="${y(r.pct).toFixed(1)}" r="3.4" fill="${i === rows.length - 1 ? C.accent : "#ffffff"}" stroke="${C.accent}" stroke-width="1.6"/>`
    )
    .join("");

  const labels = rows
    .map(
      (r, i) =>
        `<text x="${x(i).toFixed(1)}" y="${H - bottom + 18}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="9.5" fill="${C.muted}">${shortSeason(r.season)}</text>`
    )
    .join("");

  const last = rows[rows.length - 1];
  return frame(`${titleBlock("Chase success rate by season", `Chases won as a share of decided matches | ${last.season}: ${last.chased} chases in ${last.decided} decided games`)}
${grid}
<polygon points="${area}" fill="${C.accent}" opacity="0.10"/>
<polyline points="${points}" fill="none" stroke="${C.accent}" stroke-width="2.4" stroke-linejoin="round"/>
${dots}
<text x="${x(rows.length - 1) - 6}" y="${y(last.pct) - 12}" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="700" fill="${C.ink}">${last.pct.toFixed(0)}%</text>
${labels}
<text x="${W - right}" y="${H - 12}" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="10" fill="${C.muted}">50% = chasing and defending win equally often</text>`);
}

/* ------------------------------------------------------------------ */
/* Render                                                              */
/* ------------------------------------------------------------------ */
const charts = [
  { file: "chart_season_runs", svg: seasonRunsChart() },
  {
    file: "chart_top_batters",
    svg: hbarChart({
      title: "Top 10 run scorers (all time)",
      subtitle: "Minimum 500 balls faced | strike rate shown in brackets",
      rows: data.topRunScorers.slice(0, 10).map((r) => ({ label: r.batter, value: r.runs })),
      display: (r) => {
        const row = data.topRunScorers.find((b) => b.batter === r.label);
        return `${fmt(r.value)} (SR ${row.strike_rate.toFixed(1)})`;
      },
      accentTop: 1,
      note: "V Kohli: 9,336 runs in 275 innings — the only batter above 8,000.",
    }),
  },
  {
    file: "chart_top_wickets",
    svg: hbarChart({
      title: "Top 10 wicket takers (all time)",
      subtitle: "Bowler-credited dismissals only | minimum 40 wickets",
      rows: data.topWicketTakers.slice(0, 10).map((r) => ({ label: r.bowler, value: r.wickets })),
      display: (r) => `${r.value}`,
      accentTop: 1,
      note: "YS Chahal: 233 wickets — the only bowler above 230 in the dataset.",
    }),
  },
  {
    file: "chart_team_wins",
    svg: hbarChart({
      title: "Most wins by team (all time)",
      subtitle: "Decided matches only | franchise names exactly as in the source",
      rows: data.teamWins.slice(0, 10).map((r) => ({ label: r.team, value: r.wins })),
      display: (r) => `${r.value}`,
      accentTop: 1,
      note: "Renamed franchises are counted under the name used at the time.",
    }),
  },
  { file: "chart_toss", svg: tossChart() },
  { file: "chart_chase", svg: chaseChart() },
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
