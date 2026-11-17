# -*- coding: utf-8 -*-
"""Rebuild every retail-sales output in the correct order.

Usage:
    python run_all.py
"""
from __future__ import annotations

import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SCRIPTS = [
    "run_analysis.py",
    "build_reports.py",
    "build_excel_report.py",
    "build_onesheet_bi.py",
]


def main() -> int:
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    for script in SCRIPTS:
        path = os.path.join(ROOT, script)
        if not os.path.exists(path):
            print(f"Missing script: {script}", file=sys.stderr)
            return 1
        print(f"\n=== {script} ===", flush=True)
        result = subprocess.run([sys.executable, path], cwd=ROOT, env=env)
        if result.returncode != 0:
            print(f"FAILED: {script} (exit {result.returncode})", file=sys.stderr)
            return result.returncode
    print("\nAll outputs rebuilt successfully.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
