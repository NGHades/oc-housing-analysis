"""Load raw CSVs, normalize them, and write tables to SQLite.

Column names below match the sources as last known. Check them against the
files you downloaded and adjust if a source changed its format.
"""
import re
import sqlite3

import pandas as pd

from config import CITIES, COUNTY, DB_PATH, FRED_FILE, RAW_DIR, REDFIN_FILE, STATE, ZILLOW_FILE


def normalize_city(name: str) -> str:
    return " ".join(str(name).split()).title()


def to_month_start(series: pd.Series) -> pd.Series:
    return pd.to_datetime(series).dt.to_period("M").dt.to_timestamp()


def load_zillow(path=ZILLOW_FILE) -> pd.DataFrame:
    """Zillow ZHVI city file is wide: one column per month. Melt to long."""
    df = pd.read_csv(path)
    df = df[df["State"] == STATE]
    if "CountyName" in df.columns:
        df = df[df["CountyName"] == COUNTY]
    date_cols = [c for c in df.columns if re.match(r"\d{4}-\d{2}-\d{2}$", c)]
    long = df.melt(
        id_vars=["RegionName"], value_vars=date_cols, var_name="month", value_name="zhvi"
    )
    long["city"] = long["RegionName"].map(normalize_city)
    long["month"] = to_month_start(long["month"])
    long = long[long["city"].isin(CITIES)]
    return long[["city", "month", "zhvi"]].sort_values(["city", "month"]).reset_index(drop=True)


def load_redfin(path=REDFIN_FILE) -> pd.DataFrame:
    """Redfin city market tracker (tab-separated)."""
    df = pd.read_csv(path, sep="\t")
    if "property_type" in df.columns:
        df = df[df["property_type"] == "All Residential"]
    if "period_duration" in df.columns:
        df = df[df["period_duration"] == 30]  # monthly rows
    df["city"] = df["region"].str.split(",").str[0].map(normalize_city)
    df["month"] = to_month_start(df["period_begin"])
    df = df.rename(columns={"median_dom": "days_on_market"})
    df = df[df["city"].isin(CITIES)]
    cols = ["city", "month", "median_sale_price", "inventory", "days_on_market"]
    return df[cols].sort_values(["city", "month"]).reset_index(drop=True)


def load_fred(path=FRED_FILE) -> pd.DataFrame:
    """FRED weekly 30-year mortgage rate. Averaged to monthly."""
    df = pd.read_csv(path)
    date_col, rate_col = df.columns[0], df.columns[1]
    df[rate_col] = pd.to_numeric(df[rate_col], errors="coerce")
    df["month"] = to_month_start(df[date_col])
    monthly = df.groupby("month", as_index=False)[rate_col].mean()
    return monthly.rename(columns={rate_col: "rate_30yr"})


def main() -> None:
    tables = {
        "home_values": load_zillow(),
        "mortgage_rates": load_fred(),
    }
    if REDFIN_FILE.exists():
        tables["market_stats"] = load_redfin()
    else:
        print(f"Skipping market_stats: {REDFIN_FILE.name} not found in {RAW_DIR}")
    with sqlite3.connect(DB_PATH) as conn:
        for name, df in tables.items():
            df.to_sql(name, conn, if_exists="replace", index=False)
            print(f"{name}: {len(df):,} rows")


if __name__ == "__main__":
    main()
