/**
 * Cross-checks every workbook aggregate against the verified SQL results in
 * results/*.csv. Run with: npm run verify:data
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

function readResult(name) {
  return readCsvObjects(join(projectDir, "results", `${name}.csv`));
}

// --- KPI summary -----------------------------------------------------------
const kpiCsv = readResult("kpi_summary")[0];
eq(data.kpi.matches, kpiCsv.matches, "KPI matches", 0);
eq(data.kpi.total_runs, kpiCsv.total_runs, "KPI total runs", 0);
eq(data.kpi.wickets, kpiCsv.wickets, "KPI wickets", 0);
eq(data.kpi.legal_balls, kpiCsv.legal_balls, "KPI legal balls", 0);
eq(data.kpi.runs_per_over, kpiCsv.runs_per_over, "KPI runs per over", 2);

// --- Season summary (Q2 + Q3) ---------------------------------------------
const seasonMatches = new Map(readResult("season_matches").map((r) => [r.season, r]));
const seasonRuns = new Map(readResult("season_runs").map((r) => [r.season, r]));
expect(
  data.seasonSummary.length === seasonMatches.size,
  "Season summary row count",
  `${data.seasonSummary.length} vs ${seasonMatches.size}`
);
for (const s of data.seasonSummary) {
  const m = seasonMatches.get(s.season);
  const r = seasonRuns.get(s.season);
  expect(Boolean(m && r), `Season ${s.season} present in SQL results`);
  if (!m || !r) continue;
  eq(s.matches, m.matches, `Season ${s.season} matches`, 0);
  eq(s.venues, m.venues, `Season ${s.season} venues`, 0);
  eq(s.cities, m.cities, `Season ${s.season} cities`, 0);
  eq(s.runs, r.runs, `Season ${s.season} runs`, 0);
  eq(s.wickets, r.wickets, `Season ${s.season} wickets`, 0);
}

// --- Top run scorers (Q4) --------------------------------------------------
const battersCsv = readResult("top_run_scorers");
expect(data.topRunScorers.length === battersCsv.length, "Top run scorers row count");
data.topRunScorers.forEach((row, i) => {
  const expected = battersCsv[i];
  if (!expected) return;
  eqStr(row.batter, expected.batter, `Batter #${i + 1} name`);
  eq(row.innings, expected.innings, `${row.batter} innings`, 0);
  eq(row.balls_faced, expected.balls_faced, `${row.batter} balls`, 0);
  eq(row.runs, expected.runs, `${row.batter} runs`, 0);
  eq(row.strike_rate, expected.strike_rate, `${row.batter} strike rate`, 2);
});

// --- Top wicket takers (Q5) -----------------------------------------------
const wicketsCsv = new Map(readResult("top_wicket_takers").map((r) => [r.bowler, r]));
expect(data.topWicketTakers.length === wicketsCsv.size, "Top wicket takers row count");
for (const row of data.topWicketTakers) {
  const expected = wicketsCsv.get(row.bowler);
  expect(Boolean(expected), `${row.bowler} present in SQL wickets`);
  if (!expected) continue;
  eq(row.matches, expected.matches, `${row.bowler} matches`, 0);
  eq(row.wickets, expected.wickets, `${row.bowler} wickets`, 0);
}

// --- Best economy (Q6) -----------------------------------------------------
const economyCsv = new Map(readResult("best_economy").map((r) => [r.bowler, r]));
expect(data.bestEconomy.length === economyCsv.size, "Best economy row count");
for (const row of data.bestEconomy) {
  const expected = economyCsv.get(row.bowler);
  expect(Boolean(expected), `${row.bowler} present in SQL economy`);
  if (!expected) continue;
  eq(row.overs, expected.overs, `${row.bowler} overs`, 1);
  eq(row.runs_conceded, expected.runs_conceded, `${row.bowler} runs conceded`, 0);
  eq(row.economy, expected.economy, `${row.bowler} economy`, 2);
}

// --- Toss impact (Q7) ------------------------------------------------------
const tossCsv = new Map(readResult("toss_impact").map((r) => [r.toss_decision, r]));
expect(data.tossImpact.length === tossCsv.size, "Toss impact row count");
for (const row of data.tossImpact) {
  const expected = tossCsv.get(row.toss_decision);
  expect(Boolean(expected), `Toss ${row.toss_decision} present`);
  if (!expected) continue;
  eq(row.matches, expected.matches, `Toss ${row.toss_decision} matches`, 0);
  eq(row.toss_winner_won, expected.toss_winner_won, `Toss ${row.toss_decision} wins`, 0);
  eq(row.toss_winner_win_pct, expected.toss_winner_win_pct, `Toss ${row.toss_decision} pct`, 1);
}

// --- Chase vs defend (Q8) --------------------------------------------------
const chaseCsv = new Map(readResult("chase_defend_by_season").map((r) => [r.season, r]));
expect(data.chaseDefend.length === chaseCsv.size, "Chase/defend row count");
for (const row of data.chaseDefend) {
  const expected = chaseCsv.get(row.season);
  expect(Boolean(expected), `Chase season ${row.season} present`);
  if (!expected) continue;
  eq(row.defended, expected.defended, `${row.season} defended`, 0);
  eq(row.chased, expected.chased, `${row.season} chased`, 0);
  eq(row.ties, expected.ties, `${row.season} ties`, 0);
  eq(row.no_result, expected.no_result, `${row.season} no result`, 0);
}

// --- Venue averages (Q9) ---------------------------------------------------
// The 12-row LIMIT has a three-way tie at 42 matches, so SQLite can pick a
// different 12th venue. Every venue SQL returned must match exactly; the
// workbook may include one extra tied venue instead.
const venueCsv = new Map(readResult("venue_avg_first_innings").map((r) => [r.venue, r]));
for (const [venue, expected] of venueCsv) {
  const row = data.venueAverages.find((v) => v.venue === venue);
  expect(Boolean(row), `Venue present: ${venue}`);
  if (!row) continue;
  eq(row.matches, expected.matches, `${venue} matches`, 0);
  eq(row.avg_first_innings_total, expected.avg_first_innings_total, `${venue} average`, 1);
}

// --- Team wins (Q10) -------------------------------------------------------
const teamCsv = new Map(readResult("team_wins").map((r) => [r.team, r]));
expect(data.teamWins.length === teamCsv.size, "Team wins row count");
for (const row of data.teamWins) {
  const expected = teamCsv.get(row.team);
  expect(Boolean(expected), `Team present: ${row.team}`);
  if (!expected) continue;
  eq(row.wins, expected.wins, `${row.team} wins`, 0);
  eq(row.seasons_active_wins, expected.seasons_active_wins, `${row.team} active seasons`, 0);
}

// --- Head to head (Q11) ----------------------------------------------------
const h2hCsv = new Map(readResult("head_to_head").map((r) => [`${r.team}|${r.opponent}`, r]));
expect(data.headToHead.length === h2hCsv.size, "Head-to-head row count");
for (const row of data.headToHead) {
  const expected = h2hCsv.get(`${row.team}|${row.opponent}`);
  expect(Boolean(expected), `H2H present: ${row.team} vs ${row.opponent}`);
  if (!expected) continue;
  eq(row.wins, expected.wins, `H2H ${row.team} vs ${row.opponent}`, 0);
}

// --- Highest totals (Q12) --------------------------------------------------
// One match appears twice (SRH 287 v RCB 262, IPL 2024), so the key includes
// the team, and the row count is compared against the CSV row count.
const totalsRows = readResult("highest_team_totals");
const totalsCsv = new Map(totalsRows.map((r) => [`${r.match_id}|${r.batting_team}`, r]));
expect(data.highestTotals.length === totalsRows.length, "Highest totals row count");
for (const row of data.highestTotals) {
  const expected = totalsCsv.get(`${row.match_id}|${row.batting_team}`);
  expect(Boolean(expected), `Total present: match ${row.match_id}`);
  if (!expected) continue;
  eqStr(row.batting_team, expected.batting_team, `Total ${row.match_id} team`);
  eq(row.season, expected.season, `Total ${row.match_id} season`, 0);
  eq(row.total, expected.total, `Total ${row.match_id} runs`, 0);
  eq(row.wickets, expected.wickets, `Total ${row.match_id} wickets`, 0);
}

// --- Sanity checks on the extended figures --------------------------------
eq(data.totals.deliveryRowsTotal, 295732, "Delivery rows in source", 0);
eq(data.totals.deliveries, 295557, "Deliveries counted (innings <= 2)", 0);
eq(data.totals.deliveryRowsTotal - data.totals.deliveries, 175, "Super-over deliveries excluded", 0);
eq(data.totals.seasonCount, 19, "Season count", 0);
eq(data.totals.decidedMatches, 1218, "Decided matches", 0);
eq(data.totals.batterRunsTotal + data.totals.extrasRuns, data.totals.totalRuns, "Runs split", 0);
eq(data.extended.boundaryRuns, 4 * data.totals.fours + 6 * data.totals.sixes, "Boundary runs derivation", 0);

const summary = {
  checks,
  failures: failures.length,
  seasons: data.totals.seasonCount,
  matches: data.totals.matches,
  deliveries: data.totals.deliveries,
  runs: data.totals.totalRuns,
  wickets: data.totals.wickets,
  legalBalls: data.totals.legalBalls,
  runsPerOver: data.totals.runsPerOver,
  batters: data.battingTable.length,
  bowlers: data.bowlingTable.length,
  decidedMatches: data.totals.decidedMatches,
  tossOverall: Number(
    (((data.tossImpact.find((t) => t.toss_decision === "bat").toss_winner_won +
      data.tossImpact.find((t) => t.toss_decision === "field").toss_winner_won) /
      data.totals.decidedMatches) * 100).toFixed(2)
  ),
  chasePct: Number(
    ((data.chaseDefend.reduce((s, r) => s + r.chased, 0) / data.totals.decidedMatches) * 100).toFixed(2)
  ),
  extrasShare: Number((data.extended.extrasShare * 100).toFixed(2)),
  boundaryShare: Number((data.extended.boundaryShare * 100).toFixed(2)),
  dotRate: Number((data.extended.dotRate * 100).toFixed(2)),
  caughtShare: Number((data.extended.caughtShare * 100).toFixed(2)),
};

console.log(JSON.stringify(summary, null, 2));
if (failures.length) {
  console.error(`\nFAIL — ${failures.length} of ${checks} checks failed:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`\nPASS — all ${checks} data checks match results/*.csv`);
