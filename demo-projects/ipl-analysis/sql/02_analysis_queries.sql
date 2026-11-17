-- IPL cricket analytics (SQLite) — real ball-by-ball data from cricsheet.org.
--
-- Each block starts with a "-- Q<n> name" marker; scripts/analyze.py parses
-- these markers and writes results/<name>.csv for every query.
--
-- Conventions:
--   * A "legal ball" is one that is neither a wide nor a no-ball
--     (wides = 0 AND noballs = 0).
--   * Wickets credited to the bowler: bowled, caught, lbw, stumped,
--     caught and bowled, hit wicket. Run-outs and retirements are excluded.
--   * Franchise names are kept exactly as in the source data — renamed
--     franchises (e.g. Deccan Chargers vs Sunrisers Hyderabad) are counted
--     under the name used at the time.

-- Q1 kpi_summary
SELECT (SELECT COUNT(*) FROM matches)                                        AS matches,
       SUM(runs_off_bat + extras)                                            AS total_runs,
       SUM(CASE WHEN wicket_type <> '' THEN 1 ELSE 0 END)                    AS wickets,
       SUM(CASE WHEN wides = 0 AND noballs = 0 THEN 1 ELSE 0 END)            AS legal_balls,
       ROUND(SUM(runs_off_bat + extras) * 1.0
             / (SUM(CASE WHEN wides = 0 AND noballs = 0 THEN 1 ELSE 0 END) * 1.0 / 6), 2)
                                                                             AS runs_per_over
FROM deliveries
WHERE innings <= 2;

-- Q2 season_matches
SELECT season,
       COUNT(*)                         AS matches,
       COUNT(DISTINCT venue)            AS venues,
       COUNT(DISTINCT city)             AS cities
FROM matches
GROUP BY season
ORDER BY season;

-- Q3 season_runs
SELECT d.season,
       SUM(d.runs_off_bat + d.extras)   AS runs,
       SUM(CASE WHEN d.wicket_type <> '' THEN 1 ELSE 0 END) AS wickets
FROM deliveries AS d
WHERE d.innings <= 2
GROUP BY d.season
ORDER BY d.season;

-- Q4 top_run_scorers
SELECT striker                                   AS batter,
       COUNT(DISTINCT match_id)                  AS innings,
       SUM(CASE WHEN wides = 0 THEN 1 ELSE 0 END) AS balls_faced,
       SUM(runs_off_bat)                         AS runs,
       ROUND(SUM(runs_off_bat) * 100.0
             / SUM(CASE WHEN wides = 0 THEN 1 ELSE 0 END), 2) AS strike_rate
FROM deliveries
WHERE innings <= 2
GROUP BY striker
HAVING balls_faced >= 500
ORDER BY runs DESC
LIMIT 15;

-- Q5 top_wicket_takers
SELECT bowler,
       COUNT(DISTINCT match_id)                  AS matches,
       SUM(CASE WHEN wicket_type IN ('bowled', 'caught', 'lbw', 'stumped',
                                     'caught and bowled', 'hit wicket')
                THEN 1 ELSE 0 END)               AS wickets
FROM deliveries
WHERE innings <= 2
GROUP BY bowler
HAVING wickets >= 40
ORDER BY wickets DESC
LIMIT 15;

-- Q6 best_economy
SELECT bowler,
       ROUND(SUM(CASE WHEN wides = 0 AND noballs = 0 THEN 1 ELSE 0 END) * 1.0 / 6, 1) AS overs,
       SUM(runs_off_bat + wides + noballs)       AS runs_conceded,
       ROUND(SUM(runs_off_bat + wides + noballs) * 6.0
             / SUM(CASE WHEN wides = 0 AND noballs = 0 THEN 1 ELSE 0 END), 2) AS economy
FROM deliveries
WHERE innings <= 2
GROUP BY bowler
HAVING overs >= 30
ORDER BY economy ASC
LIMIT 15;

-- Q7 toss_impact
SELECT toss_decision,
       COUNT(*)                                  AS matches,
       SUM(CASE WHEN toss_winner = winner THEN 1 ELSE 0 END) AS toss_winner_won,
       ROUND(SUM(CASE WHEN toss_winner = winner THEN 1 ELSE 0 END) * 100.0
             / COUNT(*), 1)                      AS toss_winner_win_pct
FROM matches
WHERE outcome_type = 'win_by_runs' OR outcome_type = 'win_by_wickets'
GROUP BY toss_decision
ORDER BY toss_decision;

-- Q8 chase_defend_by_season
SELECT season,
       SUM(CASE WHEN outcome_type = 'win_by_runs' THEN 1 ELSE 0 END)     AS defended,
       SUM(CASE WHEN outcome_type = 'win_by_wickets' THEN 1 ELSE 0 END)  AS chased,
       SUM(CASE WHEN outcome_type = 'tie' THEN 1 ELSE 0 END)             AS ties,
       SUM(CASE WHEN outcome_type = 'no result' THEN 1 ELSE 0 END)       AS no_result
FROM matches
GROUP BY season
ORDER BY season;

-- Q9 venue_avg_first_innings
WITH first_innings AS (
    SELECT match_id,
           SUM(runs_off_bat + extras) AS total
    FROM deliveries
    WHERE innings = 1
    GROUP BY match_id
),
venue_matches AS (
    SELECT venue, COUNT(*) AS matches
    FROM matches
    GROUP BY venue
)
SELECT m.venue,
       vm.matches,
       ROUND(AVG(fi.total), 1) AS avg_first_innings_total
FROM matches AS m
JOIN first_innings AS fi ON fi.match_id = m.match_id
JOIN venue_matches AS vm ON vm.venue = m.venue
GROUP BY m.venue
ORDER BY vm.matches DESC
LIMIT 12;

-- Q10 team_wins
SELECT winner                AS team,
       COUNT(*)              AS wins,
       COUNT(DISTINCT season) AS seasons_active_wins
FROM matches
WHERE outcome_type = 'win_by_runs' OR outcome_type = 'win_by_wickets'
GROUP BY winner
ORDER BY wins DESC;

-- Q11 head_to_head
WITH decided AS (
    SELECT winner,
           CASE WHEN winner = team1 THEN team2 ELSE team1 END AS opponent
    FROM matches
    WHERE outcome_type = 'win_by_runs' OR outcome_type = 'win_by_wickets'
)
SELECT winner AS team,
       opponent,
       COUNT(*) AS wins
FROM decided
GROUP BY winner, opponent
ORDER BY wins DESC
LIMIT 15;

-- Q12 highest_team_totals
WITH innings_totals AS (
    SELECT match_id,
           season,
           innings,
           batting_team,
           SUM(runs_off_bat + extras) AS total,
           SUM(CASE WHEN wicket_type <> '' THEN 1 ELSE 0 END) AS wickets
    FROM deliveries
    WHERE innings <= 2
    GROUP BY match_id, innings
)
SELECT batting_team,
       season,
       total,
       wickets,
       match_id
FROM innings_totals
ORDER BY total DESC
LIMIT 12;
