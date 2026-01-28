import https from 'https';
import http from 'http';
import { CONFIG_API_TIMEOUT_IN_MS, CONFIG_CRAWLER_HEADERS } from '../v1/audit.config';



/**
 * Fetches HTTP headers and HTML content from a URL
 */
async function fetchHeaders(url: string): Promise<{
    headers: Record<string, string | string[]>;
    statusCode: number;
    finalUrl: string;
    ipAddress: string | null;
    html: string;
}> {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;

        const options = {
            method: 'GET',
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname + parsedUrl.search,
                    headers: CONFIG_CRAWLER_HEADERS
        };

        const req = protocol.request(options, (res) => {

            // Handle redirects (including cross-protocol redirects)
            if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                const redirectUrl = new URL(res.headers.location, url).toString();
                fetchHeaders(redirectUrl)
                    .then(resolve)
                    .catch(reject);
                return;
            }

            const headers: Record<string, string | string[]> = {};
            for (const [key, value] of Object.entries(res.headers)) {
                if (value !== undefined) {
                    headers[key.toLowerCase()] = value;
                }
            }

            // Get IP address from socket
            const ipAddress = res.socket?.remoteAddress || null;

            // Collect HTML body
            let html = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                html += chunk;
                // Stop after first 50mb to avoid memory issues
                if (html.length > 50_000_000) {
                    res.destroy();
                }
            });

            res.on('end', () => {
                resolve({
                    headers,
                    statusCode: res.statusCode || 0,
                    finalUrl: url,
                    ipAddress,
                    html
                });
            });
        });

        req.on('error', reject);
        req.setTimeout(CONFIG_API_TIMEOUT_IN_MS, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        req.end();
    });
}

/**
 * Extract meta tags from HTML
 */
function extractMetaTags(html: string): { title: string | null; description: string | null } {
    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
    const title = titleMatch ? titleMatch[1].trim() : null;

    // Extract meta description
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/is) ||
        html.match(/<meta\s+content=["'](.*?)["']\s+name=["']description["']/is);
    const description = descMatch ? descMatch[1].trim() : null;

    return { title, description };
}

/**
 * Parses Set-Cookie headers into Cookie objects
 */
function parseCookies(setCookieHeaders: string | string[]): Cookie[] {
    const cookieStrings = Array.isArray(setCookieHeaders)
        ? setCookieHeaders
        : [setCookieHeaders];

    return cookieStrings.map(cookieStr => {
        const parts = cookieStr.split(';').map(p => p.trim());
        const [nameValue] = parts;
        const [name, value] = nameValue.split('=');

        const cookie: Cookie = { name, value };

        for (const part of parts.slice(1)) {
            const lowerPart = part.toLowerCase();
            if (lowerPart === 'secure') {
                cookie.secure = true;
            } else if (lowerPart === 'httponly') {
                cookie.httpOnly = true;
            } else if (lowerPart.startsWith('samesite=')) {
                const sameSiteValue = part.split('=')[1];
                cookie.sameSite = sameSiteValue as 'Strict' | 'Lax' | 'None';
            } else if (lowerPart.startsWith('domain=')) {
                cookie.domain = part.split('=')[1];
            } else if (lowerPart.startsWith('path=')) {
                cookie.path = part.split('=')[1];
            }
        }

        return cookie;
    });
}

/**
 * Test: Content Security Policy
 */
function testCSP(csp: string | undefined, tests: ObservatoryPartialResult[]): void {
    if (!csp) {
        tests.push({
            name: 'content-security-policy',
            pass: false,
            scoreModifier: -25,
            result: 'csp-not-implemented'
        });
        return;
    }

    const lowerCSP = csp.toLowerCase();

    if (lowerCSP.includes("'unsafe-inline'")) {
        tests.push({
            name: 'content-security-policy',
            pass: false,
            scoreModifier: -20,
            result: 'csp-implemented-with-unsafe-inline'
        });
        return;
    }

    if (lowerCSP.includes("'unsafe-eval'")) {
        tests.push({
            name: 'content-security-policy',
            pass: false,
            scoreModifier: -10,
            result: 'csp-implemented-with-unsafe-eval'
        });
        return;
    }

    if (lowerCSP.includes('*') && !lowerCSP.match(/'nonce-|'sha\d+-/)) {
        tests.push({
            name: 'content-security-policy',
            pass: false,
            scoreModifier: -10,
            result: 'csp-implemented-with-unsafe-wildcards'
        });
        return;
    }

    tests.push({
        name: 'content-security-policy',
        pass: true,
        scoreModifier: 0,
        result: 'csp-implemented-with-no-unsafe'
    });

    if (lowerCSP.match(/'nonce-|'sha\d+-/)) {
        tests.push({
            name: 'content-security-policy-strict',
            pass: true,
            scoreModifier: 5,
            result: 'csp-implemented-with-nonces-or-hashes'
        });
    }
}

/**
 * Test: HTTP Strict Transport Security
 */
function testHSTS(hsts: string | undefined, tests: ObservatoryPartialResult[]): void {
    if (!hsts) {
        tests.push({
            name: 'strict-transport-security',
            pass: false,
            scoreModifier: -20,
            result: 'hsts-not-implemented'
        });
        return;
    }

    const maxAgeMatch = hsts.match(/max-age=(\d+)/i);
    if (!maxAgeMatch) {
        tests.push({
            name: 'strict-transport-security',
            pass: false,
            scoreModifier: -20,
            result: 'hsts-invalid'
        });
        return;
    }

    const maxAge = parseInt(maxAgeMatch[1]);
    const sixMonths = 15552000;

    if (maxAge < sixMonths) {
        tests.push({
            name: 'strict-transport-security',
            pass: false,
            scoreModifier: -10,
            result: 'hsts-less-than-six-months'
        });
        return;
    }

    tests.push({
        name: 'strict-transport-security',
        pass: true,
        scoreModifier: 0,
        result: 'hsts-implemented-max-age-at-least-six-months'
    });

    if (hsts.toLowerCase().includes('preload')) {
        tests.push({
            name: 'strict-transport-security-preload',
            pass: true,
            scoreModifier: 5,
            result: 'hsts-preload-enabled'
        });
    }
}

/**
 * Test: X-Content-Type-Options
 */
function testXContentTypeOptions(header: string | undefined, tests: ObservatoryPartialResult[]): void {
    if (!header || header.toLowerCase() !== 'nosniff') {
        tests.push({
            name: 'x-content-type-options',
            pass: false,
            scoreModifier: -5,
            result: 'x-content-type-options-not-implemented'
        });
        return;
    }

    tests.push({
        name: 'x-content-type-options',
        pass: true,
        scoreModifier: 0,
        result: 'x-content-type-options-nosniff'
    });
}

/**
 * Test: X-Frame-Options
 */
function testXFrameOptions(header: string | undefined, tests: ObservatoryPartialResult[]): void {
    if (!header) {
        tests.push({
            name: 'x-frame-options',
            pass: false,
            scoreModifier: -20,
            result: 'x-frame-options-not-implemented'
        });
        return;
    }

    const lowerHeader = header.toLowerCase();
    if (lowerHeader === 'deny' || lowerHeader === 'sameorigin') {
        tests.push({
            name: 'x-frame-options',
            pass: true,
            scoreModifier: 0,
            result: 'x-frame-options-implemented'
        });
    } else {
        tests.push({
            name: 'x-frame-options',
            pass: false,
            scoreModifier: -20,
            result: 'x-frame-options-invalid'
        });
    }
}

/**
 * Test: Referrer-Policy
 */
function testReferrerPolicy(policy: string | undefined, tests: ObservatoryPartialResult[]): void {
    if (!policy) {
        tests.push({
            name: 'referrer-policy',
            pass: false,
            scoreModifier: -5,
            result: 'referrer-policy-not-implemented'
        });
        return;
    }

    const lowerPolicy = policy.toLowerCase();
    const unsafePolicies = ['unsafe-url', 'no-referrer-when-downgrade'];

    if (unsafePolicies.includes(lowerPolicy)) {
        tests.push({
            name: 'referrer-policy',
            pass: false,
            scoreModifier: -5,
            result: 'referrer-policy-unsafe'
        });
        return;
    }

    const safePolicies = [
        'no-referrer',
        'same-origin',
        'strict-origin',
        'strict-origin-when-cross-origin'
    ];

    if (safePolicies.includes(lowerPolicy)) {
        tests.push({
            name: 'referrer-policy',
            pass: true,
            scoreModifier: 0,
            result: 'referrer-policy-safe'
        });
    } else {
        tests.push({
            name: 'referrer-policy',
            pass: false,
            scoreModifier: -5,
            result: 'referrer-policy-unknown'
        });
    }
}

/**
 * Test: Cookies
 */
function testCookies(cookies: Cookie[], tests: ObservatoryPartialResult[]): void {
    if (cookies.length === 0) {
        tests.push({
            name: 'cookies',
            pass: true,
            scoreModifier: 0,
            result: 'cookies-not-found'
        });
        return;
    }

    const allSecure = cookies.every(c => c.secure);
    const allHttpOnly = cookies.every(c => c.httpOnly);
    const allSameSite = cookies.every(c => c.sameSite && c.sameSite !== 'None');

    if (allSecure && allHttpOnly && allSameSite) {
        tests.push({
            name: 'cookies',
            pass: true,
            scoreModifier: 5,
            result: 'cookies-secure'
        });
    } else if (!allSecure) {
        tests.push({
            name: 'cookies',
            pass: false,
            scoreModifier: -10,
            result: 'cookies-without-secure-flag'
        });
    } else if (!allHttpOnly) {
        tests.push({
            name: 'cookies',
            pass: false,
            scoreModifier: -5,
            result: 'cookies-without-httponly-flag'
        });
    } else if (!allSameSite) {
        tests.push({
            name: 'cookies',
            pass: false,
            scoreModifier: -5,
            result: 'cookies-without-samesite-flag'
        });
    }
}

/**
 * Test: CORS
 */
function testCORS(cors: string | undefined, tests: ObservatoryPartialResult[]): void {
    if (!cors) {
        tests.push({
            name: 'cross-origin-resource-sharing',
            pass: true,
            scoreModifier: 0,
            result: 'cross-origin-resource-sharing-not-implemented'
        });
        return;
    }

    if (cors === '*') {
        tests.push({
            name: 'cross-origin-resource-sharing',
            pass: false,
            scoreModifier: -10,
            result: 'cross-origin-resource-sharing-implemented-wildcard'
        });
    } else {
        tests.push({
            name: 'cross-origin-resource-sharing',
            pass: true,
            scoreModifier: 0,
            result: 'cross-origin-resource-sharing-implemented-restricted'
        });
    }
}

/**
 * Test: Redirection
 */
function testRedirection(url: string, finalUrl: string, tests: ObservatoryPartialResult[]): void {
    const usesHTTPS = url.startsWith('https://');
    const redirectsToHTTPS = finalUrl.startsWith('https://');

    if (!usesHTTPS && !redirectsToHTTPS) {
        tests.push({
            name: 'redirection',
            pass: false,
            scoreModifier: -20,
            result: 'redirection-not-to-https'
        });
    } else if (!usesHTTPS && redirectsToHTTPS) {
        const originalHost = new URL(url).hostname;
        const finalHost = new URL(finalUrl).hostname;

        if (originalHost !== finalHost) {
            tests.push({
                name: 'redirection',
                pass: false,
                scoreModifier: -5,
                result: 'redirection-to-https-on-different-hostname'
            });
        } else {
            tests.push({
                name: 'redirection',
                pass: true,
                scoreModifier: 0,
                result: 'redirection-to-https'
            });
        }
    } else {
        tests.push({
            name: 'redirection',
            pass: true,
            scoreModifier: 0,
            result: 'redirection-all-https'
        });
    }
}

/**
 * Test: Cross-Origin Policies
 */
function testCrossOriginPolicies(
    corp: string | undefined,
    coop: string | undefined,
    coep: string | undefined,
    tests: ObservatoryPartialResult[]
): void {
    if (corp && corp.toLowerCase() === 'same-origin') {
        tests.push({
            name: 'cross-origin-resource-policy',
            pass: true,
            scoreModifier: 5,
            result: 'corp-implemented'
        });
    }

    if (coop && coop.toLowerCase().includes('same-origin')) {
        tests.push({
            name: 'cross-origin-opener-policy',
            pass: true,
            scoreModifier: 5,
            result: 'coop-implemented'
        });
    }

    if (coep && coep.toLowerCase() === 'require-corp') {
        tests.push({
            name: 'cross-origin-embedder-policy',
            pass: true,
            scoreModifier: 5,
            result: 'coep-implemented'
        });
    }
}

/**
 * Calculate letter grade from score
 */
function calculateGrade(score: number): string {
    if (score >= 100) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'A-';
    if (score >= 80) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 50) return 'C';
    if (score >= 45) return 'C-';
    if (score >= 40) return 'D+';
    if (score >= 30) return 'D';
    if (score >= 25) return 'D-';
    return 'F';
}

/**
 * Normalize URL - handles naked domains, www, and ensures protocol
 */
function normalizeURL(url: string): string {
    // Remove whitespace
    url = url.trim();

    // If URL already has a protocol, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // Add https:// by default for naked domains
    return 'https://' + url;
}

/**
 * Main function: Analyze URL security headers
 */
export async function get_http_observatory_v1(url: string): Promise<HTTPInfoResult | APIErrorResponse> {
    // Normalize URL to ensure it has protocol


    try {

        url = normalizeURL(url);

        // Fetch headers and content (follows redirects automatically)
        const { headers, finalUrl, ipAddress, html } = await fetchHeaders(url);

        // Extract meta tags
        const meta = extractMetaTags(html);

        // Extract header values
        const getString = (key: string): string | undefined => {
            const value = headers[key];
            return Array.isArray(value) ? value[0] : value;
        };

        const csp = getString('content-security-policy');
        const hsts = getString('strict-transport-security');
        const xContentType = getString('x-content-type-options');
        const xFrame = getString('x-frame-options');
        const referrer = getString('referrer-policy');
        const cors = getString('access-control-allow-origin');
        const corp = getString('cross-origin-resource-policy');
        const coop = getString('cross-origin-opener-policy');
        const coep = getString('cross-origin-embedder-policy');

        // Parse cookies
        const setCookie = headers['set-cookie'];
        const cookies = setCookie ? parseCookies(setCookie) : [];

        // Run all tests
        const tests: ObservatoryPartialResult[] = [];

        testCSP(csp, tests);
        testHSTS(hsts, tests);
        testXContentTypeOptions(xContentType, tests);
        testXFrameOptions(xFrame, tests);
        testReferrerPolicy(referrer, tests);
        testCookies(cookies, tests);
        testCORS(cors, tests);
        testRedirection(url, finalUrl, tests);
        testCrossOriginPolicies(corp, coop, coep, tests);

        // Calculate score
        const baselineScore = 100;
        let score = baselineScore;

        // Apply penalties
        for (const test of tests) {
            if (test.scoreModifier < 0) {
                score += test.scoreModifier;
            }
        }

        score = Math.max(0, score);

        // Apply bonuses if score >= 90
        if (score >= 90) {
            for (const test of tests) {
                if (test.scoreModifier > 0) {
                    score += test.scoreModifier;
                }
            }
        }

        const normalizedScore = score > 100 ? 1 : (score / 100)

        const testsPassed = tests.filter(t => t.pass).length;
        const testsFailed = tests.filter(t => !t.pass).length;

        return {
            url: finalUrl,
            ipv4: ipAddress,
            meta: {
                meta_title: meta.title,
                meta_description: meta.description
            },
            http_observatory: {
                score: normalizedScore,
                http_observatory_score: score,
                grade: calculateGrade(score),
                tests,
                testsPassed,
                testsFailed
            }
        };

    } catch (e) {
        return {
            err: "FETCH_CATCH",
            origin: 'http_observatory',
            details: e
        }
    }
}
