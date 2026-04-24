# StockFlow AI Dataset

Synthetic dataset prepared for the StockFlow AI hackathon MVP.

## Files
- items_master.csv
- location_master.csv
- users.csv
- inventory_transactions.csv
- validation_results.csv
- audit_log.csv
- data_dictionary.csv

## Recommended app wiring
- Use inventory_transactions.csv as the main operational feed.
- Join items_master.csv on item_code.
- Join validation_results.csv on transaction_id.
- Join audit_log.csv on item_code + batch_id if you need history.
- Use location_master.csv to check location restrictions.
- Use users.csv for role-based demo screens.

## Sizes
- items_master: 35
- locations: 10
- users: 9
- inventory_transactions: 324
- validation_results: 324
- audit_log: 216

## Demo-friendly special cases included
- RM-1842: status conflict -> recommended On Hold
- PK-0291: duplicate entry detected
- FG-7811: unreleased item in Yard A / invalid location
- RM-0059: aging On Hold case

## Suggested primary filters in the UI
- status
- risk_score > 70
- anomaly_type != none
- aging_flag = yes
- location_consistency_flag = warning

## Note
All data is synthetic and safe to use for a public hackathon demo.
