# Data Dictionary

Verified against files downloaded 2026-10-27.

## Tables

### home_values
Source: Zillow Research, ZHVI, all homes (SFR + condo), mid-tier (33rd-67th percentile), smoothed, seasonally adjusted, city level. File: `City_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv`, filtered to Orange County, CA (`CountyName`).

| Column | Definition | Notes |
| --- | --- | --- |
| city | City name, title-cased | Filtered to Orange County cities in `src/config.py` |
| month | First day of the month | |
| zhvi | Zillow Home Value Index, USD | Smoothed estimate of typical home value, not actual sale prices |

### market_stats
Source: Redfin Data Center, city market tracker. **Not yet loaded:** Redfin's S3 bucket returns 403 for anonymous downloads. Download manually from redfin.com/news/data-center/downloads/, unzip to `data/raw/redfin_city_market_tracker.tsv`, and re-run ingest.

| Column | Definition | Notes |
| --- | --- | --- |
| city | City name, title-cased | |
| month | First day of the month | |
| median_sale_price | Median sale price of homes sold, USD | Median, not average |
| inventory | Active listings | Only listings Redfin tracks |
| days_on_market | Median days on market (`median_dom`) | |

### mortgage_rates
Source: FRED, 30-year fixed mortgage rate.

| Column | Definition | Notes |
| --- | --- | --- |
| month | First day of the month | |
| rate_30yr | Monthly average of the weekly rate, percent | National, not local |

## Assumptions

- Weekly mortgage rates are averaged to monthly.
- Month is the join key across tables.
- City names are normalized to title case before joining.
- Zillow's month-end dates are mapped to month start.
- Only the cities listed in `src/config.py` are loaded (11 of 39 Orange County cities in the Zillow file).
- Null ZHVI values are kept as null, not imputed (3 rows: Fountain Valley, Huntington Beach, Irvine in 2004-03).
- The current month of the FRED series is a partial average of the weeks published so far.

## Recurring Questions

- How are missing months handled? (Currently none are missing; nulls are kept, not filled.)
- Do city names differ between sources (for example "Saint" vs "St.")?
- _Add questions that come up during analysis._
