"""Run Pandera checks against each table and write reports/quality.md."""
import sqlite3
from datetime import date

import pandas as pd
import pandera.pandas as pa

from config import DB_PATH, MAX_NULL_RATE, OUTLIER_MOM_CHANGE, REPORTS_DIR
from schemas import SCHEMAS

MEASURES_EXCLUDED = ["city", "month"]


def load_table(name: str) -> pd.DataFrame:
    with sqlite3.connect(DB_PATH) as conn:
        return pd.read_sql(f"SELECT * FROM {name}", conn, parse_dates=["month"])


def table_exists(name: str) -> bool:
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute(
            "SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (name,)
        ).fetchone()
    return row is not None


def flag_outliers(df: pd.DataFrame, column: str, threshold: float) -> pd.DataFrame:
    """Rows where the month-over-month change in `column` exceeds `threshold`."""
    if "city" in df.columns:
        change = df.sort_values(["city", "month"]).groupby("city")[column].pct_change()
    else:
        change = df.sort_values("month")[column].pct_change()
    return df.loc[change[change.abs() > threshold].index]


def find_missing_months(df: pd.DataFrame) -> pd.DataFrame:
    """(city, month) pairs absent between each series' first and last month."""
    groups = df.groupby("city") if "city" in df.columns else [(None, df)]
    rows = []
    for city, g in groups:
        expected = pd.date_range(g["month"].min(), g["month"].max(), freq="MS")
        for m in expected.difference(g["month"]):
            rows.append({"city": city, "month": m})
    return pd.DataFrame(rows, columns=["city", "month"])


def find_null_gaps(df: pd.DataFrame, column: str) -> pd.DataFrame:
    """Rows present in the table but with a null `column`."""
    keys = [c for c in ("city", "month") if c in df.columns]
    return df.loc[df[column].isna(), keys]


def schema_failures(name: str, df: pd.DataFrame) -> pd.DataFrame:
    """Failure cases from the Pandera schema (empty frame if the table passes)."""
    try:
        SCHEMAS[name].validate(df, lazy=True)
    except pa.errors.SchemaErrors as err:
        return err.failure_cases
    return pd.DataFrame(columns=["column", "check", "failure_case"])


def _fmt_rows(df: pd.DataFrame, limit: int = 10) -> list[str]:
    shown = df.head(limit).copy()
    shown["month"] = pd.to_datetime(shown["month"]).dt.strftime("%Y-%m")
    lines = ["  - " + ", ".join(f"{k}={v}" for k, v in r.items()) for r in shown.to_dict("records")]
    if len(df) > limit:
        lines.append(f"  - ... and {len(df) - limit} more")
    return lines


def check_table(name: str, df: pd.DataFrame) -> tuple[list[str], list[tuple[str, str, str]]]:
    """Returns report lines and (table, check, result) summary rows."""
    summary: list[tuple[str, str, str]] = []
    lines = [f"## {name}", f"- Rows: {len(df):,}", f"- Months: {df['month'].min():%Y-%m} to {df['month'].max():%Y-%m}"]
    if "city" in df.columns:
        lines.append(f"- Cities: {df['city'].nunique()}")

    failures = schema_failures(name, df)
    if failures.empty:
        lines.append("- Schema checks (types, ranges, keys, null-rate threshold): passed")
        summary.append((name, "Schema (types, ranges, keys, null rate)", "pass"))
    else:
        lines.append(f"- Schema checks: {len(failures)} failure case(s)")
        counts = failures.groupby(["column", "check"], dropna=False).size()
        lines += [f"  - `{col}` / {chk}: {n}" for (col, chk), n in counts.items()]
        summary.append((name, "Schema (types, ranges, keys, null rate)", f"FAIL ({len(failures)})"))

    missing = find_missing_months(df)
    lines.append(f"- Missing months (continuity): {len(missing)}")
    lines += _fmt_rows(missing)
    summary.append((name, "Continuous months", "pass" if missing.empty else f"FAIL ({len(missing)})"))

    for col in df.columns.difference(MEASURES_EXCLUDED):
        rate = df[col].isna().mean()
        status = "pass" if rate <= MAX_NULL_RATE else "FAIL"
        lines.append(f"- Null rate `{col}`: {rate:.1%} (threshold {MAX_NULL_RATE:.0%}, {status})")
        summary.append((name, f"Null rate `{col}` <= {MAX_NULL_RATE:.0%}", f"{status} ({rate:.1%})"))
        gaps = find_null_gaps(df, col)
        if len(gaps):
            lines.append(f"  - Null rows by city/month:")
            lines += ["  " + l for l in _fmt_rows(gaps)]

        outliers = flag_outliers(df, col, OUTLIER_MOM_CHANGE)
        lines.append(f"- Month-over-month outliers `{col}` (>{OUTLIER_MOM_CHANGE:.0%}): {len(outliers)} (flag for review)")
        lines += _fmt_rows(outliers[[c for c in ("city", "month", col) if c in outliers.columns]])
        summary.append((name, f"MoM change `{col}` <= {OUTLIER_MOM_CHANGE:.0%}", f"{'pass' if outliers.empty else 'FLAG'} ({len(outliers)})"))
    return lines + [""], summary


def check_city_consistency(tables: dict[str, pd.DataFrame]) -> tuple[list[str], list[tuple[str, str, str]]]:
    city_sets = {n: set(df["city"]) for n, df in tables.items() if "city" in df.columns}
    lines = ["## City consistency"]
    if len(city_sets) < 2:
        lines.append(f"- Only {len(city_sets)} table(s) with a city column; cross-table comparison skipped.")
        return lines + [""], [("all", "City names match across tables", "skipped")]
    union = set.union(*city_sets.values())
    bad = 0
    for name, cities in city_sets.items():
        missing = sorted(union - cities)
        bad += len(missing)
        lines.append(f"- `{name}` missing cities: {', '.join(missing) if missing else 'none'}")
    return lines + [""], [("all", "City names match across tables", "pass" if not bad else f"FAIL ({bad})")]


def build_report() -> tuple[str, bool]:
    names = [n for n in SCHEMAS if table_exists(n)]
    absent = [n for n in SCHEMAS if n not in names]
    tables = {n: load_table(n) for n in names}

    body, summary = [], []
    for name, df in tables.items():
        lines, rows = check_table(name, df)
        body += lines
        summary += rows
    lines, rows = check_city_consistency(tables)
    body += lines
    summary += rows

    header = ["# Data quality report", "", f"Generated {date.today():%Y-%m-%d}. Thresholds: null rate <= {MAX_NULL_RATE:.0%}, MoM change <= {OUTLIER_MOM_CHANGE:.0%}.", ""]
    if absent:
        header += [f"> Not validated (table not loaded): {', '.join(absent)}.", ""]
    table = ["## Summary", "", "| Table | Check | Result |", "| --- | --- | --- |"]
    table += [f"| {t} | {c} | {r} |" for t, c, r in summary] + [""]
    ok = not any(r.startswith("FAIL") for _, _, r in summary)
    return "\n".join(header + table + body), ok


def main() -> int:
    report, ok = build_report()
    REPORTS_DIR.mkdir(exist_ok=True)
    (REPORTS_DIR / "quality.md").write_text(report)
    print(report)
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
