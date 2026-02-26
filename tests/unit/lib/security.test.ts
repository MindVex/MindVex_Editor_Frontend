import { describe, it, expect } from 'vitest';
import {
    validateApiKeyFormat,
    sanitizeErrorMessage,
    createSecurityHeaders,
    checkRateLimit,
} from '../../../app/lib/security';

// ─────────────────────────────────────────────────────────────────────────────
// validateApiKeyFormat
// ─────────────────────────────────────────────────────────────────────────────
describe('validateApiKeyFormat', () => {
    it('should return false for empty string', () => {
        expect(validateApiKeyFormat('', 'openai')).toBe(false);
    });

    it('should return false for null/undefined input', () => {
        expect(validateApiKeyFormat(null as any, 'openai')).toBe(false);
        expect(validateApiKeyFormat(undefined as any, 'openai')).toBe(false);
    });

    it('should return false for keys that are too short', () => {
        expect(validateApiKeyFormat('short', 'openai')).toBe(false);
    });

    it('should return false for keys containing "your_" placeholder', () => {
        expect(validateApiKeyFormat('your_api_key_goes_here_please_replace_this_value', 'openai')).toBe(false);
    });

    it('should return false for keys containing "here" placeholder', () => {
        expect(validateApiKeyFormat('paste_your_openai_key_here_in_this_field_abcde', 'openai')).toBe(false);
    });

    it('should return true for a valid Anthropic key (>=50 chars)', () => {
        expect(validateApiKeyFormat('sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'anthropic')).toBe(true);
    });

    it('should return true for a valid OpenAI key', () => {
        expect(validateApiKeyFormat('sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'openai')).toBe(true);
    });

    it('should return true for a valid Google key (>=30 chars)', () => {
        expect(validateApiKeyFormat('AIzaSyxxxxxxxxxxxxxxxxxxxxxxxx1', 'google')).toBe(true);
    });

    it('should apply a minimum length of 20 for unknown providers', () => {
        expect(validateApiKeyFormat('12345678901234567890', 'unknown')).toBe(true);
        expect(validateApiKeyFormat('1234567890123456789', 'unknown')).toBe(false);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// sanitizeErrorMessage
// ─────────────────────────────────────────────────────────────────────────────
describe('sanitizeErrorMessage', () => {
    it('should return the full error message in development mode', () => {
        expect(sanitizeErrorMessage(new Error('Detailed internal error'), true)).toBe('Detailed internal error');
    });

    it('should return a generic message in production for regular errors', () => {
        expect(sanitizeErrorMessage(new Error('Something broke'), false)).toBe('An unexpected error occurred');
    });

    it('should return "Authentication failed" when error mentions API key', () => {
        expect(sanitizeErrorMessage(new Error('Invalid API key'), false)).toBe('Authentication failed');
    });

    it('should return "Authentication failed" when error mentions token', () => {
        expect(sanitizeErrorMessage(new Error('The token has expired'), false)).toBe('Authentication failed');
    });

    it('should return "Authentication failed" when error mentions secret', () => {
        expect(sanitizeErrorMessage(new Error('Wrong secret value'), false)).toBe('Authentication failed');
    });

    it('should return a rate limit message when error mentions rate limit', () => {
        const result = sanitizeErrorMessage(new Error('You exceeded the rate limit'), false);
        expect(result.toLowerCase()).toContain('rate limit');
    });

    it('should return a rate limit message when error mentions 429', () => {
        const result = sanitizeErrorMessage(new Error('HTTP 429 Too Many Requests'), false);
        expect(result.toLowerCase()).toContain('rate limit');
    });

    it('should handle strings in development mode', () => {
        expect(sanitizeErrorMessage('a plain string', true)).toBe('a plain string');
    });

    it('should handle non-Error objects in production mode', () => {
        expect(sanitizeErrorMessage({ some: 'object' }, false)).toBe('An unexpected error occurred');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// createSecurityHeaders
// ─────────────────────────────────────────────────────────────────────────────
describe('createSecurityHeaders', () => {
    it('should return an object', () => {
        expect(typeof createSecurityHeaders()).toBe('object');
    });

    it('should set X-Frame-Options to DENY to prevent clickjacking', () => {
        expect(createSecurityHeaders()['X-Frame-Options']).toBe('DENY');
    });

    it('should set X-Content-Type-Options to nosniff', () => {
        expect(createSecurityHeaders()['X-Content-Type-Options']).toBe('nosniff');
    });

    it('should include X-XSS-Protection header', () => {
        expect(createSecurityHeaders()).toHaveProperty('X-XSS-Protection');
    });

    it('should include Content-Security-Policy header', () => {
        expect(createSecurityHeaders()).toHaveProperty('Content-Security-Policy');
    });

    it('should include Referrer-Policy header', () => {
        expect(createSecurityHeaders()).toHaveProperty('Referrer-Policy');
    });

    it('should restrict camera, microphone, and geolocation in Permissions-Policy', () => {
        const policy = createSecurityHeaders()['Permissions-Policy'];
        expect(policy).toContain('camera=()');
        expect(policy).toContain('microphone=()');
        expect(policy).toContain('geolocation=()');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// checkRateLimit
//
// NOTE: The security module stores rate-limit state in a module-level Map that
// persists across tests. We keep tests isolated by using different IP addresses
// and endpoint paths for each test.
//
// IMPORTANT IMPLEMENTATION NOTE: The rate-limit rules are matched via
// Object.entries().find(), which means the first-matching rule wins. The
// wildcard rule '/api/*' (100 req/15min) matches BEFORE the more specific
// '/api/llmcall' rule (10 req/min). Tests reflect this actual runtime behaviour.
// ─────────────────────────────────────────────────────────────────────────────
// Monotonic counter to guarantee unique IPs across all tests and test files
let _ipCounter = 10000;
const freshIp = () => {
    _ipCounter += 1;
    return `198.51.100.${_ipCounter % 256}`;  // TEST-NET-3 reserved range
};

const makeRequest = (ip: string, path: string) =>
    new Request(`http://localhost${path}`, { headers: { 'x-real-ip': ip } });

describe('checkRateLimit', () => {
    it('should allow the first request for any matching endpoint', () => {
        const result = checkRateLimit(makeRequest(freshIp(), '/api/health'), '/api/health');
        expect(result.allowed).toBe(true);
    });

    it('should allow requests well under the rate limit', () => {
        const ip = freshIp();
        for (let i = 0; i < 5; i++) {
            expect(checkRateLimit(makeRequest(ip, '/api/testpath'), '/api/testpath').allowed).toBe(true);
        }
    });

    it('should eventually block requests for /api endpoints after 100 requests (wildcard rule)', () => {
        // The wildcard '/api/*' rule matches first (100 req/15min limit).
        // The specific '/api/llmcall' rule is unreachable due to pattern ordering.
        const ip = freshIp();
        let blocked = false;
        for (let i = 0; i <= 101; i++) {
            const res = checkRateLimit(makeRequest(ip, `/api/bulk-test`), `/api/bulk-test`);
            if (!res.allowed) {
                blocked = true;
                break;
            }
        }
        expect(blocked).toBe(true);
    });

    it('should include a resetTime when a request is blocked', () => {
        const ip = freshIp();
        // Exhaust the 100 request wildcard limit
        for (let i = 0; i < 100; i++) {
            checkRateLimit(makeRequest(ip, '/api/limit-reset-test'), '/api/limit-reset-test');
        }
        const now = Date.now();
        const result = checkRateLimit(makeRequest(ip, '/api/limit-reset-test'), '/api/limit-reset-test');
        expect(result.allowed).toBe(false);
        expect(typeof result.resetTime).toBe('number');
        expect(result.resetTime!).toBeGreaterThan(now - 1000);
    });

    it('should return allowed=true for endpoints with no matching rule', () => {
        const result = checkRateLimit(makeRequest(freshIp(), '/unknown/path'), '/unknown/path');
        expect(result.allowed).toBe(true);
    });

    it('should track rate limits independently per IP address', () => {
        const ip1 = freshIp();
        const ip2 = freshIp();
        // Exhaust limit for ip1
        for (let i = 0; i < 100; i++) {
            checkRateLimit(makeRequest(ip1, '/api/per-ip-test'), '/api/per-ip-test');
        }
        // ip1 is blocked; ip2 should still be allowed
        expect(checkRateLimit(makeRequest(ip1, '/api/per-ip-test'), '/api/per-ip-test').allowed).toBe(false);
        expect(checkRateLimit(makeRequest(ip2, '/api/per-ip-test'), '/api/per-ip-test').allowed).toBe(true);
    });
});
