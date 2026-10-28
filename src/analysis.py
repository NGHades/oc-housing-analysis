"""Exploratory analysis and charts. Writes PNGs to reports/charts/."""
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd

from config import CHARTS_DIR
from validate import load_table


def indexed_prices(home_values: pd.DataFrame) -> pd.DataFrame:
    """Wide table of ZHVI indexed to 100 at each city's first non-null month."""
    wide = home_values.pivot(index="month", columns="city", values="zhvi").sort_index()
    return wide / wide.apply(lambda s: s.dropna().iloc[0]) * 100


def pct_change(home_values: pd.DataFrame, years: int) -> pd.Series:
    wide = home_values.pivot(index="month", columns="city", values="zhvi").sort_index()
    latest = wide.iloc[-1]
    earlier = wide.iloc[-1 - 12 * years]
    return ((latest / earlier - 1) * 100).sort_values()


def chart_indexed(index: pd.DataFrame) -> None:
    ax = index.plot(figsize=(10, 5), title="Home value index by city (start = 100)")
    ax.set_ylabel("Index")
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
    latest = market[market["month"] == market["month"].max()]
    ax = latest.plot.scatter(x="inventory", y="days_on_market", figsize=(7, 5),
                             title="Inventory vs days on market (latest month)")
    for _, row in latest.iterrows():
        ax.annotate(row["city"], (row["inventory"], row["days_on_market"]), fontsize=8)
    plt.tight_layout()
    plt.savefig(CHARTS_DIR / "inventory_vs_dom.png", dpi=150)
    plt.close()


def chart_rates_vs_prices(index: pd.DataFrame, rates: pd.DataFrame) -> None:
    county = index.mean(axis=1).rename("County average index")
    rate = rates.set_index("month")["rate_30yr"].reindex(county.index)
    fig, ax1 = plt.subplots(figsize=(10, 5))
    ax1.plot(county.index, county, color="tab:blue")
    ax1.set_ylabel("Home value index (start = 100)", color="tab:blue")
    ax2 = ax1.twinx()
    ax2.plot(rate.index, rate, color="tab:red")
    ax2.set_ylabel("30-year mortgage rate (%)", color="tab:red")
    ax1.set_title("County home value index vs 30-year mortgage rate")
    fig.tight_layout()
    fig.savefig(CHARTS_DIR / "rates_vs_prices.png", dpi=150)
    plt.close(fig)


def main() -> None:
    CHARTS_DIR.mkdir(parents=True, exist_ok=True)
    home_values = load_table("home_values")
    market = load_table("market_stats")
    rates = load_table("mortgage_rates")

    index = indexed_prices(home_values)
    one_year, five_year = pct_change(home_values, 1), pct_change(home_values, 5)
    print("1-year change (%):\n", one_year.round(1), "\n")
    print("5-year change (%):\n", five_year.round(1))

    chart_indexed(index)
    chart_five_year_change(five_year)
    chart_inventory_vs_dom(market)
    chart_rates_vs_prices(index, rates)


if __name__ == "__main__":
    main()
