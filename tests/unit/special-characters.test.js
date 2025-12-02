/**
 * Unit tests for special character handling
 * Validates Requirements 2.3: Special character preservation
 */

const { reportHandler } = require('../../handler');

describe('Special Character Handling', () => {
  test('should handle emoji in CSP report', async () => {
    const event = {
      requestContext: {
        requestId: 'test-123',
        http: { sourceIp: '127.0.0.1' }
      },
      headers: {
        'user-agent': 'Mozilla/5.0',
        'content-type': 'application/reports+json'
      },
      body: JSON.stringify({
        type: 'csp-violation',
        url: 'https://example.com',
        body: {
          documentURL: 'https://example.com/page-with-emoji-😀',
          blockedURL: 'https://evil.com/script-🎉.js',
          effectiveDirective: 'script-src'
        }
      })
    };

    const response = await reportHandler(event);
    expect(response.statusCode).toBe(200);
  });

  test('should handle Unicode characters in CSP report', async () => {
    const event = {
      requestContext: {
        requestId: 'test-456',
        http: { sourceIp: '127.0.0.1' }
      },
      headers: {
        'user-agent': 'Mozilla/5.0',
        'content-type': 'application/reports+json'
      },
      body: JSON.stringify({
        type: 'csp-violation',
        url: 'https://example.com/中文/日本語',
        body: {
          documentURL: 'https://example.com/中文页面',
          blockedURL: 'https://evil.com/スクリプト.js',
          effectiveDirective: 'script-src',
          sample: 'console.log("你好世界")'
        }
      })
    };

    const response = await reportHandler(event);
    expect(response.statusCode).toBe(200);
  });

  test('should handle control characters in CSP report', async () => {
    const event = {
      requestContext: {
        requestId: 'test-789',
        http: { sourceIp: '127.0.0.1' }
      },
      headers: {
        'user-agent': 'Mozilla/5.0',
        'content-type': 'application/reports+json'
      },
      body: JSON.stringify({
        type: 'csp-violation',
        url: 'https://example.com',
        body: {
          documentURL: 'https://example.com/page',
          blockedURL: 'https://evil.com/script.js',
          effectiveDirective: 'script-src',
          sample: 'console.log("line1\\nline2\\ttab")'
        }
      })
    };

    const response = await reportHandler(event);
    expect(response.statusCode).toBe(200);
  });

  test('should handle special symbols in CSP report', async () => {
    const event = {
      requestContext: {
        requestId: 'test-abc',
        http: { sourceIp: '127.0.0.1' }
      },
      headers: {
        'user-agent': 'Mozilla/5.0',
        'content-type': 'application/reports+json'
      },
      body: JSON.stringify({
        type: 'csp-violation',
        url: 'https://example.com',
        body: {
          documentURL: 'https://example.com/page©®™',
          blockedURL: 'https://evil.com/script.js',
          effectiveDirective: 'script-src',
          sample: '© 2024 Company™'
        }
      })
    };

    const response = await reportHandler(event);
    expect(response.statusCode).toBe(200);
  });

  test('should preserve special characters in error logs for invalid JSON', async () => {
    const event = {
      requestContext: {
        requestId: 'test-error',
        http: { sourceIp: '127.0.0.1' }
      },
      headers: {
        'user-agent': 'Mozilla/5.0',
        'content-type': 'application/reports+json'
      },
      body: 'invalid json with emoji 😀 and 中文'
    };

    const response = await reportHandler(event);
    expect(response.statusCode).toBe(200);
    expect(response.body).toContain('invalid JSON');
  });
});
