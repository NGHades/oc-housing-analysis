"""Pandera schemas for each table."""
import pandera.pandas as pa

from config import CITIES, MAX_NULL_RATE


def null_rate_check(column: str) -> pa.Check:
    return pa.Check(
        lambda df: df[column].isna().mean() <= MAX_NULL_RATE,
        error=f"{column} null rate exceeds {MAX_NULL_RATE:.0%}",
    )


month_start = pa.Check(
    lambda s: s.dt.day == 1, error="month is not the first day of the month"
)
canonical_city = pa.Check.isin(CITIES, error="city not in canonical city list")

home_values_schema = pa.DataFrameSchema(
    {
        "city": pa.Column(str, canonical_city),
        "month": pa.Column("datetime64[ns]", month_start),
        "zhvi": pa.Column(float, pa.Check.gt(0), nullable=True),
    },
    unique=["city", "month"],
    checks=[null_rate_check("zhvi")],
    coerce=True,
    strict=True,
)

market_stats_schema = pa.DataFrameSchema(
    {
        "city": pa.Column(str, canonical_city),
        "month": pa.Column("datetime64[ns]", month_start),
        "median_sale_price": pa.Column(float, pa.Check.gt(0), nullable=True),
        "inventory": pa.Column(float, pa.Check.ge(0), nullable=True),
        "days_on_market": pa.Column(float, pa.Check.ge(0), nullable=True),
    },
    unique=["city", "month"],
    checks=[
        null_rate_check("median_sale_price"),
        null_rate_check("inventory"),
        null_rate_check("days_on_market"),
    ],
    coerce=True,
    strict=True,
)

mortgage_rates_schema = pa.DataFrameSchema(
    {
        "month": pa.Column("datetime64[ns]", month_start),
        "rate_30yr": pa.Column(float, pa.Check.in_range(0, 20), nullable=True),
    },
    unique=["month"],
    checks=[null_rate_check("rate_30yr")],
    coerce=True,
    strict=True,
)

SCHEMAS = {
    "home_values": home_values_schema,
    "market_stats": market_stats_schema,
    "mortgage_rates": mortgage_rates_schema,
}
