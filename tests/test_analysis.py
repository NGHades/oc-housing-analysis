import gzip

import pandas as pd
import pytest

from analysis import divergence, indexed_prices, pct_change
from ingest import load_redfin


def make_values(months=72, with_null=False):
    idx = pd.date_range("2020-01-01", periods=months, freq="MS")
    rows = []
    for city, start, step in [("Irvine", 100.0, 1.0), ("Anaheim", 100.0, 0.5)]:
        for i, m in enumerate(idx):
            rows.append({"city": city, "month": m, "zhvi": start + step * i})
    df = pd.DataFrame(rows)
    if with_null:
        df.loc[(df.city == "Irvine") & (df.month == idx[3]), "zhvi"] = None
    return df


def test_pct_change_uses_dates_not_positions():
    df = make_values()
    # drop a middle month: positional lookup would now be off by one
    df = df[df.month != pd.Timestamp("2023-06-01")]
    change = pct_change(df, 1)
    latest = df.month.max()
    earlier = latest - pd.DateOffset(years=1)
    irvine = df[df.city == "Irvine"].set_index("month")["zhvi"]
    assert change["Irvine"] == pytest.approx((irvine[latest] / irvine[earlier] - 1) * 100)


def test_pct_change_raises_when_window_missing():
    with pytest.raises(ValueError):
        pct_change(make_values(months=6), 5)


def test_indexed_prices_share_common_base():
    index = indexed_prices(make_values(), years=2)
    assert (index.iloc[0] == 100).all()


def test_indexed_prices_trims_to_common_last_month():
    df = make_values()
    df = df[~((df.city == "Anaheim") & (df.month == df.month.max()))]
    assert indexed_prices(df, years=2).index.max() == df.month.max() - pd.DateOffset(months=1)


def test_divergence_sums_to_zero():
    assert divergence(pd.Series({"a": 10.0, "b": 30.0, "c": 20.0})).sum() == pytest.approx(0)


def test_load_redfin_keeps_only_configured_ca_cities(tmp_path):
    rows = [
        # region, state_code, property_type, period_duration, period_begin, price, inv, dom
        ("Irvine, CA", "CA", "All Residential", 30, "2024-01-01", 1.0e6, 100, 20),
        ("Irvine, CA", "CA", "Condo/Co-op", 30, "2024-01-01", 5.0e5, 10, 25),
        ("Irvine, CA", "CA", "All Residential", 7, "2024-01-01", 1.0e6, 100, 20),
        ("Westminster, CO", "CO", "All Residential", 30, "2024-01-01", 6.0e5, 50, 30),
        ("Boise, ID", "ID", "All Residential", 30, "2024-01-01", 5.0e5, 50, 30),
    ]
    df = pd.DataFrame(rows, columns=["region", "state_code", "property_type", "period_duration",
                                     "period_begin", "median_sale_price", "inventory", "median_dom"])
    path = tmp_path / "city.tsv.gz"
    with gzip.open(path, "wt") as f:
        df.to_csv(f, sep="\t", index=False)
    out = load_redfin(path)
    assert out["city"].tolist() == ["Irvine"]
    assert out["days_on_market"].tolist() == [20]
