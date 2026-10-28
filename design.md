# Orange County Housing Market Analysis: Design

A one-day data project: ingest public housing data, validate it, document it, analyze it in SQL and pandas, and report findings with clear next steps.

## Goals

- Organize and inspect structured real estate data from public sources.
- Show data quality checks, not just analysis.
- Document definitions, assumptions, and recurring questions.
- Turn the analysis into a short findings and next-steps report.

## Non-goals

- No price prediction or forecasting claims.
- No scraping. Use only downloadable public datasets.
- No production deployment or dashboards beyond static charts.

## Key Questions

1. How have home values changed over the last 5 years in Fountain Valley, Irvine, Anaheim, and other nearby cities?
2. How do inventory and days on market move relative to price changes?
3. How do mortgage rate changes relate to price changes? (Descriptive only; no causal claims.)
4. Which cities diverged most from the county trend?

## Data Sources

Confirm download links, column names, and license terms before starting.

| Source | Dataset | Grain | Use |
| --- | --- | --- | --- |
| Zillow Research | Home value index (ZHVI) | city or ZIP, monthly | price trend |
| Redfin Data Center | Market tracker | city, monthly | median sale price, inventory, days on market |
| FRED | 30-year mortgage rate | national, weekly or monthly | rate context |

## Architecture

```
raw CSVs  ->  ingest.py  ->  validate.py (Pandera)  ->  SQLite/Postgres
                                                        |
                              analysis.sql / analysis.py (pandas)
                                                        |
                                           charts/  +  findings.md
```

## Repository Layout

```
oc-housing-analysis/
  design.md
  README.md              findings summary, how to run
  data/raw/              downloaded CSVs (git-ignored if large)
  data/dictionary.md     definitions, sources, known limits
  src/ingest.py          load CSVs into the database
  src/schemas.py         Pandera schemas
  src/validate.py        run checks, write a quality report
  sql/analysis.sql       reusable queries
  src/analysis.py        pandas analysis, chart generation
  reports/quality.md     checks run and issues found
  reports/charts/        PNG charts
  reports/findings.md    findings, assumptions, next steps
  tests/                 pytest tests for validation logic
```

## Data Model

- `home_values(city, month, zhvi)`
- `market_stats(city, month, median_sale_price, inventory, days_on_market)`
- `mortgage_rates(date, rate_30yr)`
- Normalize city names to one canonical form so tables join cleanly.
- Use month start as the date key across tables.

## Data Quality Checks (Pandera)

- **Types and ranges:** prices > 0, rates between 0 and 20, days on market >= 0.
- **Keys:** no duplicate (city, month) rows.
- **Completeness:** null rate per column below an agreed threshold; list gaps by city and month.
- **Consistency:** city names match across tables; months are continuous.
- **Outliers:** flag month-over-month price changes beyond a set threshold for manual review.

Every failed check is logged with counts in `reports/quality.md`. Record what was dropped, fixed, or kept, and why.

## Analysis Plan

1. Normalize price series to an index (start = 100) for comparison.
2. Compute 1-year and 5-year percent change per city.
3. Compare inventory and days on market against price change by city.
4. Overlay mortgage rates on the county price trend.
5. Rank cities by divergence from the county average.

## Charts

- Indexed price trend by city (line).
- 5-year percent change by city (bar).
- Inventory versus days on market (scatter).
- Mortgage rate against county price trend (dual-axis line, clearly labeled).

## Documentation

`data/dictionary.md` defines each metric, its source, and its limits. Examples:

- Median versus average sale price.
- ZHVI is a smoothed estimate, not actual sale prices.
- Redfin counts only the listings it covers.

Include an "Assumptions" section and a "Recurring questions" section (for example, how are missing months handled?).

## Optional: Natural Language Query Layer

Only if time allows.

- A script takes a plain-English question and has an LLM draft SQL against the schema.
- Safety: read-only connection, allow only `SELECT`, validate the SQL before running, and show the query alongside results.
- Evaluate with 10 hand-written questions and record how many produce correct SQL.

## Timeline (about 8 hours)

| Block | Task |
| --- | --- |
| 1 hr | Download data, create schema, ingest |
| 1-2 hrs | Pandera schemas, validation, quality report |
| 1 hr | Data dictionary and assumptions |
| 2 hrs | SQL and pandas analysis |
| 1 hr | Charts and findings |
| 1 hr | README, tests, cleanup, push to GitHub |

## Definition of Done

- [ ] Pipeline runs end to end from raw CSVs with one command.
- [ ] Quality report lists every check and its result.
- [ ] Data dictionary and assumptions are written.
- [ ] 3-4 charts and a findings section with next steps.
- [ ] README explains how to run it and states limitations honestly.
- [ ] Record real numbers for the resume: row counts, issues found, main finding.

## Risks

- **Data format changes:** column names differ from what is assumed. Check the files first.
- **City name mismatches:** budget time for normalization.
- **Overclaiming:** keep conclusions descriptive; correlation is not causation.
