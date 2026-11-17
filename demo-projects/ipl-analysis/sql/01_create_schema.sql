-- IPL cricket schema (SQLite).
--
-- Source: ball-by-ball data for 1,244 IPL matches (2008 onwards) from
-- https://cricsheet.org/downloads/ipl_csv2.zip, consolidated by
-- scripts/prepare_data.py into two flat tables.
--
-- Load with the sqlite3 CLI:
--   sqlite3 ipl.db < sql/01_create_schema.sql
--   sqlite3 ipl.db -cmd ".mode csv" \
--     -cmd ".import --skip 1 data/matches.csv matches" \
--     -cmd ".import --skip 1 data/deliveries.csv deliveries" \
--     "SELECT 'loaded';"
--
-- scripts/analyze.py builds the same schema in memory automatically.

CREATE TABLE matches (
    match_id        INTEGER PRIMARY KEY,
    season          TEXT NOT NULL,
    date            TEXT NOT NULL,
    city            TEXT,
    venue           TEXT NOT NULL,
    team1           TEXT NOT NULL,
    team2           TEXT NOT NULL,
    toss_winner     TEXT,
    toss_decision   TEXT,
    player_of_match TEXT,
    winner          TEXT,
    win_margin      INTEGER,
    outcome_type    TEXT
);

-- One row per delivery. Runs and extras are integers (0 when none).
-- wicket_type is '' when no wicket fell on this ball. "over" is derived
-- from the cricsheet ball number (floor): ball 0.1 → over 0, 19.6 → over 19.
CREATE TABLE deliveries (
    match_id          INTEGER NOT NULL REFERENCES matches(match_id),
    season            TEXT NOT NULL,
    innings           INTEGER NOT NULL,
    over              REAL NOT NULL,
    ball              REAL NOT NULL,
    batting_team      TEXT NOT NULL,
    bowling_team      TEXT NOT NULL,
    striker           TEXT NOT NULL,
    bowler            TEXT NOT NULL,
    runs_off_bat      INTEGER NOT NULL,
    extras            INTEGER NOT NULL,
    wides             INTEGER NOT NULL,
    noballs           INTEGER NOT NULL,
    byes              INTEGER NOT NULL,
    legbyes           INTEGER NOT NULL,
    penalty           INTEGER NOT NULL,
    wicket_type       TEXT NOT NULL,
    player_dismissed  TEXT
);

CREATE INDEX idx_deliveries_match ON deliveries(match_id);
CREATE INDEX idx_deliveries_striker ON deliveries(striker);
CREATE INDEX idx_deliveries_bowler ON deliveries(bowler);
