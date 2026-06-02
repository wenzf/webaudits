# Changelog

## [0.2.0] - 2026-06-XX

### Added
- **CMS Integration:** Introduced the content management system.
- **Blog:** Added a blog section.
- **Middleware (`v8_middleware`):** Implemented middleware handling:
  - CSRF protection
  - Honeypot fields
  - Server-timing headers
  - Authentication guard for CMS routes
- **Audit:** Added a visual badge to display audit results.
- **LLMS.txt:**: Added an `llms.txt` file to facilitate accessibility for large language models and web scrapers.

### Changed
- **Code Splitting:** Separated CMS components using the `.client` suffix instead of lazy loading to increase network stability.
- **Markdown Parsing:** Replaced `micromark` with `react-markdown` globally.
- **Rate Limiting:** Increased the duration between sequential calls from the AWS origin to lower the risk of being blocked.
- **Dependency Updates:** Upgraded internal packages to their latest versions.

### Removed
- **Audit Function Refactor (`audit_lambda_function_1`):** Removed content extraction from the audited page and dropped the `cheerio` dependency.