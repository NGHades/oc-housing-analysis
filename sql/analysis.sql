-- Reusable queries. Run with: sqlite3 data/housing.db < sql/analysis.sql

-- Latest ZHVI per city
SELECT city, month, zhvi
FROM home_values
WHERE month = (SELECT MAX(month) FROM home_values)
ORDER BY zhvi DESC;

-- 1-year change in ZHVI per city
WITH latest AS (
    SELECT city, zhvi FROM home_values
    WHERE month = (SELECT MAX(month) FROM home_values)
),
year_ago AS (
    SELECT city, zhvi FROM home_values
    WHERE month = (SELECT date(MAX(month), '-12 months') FROM home_values)
)
SELECT l.city,
       ROUND((l.zhvi / y.zhvi - 1) * 100, 1) AS pct_change_1y
FROM latest l
JOIN year_ago y USING (city)
ORDER BY pct_change_1y DESC;

-- Latest inventory and days on market per city
SELECT city, inventory, days_on_market
FROM market_stats
WHERE month = (SELECT MAX(month) FROM market_stats)
ORDER BY days_on_market;
