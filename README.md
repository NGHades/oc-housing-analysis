# Orange County Housing Market Analysis

A small data pipeline and analysis of Orange County, CA housing trends. It ingests public housing data, validates it with Pandera, documents definitions and assumptions, and reports findings with next steps.

> Status: in progress. Zillow and FRED are ingested and validated. Redfin data must be downloaded manually (its S3 bucket denies anonymous access), so `market_stats` is not yet loaded.

## Questions

1. How have home values changed over the last 5 years in Fountain Valley, Irvine, Anaheim, and nearby cities?
2. How do inventory and days on market move relative to price changes?
3. How do mortgage rate changes relate to price changes? (Descriptive only, no causal claims.)
4. Which cities diverged most from the county trend?

## Data

| Source | Dataset | Use |
| --- | --- | --- |
| Zillow Research | Home value index (ZHVI), city level | price trend |
| Redfin Data Center | Market tracker, city level | median sale price, inventory, days on market |
| FRED | 30-year mortgage rate | rate context |

Download the CSVs into `data/raw/` and check each source's license and terms before use. See `data/dictionary.md` for metric definitions and limitations.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install pandas pandera matplotlib pytest
```

## Usage

```bash
python src/ingest.py      # load raw CSVs into the database
python src/validate.py    # run Pandera checks, write reports/quality.md
python src/analysis.py    # run analysis, write charts to reports/charts/
pytest                    # test validation logic
```

## Project Structure

```
data/raw/            downloaded CSVs
data/dictionary.md   definitions, sources, known limits
src/                 ingest, schemas, validation, analysis
sql/analysis.sql     reusable queries
reports/             quality report, charts, findings
tests/               pytest tests
design.md            design and plan
```

## Data Quality

Pandera schemas check types, value ranges, duplicate (city, month) keys, null rates, city name consistency, and month-over-month outliers. Every check and its result is logged in `reports/quality.md`.

## Findings

_To be completed after the analysis runs._

- Dataset sizes: home_values 3,531 rows (11 cities, 2000-01 to 2026-09); mortgage_rates 667 monthly rows
- Quality issues found: 3 null ZHVI values (all 2004-03); no duplicates, gaps, or MoM outliers >20%. See `reports/quality.md`
- Main findings: _TBD_

## Limitations

- ZHVI is a smoothed estimate, not actual sale prices.
- Redfin data covers only the listings it tracks.
- Results are descriptive. Correlation here is not causation, and nothing in this project is a forecast.

## Next Steps

- Add ZIP-level analysis.
- Add an optional natural-language query layer that drafts read-only SQL, with validation.

See `design.md` for the full plan.
