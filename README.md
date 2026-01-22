# webaudits.org

The ECOS Web Audit is an analytical tool for the technical assessment of websites. The system aggregates measurable technical indicators into a Composite Index that evaluates the categories: **Efficient**, **Clean**, **Open**, and **Safe**.


## Codebase Overview

The repository is primarily intended for conducting ECOS audits and presenting the results. However, it can also serve as a starting point for developing audits with a completely different structure. 

The repository is structured into two primary components:

* **Web Interface:** A frontend application featuring a dashboard to execute new tests, review specific results, access curated lists such as "Best" and "Latest" entries and to retrieve data via REST-API (GET requests only). It also provides descriptive statistics for aggregate data visualization.
* **API (Serverless):** The core audit logic and processing engine, architected for deployment as **AWS Lambda** functions.

## Concept & Methodology

For an in-depth explanation of the audit concept, the underlying methodology, and the calculation of metrics, refer to the documentation:

👉 **[Read the Audit Methodology & Concept](https://webaudits.org/docs)**

---

## Technical Setup

### Framework & Infrastructure
The project is built with a serverless stack:

* **Frontend:** [React Router v7](https://reactrouter.com/) (Framework Mode) for routing and data loading.
* **Infrastructure:** [SST (Serverless Stack)](https://sst.dev/) for managing AWS resources.
* **Deployment:** The API and frontend are deployed on [AWS Lambda](https://aws.amazon.com/lambda/) and S3.

### Configuration
1.  **Environment Variables:** Copy the example file: `cp sst-secrets.example.ts sst-secrets.ts` and fill in the required credentials.
2.  **SST Setup:** For infrastructure modifications, refer to the `sst.config.ts`. See the [SST Documentation](https://docs.sst.dev/) for deployment commands.
3.  **Local Development:** Run `npm install` followed by `npx sst dev` to start the local development environment with AWS connection.


### API Keys

The audit engine relies on external services to evaluate technical indicators. To run the project, you must obtain and configure API keys for the following services:

* **Google PageSpeed Insights API**: Used for measuring performance and core web vitals.
  * [Get API Key here](https://developers.google.com/speed/docs/insights/v5/get-started)
* **Google Cloud Web Risk API**: Utilized to check URLs against lists of unsafe web resources (Category: **Safe**).
  * [Get API Key here](https://cloud.google.com/web-risk/docs/setup)
* **AbuseIPDB API**: Used for checking IP addresses against a database of reported malicious activity (Category: **Safe**).
  * [Create Account & Get Key here](https://www.abuseipdb.com/account/api)

These keys must be stored in your `sst-secrets.ts` file to enable the Lambda functions to perform the analysis. Without valid keys, the audit results will be incomplete.


## Project Structure

This project follows a monorepo-style structure, separating the serverless audit logic from the React Router frontend and shared configurations.

The frontend architecture originally comprised `/app/site`, `/app/cms`, and `/app/common`, with the latter containing shared logic between the public website and the CMS. While the CMS managed page content and provided a developer interface for data manipulation, it is excluded from this repository. To set up the project, you must exclude the `cmsRouteConfig` variable from `/app/routes.ts`. Libraries only used for the CMS aren't included in the bundle of the public website.

### Directory Tree

```text
app/
├── audit_api/                  # Serverless Audit Engine (AWS Lambda logic)
│   ├── api_calls/              # Implementation of external API integrations
│   ├── data                    # Static data
│   ├── helpers/                # Logic-specific utility functions
│   └── v1/                     # Versioned API endpoints
│       ├── audit_lambda_function_v1.ts # Main entry point for Lambda
│       ├── audit.config.ts     # Specific configuration for the audit engine, it contains the process 
│       │                         of creating the scores. For future changes of the methodology, this 
│       │                         is a central file
│       └── create_stats_cron_jobs.ts   # Logic for scheduled statistics generation
├── common/                     # Shared logic between Website and CMS
├── site/                       # Frontend
│   ├── routes/                 # Routing logic
│   │   ├── actions_and_loaders/# Data handling for React Router
│   │   ├── discovery/          # Discovery page components such as robots.txt or sitemaps
│   │   └── pages/              # Main view components
│   ├── ui/                     # UI components
│   │   ├── audit/              # Components and subcomponents related to audit
│   │   ├── charts/             # Data visualization & statistics charts
│   │   └── core/               # UI elements used on most pages
│   ├── utils/                  # Helpers
│   ├── site_routes_config.ts   # Route definitions and hierarchy
│   └── site.config.ts          # Global configuration
├── entry.server.tsx            # React Router server-side entry point where response headers such as CSP and none are set
├── root.tsx                    # Root layout and global providers
└── routes.ts                   # Main route configuration (v7 framework)

public/                         # Global TypeScript definitions
├── locales/                    # Localized text fragments

types/                          # Global TypeScript definitions
├── audit_data.d.ts             # Types for raw audit data and API responses
├── audit_view.d.ts             # Types for frontend visualization objects
└── site.d.ts                   # General site and configuration types

sst-secrets.ts                  # Bridge for SST secret management
sst.config.ts                   # Infrastructure as Code (SST Ion/v3 configuration)

```

### Routing structure

* `:lang?` Home
* `:lang?/about` About`
* `:lang?/docs` Docs`
* `:lang?/audit` Audit overview
* `:lang?/audit/ecos-v1` Interface
* `:lang?/audit/ecos-v1/stats` Stats
* `:lang?/audit/ecos-v1/latest` Latest
* `:lang?/audit/ecos-v1/best` Leaderboard
* `:lang?/audit/ecos-v1/:id` Audit Results
* `/api/ecos/v1/:type/:id?.json` REST-API (GET request of exsisting data only, no requests to create or update audits)


### Things that might not be intuitive and other noteworthy remarks

* **Localization:** Localization is route-based; no automatic language detection for localization. Text files are located in `/public/locales/<lang>` and are loaded via the `get_static_data.server.ts` function. Instead of a single monolithic file, the texts are distributed across several files that are loaded as needed (or according to route).
* **Abstraction of Views:** Various views (Docs, Audit Results, Stats) are defined in configuration objects and processed by recursive render functions (e.g., for page segments, sidebars, or nested tables). Although less intuitive, this abstraction reduces code size and ensures that future changes to the audit methodology primarily require updates to the configuration objects rather than the logic.
* **Dependency Management:** The current version of the `visx` library uses an older version of React as a peer dependency. To install dependencies, use the force flag: `npm install --legacy-peer-deps`. The `visx` library might lead to hydration errors in development mode (markup mismatch between server and client), no errors in production mode.
* **Lambda & Audit API Architecture:** The Lambda function running the audit is decoupled from the main website codebase. It is located in `/app/audit_api/v1/audit_lambda_function_1.ts` and deployed by `SST` as a standalone API. When an audit is triggered, the loader in `/app/site/routes/actions_and_loaders/loader_audit_1.tsx` calls the Lambda function. So the Lambda function isn't exposed to clients, instead API calls must be triggered via the `loader` route.
* **CSRF Protection:** Due to past issues with standard CSRF libraries (potentially related to CloudFront caching behavior) this project uses a custom, simplified CSRF protection to prevent bots from spamming the loader routes.
* Check **vite.config.ts** and adjust or delete the `build` entry with the `rollupOptions` in case you alter the file structure.



