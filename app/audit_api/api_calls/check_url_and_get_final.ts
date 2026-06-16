import https from 'https';
import http from 'http';
import dns from 'node:dns/promises';
import net from 'node:net';

import { URL as NodeURL } from 'url';
import { CONFIG_CRAWLER_HEADERS } from '../v1/audit.config';


interface UrlCheckResult {
  success: boolean;
  finalUrl?: string;
  statusCode?: number;
  err?: string;
  redirectCount?: number
  origin?: "initial_fetch",
  details?:unknown
}

function isPrivateOrReservedIP(ip: string): boolean {
  const blocks = [
    /^127\./, /^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./,
    /^169\.254\./, /^0\./, /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
  ];
  if (net.isIPv4(ip)) return blocks.some(re => re.test(ip));
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    return lower === '::1' || lower.startsWith('fc') || lower.startsWith('fd')
      || lower.startsWith('fe80') || lower.startsWith('::ffff:127.');
  }
  return true;
}

function createSafeLookup(): http.RequestOptions['lookup'] {
  return async (hostname, opts, callback) => {
    try {
      const addresses = await dns.lookup(hostname, { all: true });
      for (const { address } of addresses) {
        if (isPrivateOrReservedIP(address)) {
          return callback(new Error(`Blocked restricted IP: ${address}`), '', 0);
        }
      }
      const chosen = addresses[0];
      callback(null, chosen.address, chosen.family);
    } catch (err) {
      callback(err as Error, '', 0);
    }
  };
}


export async function check_url_and_get_final(
  inputUrl: string,
  maxRedirects: number = 10
): Promise<UrlCheckResult> {
  // Normalize the URL - add https:// if no protocol is specified
  let normalizedUrl = inputUrl.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  let currentUrl = normalizedUrl;
  let redirectCount = 0;

  return new Promise((resolve) => {
    const makeRequest = (url: string): void => {
      let parsedUrl: NodeURL;
      try {
        parsedUrl = new NodeURL(url);
      } catch (err) {
        return resolve({
          success: false,
          details: `Invalid URL: ${(err as Error).message}`,
          err: `initial_fetch_invalid_url`,
          redirectCount,
          origin: "initial_fetch"
        });
      }

      const protocol = parsedUrl.protocol === 'https:' ? https : http;

      const options: http.RequestOptions = {
        method: 'GET', // Use GET to match browser behavior
        timeout: 10000, // 10 second timeout
        headers: CONFIG_CRAWLER_HEADERS,
        lookup: createSafeLookup()
      };

      const req = protocol.request(url, options, (res) => {
        const { statusCode, headers } = res;

        // Consume response data to free up memory (required for GET requests)
        res.resume();

        // Check if it's a redirect status code
        if (statusCode && statusCode >= 300 && statusCode < 400 && headers.location) {
          redirectCount++;

          if (redirectCount > maxRedirects) {
            return resolve({
              success: false,
              err: `initial_fetch_too_many_redirects`,
              details: `Too many redirects (>${maxRedirects})`,
              redirectCount,
              origin: "initial_fetch"
            });
          }

          // Handle relative URLs in Location header
          let nextUrl = headers.location;
          if (!nextUrl.startsWith('http')) {
            const base = `${parsedUrl.protocol}//${parsedUrl.host}`;
            nextUrl = new NodeURL(nextUrl, base).href;
          }

          currentUrl = nextUrl;
          return makeRequest(nextUrl);
        }

        // Success - website exists
        if (statusCode && statusCode >= 200 && statusCode < 300) {
          return resolve({
            success: true,
            finalUrl: currentUrl,
            statusCode: statusCode,
            redirectCount
          });
        }

        // Client or server error
        resolve({
          success: false,
          finalUrl: currentUrl,
          statusCode: statusCode,
          err: `initial_fetch_catch`,
          details: `HTTP ${statusCode}`,
          redirectCount,
          origin: "initial_fetch"
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          success: false,
          err: 'initial_fetch_request_timeout',
          redirectCount,
          origin: "initial_fetch"
        });
      });

      req.on('error', (err: NodeJS.ErrnoException) => {
        // If HTTPS fails, try HTTP as fallback (only on first attempt)
        if (redirectCount === 0 && parsedUrl.protocol === 'https:' &&
          (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED')) {
          const httpUrl = url.replace('https://', 'http://');
          return makeRequest(httpUrl);
        }

        resolve({
          success: false,
          details: err.message,
          err: "could_not_load_page",
          redirectCount,
          origin: "initial_fetch"
        });
      });

      req.end();
    };

    makeRequest(currentUrl);
  });
}
