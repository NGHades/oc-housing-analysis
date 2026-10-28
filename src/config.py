"""Shared paths and settings."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "data" / "raw"
DB_PATH = ROOT / "data" / "housing.db"
REPORTS_DIR = ROOT / "reports"
CHARTS_DIR = REPORTS_DIR / "charts"

# Redfin's S3 bucket denies anonymous downloads (403), so redfin_city_market_tracker.tsv
# (or .tsv.gz) must be downloaded manually from redfin.com/news/data-center/downloads/ and is optional.
ZILLOW_FILE = RAW_DIR / "zillow_zhvi_city.csv"
REDFIN_FILE = RAW_DIR / "redfin_city_market_tracker.tsv"  # a .tsv000.gz of the same name also works
FRED_FILE = RAW_DIR / "fred_mortgage30us.csv"

STATE = "CA"
COUNTY = "Orange County"  # Zillow CountyName value
CITIES = [
    "Fountain Valley",
    "Irvine",
    "Anaheim",
    "Huntington Beach",
    "Santa Ana",
    "Costa Mesa",
    "Newport Beach",
    "Garden Grove",
    "Tustin",
    "Westminster",
    "Fullerton",
]

# Data quality thresholds
MAX_NULL_RATE = 0.10  # max share of missing values per measure column
OUTLIER_MOM_CHANGE = 0.20  # flag month-over-month changes larger than 20%
