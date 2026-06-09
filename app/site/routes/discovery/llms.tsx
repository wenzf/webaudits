

export const loader = () => {
    const llmsText = `# Web Audits

> webaudits.org is a non-profit Open Data and Open Source initiative for evaluating websites based on the ECOS framework: Efficient, Clean, Open, and Safe. It provides technically measurable, benchmarking of URLs against general web development best practices.

Available in English and German (\`en\`, \`de\`).

The ECOS Web Audit is based on and inspired by the Web Sustainablity Guidelines (WSG). It consolidates indicators into a composite index (score 0–100) covering efficiency, sustainability, accessibility, and security. The project is open-source (GitHub: https://github.com/wenzf/webaudits).

## ECOS Framework

The four index areas each carry 25% weight in the total score:

- **Efficient** – Evaluates volume of transferred data and number of HTTP requests (via PageSpeed Insights, HTTP Archive).
- **Clean** – Measures the ecological/carbon footprint based on data volume and the energy mix of the hosting data center (via CO2.js, Green Web Foundation, AbuseIPDB).
- **Open** – Measures accessibility (WCAG) and Search Engine Optimization to ensure technical accessibility for all users and technologies (via PageSpeed Insights).
- **Safe** – Rates infrastructure reputation against blacklists and analyzes SSL certificates and Content Security Policies (via AbuseIPDB, Google Web Risk API, HTTP Observatory).

The four areas reinforce each other: efficient programming reduces energy consumption (Clean), improves loading times and visibility (Open), and a clean technical foundation ensures long-term maintainability.

## Key Pages

- [Home](https://webaudits.org/): Overview.
- [Documentation](https://webaudits.org/docs): Explanation of the ECOS framework, scoring methodology, sub-indicators, tech stack, and REST API.
- [About the Project](https://webaudits.org/about): Mission, contribution options, and contact.
- [Privacy Policy](https://webaudits.org/privacy): Data handling information.
- [Run ECOS Audit](https://webaudits.org/audits/ecos-v1): Enter any URL to run a free ECOS audit. Limited to 3,000 requests per 24 hours.
- [Top 100 Highest-Rated URLs](https://webaudits.org/audits/ecos-v1/best): Leaderboard of best-performing websites.
- [100 Latest Audits](https://webaudits.org/audits/ecos-v1/latest): Most recently analyzed URLs.
- [Global Benchmark Statistics](https://webaudits.org/audits/ecos-v1/stats): Descriptive statistics across all audited websites (mean, median, percentiles).

## Tech Stack

- **Framework & Runtime:** React, React Router, Node.js
- **Frontend:** Radix UI, d3/visx, Tailwind CSS
- **Infrastructure:** SST (Ion) on AWS (DynamoDB, Lambda, S3, Route53, CloudFront)

## REST API

The public REST API supports GET requests to the ECOS database, providing audit results and daily-updated descriptive statistics. Write/trigger requests are not available via API at this time.

## Contribute

Contributions are welcome in the areas of: development (GitHub PRs/Issues), conceptual design of the evaluation methodology, localization/translations, cooperation with other web infrastructure projects, funding, and outreach.

Contact: Wenzel Frick — hello@wefrick.com
License (Code): Apache 2.0 — https://github.com/wenzf/webaudits
License (Data): CC-BY-SA 4.0 — https://creativecommons.org/licenses/by-sa/4.0/`

    return new Response(llmsText, {
        status: 200,
        headers: {
            "Content-Type": "text/plain",
            "Cache-Control": "public, max-age=86400",
            "X-Content-Type-Options": "nosniff"
        }
    });
};