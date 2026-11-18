/**
 * Builds IPL-Analytics-Workbook.xlsx from the verified project data.
 *
 * Layout: Dashboard (% KPIs first) -> KPI Summary -> the 12 SQL analyses ->
 * pivot-ready data sheets (Team Season, Batting, Bowling, Wicket Types) ->
 * the full 1,243-match table -> How To Use.
 *
 * Run with: npm run build
 */
import ExcelJS from "exceljs";
import { existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readCsvObjects } from "./lib/csv.mjs";
import { computeAll } from "./lib/compute.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const projectDir = join(here, "..");
const outPath = join(projectDir, "IPL-Analytics-Workbook.xlsx");
const assets = join(here, "assets");

const data = computeAll(projectDir);
const r = (name) => readCsvObjects(join(projectDir, "results", `${name}.csv`));

const results = {
  seasonMatches: r("season_matches"),
  seasonRuns: r("season_runs"),
  topRunScorers: r("top_run_scorers"),
  topWicketTakers: r("top_wicket_takers"),
  bestEconomy: r("best_economy"),
  tossImpact: r("toss_impact"),
  chaseDefend: r("chase_defend_by_season"),
  venueAverages: r("venue_avg_first_innings"),
  teamWins: r("team_wins"),
  headToHead: r("head_to_head"),
  highestTotals: r("highest_team_totals"),
};

const num = (v) => Number(v);
const f = (formula, result) => (result === undefined ? { formula } : { formula, result });
const pct = (n, d) => (d === 0 ? 0 : n / d);
const FONT = "Segoe UI";

const batToss = results.tossImpact.find((x) => x.toss_decision === "bat");
const fieldToss = results.tossImpact.find((x) => x.toss_decision === "field");

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
workbook.title = "IPL Cricket Analytics Workbook";
workbook.subject = "Real ball-by-ball IPL data (cricsheet.org, ODC-By) - 1,243 matches, 295,732 deliveries";
workbook.description =
  "Excel / Google Sheets workbook for the IPL Cricket Analytics project. Percentages are live formulas; data aggregates are cross-checked against the 12 SQL result files.";
workbook.keywords = "IPL, cricket, analytics, SQL, Excel, Google Sheets, pivot";
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
    oddFooter: `&LIPL Analytics&CPage &P of &N&RSource: cricsheet.org (ODC-By)`,
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
dashTitle.value = "IPL CRICKET ANALYTICS";
dashTitle.font = { name: FONT, size: 28, bold: true, color: { argb: COLORS.ink } };
dashTitle.alignment = { vertical: "middle" };
dash.getRow(1).height = 44;

dash.mergeCells("A2:D2");
const dashSub = dash.getCell("A2");
dashSub.value =
  "Real ball-by-ball data from cricsheet.org (ODC-By) · 1,243 matches · 295,732 deliveries · 19 seasons (2008-2026)";
dashSub.font = { name: FONT, size: 11, color: { argb: COLORS.muted } };
dash.getRow(2).height = 22;

dash.mergeCells("A3:D3");
const dashNote = dash.getCell("A3");
dashNote.value =
  "Percentages on this page are live formulas over the sheets in this workbook. Charts are static images built from the same verified data.";
dashNote.font = { name: FONT, size: 9.5, italic: true, color: { argb: COLORS.muted } };
dash.getRow(3).height = 18;

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
    label: "Toss winner win rate",
    formula: "('Toss Impact'!C5+'Toss Impact'!C6)/('Toss Impact'!B5+'Toss Impact'!B6)",
    result: (num(results.tossImpact[0].toss_winner_won) + num(results.tossImpact[1].toss_winner_won)) / data.totals.decidedMatches,
    basis: `${data.totals.decidedMatches.toLocaleString("en-US")} decided matches; toss winners also won the match 51.6% of the time`,
  },
  {
    label: "Field first after winning the toss",
    formula: `'Toss Impact'!D${5 + results.tossImpact.findIndex((x) => x.toss_decision === "field")}`,
    result: pct(num(fieldToss.toss_winner_won), num(fieldToss.matches)),
    basis: `${fieldToss.toss_winner_won} of ${fieldToss.matches} decided matches — the single strongest toss signal in the data`,
  },
  {
    label: "Bat first after winning the toss",
    formula: `'Toss Impact'!D${5 + results.tossImpact.findIndex((x) => x.toss_decision === "bat")}`,
    result: pct(num(batToss.toss_winner_won), num(batToss.matches)),
    basis: `${batToss.toss_winner_won} of ${batToss.matches} decided matches — fielding first has been the better toss call`,
  },
  {
    label: "Chasing win rate",
    formula: "SUM('Chase vs Defend'!C5:C23)/SUM('Chase vs Defend'!F5:F23)",
    result: pct(results.chaseDefend.reduce((s, x) => s + num(x.chased), 0), data.totals.decidedMatches),
    basis: "660 of 1,218 decided matches were won by the team batting second",
  },
  {
    label: "Defending win rate",
    formula: "SUM('Chase vs Defend'!B5:B23)/SUM('Chase vs Defend'!F5:F23)",
    result: pct(results.chaseDefend.reduce((s, x) => s + num(x.defended), 0), data.totals.decidedMatches),
    basis: "558 of 1,218 decided matches were won by the team batting first",
  },
  {
    label: "Dot ball rate",
    formula: "'KPI Summary'!B21",
    result: data.extended.dotRate,
    basis: `${data.totals.dotBalls.toLocaleString("en-US")} of ${data.totals.legalBalls.toLocaleString("en-US")} legal balls produced no run`,
  },
  {
    label: "Boundary runs share",
    formula: "'KPI Summary'!B17",
    result: data.extended.boundaryShare,
    basis: `${data.extended.boundaryRuns.toLocaleString("en-US")} of ${data.totals.totalRuns.toLocaleString("en-US")} runs came in fours and sixes`,
  },
  {
    label: "Extras share of runs",
    formula: "'KPI Summary'!B19",
    result: data.extended.extrasShare,
    basis: `${data.totals.extrasRuns.toLocaleString("en-US")} of ${data.totals.totalRuns.toLocaleString("en-US")} runs were extras`,
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
  value.numFmt = "0.0%";
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
  { label: "Matches", value: f("'KPI Summary'!B6", data.totals.matches), fmt: "#,##0", unit: "matches", note: "Every IPL match in the source, 2008-2026" },
  { label: "Runs", value: f("'KPI Summary'!B7", data.totals.totalRuns), fmt: "#,##0", unit: "runs", note: "Bat runs + extras, innings 1-2" },
  { label: "Dismissals recorded", value: f("'KPI Summary'!B8", data.totals.wickets), fmt: "#,##0", unit: "wickets", note: "All wicket_type values, including run-outs and retirements" },
  { label: "Legal balls", value: f("'KPI Summary'!B9", data.totals.legalBalls), fmt: "#,##0", unit: "balls", note: "wides = 0 AND noballs = 0" },
  { label: "Runs per over", value: f("'KPI Summary'!B10", data.totals.runsPerOver), fmt: "0.00", unit: "runs/over", note: "Runs / (legal balls / 6)" },
  { label: "Balls scoring 4", value: f("'KPI Summary'!B11", data.totals.fours), fmt: "#,##0", unit: "balls", note: "34,420 fours across 19 seasons" },
  { label: "Balls scoring 6", value: f("'KPI Summary'!B12", data.totals.sixes), fmt: "#,##0", unit: "balls", note: "15,763 sixes — 12.7 per match on average" },
  { label: "Seasons", value: f("COUNTA('Season Summary'!A5:A23)", data.totals.seasonCount), fmt: "#,##0", unit: "seasons", note: "2008 to 2026 (source labels: 2007/08, 2009/10, 2020/21)" },
  { label: "Venues", value: 41, fmt: "#,##0", unit: "venues", note: "Distinct venue names in the source data" },
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

dashSection(28, "MOST WINS — ALL TIME (top 8 franchises)");
dashHeader(29, ["Team", "Wins", "Played", "Win %"], ["left", "right", "right", "right"]);
results.teamWins.slice(0, 8).forEach((team, i) => {
  const rn = 30 + i;
  const name = dash.getCell(rn, 1);
  name.value = f(`'Team Wins'!A${5 + i}`, team.team);
  name.font = { name: FONT, size: 10.5, color: { argb: COLORS.ink } };
  name.alignment = { vertical: "middle" };
  name.border = { bottom: thinBorder };

  const wins = dash.getCell(rn, 2);
  wins.value = f(`'Team Wins'!B${5 + i}`, num(team.wins));
  wins.numFmt = "#,##0";
  wins.font = { name: FONT, size: 10.5, bold: true, color: { argb: COLORS.ink } };
  wins.alignment = { vertical: "middle", horizontal: "right" };
  wins.border = { bottom: thinBorder };

  const played = dash.getCell(rn, 3);
  played.value = f(`'Team Wins'!D${5 + i}`);
  played.numFmt = "#,##0";
  played.font = { name: FONT, size: 10.5, color: { argb: COLORS.ink } };
  played.alignment = { vertical: "middle", horizontal: "right" };
  played.border = { bottom: thinBorder };

  const winPct = dash.getCell(rn, 4);
  winPct.value = f(`'Team Wins'!E${5 + i}`);
  winPct.numFmt = "0.0%";
  winPct.font = { name: FONT, size: 10.5, color: { argb: COLORS.accentDark } };
  winPct.alignment = { vertical: "middle", horizontal: "right" };
  winPct.border = { bottom: thinBorder };
  dash.getRow(rn).height = 20;
});
dash.mergeCells("A38:D38");
const teamNote = dash.getCell("A38");
teamNote.value = "Played counts every match a team appeared in (including ties / no-results); wins count decided matches only.";
teamNote.font = { name: FONT, size: 9, italic: true, color: { argb: COLORS.muted } };
dash.getRow(38).height = 16;

dashSection(40, "HEADLINE FINDINGS (every number is verifiable in the sheets)");
const findings = [
  "Most runs: V Kohli — 9,336 in 275 innings (SR 134.8), ahead of RG Sharma (7,329) and S Dhawan (6,769).",
  "Most wickets: YS Chahal — 233, ahead of B Kumar (226) and SP Narine (207). Bowler-credited dismissals only.",
  "Toss: teams fielded 810 times vs batted 408; toss winners who fielded won 54.7% of decided matches.",
  "Biggest total: Sunrisers Hyderabad 287/3 vs Royal Challengers Bengaluru (2024) — SRH owns the top four totals.",
  "2026: 45 successful chases in 72 decided matches — the highest chase count of any IPL season.",
];
findings.forEach((text, i) => {
  const rn = 41 + i;
  dash.mergeCells(rn, 1, rn, 4);
  const c = dash.getCell(rn, 1);
  c.value = text;
  c.font = { name: FONT, size: 10, color: { argb: COLORS.ink } };
  c.alignment = { vertical: "middle", indent: 1 };
  c.border = { bottom: thinBorder };
  dash.getRow(rn).height = 20;
});

dashSection(47, "CHARTS — generated from the same verified data (static images)");

const chartFiles = [
  "chart_season_runs.png",
  "chart_top_batters.png",
  "chart_top_wickets.png",
  "chart_team_wins.png",
  "chart_toss.png",
  "chart_chase.png",
];
for (const file of chartFiles) {
  if (!existsSync(join(assets, file))) {
    throw new Error(`Missing chart ${file}. Run "npm run charts" first.`);
  }
}
const imageIds = chartFiles.map((file) =>
  workbook.addImage({ filename: join(assets, file), extension: "png" })
);
const chartRows = [47, 65, 83];
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
  "Q1 headline totals plus extended percentage metrics. Values come from data/deliveries.csv with the same definitions as sql/02_analysis_queries.sql.";
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
  { label: "Matches", value: data.totals.matches, fmt: "#,##0", unit: "matches", note: "COUNT(*) from the matches table" },
  { label: "Total runs", value: data.totals.totalRuns, fmt: "#,##0", unit: "runs", note: "SUM(runs_off_bat + extras), innings 1-2" },
  { label: "Dismissals recorded", value: data.totals.wickets, fmt: "#,##0", unit: "wickets", note: "Every row with a non-empty wicket_type" },
  { label: "Legal balls", value: data.totals.legalBalls, fmt: "#,##0", unit: "balls", note: "wides = 0 AND noballs = 0" },
  { label: "Runs per over", value: f("B7*6/B9", data.totals.runsPerOver), fmt: "0.00", unit: "runs/over", note: "Total runs / (legal balls / 6)" },
  { label: "Balls scoring 4", value: data.totals.fours, fmt: "#,##0", unit: "balls", note: "runs_off_bat = 4" },
  { label: "Balls scoring 6", value: data.totals.sixes, fmt: "#,##0", unit: "balls", note: "runs_off_bat = 6" },
]);

kpiSection(14, "B. EXTENDED METRICS — PERCENTAGES");
["Metric", "Value", "Unit", "Definition"].forEach((h, i) => {
  const c = kpi.getCell(15, i + 1);
  c.value = h;
  c.font = { name: FONT, size: 10.5, bold: true, color: { argb: COLORS.white } };
  c.fill = solid(COLORS.header);
  c.alignment = { vertical: "middle", horizontal: i === 0 ? "left" : i === 1 ? "right" : "left" };
});
kpi.getRow(15).height = 26;
kpiRows(16, [
  { label: "Boundary runs", value: f("B11*4+B12*6", data.extended.boundaryRuns), fmt: "#,##0", unit: "runs", note: "4 × fours + 6 × sixes" },
  { label: "Boundary runs share", value: f("B16/B7", data.extended.boundaryShare), fmt: "0.0%", unit: "% of runs", note: "Boundary runs / total runs" },
  { label: "Extras", value: data.totals.extrasRuns, fmt: "#,##0", unit: "runs", note: "Wides + no-balls + byes + leg-byes + penalties" },
  { label: "Extras share", value: f("B18/B7", data.extended.extrasShare), fmt: "0.0%", unit: "% of runs", note: "Extras / total runs" },
  { label: "Dot balls", value: data.totals.dotBalls, fmt: "#,##0", unit: "balls", note: "Legal ball, no runs off bat, no byes/leg-byes" },
  { label: "Dot ball rate", value: f("B20/B9", data.extended.dotRate), fmt: "0.0%", unit: "% of legal balls", note: "Dot balls / legal balls" },
  { label: "Caught dismissals", value: data.extended.caughtCount, fmt: "#,##0", unit: "wickets", note: "Largest single dismissal type" },
  { label: "Caught share", value: f("B22/B8", data.extended.caughtShare), fmt: "0.0%", unit: "% of dismissals", note: "Caught / all recorded dismissals" },
]);

kpiSection(25, "C. DEFINITIONS");
const definitions = [
  "Legal ball = wides = 0 AND noballs = 0. Super overs (innings > 2) are excluded from every aggregate in this workbook.",
  "Bowler-credited wickets = bowled, caught, lbw, stumped, caught and bowled, hit wicket. Run-outs, retirements and obstruction are not credited to the bowler.",
  "Batter balls faced counts deliveries with wides = 0; no-balls are included, matching Q4. Strike rate = runs off bat / balls faced × 100.",
  "Economy runs = runs off bat + wides + no-balls. Economy = economy runs / legal balls × 6. Minimum 30 overs for the Best Economy sheet.",
  "Dismissals recorded (14,674) is larger than bowler wickets (13,460) because it also counts run-outs, retirements and obstruction.",
  "Franchise names are kept exactly as in the source: renamed franchises (Deccan Chargers / Sunrisers, Delhi Daredevils / Delhi Capitals, Kings XI Punjab / Punjab Kings, RCB / Royal Challengers Bengaluru) appear separately.",
];
definitions.forEach((text, i) => {
  const rn = 26 + i;
  kpi.mergeCells(rn, 1, rn, 4);
  const c = kpi.getCell(rn, 1);
  c.value = `•  ${text}`;
  c.font = { name: FONT, size: 9.5, color: { argb: COLORS.ink } };
  c.alignment = { vertical: "top", wrapText: true, indent: 1 };
  kpi.getRow(rn).height = Math.max(18, Math.ceil(text.length / 105) * 14 + 4);
});

kpi.mergeCells("A33:D33");
kpi.getCell("A33").value =
  "Source: cricsheet.org IPL ball-by-ball data (ODC-By). Cross-checked against results/kpi_summary.csv and the 12 SQL result files.";
kpi.getCell("A33").font = { name: FONT, size: 9, italic: true, color: { argb: COLORS.muted } };

/* ------------------------------------------------------------------------- */
/* 3. Season Summary (Q2 + Q3)                                               */
/* ------------------------------------------------------------------------- */
const seasonRows = results.seasonMatches.map((m) => {
  const runs = results.seasonRuns.find((x) => x.season === m.season);
  return [m.season, num(m.matches), num(m.venues), num(m.cities), num(runs.runs), num(runs.wickets)];
});
const seasonSheet = workbook.addWorksheet("Season Summary", {
  properties: { tabColor: { argb: "FF475569" } },
  views: [{ showGridLines: false }],
});
writeTable(seasonSheet, {
  title: "Season Summary — matches, venues, runs and wickets",
  subtitle:
    "Q2 + Q3 · results/season_matches.csv + results/season_runs.csv · 19 seasons · percentages and per-match rates are live formulas",
  headers: ["Season", "Matches", "Venues", "Cities", "Runs", "Wickets", "Runs per Match", "Share of Runs", "Share of Wickets"],
  rows: seasonRows.map((row, i) => {
    const rn = 5 + i;
    return [
      row[0],
      row[1],
      row[2],
      row[3],
      row[4],
      row[5],
      f(`E${rn}/B${rn}`),
      f(`E${rn}/$E$24`),
      f(`F${rn}/$F$24`),
    ];
  }),
  widths: [12, 10, 9, 9, 11, 10, 13, 12, 13],
  formats: ["@", "#,##0", "#,##0", "#,##0", "#,##0", "#,##0", "0.0", "0.0%", "0.0%"],
  aligns: ["left", "right", "right", "right", "right", "right", "right", "right", "right"],
  totalRow: [
    "TOTAL",
    f("SUM(B5:B23)"),
    "—",
    "—",
    f("SUM(E5:E23)"),
    f("SUM(F5:F23)"),
    f("E24/B24"),
    f("SUM(H5:H23)"),
    f("SUM(I5:I23)"),
  ],
  note:
    "Venues and cities are distinct counts per season. Runs and wickets cover innings 1-2 only. The TOTAL row uses SUM formulas; pivot ranges should exclude it.",
});
addDataBar(seasonSheet, "E5:E23");

/* ------------------------------------------------------------------------- */
/* 4. Top Run Scorers (Q4)                                                   */
/* ------------------------------------------------------------------------- */
const runsSheet = workbook.addWorksheet("Top Run Scorers", {
  properties: { tabColor: { argb: "FF475569" } },
  views: [{ showGridLines: false }],
});
const runsCount = results.topRunScorers.length;
writeTable(runsSheet, {
  title: "Top Run Scorers — all time",
  subtitle: `Q4 · results/top_run_scorers.csv · ${runsCount} batters · minimum 500 balls faced · strike rate and per-innings rates are live formulas`,
  headers: ["Batter", "Innings", "Balls Faced", "Runs", "Strike Rate", "Runs per Innings", "Balls per Innings", "Share of Top-15 Runs"],
  rows: results.topRunScorers.map((row, i) => {
    const rn = 5 + i;
    return [
      row.batter,
      num(row.innings),
      num(row.balls_faced),
      num(row.runs),
      f(`IF(C${rn}=0,0,D${rn}/C${rn}*100)`),
      f(`D${rn}/B${rn}`),
      f(`C${rn}/B${rn}`),
      f(`D${rn}/$D$${runsCount + 5}`),
    ];
  }),
  widths: [22, 10, 12, 10, 11, 13, 13, 15],
  formats: ["@", "#,##0", "#,##0", "#,##0", "0.00", "0.0", "0.0", "0.0%"],
  aligns: ["left", "right", "right", "right", "right", "right", "right", "right"],
  totalRow: [
    "TOTAL (15 players)",
    "—",
    f(`SUM(C5:C${runsCount + 4})`),
    f(`SUM(D5:D${runsCount + 4})`),
    f(`D${runsCount + 5}/C${runsCount + 5}*100`),
    "—",
    "—",
    f(`SUM(H5:H${runsCount + 4})`),
  ],
  note:
    "Balls faced counts deliveries with wides = 0 (no-balls included), exactly as Q4. Innings = distinct matches in which the batter faced at least one delivery.",
});
addDataBar(runsSheet, "D5:D19");

/* ------------------------------------------------------------------------- */
/* 5. Top Wicket Takers (Q5)                                                 */
/* ------------------------------------------------------------------------- */
const wicketsSheet = workbook.addWorksheet("Top Wicket Takers", {
  properties: { tabColor: { argb: "FF475569" } },
  views: [{ showGridLines: false }],
});
const wicketsCount = results.topWicketTakers.length;
writeTable(wicketsSheet, {
  title: "Top Wicket Takers — all time",
  subtitle: `Q5 · results/top_wicket_takers.csv · ${wicketsCount} bowlers · minimum 40 bowler-credited wickets`,
  headers: ["Bowler", "Matches", "Wickets", "Wickets per Match", "Share of Top-15 Wickets"],
  rows: results.topWicketTakers.map((row, i) => {
    const rn = 5 + i;
    return [row.bowler, num(row.matches), num(row.wickets), f(`C${rn}/B${rn}`), f(`C${rn}/$C$${wicketsCount + 5}`)];
  }),
  widths: [22, 11, 11, 16, 18],
  formats: ["@", "#,##0", "#,##0", "0.00", "0.0%"],
  aligns: ["left", "right", "right", "right", "right"],
  totalRow: [
    "TOTAL (15 bowlers)",
    "—",
    f(`SUM(C5:C${wicketsCount + 4})`),
    "—",
    f(`SUM(E5:E${wicketsCount + 4})`),
  ],
  note:
    "Bowler-credited dismissals only: bowled, caught, lbw, stumped, caught and bowled, hit wicket. Run-outs and retirements are excluded.",
});
addDataBar(wicketsSheet, "C5:C19");

/* ------------------------------------------------------------------------- */
/* 6. Best Economy (Q6)                                                      */
/* ------------------------------------------------------------------------- */
const economySheet = workbook.addWorksheet("Best Economy", {
  properties: { tabColor: { argb: "FF475569" } },
  views: [{ showGridLines: false }],
});
const economyCount = results.bestEconomy.length;
writeTable(economySheet, {
  title: "Best Economy — lowest runs conceded per over",
  subtitle: `Q6 · results/best_economy.csv · ${economyCount} bowlers · minimum 30 overs · economy is recomputed from exact legal balls`,
  headers: ["Bowler", "Legal Balls", "Overs", "Runs Conceded", "Economy", "Matches", "Wickets", "Wickets per Match"],
  rows: data.bestEconomy.map((row, i) => {
    const rn = 5 + i;
    return [
      row.bowler,
      row.legal_balls,
      f(`B${rn}/6`),
      row.runs_conceded,
      f(`D${rn}*6/B${rn}`),
      row.matches,
      row.wickets,
      f(`G${rn}/F${rn}`),
    ];
  }),
  widths: [22, 11, 9, 14, 10, 10, 10, 15],
  formats: ["@", "#,##0", "0.0", "#,##0", "0.00", "#,##0", "#,##0", "0.00"],
  aligns: ["left", "right", "right", "right", "right", "right", "right", "right"],
  totalRow: [
    "TOTAL (15 bowlers)",
    f(`SUM(B5:B${economyCount + 4})`),
    f(`B${economyCount + 5}/6`),
    f(`SUM(D5:D${economyCount + 4})`),
    f(`D${economyCount + 5}*6/B${economyCount + 5}`),
    "—",
    f(`SUM(G5:G${economyCount + 4})`),
    "—",
  ],
  note:
    "Economy runs = runs off bat + wides + no-balls. Small samples dominate this list: A Chandila (39 overs) tops it, while A Kumble (6.58 over 160 overs) is the best high-workload bowler. Overs are displayed to one decimal; economy uses exact legal balls.",
});
addDataBar(economySheet, "E5:E19", "FFB45309");

/* ------------------------------------------------------------------------- */
/* 7. Toss Impact (Q7)                                                       */
/* ------------------------------------------------------------------------- */
const tossSheet = workbook.addWorksheet("Toss Impact", {
  properties: { tabColor: { argb: "FF475569" } },
  views: [{ showGridLines: false }],
});
writeTable(tossSheet, {
  title: "Toss Impact — does winning the toss help?",
  subtitle: "Q7 · results/toss_impact.csv · decided matches only (win by runs / win by wickets)",
  headers: ["Toss Decision", "Matches", "Toss Winner Won", "Win %", "Share of Decided Matches"],
  rows: results.tossImpact.map((row, i) => {
    const rn = 5 + i;
    return [row.toss_decision, num(row.matches), num(row.toss_winner_won), f(`C${rn}/B${rn}`), f(`B${rn}/$B$7`)];
  }),
  widths: [16, 11, 16, 11, 20],
  formats: ["@", "#,##0", "#,##0", "0.0%", "0.0%"],
  aligns: ["left", "right", "right", "right", "right"],
  totalRow: ["TOTAL", f("SUM(B5:B6)"), f("SUM(C5:C6)"), f("C7/B7"), f("SUM(E5:E6)")],
  note:
    "Decided matches only: ties and no-results are excluded. 'bat' = toss winner chose to bat first; 'field' = chose to field first.",
});
addDataBar(tossSheet, "D5:D6");

/* ------------------------------------------------------------------------- */
/* 8. Chase vs Defend (Q8)                                                   */
/* ------------------------------------------------------------------------- */
const chaseSheet = workbook.addWorksheet("Chase vs Defend", {
  properties: { tabColor: { argb: "FF475569" } },
  views: [{ showGridLines: false }],
});
const chaseCount = results.chaseDefend.length;
writeTable(chaseSheet, {
  title: "Chase vs Defend — by season",
  subtitle: `Q8 · results/chase_defend_by_season.csv · ${chaseCount} seasons · chased % and defended % are live formulas`,
  headers: ["Season", "Defended", "Chased", "Ties", "No Result", "Decided", "Chased %", "Defended %"],
  rows: results.chaseDefend.map((row, i) => {
    const rn = 5 + i;
    return [
      row.season,
      num(row.defended),
      num(row.chased),
      num(row.ties),
      num(row.no_result),
      f(`B${rn}+C${rn}`),
      f(`IF(F${rn}=0,0,C${rn}/F${rn})`),
      f(`IF(F${rn}=0,0,B${rn}/F${rn})`),
    ];
  }),
  widths: [12, 11, 10, 8, 10, 10, 11, 12],
  formats: ["@", "#,##0", "#,##0", "#,##0", "#,##0", "#,##0", "0.0%", "0.0%"],
  aligns: ["left", "right", "right", "right", "right", "right", "right", "right"],
  totalRow: [
    "TOTAL",
    f(`SUM(B5:B${chaseCount + 4})`),
    f(`SUM(C5:C${chaseCount + 4})`),
    f(`SUM(D5:D${chaseCount + 4})`),
    f(`SUM(E5:E${chaseCount + 4})`),
    f(`SUM(F5:F${chaseCount + 4})`),
    f(`C${chaseCount + 5}/F${chaseCount + 5}`),
    f(`B${chaseCount + 5}/F${chaseCount + 5}`),
  ],
  note:
    "Defended = wins by runs (team batting first). Chased = wins by wickets (team batting second). 2026 had 45 chases in 72 decided matches — the highest chase count of any season.",
});
addDataBar(chaseSheet, "G5:G23");

/* ------------------------------------------------------------------------- */
/* 9. Venue Averages (Q9)                                                    */
/* ------------------------------------------------------------------------- */
const venueSheet = workbook.addWorksheet("Venue Averages", {
  properties: { tabColor: { argb: "FF475569" } },
  views: [{ showGridLines: false }],
});
const venueCount = results.venueAverages.length;
writeTable(venueSheet, {
  title: "Venue Averages — first-innings totals",
  subtitle: `Q9 · results/venue_avg_first_innings.csv · top ${venueCount} venues by match count · average first-innings total`,
  headers: ["Venue", "Matches", "Avg First-Innings Total", "Share of Top-12 Venue Matches"],
  rows: results.venueAverages.map((row, i) => {
    const rn = 5 + i;
    return [row.venue, num(row.matches), num(row.avg_first_innings_total), f(`B${rn}/$B$${venueCount + 5}`)];
  }),
  widths: [46, 10, 18, 22],
  formats: ["@", "#,##0", "0.0", "0.0%"],
  aligns: ["left", "right", "right", "right"],
  totalRow: [
    "TOTAL (top 12 venues)",
    f(`SUM(B5:B${venueCount + 4})`),
    "—",
    f(`SUM(D5:D${venueCount + 4})`),
  ],
  note:
    "Average first-innings total = runs conceded in innings 1 per match at that venue. Venues with identical match counts can appear in a different order than the SQL LIMIT because ties are broken arbitrarily.",
});
addDataBar(venueSheet, "C5:C16");

/* ------------------------------------------------------------------------- */
/* 10. Team Wins (Q10)                                                       */
/* ------------------------------------------------------------------------- */
const teamsSheet = workbook.addWorksheet("Team Wins", {
  properties: { tabColor: { argb: "FF475569" } },
  views: [{ showGridLines: false }],
});
const teamCount = results.teamWins.length;
const teamLast = teamCount + 4; // last data row (starts at 5)
const teamTotal = teamLast + 1;
writeTable(teamsSheet, {
  title: "Team Wins — all time",
  subtitle: `Q10 · results/team_wins.csv · ${teamCount} franchise names · played and win % are live formulas over the Matches sheet`,
  headers: ["Team", "Wins", "Seasons with a Win", "Played", "Win %", "Share of All Wins"],
  rows: results.teamWins.map((row, i) => {
    const rn = 5 + i;
    return [
      row.team,
      num(row.wins),
      num(row.seasons_active_wins),
      f(`COUNTIFS(Matches!$F$5:$F$1247,$A${rn})+COUNTIFS(Matches!$G$5:$G$1247,$A${rn})`),
      f(`IF(D${rn}=0,0,B${rn}/D${rn})`),
      f(`B${rn}/$B$${teamTotal}`),
    ];
  }),
  widths: [30, 9, 14, 9, 10, 14],
  formats: ["@", "#,##0", "#,##0", "#,##0", "0.0%", "0.0%"],
  aligns: ["left", "right", "right", "right", "right", "right"],
  totalRow: [
    "TOTAL (team appearances)",
    f(`SUM(B5:B${teamLast})`),
    "—",
    f(`SUM(D5:D${teamLast})`),
    f(`B${teamTotal}/D${teamTotal}`),
    f(`SUM(F5:F${teamLast})`),
  ],
  note:
    "Played counts every match a team appeared in, including ties and no-results. The TOTAL row therefore shows team appearances (two per match), and its win % is 50% by construction. Franchise names are exactly as in the source, so renamed franchises appear separately.",
});
addDataBar(teamsSheet, "B5:B23");

/* ------------------------------------------------------------------------- */
/* 11. Head to Head (Q11)                                                    */
/* ------------------------------------------------------------------------- */
const h2hSheet = workbook.addWorksheet("Head to Head", {
  properties: { tabColor: { argb: "FF475569" } },
  views: [{ showGridLines: false }],
});
const h2hCount = results.headToHead.length;
writeTable(h2hSheet, {
  title: "Head to Head — top winning match-ups",
  subtitle: `Q11 · results/head_to_head.csv · top ${h2hCount} team-vs-opponent win counts (decided matches only)`,
  headers: ["Team", "Opponent", "Wins", "Share of Team's Wins"],
  rows: results.headToHead.map((row, i) => {
    const rn = 5 + i;
    return [
      row.team,
      row.opponent,
      num(row.wins),
      f(`IFERROR(C${rn}/SUMIF('Team Wins'!$A$5:$A$23,$A${rn},'Team Wins'!$B$5:$B$23),0)`),
    ];
  }),
  widths: [30, 30, 9, 18],
  formats: ["@", "@", "#,##0", "0.0%"],
  aligns: ["left", "left", "right", "right"],
  note:
    "Wins are counted from the winning team's perspective only. 'Share of Team's Wins' divides this match-up's wins by the team's all-time win total from the Team Wins sheet.",
});
addDataBar(h2hSheet, "C5:C19");

/* ------------------------------------------------------------------------- */
/* 12. Highest Totals (Q12)                                                  */
/* ------------------------------------------------------------------------- */
const totalsSheet = workbook.addWorksheet("Highest Totals", {
  properties: { tabColor: { argb: "FF475569" } },
  views: [{ showGridLines: false }],
});
const totalsCount = results.highestTotals.length;
writeTable(totalsSheet, {
  title: "Highest Team Totals — biggest innings",
  subtitle: `Q12 · results/highest_team_totals.csv · top ${totalsCount} innings totals · wickets in hand and vs-season-average are live formulas`,
  headers: ["Batting Team", "Season", "Total", "Wickets", "Match ID", "Wickets in Hand", "vs Season Average"],
  rows: results.highestTotals.map((row, i) => {
    const rn = 5 + i;
    return [
      row.batting_team,
      row.season,
      num(row.total),
      num(row.wickets),
      String(row.match_id),
      f(`10-D${rn}`),
      f(
        `C${rn}/(SUMIF('Season Summary'!$A$5:$A$23,$B${rn},'Season Summary'!$E$5:$E$23)/SUMIF('Season Summary'!$A$5:$A$23,$B${rn},'Season Summary'!$B$5:$B$23))-1`
      ),
    ];
  }),
  widths: [30, 9, 9, 9, 12, 14, 16],
  formats: ["@", "@", "#,##0", "#,##0", "@", "#,##0", "+0.0%;-0.0%;0.0%"],
  aligns: ["left", "left", "right", "right", "right", "right", "right"],
  note:
    "One 2024 match appears twice (Sunrisers Hyderabad 287/3 and Royal Challengers Bengaluru 262/7). vs Season Average compares the total with that season's average runs per match.",
});
addDataBar(totalsSheet, "C5:C16", "FFB45309");

/* ------------------------------------------------------------------------- */
/* 13. Team Season (pivot source)                                            */
/* ------------------------------------------------------------------------- */
const teamSeasonSheet = workbook.addWorksheet("Team Season", {
  properties: { tabColor: { argb: COLORS.amber } },
  views: [{ showGridLines: false }],
});
const tsCount = data.teamSeasonTable.length;
writeTable(teamSeasonSheet, {
  title: "Team Season — pivot-ready team results",
  subtitle: `One row per team per season (${tsCount} rows) · built from data/matches.csv · win % is a live formula`,
  headers: ["Team", "Season", "Matches", "Wins", "Win %", "Share of Team's Wins"],
  rows: data.teamSeasonTable.map((row, i) => {
    const rn = 5 + i;
    return [
      row.team,
      row.season,
      row.matches,
      row.wins,
      f(`IF(C${rn}=0,0,D${rn}/C${rn})`),
      f(`IFERROR(D${rn}/SUMIF('Team Wins'!$A$5:$A$23,$A${rn},'Team Wins'!$B$5:$B$23),0)`),
    ];
  }),
  widths: [30, 10, 10, 8, 10, 18],
  formats: ["@", "@", "#,##0", "#,##0", "0.0%", "0.0%"],
  aligns: ["left", "left", "right", "right", "right", "right"],
  note:
    "Matches include ties and no-results; wins count decided matches only. Use this sheet for team × season pivots without touching the raw match table.",
});
addDataBar(teamSeasonSheet, `E5:E${tsCount + 4}`);

/* ------------------------------------------------------------------------- */
/* 14. Batting Stats (pivot source)                                          */
/* ------------------------------------------------------------------------- */
const battingSheet = workbook.addWorksheet("Batting Stats", {
  properties: { tabColor: { argb: COLORS.amber } },
  views: [{ showGridLines: false }],
});
const batCount = data.battingTable.length;
const batLast = batCount + 4;
const batTotal = batLast + 1;
writeTable(battingSheet, {
  title: "Batting Stats — career table for pivots",
  subtitle: `All ${batCount} batters in the dataset · built from data/deliveries.csv with the same definitions as Q4`,
  headers: ["Batter", "Innings", "Balls Faced", "Runs", "Strike Rate", "Fours", "Sixes", "Dot Balls", "Highest Score", "Share of All Runs"],
  rows: data.battingTable.map((row, i) => {
    const rn = 5 + i;
    return [
      row.batter,
      row.innings,
      row.balls_faced,
      row.runs,
      f(`IF(C${rn}=0,0,D${rn}/C${rn}*100)`),
      row.fours,
      row.sixes,
      row.dot_balls,
      row.highest_score,
      f(`D${rn}/$D$${batTotal}`),
    ];
  }),
  widths: [22, 9, 11, 10, 11, 8, 8, 9, 12, 13],
  formats: ["@", "#,##0", "#,##0", "#,##0", "0.00", "#,##0", "#,##0", "#,##0", "#,##0", "0.00%"],
  aligns: ["left", "right", "right", "right", "right", "right", "right", "right", "right", "right"],
  totalRow: [
    "TOTAL (all batters)",
    "—",
    f(`SUM(C5:C${batLast})`),
    f(`SUM(D5:D${batLast})`),
    f(`D${batTotal}/C${batTotal}*100`),
    f(`SUM(F5:F${batLast})`),
    f(`SUM(G5:G${batLast})`),
    f(`SUM(H5:H${batLast})`),
    f(`MAX(I5:I${batLast})`),
    f(`SUM(J5:J${batLast})`),
  ],
  note:
    "Fours = balls scoring exactly 4; sixes = balls scoring exactly 6. Dot balls are legal balls with no runs off the bat and no byes/leg-byes. Highest score is the best single-innings total.",
});
addDataBar(battingSheet, "D5:D743");

/* ------------------------------------------------------------------------- */
/* 15. Bowling Stats (pivot source)                                          */
/* ------------------------------------------------------------------------- */
const bowlingSheet = workbook.addWorksheet("Bowling Stats", {
  properties: { tabColor: { argb: COLORS.amber } },
  views: [{ showGridLines: false }],
});
const bowlCount = data.bowlingTable.length;
const bowlLast = bowlCount + 4;
const bowlTotal = bowlLast + 1;
writeTable(bowlingSheet, {
  title: "Bowling Stats — career table for pivots",
  subtitle: `Every bowler with 60+ legal balls (${bowlCount} bowlers) · built from data/deliveries.csv with the same definitions as Q5/Q6`,
  headers: ["Bowler", "Matches", "Legal Balls", "Overs", "Runs Conceded", "Wickets", "Economy", "Average", "Strike Rate", "Best Bowling", "Share of All Wickets"],
  rows: data.bowlingTable.map((row, i) => {
    const rn = 5 + i;
    return [
      row.bowler,
      row.matches,
      row.legal_balls,
      f(`C${rn}/6`),
      row.runs_conceded,
      row.wickets,
      f(`IF(C${rn}=0,0,E${rn}/C${rn}*6)`),
      f(`IF(F${rn}=0,"—",E${rn}/F${rn})`),
      f(`IF(F${rn}=0,"—",C${rn}/F${rn})`),
      row.best_bowling,
      f(`F${rn}/$F$${bowlTotal}`),
    ];
  }),
  widths: [22, 9, 11, 8, 13, 9, 10, 10, 10, 13, 16],
  formats: ["@", "#,##0", "#,##0", "0.0", "#,##0", "#,##0", "0.00", "0.00", "0.0", "@", "0.00%"],
  aligns: ["left", "right", "right", "right", "right", "right", "right", "right", "right", "right", "right"],
  totalRow: [
    "TOTAL (qualifying bowlers)",
    "—",
    f(`SUM(C5:C${bowlLast})`),
    f(`C${bowlTotal}/6`),
    f(`SUM(E5:E${bowlLast})`),
    f(`SUM(F5:F${bowlLast})`),
    f(`E${bowlTotal}/C${bowlTotal}*6`),
    "—",
    "—",
    "—",
    f(`SUM(K5:K${bowlLast})`),
  ],
  note:
    "Economy runs = runs off bat + wides + no-balls. Overs = legal balls / 6. Best bowling is the best wickets/runs return in a single match. Averages and strike rates are blank (—) when a bowler has no wickets.",
});
addDataBar(bowlingSheet, "F5:F411");

/* ------------------------------------------------------------------------- */
/* 16. Wicket Types                                                          */
/* ------------------------------------------------------------------------- */
const wicketTypesSheet = workbook.addWorksheet("Wicket Types", {
  properties: { tabColor: { argb: COLORS.amber } },
  views: [{ showGridLines: false }],
});
const wtCount = data.wicketTypeTable.length;
writeTable(wicketTypesSheet, {
  title: "Wicket Types — how batters get out",
  subtitle: `All recorded wicket_type values (${wtCount} types) · innings 1-2 · share is a live formula`,
  headers: ["Dismissal Type", "Count", "Share of Dismissals", "Bowler Credited"],
  rows: data.wicketTypeTable.map((row, i) => {
    const rn = 5 + i;
    return [row.type, row.count, f(`B${rn}/$B$${wtCount + 5}`), row.bowler_credited];
  }),
  widths: [26, 10, 18, 15],
  formats: ["@", "#,##0", "0.00%", "@"],
  aligns: ["left", "right", "right", "center"],
  totalRow: ["TOTAL", f(`SUM(B5:B${wtCount + 4})`), f(`SUM(C5:C${wtCount + 4})`), "—"],
  note:
    "Retirements (19 retired hurt, 6 retired out) and obstruction are recorded dismissals but are not credited to the bowler. Caught is the dominant dismissal type at 63.45%.",
});
addDataBar(wicketTypesSheet, "C5:C14");

/* ------------------------------------------------------------------------- */
/* 17. Matches (full grain)                                                  */
/* ------------------------------------------------------------------------- */
const matchesSheet = workbook.addWorksheet("Matches", {
  properties: { tabColor: { argb: "FFB45309" } },
  views: [{ showGridLines: false }],
});
const matchCount = data.totals.matches;
const matchLast = matchCount + 4;
writeTable(matchesSheet, {
  title: "Matches — every IPL match in the source",
  subtitle: `1,243 rows · data/matches.csv · Result and Toss Winner Won are live formulas · pivot-ready`,
  headers: [
    "Match ID",
    "Season",
    "Date",
    "City",
    "Venue",
    "Team 1",
    "Team 2",
    "Toss Winner",
    "Toss Decision",
    "Player of the Match",
    "Winner",
    "Win Margin",
    "Outcome",
    "Result",
    "Toss Winner Won",
  ],
  rows: data.matches?.map((m, i) => {
    const rn = 5 + i;
    return [
      m.matchId,
      m.season,
      m.date ? new Date(`${m.date}T00:00:00Z`) : "",
      m.city,
      m.venue,
      m.team1,
      m.team2,
      m.tossWinner,
      m.tossDecision,
      m.playerOfMatch,
      m.winner,
      m.winMargin ?? "",
      m.outcomeType,
      f(`IF(M${rn}="win_by_wickets","Chased",IF(M${rn}="win_by_runs","Defended",IF(M${rn}="tie","Tie","No result")))`),
      f(`IF(OR(K${rn}="",H${rn}<>K${rn}),"No","Yes")`),
    ];
  }) ?? [],
  widths: [11, 9, 11, 15, 40, 28, 28, 28, 12, 22, 28, 10, 18, 11, 13],
  formats: ["@", "@", "yyyy-mm-dd", "@", "@", "@", "@", "@", "@", "@", "@", "#,##0", "@", "@", "@"],
  aligns: ["right", "left", "center", "left", "left", "left", "left", "left", "left", "left", "left", "right", "left", "center", "center"],
  note:
    "Result translates the source outcome_type. Toss Winner Won compares the toss winner with the match winner (No for ties/no-results). The ball-by-ball grain (295,732 rows) stays in data/deliveries.csv; use Batting Stats, Bowling Stats and Team Season for pivots.",
});

/* ------------------------------------------------------------------------- */
/* 18. How To Use                                                            */
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
  "IPL Cricket Analytics · real ball-by-ball data from cricsheet.org (ODC-By) · Excel and Google Sheets · rebuild with: cd excel && npm run all";
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
  ["Dashboard", "Headline percentages, volume KPIs, top-team win rates and six charts", "Live formulas + static chart images"],
  ["KPI Summary", "Q1 totals plus extended % metrics: extras, dot balls, boundaries, dismissal mix", "data/deliveries.csv"],
  ["Season Summary", "Q2 + Q3: matches, venues, cities, runs and wickets per season", "results/season_matches.csv + season_runs.csv"],
  ["Top Run Scorers", "Q4: most runs all time (minimum 500 balls faced)", "results/top_run_scorers.csv"],
  ["Top Wicket Takers", "Q5: most bowler-credited wickets (minimum 40)", "results/top_wicket_takers.csv"],
  ["Best Economy", "Q6: lowest economy (minimum 30 overs) with matches and wickets added", "results/best_economy.csv"],
  ["Toss Impact", "Q7: win rate of toss winners who bat vs field", "results/toss_impact.csv"],
  ["Chase vs Defend", "Q8: chase/defend split for every season", "results/chase_defend_by_season.csv"],
  ["Venue Averages", "Q9: average first-innings total by venue", "results/venue_avg_first_innings.csv"],
  ["Team Wins", "Q10: all-time wins with live played and win % columns", "results/team_wins.csv + Matches"],
  ["Head to Head", "Q11: top team-vs-opponent win counts", "results/head_to_head.csv"],
  ["Highest Totals", "Q12: biggest innings totals with wickets in hand", "results/highest_team_totals.csv"],
  ["Team Season", "Team × season pivot source (matches, wins, win %)", "data/matches.csv"],
  ["Batting Stats", "Career batting table for pivots (739 batters)", "data/deliveries.csv"],
  ["Bowling Stats", "Career bowling table for pivots (407 bowlers, 60+ legal balls)", "data/deliveries.csv"],
  ["Wicket Types", "Dismissal mix with share of all dismissals", "data/deliveries.csv"],
  ["Matches", "All 1,243 matches with live Result and Toss Winner Won columns", "data/matches.csv"],
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
  ["Step 2", "File → Import → Upload → select IPL-Analytics-Workbook.xlsx → Import data.", "Choose Create new sheet (or Replace spreadsheet)."],
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
  ["Wins by team and season", "Team Season → Rows: Team, Season", "SUM of Wins; compare with SUM of Matches"],
  ["Runs by batter", "Batting Stats → Rows: Batter", "SUM of Runs, SUM of Balls Faced, SUM of Fours/Sixes"],
  ["Wickets by bowler", "Bowling Stats → Rows: Bowler", "SUM of Wickets, SUM of Legal Balls, AVERAGE of Economy"],
  ["Toss decision by season", "Matches → Rows: Season; Columns: Toss Decision", "COUNTA of Match ID"],
  ["Chase vs defend by season", "Matches → Rows: Season; Columns: Result", "COUNTA of Match ID"],
  ["Dismissal mix", "Wicket Types sheet (already summarised)", "Count and Share of Dismissals"],
].forEach((row) => {
  guideRow(gr, row, { boldFirst: true });
  gr += 1;
});

gr += 1;
guideSection(gr, "4. EXCEL POWER QUERY — FULL BALL-BY-BALL GRAIN");
gr += 1;
[
  ["Step 1", "Data → Get Data → From File → From Text/CSV.", "Use data/matches.csv or data/deliveries.csv from the project folder."],
  ["Step 2", "Load the 295,732-row deliveries file to a worksheet or the Data Model.", "The workbook itself keeps pre-aggregated tables for speed."],
  ["Step 3", "Apply the same definitions: innings ≤ 2, legal ball = wides 0 and no-balls 0, bowler wickets = the six credited types.", "All definitions match sql/02_analysis_queries.sql."],
].forEach((row) => {
  guideRow(gr, row);
  gr += 1;
});

gr += 1;
guideSection(gr, "5. REBUILD THIS WORKBOOK");
gr += 1;
[
  ["Requirements", "Node.js 20+ and npm. Edge is only needed to regenerate chart images on Windows.", "npm install"],
  ["Build", "Regenerate IPL-Analytics-Workbook.xlsx from data/ + results/.", "npm run build"],
  ["Charts", "Re-render the six dashboard PNGs into excel/assets/.", "npm run charts"],
  ["Verify", "Re-check the workbook and every aggregate against results/*.csv.", "npm run verify"],
  ["Everything", "Charts → build → verify in one command.", "npm run all"],
].forEach((row) => {
  guideRow(gr, row, { boldFirst: true });
  gr += 1;
});

gr += 1;
guideSection(gr, "6. DEFINITIONS (MATCH THE SQL PROJECT)");
gr += 1;
[
  "Legal ball: wides = 0 AND noballs = 0. Super overs (innings > 2) are excluded from every aggregate.",
  "Bowler-credited wicket: bowled, caught, lbw, stumped, caught and bowled, hit wicket. Run-outs, retirements and obstruction are not credited.",
  "Batter balls faced: deliveries with wides = 0 (no-balls included), matching Q4. Strike rate uses runs off the bat only.",
  "Economy runs: runs off bat + wides + no-balls; economy = runs per legal over. Minimum 30 overs on the Best Economy sheet.",
  "Minimum thresholds: 500 balls for batting, 40 wickets for the wicket table, 60 legal balls for the pivot bowling table.",
  "Franchise names: exactly as in the source. Renamed franchises count under the name used at the time.",
  "Seasons: cricsheet labels three seasons with cross-year strings (2007/08, 2009/10, 2020/21); those labels are preserved.",
].forEach((text) => {
  guideBullet(gr, text);
  gr += 1;
});

gr += 1;
guideSection(gr, "7. HONEST LIMITATIONS");
gr += 1;
[
  "The six dashboard charts are embedded PNG images, not native Excel charts — ExcelJS has no chart API. Every number behind them is in the sheets, so they can be rebuilt.",
  "The workbook keeps aggregated batting/bowling tables instead of all 295,732 delivery rows (28 MB CSV) so it stays fast and portable. Raw files are in data/ and documented above.",
  "Aggregates were computed by excel/lib/compute.mjs and cross-checked against the 12 SQL result files with 601 assertions (npm run verify).",
  "The dataset ends with the 2026 season as published on cricsheet.org at build time; it is not a live feed.",
  "Franchise splits follow the source naming, so Royal Challengers Bangalore and Royal Challengers Bengaluru are separate rows.",
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
guide.headerFooter = { oddFooter: `&LIPL Analytics&CPage &P of &N&RSource: cricsheet.org (ODC-By)` };

/* ------------------------------------------------------------------------- */
/* Write                                                                     */
/* ------------------------------------------------------------------------- */
const expectedSheets = [
  "Dashboard",
  "KPI Summary",
  "Season Summary",
  "Top Run Scorers",
  "Top Wicket Takers",
  "Best Economy",
  "Toss Impact",
  "Chase vs Defend",
  "Venue Averages",
  "Team Wins",
  "Head to Head",
  "Highest Totals",
  "Team Season",
  "Batting Stats",
  "Bowling Stats",
  "Wicket Types",
  "Matches",
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
console.log(`    Matches: ${matchCount} · Batting rows: ${batCount} · Bowling rows: ${bowlCount} · Team-season rows: ${tsCount}`);
console.log(`    Dashboard images: ${dash.getImages().length}`);
