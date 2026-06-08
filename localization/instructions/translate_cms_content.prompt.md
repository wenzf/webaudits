# Translation Prompt for webaudits.org

## Your Task

Translate a CMS JSON entry from English into the target language. You will be provided with two things:

1. **The JSON entry** — a flat or shallow object where some fields contain plain text, some contain HTML, some contain Markdown, and some contain custom component markup (`{{cc_...}}`). Translate the content. Do not translate structure.
2. **The glossary** — a Markdown file listing approved translations and terms that must stay in English.

Produce a new JSON object in the target language with the same structure as the input.

---

## Field-by-Field Rules

### Fields to translate

Translate the visible text content of these fields when present:

| Field | Notes |
|---|---|
| `title` | Page or article title |
| `description` | Meta description |
| `h1_title` | Main heading |
| `eyebrow` | Short label above the heading |
| `md_lead` | Lead paragraph / article intro |
| `md_body` | Main body content (HTML, Markdown, or mixed) |
| `md_body_top` | Secondary body field — translate if it contains real prose; leave as-is if it is an obvious stub or placeholder (e.g. `"ss"`, `"adsf"`, a single nonsensical word) |
| `faq_title` | FAQ section heading |
| `faq_description` | FAQ section description |
| `faq_qa_pairs` | Array of FAQ items — translate both `q` and `a` values; leave `item_display_position` untouched |
| `main_image.alt` | Image alt text — translate |
| `main_image.figCaption` | Image caption — translate if non-empty; leave empty string as-is |
| `og_image.alt` | OG image alt text — translate |

### Fields to leave exactly as-is

Never modify any of the following:

- All keys (never translate or alter any key name)
- `pk`, `sk` — **exception: update the language suffix** — e.g. `PS#en` → `PS#zh`, `BP#en` → `BP#zh`, `BP#de` → `BP#zh` (substitute the correct BCP 47 code for the target language)
- `createdAt`, `date_modified`, `date_published`, `reading_time`
- `hreflangs`, `tags`, `alternative_keywords`
- `main_image` (all fields except `alt` and `figCaption`): `src`, `srcSet`, `jpgFallbacks`, `width`, `height`, `license_name`, `license_url`, `author_name`, `author_url`, `author_type`
- `og_image` (all fields except `alt`): `src`, `mime`, `width`, `height`
- `ai_translated` — **do not copy from the input**; generate this field fresh (see [AI Translated Field](#ai-translated-field) below)
- `source_lang` — BCP 47 code of the language the entry was translated from; leave as-is, do not change it to the target language code
- `ai_assistance` — model metadata from the original author; pass through untouched
- `authors`, `related_posts_list`
- `in_news_sitemap`, `schema_article_type`
- `main_keyword` — SEO taxonomy term, leave in English
- Any field whose value is `null`, a number, or a boolean

---

## Content Format Rules

### Plain text
Translate directly. No markup.

### HTML
- Preserve all tags, attributes, and structure exactly
- Translate only visible text content between tags
- Never modify `href`, `data-markup`, `class`, `id`, or any other attribute value
- Never add, remove, or restructure tags

### Markdown
- Preserve all Markdown syntax: `**bold**`, `*italic*`, headings (`#`, `##`), bullet lists (`-`, `*`), tables (keep `|` structure and alignment colons), inline code (`` `code` ``), `<details>`/`<summary>` tags, and line breaks (`\n`)
- Translate only the prose — including text inside `<summary>` tags and table cell content
- Do not convert Markdown to HTML or vice versa

### Mixed HTML + Markdown
Some fields combine both. Apply HTML rules to HTML elements and Markdown rules to everything else.

### Placeholders
Strings like `{{source_language}}`, `{{target_language}}`, `{{models}}`, `{{domain}}`, `{{score}}`, `{{date}}` are runtime values injected at render time. Never translate or modify them, including the double curly braces.

---

## Custom Component Markup (`{{cc_...}}`)

Fields may contain blocks that begin with `{{cc_` and end with `}}`. These are custom components rendered by the application. They contain a JSON configuration object as their argument.

### General rule
Pass through the entire `{{cc_...}}` block structurally unchanged. Never modify keys, namespaces, data values, URLs, numeric scores, or structural properties.

### What to translate inside `{{cc_...}}` blocks

| Location | Field | Translate? |
|---|---|---|
| `tableCaption` | Table caption string | Yes |
| `locTxt` | All user-facing label strings inside this object | Yes |
| `additionalCols[].col_label` | Column header label | Yes |
| `listData[].tool_category` | Tool category string shown in the table | Yes |

### What NOT to translate inside `{{cc_...}}` blocks

| Field | Reason |
|---|---|
| `listData[].tool_name` | Product/brand name |
| `listData[].final_url` | URL |
| `listData[].sk`, `created_at`, `score_*`, `score` | System identifiers and numeric data |
| `additionalCols[].data_namespace`, `id`, `td_classname`, `col_position_insert_before` | Technical properties |
| `defaultSortSettings.*` | System configuration |
| `itemProp` | Schema.org attribute |

---

## AI Translated Field

If the input entry contains an `ai_translated` field, you must generate it fresh — do not copy the value from the input. Populate it with your own identity as the model performing the translation:

```json
"ai_translated": [
  {
    "llm_vendor_name": "<your vendor name, e.g. Anthropic, OpenAI, Google>",
    "llm_vendor_url": "<your vendor URL, e.g. https://www.anthropic.com/claude>",
    "llm_name": "<your model family name, e.g. Claude, GPT, Gemini>",
    "llm_version": "<your full model version string, e.g. claude-sonnet-4-6>"
  }
]
```

If the input entry does not contain an `ai_translated` field, do not add one.

---

## Glossary Rules

1. Read the full glossary before translating
2. Apply approved translations consistently across all fields
3. Terms marked "Keep in all languages", "Never translate", or listed without a translation must remain in English exactly as written

---

## Terms That Are Never Translated

Regardless of the glossary, always keep the following in English:

- The four ECOS category names as product terms: **Efficient, Clean, Open, Safe**
- Technical acronyms: HTTP, HTTPS, TTFB, LCP, INP, CLS, SSL, TLS, CSP, HSTS, CORS, CDN, DNS, API, REST, SEO, SSR, URL, IP, DOM
- Web technology names: JavaScript, CSS, HTML, JSON, SVG, ARIA
- Tool and product names: Lighthouse, PageSpeed, CrUX, Chrome, AWS, Lambda, DynamoDB, S3, CloudFront, React, Node.js, Tailwind, co2.js
- Data and standard names: CO2, CO₂, Core Web Vitals, Web Vitals, Web Sustainability Guidelines, Sustainable Web Manifesto
- Third-party service and tool names: AbuseIPDB, WebAIM, Green Web Foundation, MDN, Mozilla, Google, HTTP Archive, GTmetrix, Pingdom, dareboost, and any other named third-party product
- Statistical labels: p10, p25, p50, p75, p90
- Open Source terms widely used in tech contexts: Open Source, Open Data, Pull Request, Issues, Best Practices, Performance, Benchmark, Benchmarking, Audit, Web Audit
- Brand names and proper nouns in general

Descriptive equivalents of the ECOS category names (e.g. "efficiency", "sustainability", "openness", "security") **may and should** be translated when used as prose descriptions or section headings — only the four product-term names themselves stay in English.

---

## Tone and Style

- Be direct. Short sentences. No filler phrases.
- Active voice where possible.
- Short UI labels (buttons, column headers, navigation) should stay short — do not pad them.
- Match the register of the source: technical but approachable, not academic, not marketing.

---

## Output

Return a single valid JSON object with:
- Identical structure and all the same keys as the input
- All translatable content translated into the target language
- All non-translatable elements left unchanged
- No extra keys, no missing keys, no comments, no Markdown code fences around the output