import {
  getCSP, NONE, STRICT_DYNAMIC, SELF,
  //  UNSAFE_INLINE 
} from 'csp-header';
import headers_remove from './headers_remove.json';

/*
 * headers_remove.json via
 * https://owasp.org/www-project-secure-headers/ci/headers_remove.json
 */


export const securityHeaders = (nonce: string): Headers => {
  const owaspHeaders = new Headers();

  owaspHeaders.set('Content-Security-Policy', contentSecurityPolicy(nonce));
  owaspHeaders.set('Cross-Origin-Embedder-Policy', 'same-origin');
  owaspHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');
  owaspHeaders.set('Cross-Origin-Resource-Policy', 'same-origin');
  owaspHeaders.set('Origin-Agent-Cluster', '?1');
  owaspHeaders.set('Permissions-Policy',
    'accelerometer=(), camera=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()');
  owaspHeaders.set('Referrer-Policy', 'origin-when-cross-origin');
  owaspHeaders.set('X-Content-Type-Options', 'nosniff');
  owaspHeaders.set('X-DNS-Prefetch-Control', 'off');
  owaspHeaders.set('X-Download-Options', 'noopen');
  owaspHeaders.set('X-Frame-Options', 'SAMEORIGIN');
  owaspHeaders.set('X-Permitted-Cross-Domain-Policies', 'none');
  owaspHeaders.set('X-XSS-Protection', '0');
  owaspHeaders.set('Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload');

  return owaspHeaders;
};

export const addSecurityHeaders = (headers: Headers, nonce: string): Headers => {
  const owaspHeaders = securityHeaders(nonce);

  owaspHeaders.forEach((value, key) => {
    headers.set(key, value);
  });

  return headers;
};

export const sanitizeHeaders = (headers: Headers): Headers => {
  headers_remove.headers.forEach((header) => {
    headers.delete(header);
  });

  return headers;
};

export const contentSecurityPolicy = (nonce: string): string => {
  return getCSP({
    directives: {
      'script-src': [
        `${STRICT_DYNAMIC} 'nonce-${nonce}'`
      ],
      'object-src': [NONE],
      'base-uri': [NONE],
      'upgrade-insecure-requests': true,
      'frame-ancestors': [NONE],
      'font-src': [SELF],
      'form-action': [SELF],
      'manifest-src': [SELF]
    }
  });
};