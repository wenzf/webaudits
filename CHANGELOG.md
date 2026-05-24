# Changelog

## 0.2.0

- added CMS
- code splitting: separate CMS components by `.client` suffix instead of lazy loadind components to increase network stablity 
- added middleware `v8_middleware`
- - CSRF
- - honeypot
- - server timing
- - auth for CMS routes
- updated packages
- audit function `audit_lambda_function_1`
- - removed content extraction from audited page; removed `cheerio`
- - increased duration between 2 calls from AWS orign to lower the risk of being blocked
- added blog
- replaced `micromark` with `react-markdown` globally

