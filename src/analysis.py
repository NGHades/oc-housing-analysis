"""Exploratory analysis and charts. Writes PNGs to reports/charts/.

"County" series here are the equal-weighted average of the configured cities,
not an official county index.
"""
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd

from config import CHARTS_DIR, REPORTS_DIR
from validate import load_table, table_exists

BASE_YEARS = 5  # indexed series start this many years before the latest month


def price_wide(home_values: pd.DataFrame) -> pd.DataFrame:
    """Months x cities table of ZHVI, trimmed to the last month every city has."""
    wide = home_values.pivot(index="month", columns="city", values="zhvi").sort_index()
    last_valid = wide.apply(pd.Series.last_valid_index).min()
    return wide.loc[:last_valid]


def indexed_prices(home_values: pd.DataFrame, years: int = BASE_YEARS) -> pd.DataFrame:
    """ZHVI indexed to 100 at a common base month `years` before the latest month."""
    wide = price_wide(home_values)
    base_month = wide.index.max() - pd.DateOffset(years=years)
    wide = wide.loc[base_month:]
    return wide / wide.iloc[0] * 100


def pct_change(home_values: pd.DataFrame, years: int) -> pd.Series:
    """Percent change from `years` before the latest month, looked up by date."""
    wide = price_wide(home_values)
    earlier_month = wide.index.max() - pd.DateOffset(years=years)
    if earlier_month not in wide.index:
        raise ValueError(f"No data for {earlier_month:%Y-%m}; cannot compute {years}-year change")
    latest, earlier = wide.iloc[-1], wide.loc[earlier_month]
    return ((latest / earlier - 1) * 100).sort_values()


def divergence(change: pd.Series) -> pd.Series:
    """Percentage-point gap between each city and the average city change."""
    return (change - change.mean()).sort_values()


def chart_indexed(index: pd.DataFrame) -> None:
    ax = index.plot(figsize=(10, 5), title=f"Home value index by city (start = 100, {index.index[0]:%Y-%m})")
    ax.set_ylabel("Index")
    ax.set_xlabel("")
    plt.tight_layout()
    plt.savefig(CHARTS_DIR / "indexed_prices.png", dpi=150)
    plt.close()


def chart_five_year_change(change: pd.Series) -> None:
    ax = change.plot.barh(figsize=(8, 5), title="5-year home value change (%)")
    ax.set_xlabel("% change")
    plt.tight_layout()
    plt.savefig(CHARTS_DIR / "five_year_change.png", dpi=150)
    plt.close()


def chart_inventory_vs_dom(market: pd.DataFrame) -> None:
    """Latest month with data for every plotted city, nulls dropped."""
    complete = market.dropna(subset=["inventory", "days_on_market"])
    latest = complete[complete["month"] == complete["month"].max()]
    ax = latest.plot.scatter(x="inventory", y="days_on_market", figsize=(7, 5),
                             title=f"Inventory vs days on market ({latest['month'].max():%Y-%m})")
    for _, row in latest.iterrows():
        ax.annotate(row["city"], (row["inventory"], row["days_on_market"]), fontsize=8)
    plt.tight_layout()
    plt.savefig(CHARTS_DIR / "inventory_vs_dom.png", dpi=150)
    plt.close()


def chart_rates_vs_prices(index: pd.DataFrame, rates: pd.DataFrame) -> None:
    """Dual-axis, descriptive only. Rates are limited to months with a price index."""
    avg = index.mean(axis=1)
    rate = rates.set_index("month")["rate_30yr"].reindex(avg.index)
    fig, ax1 = plt.subplots(figsize=(10, 5))
    ax1.plot(avg.index, avg, color="tab:blue")
    ax1.set_ylabel("Avg. city home value index (start = 100)", color="tab:blue")
    ax2 = ax1.twinx()
    ax2.plot(rate.index, rate, color="tab:red")
    ax2.set_ylabel("30-year mortgage rate, monthly avg (%)", color="tab:red")
    ax1.set_title("Avg. city home value index vs 30-year mortgage rate (descriptive only)")
    fig.tight_layout()
    fig.savefig(CHARTS_DIR / "rates_vs_prices.png", dpi=150)
    plt.close(fig)


def main() -> None:
    CHARTS_DIR.mkdir(parents=True, exist_ok=True)
    home_values = load_table("home_values")
    rates = load_table("mortgage_rates")

    index = indexed_prices(home_values)
    one_year, five_year = pct_change(home_values, 1), pct_change(home_values, 5)
    gap = divergence(five_year)
    print(f"Latest price month: {price_wide(home_values).index.max():%Y-%m}")
    print("1-year change (%):\n", one_year.round(1), "\n")
    print("5-year change (%):\n", five_year.round(1), "\n")
    print("5-year divergence from average city (pct points):\n", gap.round(1))

    summary = pd.DataFrame({"pct_change_1y": one_year, "pct_change_5y": five_year, "divergence_5y_pp": gap})
    summary.round(2).to_csv(REPORTS_DIR / "city_changes.csv", index_label="city")

    chart_indexed(index)
    chart_five_year_change(five_year)
    chart_rates_vs_prices(index, rates)
    if table_exists("market_stats"):
        chart_inventory_vs_dom(load_table("market_stats"))
    else:
        print("\nSkipping inventory_vs_dom chart: market_stats not loaded (Redfin file missing).")


if __name__ == "__main__":
    main()
