import pandas as pd
import pandera as pa
import pytest

from schemas import home_values_schema, mortgage_rates_schema
from validate import find_missing_months, find_null_gaps, flag_outliers


def make_home_values(**overrides):
    df = pd.DataFrame(
        {
            "city": ["Irvine", "Irvine", "Anaheim", "Anaheim"],
            "month": pd.to_datetime(["2024-01-01", "2024-02-01"] * 2),
            "zhvi": [1_000_000.0, 1_010_000.0, 800_000.0, 805_000.0],
        }
    )
    return df.assign(**overrides)


def test_valid_home_values_pass():
    home_values_schema.validate(make_home_values())


def test_non_positive_price_fails():
    with pytest.raises(pa.errors.SchemaError):
        home_values_schema.validate(make_home_values(zhvi=[-1.0, 1.0, 2.0, 3.0]))


def test_duplicate_city_month_fails():
    df = make_home_values(month=pd.to_datetime(["2024-01-01"] * 4))
    with pytest.raises(pa.errors.SchemaError):
        home_values_schema.validate(df)


def test_high_null_rate_fails():
    df = make_home_values(zhvi=[None, None, None, 805_000.0])
    with pytest.raises(pa.errors.SchemaError):
        home_values_schema.validate(df)


def test_mortgage_rate_out_of_range_fails():
    df = pd.DataFrame({"month": pd.to_datetime(["2024-01-01"]), "rate_30yr": [45.0]})
    with pytest.raises(pa.errors.SchemaError):
        mortgage_rates_schema.validate(df)


def test_flag_outliers_finds_large_jump():
    df = pd.DataFrame(
        {
            "city": ["Irvine"] * 3,
            "month": pd.to_datetime(["2024-01-01", "2024-02-01", "2024-03-01"]),
            "zhvi": [100.0, 101.0, 160.0],
        }
    )
    flagged = flag_outliers(df, "zhvi", 0.20)
    assert list(flagged["zhvi"]) == [160.0]


def test_mid_month_date_fails():
    df = make_home_values(month=pd.to_datetime(["2024-01-15", "2024-02-01"] * 2))
    with pytest.raises(pa.errors.SchemaError):
        home_values_schema.validate(df)


def test_non_canonical_city_fails():
    df = make_home_values(city=["irvine", "irvine", "Anaheim", "Anaheim"])
    with pytest.raises(pa.errors.SchemaError):
        home_values_schema.validate(df)


def test_unexpected_column_fails():
    with pytest.raises((pa.errors.SchemaError, pa.errors.SchemaErrors)):
        home_values_schema.validate(make_home_values(extra=1))


def test_find_missing_months_detects_gap():
    df = pd.DataFrame(
        {
            "city": ["Irvine"] * 3,
            "month": pd.to_datetime(["2024-01-01", "2024-02-01", "2024-04-01"]),
        }
    )
    missing = find_missing_months(df)
    assert list(missing["month"]) == [pd.Timestamp("2024-03-01")]


def test_find_missing_months_continuous_is_empty():
    assert find_missing_months(make_home_values()).empty


def test_find_null_gaps_lists_null_rows():
    df = make_home_values(zhvi=[1.0, None, 3.0, 4.0])
    gaps = find_null_gaps(df, "zhvi")
    assert gaps.to_dict("records") == [{"city": "Irvine", "month": pd.Timestamp("2024-02-01")}]
