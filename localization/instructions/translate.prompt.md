# Translation Prompt for webaudits.org

## Your Task

Translate a JSON file containing UI text fragments from English into the target language. You will be provided with three files:

1. **The text file** — a JSON file with the actual content to translate (e.g. `xyz.json`)
2. **The context file** — a JSON file with the same keys, where each value describes what the text fragment is and where it appears on the page (e.g. `xyz.context.json`)
3. **The glossary** — a Markdown file listing approved translations for key terms (`glossary.prompt.md`)

For each key, read the value in the text file (what to translate) and the corresponding value in the context file (what it is and where it appears). Use the glossary for all listed terms. Translate accordingly.

Produce a new JSON file in the target language with the same structure as the input file.

---

## How to Use the Glossary

The glossary defines approved translations for recurring terms. Before translating:

1. Check that the target language column is filled in for all relevant terms
2. If the target language column is missing or incomplete, propose translations for all glossary terms first and wait for approval before proceeding with file translation
3. Once the glossary is approved, use it consistently across all files — do not translate listed terms independently

Terms marked "Keep in all languages" or "Never translate" must remain in English regardless of the target language.

---

## Rules

### Keys
- **Never change any key.** Keys are used programmatically. Translate values only.
- Keys may contain typos (e.g. `dcocument`, `hol_orgingal_score`). Leave them exactly as they are.

### Value formats
- **Plain text** — translate as plain text. No markup.
- **HTML** — preserve all HTML tags, attributes, and structure exactly. Translate only the visible text content between tags. Do not change `href`, `data-markup`, `class`, or any other attribute values.
- **Markdown** — preserve all markdown syntax: `**bold**`, `*italic*`, bullet points (`*` or `-`), headings (`#`, `##`), inline code (`` `code` ``), and line breaks (`\n`). Translate only the prose.
- **Placeholders** — strings like `{{domain}}`, `{{date}}`, `{{score}}`, `{{models}}`, `{{time}}`, `{{limit}}` are dynamic values injected at runtime. **Never translate or modify placeholders.**
- **Mixed content** — some values combine HTML with markdown or plain text. Apply the rules above to each part.

### Technical terms
The following terms must **not** be translated. Keep them in English exactly as written:
- ECOS, Efficient, Clean, Open, Safe (the four ECOS category names)
- HTTP, HTTPS, SSL, TLS, CSP, HSTS, CORS, CDN, DNS, SSR, API, REST, GET, URL, IP
- JavaScript, CSS, HTML, JSON, SVG, ARIA, SEO
- Lighthouse, PageSpeed, CrUX, Chrome, AWS, Lambda, DynamoDB, S3, CloudFront, React, Node.js, Tailwind
- CO2, CO₂, co2.js
- AbuseIPDB, WebAIM, Green Web Foundation, MDN, Mozilla, Google, HTTP Archive
- p10, p25, p50, p75, p90 (statistical percentile labels)
- Brand names, product names, and proper nouns in general

---

## About the Website

**webaudits.org** is a non-profit, open-source and open-data project that analyzes websites and scores them on technical quality. It is aimed at web developers, site owners, and anyone interested in web performance, sustainability, accessibility, and security.

### The ECOS Framework

ECOS is the scoring framework at the heart of the project. The name stands for four categories:

- **Efficient** — measures loading speed and resource use: data volume transferred and number of HTTP requests, benchmarked against global averages (HTTP Archive)
- **Clean** — measures the ecological footprint: CO2 emissions estimated from data volume and the energy mix of the hosting data center
- **Open** — measures accessibility (for people with disabilities) and SEO (discoverability by search engines)
- **Safe** — measures security: SSL/TLS encryption, Content Security Policy headers (via MDN HTTP Observatory), and domain/IP reputation (via Google Web Risk and AbuseIPDB)

Each category produces a sub-score from 0 to 100. These are combined into a total ECOS score. Results are benchmarked against a global database of audited websites using percentiles (p10–p90).

The four ECOS category names — Efficient, Clean, Open, Safe — are **official product terms** and must remain in English in all languages. Their descriptive equivalents (e.g. Efficiency, Sustainability, Openness, Security) may be used in explanatory text and section headings where indicated in the context file, but the ECOS code names themselves are never translated.

---

## Tone and Style

The website uses a calm, precise, and approachable tone. It is technical but not academic. Follow these guidelines:

- **Be direct.** Prefer short sentences over long compound ones. Avoid filler phrases like "it should be noted that", "in order to", "as well as".
- **Use active voice** where possible. Avoid passive constructions when an active form works equally well.
- **Avoid nominalization.** Prefer verb forms over noun phrases where natural in the target language.
- **No AI-style constructions.** Avoid em dashes used as connectors (`—`), stacked rhetorical questions, and phrases like "seamlessly", "cutting-edge", "leverage", "unlock", "holistic".
- **Short labels stay short.** Button labels, table headers, navigation items, and breadcrumbs should be as short as possible — typically one to three words. Do not pad them.
- **Accessible language.** The site is used by non-native speakers. Prefer common words over specialist jargon where both convey the same meaning.

### Language-specific notes for German
- Do not use the sharp s (ß). Use `ss` instead. This reflects Swiss German orthographic conventions used on this site.
- Technical terms universally used in German tech contexts in English (SSR, CDN, IaC, NoSQL, REST, GET, HTTP, API, etc.) stay in English.
- Avoid bureaucratic German: long nominal chains, inverted sentence structures for formality, and compound verbs where simpler alternatives exist.
- The grammatically inflected language name forms used in translation notice sentences follow German case rules: "aus dem Deutschen / Englischen" (dative), "ins Deutsche / Englische" (accusative).

---

## What to Produce

Output a single valid JSON file with:
- The same structure and all the same keys as the input text file
- All translatable values translated into the target language
- All non-translatable elements (placeholders, technical terms, HTML, code, brand names) left unchanged
- No extra keys, no missing keys, no comments

Do not include any explanation or preamble outside the JSON.