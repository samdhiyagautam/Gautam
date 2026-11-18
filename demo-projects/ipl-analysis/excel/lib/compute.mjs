import { join } from "node:path";
import { readCsvObjects, num, round } from "./csv.mjs";

/** Wicket types that are credited to the bowler (documented in sql/02). */
export const BOWLER_WICKETS = new Set([
  "bowled",
  "caught",
  "lbw",
  "stumped",
  "caught and bowled",
  "hit wicket",
]);

const DECIDED = new Set(["win_by_runs", "win_by_wickets"]);

/** Chronological key for cricsheet season labels ("2007/08" -> 2007). */
function seasonKey(season) {
  const year = Number.parseInt(String(season).slice(0, 4), 10);
  return Number.isFinite(year) ? year : 9999;
}

export function computeAll(projectDir) {
  const matchRows = readCsvObjects(join(projectDir, "data", "matches.csv"));
  const deliveryRows = readCsvObjects(join(projectDir, "data", "deliveries.csv"));

  // ---------------------------------------------------------------------
  // Matches-level aggregates
  // ---------------------------------------------------------------------
  const matches = matchRows.map((m) => ({
    matchId: m.match_id,
    season: m.season,
    date: m.date,
    city: m.city,
    venue: m.venue,
    team1: m.team1,
    team2: m.team2,
    tossWinner: m.toss_winner,
    tossDecision: m.toss_decision,
    playerOfMatch: m.player_of_match,
    winner: m.winner,
    winMargin: m.win_margin === "" ? null : num(m.win_margin),
    outcomeType: m.outcome_type,
  }));

  const seasons = [];
  const seasonMatches = new Map();
  const teamSeason = new Map();
  const teamWinCounts = new Map();
  const teamPlayed = new Map();
  const toss = new Map();
  const chase = new Map();
  const venueMatches = new Map();
  const h2hCounts = new Map();

  for (const m of matches) {
    if (!seasons.includes(m.season)) seasons.push(m.season);
    const s = seasonMatches.get(m.season) ?? { season: m.season, matches: 0, venues: new Set(), cities: new Set() };
    s.matches += 1;
    s.venues.add(m.venue);
    s.cities.add(m.city);
    seasonMatches.set(m.season, s);

    venueMatches.set(m.venue, (venueMatches.get(m.venue) ?? 0) + 1);

    const c = chase.get(m.season) ?? { season: m.season, defended: 0, chased: 0, ties: 0, no_result: 0 };
    if (m.outcomeType === "win_by_runs") c.defended += 1;
    else if (m.outcomeType === "win_by_wickets") c.chased += 1;
    else if (m.outcomeType === "tie") c.ties += 1;
    else c.no_result += 1;
    chase.set(m.season, c);

    for (const team of [m.team1, m.team2]) {
      if (!team) continue;
      teamPlayed.set(team, (teamPlayed.get(team) ?? 0) + 1);
      const key = `${team}|${m.season}`;
      const ts = teamSeason.get(key) ?? { team, season: m.season, matches: 0, wins: 0 };
      ts.matches += 1;
      teamSeason.set(key, ts);
    }

    if (!DECIDED.has(m.outcomeType)) continue;

    const decision = m.tossDecision || "";
    const t = toss.get(decision) ?? { decision, matches: 0, tossWinnerWon: 0 };
    t.matches += 1;
    if (m.tossWinner === m.winner) t.tossWinnerWon += 1;
    toss.set(decision, t);

    if (!m.winner) continue;
    teamWinCounts.set(m.winner, (teamWinCounts.get(m.winner) ?? 0) + 1);
    const ts = teamSeason.get(`${m.winner}|${m.season}`);
    if (ts) ts.wins += 1;

    const opponent = m.winner === m.team1 ? m.team2 : m.team1;
    const h2hKey = `${m.winner}|${opponent}`;
    h2hCounts.set(h2hKey, (h2hCounts.get(h2hKey) ?? 0) + 1);
  }

  // SQL sorts seasons as text ("2007/08" < "2009" < "2009/10" < "2011"...),
  // which is also chronological because every label starts with the year.
  seasons.sort((a, b) => String(a).localeCompare(String(b)));

  // ---------------------------------------------------------------------
  // Deliveries-level aggregates (super overs excluded: innings <= 2)
  // ---------------------------------------------------------------------
  const seasonRuns = new Map();
  const batters = new Map();
  const bowlers = new Map();
  const bowlerPerMatch = new Map();
  const batterPerInnings = new Map();
  const firstInnings = new Map();
  const inningsTotals = new Map();
  const wicketTypes = new Map();

  let totalRuns = 0;
  let totalWickets = 0;
  let legalBalls = 0;
  let extrasRuns = 0;
  let fours = 0;
  let sixes = 0;
  let dotBalls = 0;
  let batterRunsTotal = 0;
  let bowlerWicketsTotal = 0;
  let counted = 0;

  for (const d of deliveryRows) {
    if (num(d.innings) > 2) continue;
    counted += 1;

    const runsOffBat = num(d.runs_off_bat);
    const extras = num(d.extras);
    const wides = num(d.wides);
    const noballs = num(d.noballs);
    const byes = num(d.byes);
    const legbyes = num(d.legbyes);
    const legal = wides === 0 && noballs === 0;
    const total = runsOffBat + extras;
    const wicket = d.wicket_type || "";

    totalRuns += total;
    extrasRuns += extras;
    if (legal) legalBalls += 1;
    if (runsOffBat === 4) fours += 1;
    if (runsOffBat === 6) sixes += 1;
    if (legal && runsOffBat === 0 && byes === 0 && legbyes === 0 && extras === 0) dotBalls += 1;
    if (wicket !== "") {
      totalWickets += 1;
      wicketTypes.set(wicket, (wicketTypes.get(wicket) ?? 0) + 1);
    }

    const sr = seasonRuns.get(d.season) ?? { season: d.season, runs: 0, wickets: 0 };
    sr.runs += total;
    if (wicket !== "") sr.wickets += 1;
    seasonRuns.set(d.season, sr);

    // Batter: innings = distinct match_id, balls faced = wides = 0 (SQL Q4).
    const b = batters.get(d.striker) ?? {
      batter: d.striker,
      innings: new Set(),
      balls: 0,
      runs: 0,
      fours: 0,
      sixes: 0,
      dots: 0,
      highest: 0,
    };
    b.innings.add(d.match_id);
    if (wides === 0) b.balls += 1;
    b.runs += runsOffBat;
    if (runsOffBat === 4) b.fours += 1;
    if (runsOffBat === 6) b.sixes += 1;
    if (legal && runsOffBat === 0 && byes === 0 && legbyes === 0 && extras === 0) b.dots += 1;
    batterRunsTotal += runsOffBat;
    batters.set(d.striker, b);

    const innKey = `${d.match_id}|${d.innings}|${d.striker}`;
    batterPerInnings.set(innKey, (batterPerInnings.get(innKey) ?? 0) + runsOffBat);

    // Bowler: economy runs include wides + no-balls (SQL Q6).
    const bo = bowlers.get(d.bowler) ?? {
      bowler: d.bowler,
      matches: new Set(),
      legalBalls: 0,
      runs: 0,
      wickets: 0,
    };
    bo.matches.add(d.match_id);
    if (legal) bo.legalBalls += 1;
    bo.runs += runsOffBat + wides + noballs;
    if (BOWLER_WICKETS.has(wicket)) bo.wickets += 1;
    bowlerWicketsTotal += BOWLER_WICKETS.has(wicket) ? 1 : 0;
    bowlers.set(d.bowler, bo);

    const pmKey = `${d.match_id}|${d.bowler}`;
    const pm = bowlerPerMatch.get(pmKey) ?? { matchId: d.match_id, bowler: d.bowler, wickets: 0, runs: 0 };
    if (BOWLER_WICKETS.has(wicket)) pm.wickets += 1;
    pm.runs += runsOffBat + wides + noballs;
    bowlerPerMatch.set(pmKey, pm);

    if (num(d.innings) === 1) firstInnings.set(d.match_id, (firstInnings.get(d.match_id) ?? 0) + total);

    const itKey = `${d.match_id}|${d.innings}`;
    const it = inningsTotals.get(itKey) ?? {
      matchId: d.match_id,
      season: d.season,
      innings: num(d.innings),
      battingTeam: d.batting_team,
      total: 0,
      wickets: 0,
    };
    it.total += total;
    if (wicket !== "") it.wickets += 1;
    inningsTotals.set(itKey, it);
  }

  // Highest score per batter (innings totals computed above).
  for (const [key, runs] of batterPerInnings) {
    const batter = key.split("|")[2];
    const b = batters.get(batter);
    if (b && runs > b.highest) b.highest = runs;
  }

  // ---------------------------------------------------------------------
  // Shaped tables (mirror results/*.csv)
  // ---------------------------------------------------------------------
  const kpi = {
    matches: matches.length,
    total_runs: totalRuns,
    wickets: totalWickets,
    legal_balls: legalBalls,
    runs_per_over: round((totalRuns * 6) / legalBalls, 2),
  };

  const seasonSummary = seasons
    .map((season) => {
      const m = seasonMatches.get(season);
      const r = seasonRuns.get(season) ?? { runs: 0, wickets: 0 };
      return {
        season,
        matches: m.matches,
        venues: m.venues.size,
        cities: m.cities.size,
        runs: r.runs,
        wickets: r.wickets,
      };
    })
    .sort((a, b) => String(a.season).localeCompare(String(b.season)));

  const topRunScorers = [...batters.values()]
    .filter((b) => b.balls >= 500)
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 15)
    .map((b) => ({
      batter: b.batter,
      innings: b.innings.size,
      balls_faced: b.balls,
      runs: b.runs,
      strike_rate: round((b.runs * 100) / b.balls, 2),
    }));

  const topWicketTakers = [...bowlers.values()]
    .filter((b) => b.wickets >= 40)
    .sort((a, b) => b.wickets - a.wickets)
    .slice(0, 15)
    .map((b) => ({ bowler: b.bowler, matches: b.matches.size, wickets: b.wickets }));

  const bestEconomy = [...bowlers.values()]
    .filter((b) => b.legalBalls / 6 >= 30)
    .map((b) => ({
      bowler: b.bowler,
      overs: round(b.legalBalls / 6, 1),
      runs_conceded: b.runs,
      economy: round((b.runs * 6) / b.legalBalls, 2),
      legal_balls: b.legalBalls,
      matches: b.matches.size,
      wickets: b.wickets,
    }))
    .sort((a, b) => a.economy - b.economy)
    .slice(0, 15);

  const tossImpact = [...toss.values()]
    .map((t) => ({
      toss_decision: t.decision,
      matches: t.matches,
      toss_winner_won: t.tossWinnerWon,
      toss_winner_win_pct: round((t.tossWinnerWon * 100) / t.matches, 1),
    }))
    .sort((a, b) => a.toss_decision.localeCompare(b.toss_decision));

  const chaseDefend = seasons
    .map((season) => chase.get(season))
    .sort((a, b) => String(a.season).localeCompare(String(b.season)));

  const venueAverages = [...venueMatches.entries()]
    .map(([venue, matchCount]) => {
      let sum = 0;
      let n = 0;
      for (const m of matches) {
        if (m.venue !== venue) continue;
        const first = firstInnings.get(m.matchId);
        if (first === undefined) continue;
        sum += first;
        n += 1;
      }
      return { venue, matches: matchCount, avg_first_innings_total: n ? round(sum / n, 1) : 0 };
    })
    .sort((a, b) => b.matches - a.matches || a.venue.localeCompare(b.venue));

  const teamWins = [...teamWinCounts.entries()]
    .map(([team, wins]) => ({
      team,
      wins,
      seasons_active_wins: new Set(matches.filter((m) => m.winner === team).map((m) => m.season)).size,
      played: teamPlayed.get(team) ?? 0,
    }))
    .sort((a, b) => b.wins - a.wins);

  const headToHead = [...h2hCounts.entries()]
    .map(([key, wins]) => {
      const [team, opponent] = key.split("|");
      return { team, opponent, wins };
    })
    .sort((a, b) => b.wins - a.wins)
    .slice(0, 15);

  const highestTotals = [...inningsTotals.values()]
    .sort((a, b) => b.total - a.total)
    .slice(0, 12)
    .map((it) => ({
      batting_team: it.battingTeam,
      season: it.season,
      total: it.total,
      wickets: it.wickets,
      match_id: it.matchId,
    }));

  // ---------------------------------------------------------------------
  // Workbook-only aggregates (pivot sources)
  // ---------------------------------------------------------------------
  const battingTable = [...batters.values()]
    .sort((a, b) => b.runs - a.runs)
    .map((b) => ({
      batter: b.batter,
      innings: b.innings.size,
      balls_faced: b.balls,
      runs: b.runs,
      strike_rate: b.balls ? round((b.runs * 100) / b.balls, 1) : 0,
      fours: b.fours,
      sixes: b.sixes,
      dot_balls: b.dots,
      highest_score: b.highest,
    }));

  const bestByBowler = new Map();
  for (const pm of bowlerPerMatch.values()) {
    const current = bestByBowler.get(pm.bowler);
    if (
      !current ||
      pm.wickets > current.wickets ||
      (pm.wickets === current.wickets && pm.runs < current.runs)
    ) {
      bestByBowler.set(pm.bowler, pm);
    }
  }

  const bowlingTable = [...bowlers.values()]
    .filter((b) => b.legalBalls >= 60)
    .sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)
    .map((b) => {
      const best = bestByBowler.get(b.bowler);
      return {
        bowler: b.bowler,
        matches: b.matches.size,
        legal_balls: b.legalBalls,
        runs_conceded: b.runs,
        wickets: b.wickets,
        economy: round((b.runs * 6) / b.legalBalls, 2),
        average: b.wickets ? round(b.runs / b.wickets, 2) : null,
        strike_rate: b.wickets ? round(b.legalBalls / b.wickets, 1) : null,
        best_bowling: best ? `${best.wickets}/${best.runs}` : "",
      };
    });

  const teamSeasonTable = [...teamSeason.values()]
    .sort(
      (a, b) =>
        a.team.localeCompare(b.team) || String(a.season).localeCompare(String(b.season))
    )
    .map((t) => ({
      team: t.team,
      season: t.season,
      matches: t.matches,
      wins: t.wins,
      win_pct: t.matches ? round((t.wins * 100) / t.matches, 1) : 0,
    }));

  const wicketTypeTable = [...wicketTypes.entries()]
    .map(([type, count]) => ({
      type,
      count,
      share: round((count * 100) / totalWickets, 2),
      bowler_credited: BOWLER_WICKETS.has(type) ? "Yes" : "No",
    }))
    .sort((a, b) => b.count - a.count);

  const totals = {
    matches: matches.length,
    deliveryRowsTotal: deliveryRows.length,
    deliveries: counted,
    totalRuns,
    wickets: totalWickets,
    legalBalls,
    runsPerOver: kpi.runs_per_over,
    extrasRuns,
    fours,
    sixes,
    dotBalls,
    batterRunsTotal,
    bowlerWicketsTotal,
    teamWinsTotal: teamWins.reduce((sum, t) => sum + t.wins, 0),
    decidedMatches: matches.filter((m) => DECIDED.has(m.outcomeType)).length,
    seasonCount: seasons.length,
    venueCount: venueMatches.size,
  };

  const extended = {
    extrasShare: round(extrasRuns / totalRuns, 4),
    boundaryRuns: fours * 4 + sixes * 6,
    boundaryShare: round((fours * 4 + sixes * 6) / totalRuns, 4),
    dotRate: round(dotBalls / legalBalls, 4),
    caughtCount: wicketTypes.get("caught") ?? 0,
    caughtShare: round((wicketTypes.get("caught") ?? 0) / totalWickets, 4),
  };

  return {
    kpi,
    totals,
    extended,
    matches,
    extendedTable: [
      { metric: "Total matches", value: totals.matches, unit: "matches", note: "Every IPL match in the source (2008-2026)." },
      { metric: "Total runs", value: totals.totalRuns, unit: "runs", note: "Bat runs + extras, innings 1-2." },
      { metric: "Dismissals recorded", value: totals.wickets, unit: "wickets", note: "Every non-empty wicket_type, including retirements." },
      { metric: "Legal balls", value: totals.legalBalls, unit: "balls", note: "wides = 0 AND noballs = 0." },
      { metric: "Runs per over", value: totals.runsPerOver, unit: "runs/over", note: "Total runs / (legal balls / 6).", dp: 2 },
      { metric: "Balls scoring 4", value: totals.fours, unit: "balls", note: "Deliveries with exactly 4 runs off the bat." },
      { metric: "Balls scoring 6", value: totals.sixes, unit: "balls", note: "Deliveries with exactly 6 runs off the bat." },
      { metric: "Boundary runs", value: extended.boundaryRuns, unit: "runs", note: "4 x fours + 6 x sixes.", computed: true },
      { metric: "Extras", value: totals.extrasRuns, unit: "runs", note: "Wides + no-balls + byes + leg-byes + penalties." },
      { metric: "Dot balls", value: totals.dotBalls, unit: "balls", note: "Legal ball, no runs off bat, no byes/leg-byes." },
      { metric: "Caught dismissals", value: extended.caughtCount, unit: "wickets", note: "Largest single dismissal type." },
    ],
    seasonSummary,
    topRunScorers,
    topWicketTakers,
    bestEconomy,
    tossImpact,
    chaseDefend,
    venueAverages,
    teamWins,
    headToHead,
    highestTotals,
    battingTable,
    bowlingTable,
    teamSeasonTable,
    wicketTypeTable,
  };
}
