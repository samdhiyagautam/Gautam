/**
 * Reads IPL-Analytics-Workbook.xlsx back and verifies structure, formulas and
 * key values. This does not open Excel's UI — it validates the file ExcelJS
 * produced, the sheet contents, and every cross-sheet sheet reference.
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

const here = dirname(fileURLToPath(import.meta.url));
const projectDir = join(here, "..");
const file = join(projectDir, "IPL-Analytics-Workbook.xlsx");

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
eq(value(dash, "A1"), "IPL CRICKET ANALYTICS", "Dashboard title");
eq(dash.getImages().length, 6, "Dashboard chart images");
expect(Boolean(formula(dash, "B7")), "Dashboard toss formula exists");
near(value(dash, "B7"), 0.5156, 0.0001, "Dashboard toss win rate (cached)");
near(value(dash, "B8"), 0.546914, 0.0001, "Dashboard field-first rate (cached)");
near(value(dash, "B9"), 0.453431, 0.0001, "Dashboard bat-first rate (cached)");
hasFormula(dash, "C7", "REPT", "Dashboard visual bar formula");
eq(value(dash, "B18"), 1243, "Dashboard matches value");
eq(value(dash, "B19"), 401423, "Dashboard runs value");
eq(value(dash, "B20"), 14674, "Dashboard dismissals value");
eq(value(dash, "B21"), 284465, "Dashboard legal balls value");
eq(value(dash, "B22"), 8.47, "Dashboard runs per over");
eq(value(dash, "B23"), 34420, "Dashboard fours");
eq(value(dash, "B24"), 15763, "Dashboard sixes");
eq(value(dash, "B25"), 19, "Dashboard seasons");
eq(value(dash, "B26"), 41, "Dashboard venues");
eq(value(dash, "A30"), "Mumbai Indians", "Dashboard top team");
eq(value(dash, "B30"), 155, "Dashboard top team wins");
hasFormula(dash, "C30", "'Team Wins'!D5", "Dashboard top team played formula");
hasFormula(dash, "D30", "'Team Wins'!E5", "Dashboard top team win % formula");
eq(value(dash, "A37"), "Delhi Daredevils", "Dashboard 8th team");
eq(value(dash, "A41")?.startsWith?.("Most runs: V Kohli"), true, "Dashboard finding 1");
expect(String(value(dash, "A45") ?? "").includes("2026"), "Dashboard finding 5 mentions 2026");
eq(dash.conditionalFormattings.length, 1, "Dashboard data bar present");
eq(dash.conditionalFormattings[0].ref, "B7:B14", "Dashboard data bar range");

// --- KPI Summary -----------------------------------------------------------
const kpi = ws("KPI Summary");
eq(value(kpi, "B6"), 1243, "KPI matches");
eq(value(kpi, "B7"), 401423, "KPI total runs");
eq(value(kpi, "B8"), 14674, "KPI dismissals");
eq(value(kpi, "B9"), 284465, "KPI legal balls");
near(value(kpi, "B10"), 8.47, 0.001, "KPI runs per over cached");
hasFormula(kpi, "B10", "B7*6/B9", "KPI runs-per-over formula");
eq(value(kpi, "B11"), 34420, "KPI fours");
eq(value(kpi, "B12"), 15763, "KPI sixes");
eq(value(kpi, "B16"), 232258, "KPI boundary runs");
near(value(kpi, "B17"), 0.5786, 0.0001, "KPI boundary share cached");
eq(value(kpi, "B18"), 20188, "KPI extras");
near(value(kpi, "B19"), 0.0503, 0.0001, "KPI extras share cached");
eq(value(kpi, "B20"), 101188, "KPI dot balls");
near(value(kpi, "B21"), 0.3557, 0.0001, "KPI dot rate cached");
eq(value(kpi, "B22"), 9310, "KPI caught dismissals");
near(value(kpi, "B23"), 0.6345, 0.0001, "KPI caught share cached");
hasFormula(kpi, "B16", "B11*4+B12*6", "KPI boundary runs formula");
hasFormula(kpi, "B17", "B16/B7", "KPI boundary share formula");
hasFormula(kpi, "B19", "B18/B7", "KPI extras share formula");
hasFormula(kpi, "B21", "B20/B9", "KPI dot rate formula");
hasFormula(kpi, "B23", "B22/B8", "KPI caught share formula");
expect(String(value(kpi, "A26") ?? "").includes("Legal ball"), "KPI definitions present");

// --- Season Summary --------------------------------------------------------
const season = ws("Season Summary");
eq(countRows(season, 5, 23), 19, "Season Summary data rows");
eq(value(season, "A5"), "2007/08", "First season");
eq(value(season, "A23"), "2026", "Last season");
eq(value(season, "A24"), "TOTAL", "Season Summary total row");
hasFormula(season, "B24", "SUM(B5:B23)", "Season total matches formula");
hasFormula(season, "E24", "SUM(E5:E23)", "Season total runs formula");
hasFormula(season, "F24", "SUM(F5:F23)", "Season total wickets formula");
hasFormula(season, "G5", "E5/B5", "Season runs-per-match formula");
hasFormula(season, "H5", "$E$24", "Season share formula");
hasFormula(season, "I5", "$F$24", "Season wicket share formula");
eq(season.conditionalFormattings[0]?.ref, "E5:E23", "Season data bar range");

// --- Top Run Scorers -------------------------------------------------------
const battingTop = ws("Top Run Scorers");
eq(value(battingTop, "A5"), "V Kohli", "Top scorer name");
eq(value(battingTop, "D5"), 9336, "Kohli runs");
eq(value(battingTop, "C5"), 6926, "Kohli balls");
eq(value(battingTop, "B5"), 275, "Kohli innings");
hasFormula(battingTop, "E5", "D5/C5*100", "Strike rate formula");
hasFormula(battingTop, "F5", "D5/B5", "Runs per innings formula");
eq(countRows(battingTop, 5, 19), 15, "Top run scorers rows");
eq(value(battingTop, "A20"), "TOTAL (15 players)", "Top run scorers total row");
hasFormula(battingTop, "D20", "SUM(D5:D19)", "Top run scorers total formula");
hasFormula(battingTop, "H5", "$D$20", "Top run scorers share formula");

// --- Top Wicket Takers -----------------------------------------------------
const wicketsTop = ws("Top Wicket Takers");
eq(value(wicketsTop, "A5"), "YS Chahal", "Top wicket taker");
eq(value(wicketsTop, "C5"), 233, "Chahal wickets");
eq(value(wicketsTop, "B5"), 184, "Chahal matches");
hasFormula(wicketsTop, "D5", "C5/B5", "Wickets per match formula");
hasFormula(wicketsTop, "E5", "$C$20", "Wicket share formula");
eq(countRows(wicketsTop, 5, 19), 15, "Top wicket takers rows");
eq(value(wicketsTop, "A20"), "TOTAL (15 bowlers)", "Top wicket takers total row");
hasFormula(wicketsTop, "C20", "SUM(C5:C19)", "Top wicket takers total formula");

// --- Best Economy ----------------------------------------------------------
const economy = ws("Best Economy");
eq(value(economy, "A5"), "A Chandila", "Best economy bowler");
eq(value(economy, "B5"), 234, "Chandila legal balls (39 overs)");
hasFormula(economy, "C5", "B5/6", "Overs formula");
eq(value(economy, "D5"), 242, "Chandila runs conceded");
hasFormula(economy, "E5", "D5*6/B5", "Economy formula");
hasFormula(economy, "H5", "G5/F5", "Wickets per match formula");
eq(countRows(economy, 5, 19), 15, "Best economy rows");
eq(value(economy, "A20"), "TOTAL (15 bowlers)", "Best economy total row");
hasFormula(economy, "B20", "SUM(B5:B19)", "Best economy balls total formula");
eq(economy.conditionalFormattings[0]?.ref, "E5:E19", "Best economy data bar range");

// --- Toss Impact -----------------------------------------------------------
const toss = ws("Toss Impact");
eq(value(toss, "A5"), "bat", "Toss row 1");
eq(value(toss, "A6"), "field", "Toss row 2");
eq(value(toss, "B5"), 408, "Bat-first matches");
eq(value(toss, "C5"), 185, "Bat-first toss wins");
eq(value(toss, "B6"), 810, "Field-first matches");
eq(value(toss, "C6"), 443, "Field-first toss wins");
hasFormula(toss, "D5", "C5/B5", "Bat-first win rate formula");
hasFormula(toss, "D6", "C6/B6", "Field-first win rate formula");
hasFormula(toss, "B7", "SUM(B5:B6)", "Toss total matches formula");
hasFormula(toss, "C7", "SUM(C5:C6)", "Toss total wins formula");
hasFormula(toss, "D7", "C7/B7", "Toss overall rate formula");
hasFormula(toss, "E5", "$B$7", "Toss share formula");

// --- Chase vs Defend -------------------------------------------------------
const chase = ws("Chase vs Defend");
eq(countRows(chase, 5, 23), 19, "Chase rows");
eq(value(chase, "A5"), "2007/08", "Chase first season");
eq(value(chase, "A24"), "TOTAL", "Chase total row");
hasFormula(chase, "B24", "SUM(B5:B23)", "Chase total defenses formula");
hasFormula(chase, "C24", "SUM(C5:C23)", "Chase total chases formula");
hasFormula(chase, "F24", "SUM(F5:F23)", "Chase total decided formula");
const chase2026 = 23;
eq(value(chase, `A${chase2026}`), "2026", "Chase 2026 row");
eq(value(chase, `B${chase2026}`), 27, "2026 defended");
eq(value(chase, `C${chase2026}`), 45, "2026 chased");
hasFormula(chase, `F${chase2026}`, "B23+C23", "2026 decided formula");
hasFormula(chase, `G${chase2026}`, "IF(F23=0,0,C23/F23)", "2026 chase share formula");
hasFormula(chase, `H${chase2026}`, "IF(F23=0,0,B23/F23)", "2026 defend share formula");

// --- Venue Averages --------------------------------------------------------
const venue = ws("Venue Averages");
eq(value(venue, "A5"), "Wankhede Stadium, Mumbai", "Top venue");
eq(value(venue, "B5"), 132, "Wankhede matches");
eq(value(venue, "C5"), 173.1, "Wankhede average");
eq(countRows(venue, 5, 16), 12, "Venue rows");
eq(value(venue, "A17"), "TOTAL (top 12 venues)", "Venue total row");
hasFormula(venue, "D5", "$B$17", "Venue share formula");
hasFormula(venue, "B17", "SUM(B5:B16)", "Venue matches total formula");

// --- Team Wins -------------------------------------------------------------
const teams = ws("Team Wins");
eq(value(teams, "A5"), "Mumbai Indians", "Top team");
eq(value(teams, "B5"), 155, "MI wins");
eq(value(teams, "C5"), 19, "MI active seasons");
hasFormula(teams, "D5", "COUNTIFS(Matches!", "Played COUNTIFS formula");
hasFormula(teams, "E5", "B5/D5", "Win % formula");
hasFormula(teams, "F5", "$B$24", "Team win share formula");
eq(countRows(teams, 5, 23), 19, "Team rows");
eq(value(teams, "A24"), "TOTAL (team appearances)", "Team Wins total row");
hasFormula(teams, "B24", "SUM(B5:B23)", "Team wins total formula");
hasFormula(teams, "D24", "SUM(D5:D23)", "Team played total formula");
eq(teams.conditionalFormattings[0]?.ref, "B5:B23", "Team data bar range");

// --- Head to Head ----------------------------------------------------------
const h2h = ws("Head to Head");
eq(value(h2h, "A5"), "Mumbai Indians", "H2H team");
eq(value(h2h, "B5"), "Kolkata Knight Riders", "H2H opponent");
eq(value(h2h, "C5"), 25, "H2H wins");
hasFormula(h2h, "D5", "SUMIF('Team Wins'!", "H2H share formula");
eq(countRows(h2h, 5, 19), 15, "H2H rows");

// --- Highest Totals --------------------------------------------------------
const highest = ws("Highest Totals");
eq(value(highest, "A5"), "Sunrisers Hyderabad", "Highest total team");
eq(value(highest, "B5"), "2024", "Highest total season");
eq(value(highest, "C5"), 287, "Highest total runs");
eq(value(highest, "D5"), 3, "Highest total wickets");
eq(value(highest, "E5"), "1426268", "Highest total match id");
hasFormula(highest, "F5", "10-D5", "Wickets in hand formula");
hasFormula(highest, "G5", "'Season Summary'!", "Highest total vs season formula");
eq(countRows(highest, 5, 16), 12, "Highest totals rows");

// --- Team Season -----------------------------------------------------------
const teamSeason = ws("Team Season");
eq(countRows(teamSeason, 5, 170), 166, "Team Season rows");
hasFormula(teamSeason, "E5", "D5/C5", "Team Season win % formula");
hasFormula(teamSeason, "F5", "SUMIF('Team Wins'!", "Team Season win share formula");
eq(teamSeason.conditionalFormattings[0]?.ref, "E5:E170", "Team Season data bar range");

// --- Batting Stats ---------------------------------------------------------
const batting = ws("Batting Stats");
eq(countRows(batting, 5, 743), 739, "Batting Stats data rows");
eq(value(batting, "A5"), "V Kohli", "Batting table top row");
eq(value(batting, "D5"), 9336, "Batting table Kohli runs");
eq(value(batting, "A744"), "TOTAL (all batters)", "Batting total row");
hasFormula(batting, "D744", "SUM(D5:D743)", "Batting total runs formula");
hasFormula(batting, "C744", "SUM(C5:C743)", "Batting total balls formula");
hasFormula(batting, "E5", "D5/C5*100", "Batting strike rate formula");
hasFormula(batting, "J5", "$D$744", "Batting share formula");
eq(batting.conditionalFormattings[0]?.ref, "D5:D743", "Batting data bar range");

// --- Bowling Stats ---------------------------------------------------------
const bowling = ws("Bowling Stats");
eq(countRows(bowling, 5, 411), 407, "Bowling Stats data rows");
eq(value(bowling, "A5"), "YS Chahal", "Bowling table top row");
eq(value(bowling, "F5"), 233, "Bowling table Chahal wickets");
eq(value(bowling, "A412"), "TOTAL (qualifying bowlers)", "Bowling total row");
hasFormula(bowling, "F412", "SUM(F5:F411)", "Bowling total wickets formula");
hasFormula(bowling, "C412", "SUM(C5:C411)", "Bowling total balls formula");
hasFormula(bowling, "D5", "C5/6", "Bowling overs formula");
hasFormula(bowling, "G5", "E5/C5*6", "Bowling economy formula");
hasFormula(bowling, "K5", "$F$412", "Bowling share formula");

// --- Wicket Types ----------------------------------------------------------
const wicketTypes = ws("Wicket Types");
eq(value(wicketTypes, "A5"), "caught", "Top wicket type");
eq(value(wicketTypes, "B5"), 9310, "Caught count");
eq(value(wicketTypes, "A15"), "TOTAL", "Wicket types total row");
hasFormula(wicketTypes, "B15", "SUM(B5:B14)", "Wicket types total formula");
hasFormula(wicketTypes, "C5", "$B$15", "Wicket type share formula");
eq(countRows(wicketTypes, 5, 14), 10, "Wicket type rows");

// --- Matches ---------------------------------------------------------------
const matches = ws("Matches");
eq(countRows(matches, 5, 1247), 1243, "Matches data rows");
eq(value(matches, "A5"), "1082591", "First match id");
eq(value(matches, "B5"), "2017", "First match season");
eq(value(matches, "E5"), "Rajiv Gandhi International Stadium, Uppal", "First match venue");
hasFormula(matches, "N5", "win_by_wickets", "Result formula");
hasFormula(matches, "O5", "H5<>K5", "Toss winner formula");
eq(value(matches, "A1247"), "981019", "Last match id");

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

expect(formulaCount >= 6000, "Live formula count", `found ${formulaCount}`);
expect(dataBarCount >= 14, "Data bars preserved", `found ${dataBarCount}`);
expect(placeholderCount === 0, "No [ADD ...] placeholders", `found ${placeholderCount}`);
expect(badParens.length === 0, "All formulas have balanced parentheses", badParens.slice(0, 3).join(", "));
const expectedRefs = ["Chase vs Defend", "KPI Summary", "Matches", "Season Summary", "Team Wins", "Toss Impact"];
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
      matchesRows: 1243,
      battingRows: 739,
      bowlingRows: 407,
      teamSeasonRows: 166,
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
