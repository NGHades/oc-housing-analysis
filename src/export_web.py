"""Export analysis and validation results as JSON for the web frontend.

Writes web/src/data/housing.json. Run after ingest.py:
    python src/export_web.py
"""
import json
from datetime import date

import pandas as pd

from analysis import divergence, indexed_prices, pct_change, price_wide
from config import MAX_NULL_RATE, OUTLIER_MOM_CHANGE, ROOT
from schemas import SCHEMAS
from validate import (
    check_city_consistency,
    check_table,
    find_null_gaps,
    load_table,
    table_exists,
)

OUT_PATH = ROOT / "web" / "src" / "data" / "housing.json"


def month_str(ts: pd.Timestamp) -> str:
    return f"{ts:%Y-%m}"


def records(df: pd.DataFrame) -> list[dict]:
    """DataFrame rows as JSON-safe dicts (NaN becomes null)."""
    return json.loads(df.to_json(orient="records"))


def price_series(home_values: pd.DataFrame) -> list[dict]:
    wide = price_wide(home_values).round(0)
    wide.index = wide.index.map(month_str)
    return records(wide.reset_index().rename(columns={"month": "month"}))


def indexed_series(home_values: pd.DataFrame) -> list[dict]:
    index = indexed_prices(home_values).round(2)
    index.insert(0, "Average", index.mean(axis=1).round(2))
    index.index = index.index.map(month_str)
    return records(index.reset_index())


def city_summary(home_values: pd.DataFrame) -> list[dict]:
    wide = price_wide(home_values)
    one, five = pct_change(home_values, 1), pct_change(home_values, 5)
    gap = divergence(five)
    table = pd.DataFrame(
        {
            "latest_zhvi": wide.iloc[-1].round(0),
            "pct_change_1y": one.round(2),
            "pct_change_5y": five.round(2),
            "divergence_5y_pp": gap.round(2),
        }
    )
    return records(table.sort_values("pct_change_5y", ascending=False).reset_index())


def rate_series(rates: pd.DataFrame) -> list[dict]:
    out = rates.assign(month=rates["month"].map(month_str)).rename(columns={"rate_30yr": "rate"})
    out["rate"] = out["rate"].round(3)
    return records(out)


def quality_section(tables: dict[str, pd.DataFrame]) -> dict:
    checks, table_info, null_gaps = [], [], []
    for name, df in tables.items():
        _, rows = check_table(name, df)
        checks += [{"table": t, "check": c, "result": r} for t, c, r in rows]
        table_info.append(
            {
                "name": name,
                "rows": len(df),
                "first_month": month_str(df["month"].min()),
                "last_month": month_str(df["month"].max()),
                "cities": int(df["city"].nunique()) if "city" in df.columns else None,
            }
        )
        for col in df.columns.difference(["city", "month"]):
            gaps = find_null_gaps(df, col)
            null_gaps += [
                {"table": name, "column": col, "city": r.get("city"), "month": month_str(r["month"])}
                for r in gaps.to_dict("records")
            ]
    _, rows = check_city_consistency(tables)
    checks += [{"table": t, "check": c, "result": r} for t, c, r in rows]
    for c in checks:
        c["status"] = c["result"].split(" ")[0].lower()  # pass | fail | flag | skipped
    return {
        "checks": checks,
        "tables": table_info,
        "null_gaps": null_gaps,
        "not_loaded": [n for n in SCHEMAS if n not in tables],
        "thresholds": {"max_null_rate": MAX_NULL_RATE, "max_mom_change": OUTLIER_MOM_CHANGE},
    }


def main() -> None:
    tables = {n: load_table(n) for n in SCHEMAS if table_exists(n)}
    home_values, rates = tables["home_values"], tables["mortgage_rates"]
    latest = price_wide(home_values).index.max()
    payload = {
        "generated": f"{date.today():%Y-%m-%d}",
        "latest_price_month": month_str(latest),
        "cities": sorted(home_values["city"].unique()),
        "prices": price_series(home_values),
        "indexed": indexed_series(home_values),
        "summary": city_summary(home_values),
        "rates": rate_series(rates),
        "quality": quality_section(tables),
    }
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(payload, indent=1))
    print(f"Wrote {OUT_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
