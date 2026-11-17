#!/usr/bin/env python3
"""Build data/matches.csv and data/deliveries.csv from cricsheet.org IPL data.

Downloads https://cricsheet.org/downloads/ipl_csv2.zip (unless the zip already
exists next to this script), extracts it, and consolidates the per-match CSVs
into two flat files:

  data/matches.csv     one row per match (from the *_info.csv metadata files)
  data/deliveries.csv  one row per ball, 18 columns, from the match CSVs

Normalization (identical to what produced the committed data):
  * info-file date 2017/04/05 -> 2017-04-05
  * season comes from the info file, so matches and deliveries share one
    label per match (cricsheet uses "2007/08", "2009/10", "2020/21" for the
    inaugural/cross-year seasons)
  * the source has no "over" column; over is derived as floor(ball)
  * empty numeric fields become 0
  * all_matches.csv (cricsheet's aggregate file) is ignored

Source data license: ODC Attribution License (ODC-By) — https://cricsheet.org/

Usage:
    python scripts/prepare_data.py [path/to/ipl_csv2.zip]
"""

import csv
import io
import os
import sys
import urllib.request
import zipfile

ZIP_URL = "https://cricsheet.org/downloads/ipl_csv2.zip"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "data")

MATCH_HEADER = ["match_id", "season", "date", "city", "venue", "team1", "team2",
                "toss_winner", "toss_decision", "player_of_match", "winner",
                "win_margin", "outcome_type"]
DELIVERY_HEADER = ["match_id", "season", "innings", "over", "ball",
                   "batting_team", "bowling_team", "striker", "bowler",
                   "runs_off_bat", "extras", "wides", "noballs", "byes",
                   "legbyes", "penalty", "wicket_type", "player_dismissed"]
NUMERIC_FIELDS = ["match_id", "innings", "ball", "runs_off_bat", "extras",
                  "wides", "noballs", "byes", "legbyes", "penalty"]
BOWLER_WICKETS = {"bowled", "caught", "lbw", "stumped", "caught and bowled",
                  "hit wicket"}  # kept for reference; wicket_type is stored raw


def num(value):
    return 0 if value is None or value == "" else int(float(value))


def get_zip(zip_path):
    if zip_path and os.path.exists(zip_path):
        return zip_path
    local = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ipl_csv2.zip")
    if os.path.exists(local):
        return local
    print(f"downloading {ZIP_URL} ...")
    urllib.request.urlretrieve(ZIP_URL, local)
    return local


def parse_info_csv(text):
    """Return the match summary dict from a *_info.csv file."""
    info = {}
    teams = []
    for row in csv.reader(io.StringIO(text)):
        if not row or row[0] != "info":
            continue
        key = row[1]
        if key == "team":
            teams.append(row[2])
        elif key == "date":
            info["date"] = row[2].replace("/", "-")
        else:
            info[key] = ",".join(row[2:])
    info["team1"] = teams[0] if teams else ""
    info["team2"] = teams[1] if len(teams) > 1 else ""
    if info.get("winner"):
        if info.get("winner_runs"):
            info["outcome_type"], info["win_margin"] = "win_by_runs", info["winner_runs"]
        elif info.get("winner_wickets"):
            info["outcome_type"], info["win_margin"] = "win_by_wickets", info["winner_wickets"]
        else:
            info["outcome_type"], info["win_margin"] = "win", ""
    elif info.get("outcome"):
        info["outcome_type"] = info["outcome"]
        info["win_margin"] = ""
    else:
        info["outcome_type"], info["win_margin"] = "", ""
    return info


def consolidate(zip_path):
    match_rows = []
    delivery_rows = []
    with zipfile.ZipFile(zip_path) as zf:
        info_names = sorted(n for n in zf.namelist()
                            if n.endswith("_info.csv") and "/" not in n)
        for name in info_names:
            info = parse_info_csv(zf.read(name).decode("utf-8-sig"))
            match_rows.append([
                info.get("match_id", ""), info.get("season", ""), info.get("date", ""),
                info.get("city", ""), info.get("venue", ""), info["team1"],
                info["team2"], info.get("toss_winner", ""), info.get("toss_decision", ""),
                info.get("player_of_match", ""), info.get("winner", ""),
                info.get("win_margin", ""), info.get("outcome_type", ""),
            ])

            ball_name = name.replace("_info.csv", ".csv")
            if ball_name not in zf.namelist():
                continue
            reader = csv.DictReader(io.StringIO(zf.read(ball_name).decode("utf-8-sig")))
            for ball in reader:
                ball_val = num(ball.get("ball"))
                delivery_rows.append([
                    num(ball.get("match_id")), info.get("season", ""),
                    num(ball.get("innings")), int(ball_val // 1), ball_val,
                    ball.get("batting_team", ""), ball.get("bowling_team", ""),
                    ball.get("striker", ""), ball.get("bowler", ""),
                    num(ball.get("runs_off_bat")), num(ball.get("extras")),
                    num(ball.get("wides")), num(ball.get("noballs")),
                    num(ball.get("byes")), num(ball.get("legbyes")),
                    num(ball.get("penalty")), ball.get("wicket_type", ""),
                    ball.get("player_dismissed", ""),
                ])
    return match_rows, delivery_rows


def main():
    zip_path = get_zip(sys.argv[1] if len(sys.argv) > 1 else None)
    match_rows, delivery_rows = consolidate(zip_path)
    os.makedirs(DATA_DIR, exist_ok=True)
    for file_name, header, rows in (
        ("matches.csv", MATCH_HEADER, match_rows),
        ("deliveries.csv", DELIVERY_HEADER, delivery_rows),
    ):
        with open(os.path.join(DATA_DIR, file_name), "w", newline="", encoding="utf-8") as fh:
            writer = csv.writer(fh)
            writer.writerow(header)
            writer.writerows(rows)
        print(f"data/{file_name}: {len(rows)} rows")


if __name__ == "__main__":
    main()
