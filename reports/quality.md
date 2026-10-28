# Data quality report

Generated 2026-10-27. Thresholds: null rate <= 10%, MoM change <= 20%.

> Not validated (table not loaded): market_stats.

## Summary

| Table | Check | Result |
| --- | --- | --- |
| home_values | Schema (types, ranges, keys, null rate) | pass |
| home_values | Continuous months | pass |
| home_values | Null rate `zhvi` <= 10% | pass (0.1%) |
| home_values | MoM change `zhvi` <= 20% | pass (0) |
| mortgage_rates | Schema (types, ranges, keys, null rate) | pass |
| mortgage_rates | Continuous months | pass |
| mortgage_rates | Null rate `rate_30yr` <= 10% | pass (0.0%) |
| mortgage_rates | MoM change `rate_30yr` <= 20% | pass (0) |
| all | City names match across tables | skipped |

## home_values
- Rows: 3,531
- Months: 2000-01 to 2026-09
- Cities: 11
- Schema checks (types, ranges, keys, null-rate threshold): passed
- Missing months (continuity): 0
- Null rate `zhvi`: 0.1% (threshold 10%, pass)
  - Null rows by city/month:
    - city=Fountain Valley, month=2004-03
    - city=Huntington Beach, month=2004-03
    - city=Irvine, month=2004-03
- Month-over-month outliers `zhvi` (>20%): 0 (flag for review)

## mortgage_rates
- Rows: 667
- Months: 1971-04 to 2026-10
- Schema checks (types, ranges, keys, null-rate threshold): passed
- Missing months (continuity): 0
- Null rate `rate_30yr`: 0.0% (threshold 10%, pass)
- Month-over-month outliers `rate_30yr` (>20%): 0 (flag for review)

## City consistency
- Only 1 table(s) with a city column; cross-table comparison skipped.
