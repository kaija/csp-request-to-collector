/**
 * Round-trip tests for special character preservation
 * Validates that special characters survive JSON parse → stringify cycle
 * Validates Requirements 2.3: Special character preservation
 */

describe('Special Character Round-trip', () => {
  test('emoji should survive JSON parse and stringify', () => {
    const original = { message: 'Hello 😀 World 🎉' };
    const jsonString = JSON.stringify(original);
    const parsed = JSON.parse(jsonString);
    const reStringified = JSON.stringify(parsed);
    
    expect(parsed.message).toBe('Hello 😀 World 🎉');
    expect(reStringified).toBe(jsonString);
  });

  test('Unicode characters should survive JSON parse and stringify', () => {
    const original = { 
      chinese: '你好世界',
      japanese: '日本語',
      korean: '한국어',
      arabic: 'مرحبا'
    };
    const jsonString = JSON.stringify(original);
    const parsed = JSON.parse(jsonString);
    const reStringified = JSON.stringify(parsed);
    
    expect(parsed.chinese).toBe('你好世界');
    expect(parsed.japanese).toBe('日本語');
    expect(parsed.korean).toBe('한국어');
    expect(parsed.arabic).toBe('مرحبا');
    expect(reStringified).toBe(jsonString);
  });

  test('control characters should survive JSON parse and stringify', () => {
    const original = { message: 'line1\nline2\ttab\rcarriage' };
    const jsonString = JSON.stringify(original);
    const parsed = JSON.parse(jsonString);
    
    expect(parsed.message).toBe('line1\nline2\ttab\rcarriage');
  });

  test('special symbols should survive JSON parse and stringify', () => {
    const original = { 
      copyright: '© 2024',
      registered: '®',
      trademark: '™',
      euro: '€',
      pound: '£'
    };
    const jsonString = JSON.stringify(original);
    const parsed = JSON.parse(jsonString);
    const reStringified = JSON.stringify(parsed);
    
    expect(parsed.copyright).toBe('© 2024');
    expect(parsed.registered).toBe('®');
    expect(parsed.trademark).toBe('™');
    expect(parsed.euro).toBe('€');
    expect(parsed.pound).toBe('£');
    expect(reStringified).toBe(jsonString);
  });

  test('mixed special characters should survive JSON parse and stringify', () => {
    const original = {
      url: 'https://example.com/中文/page-😀',
      sample: 'console.log("Hello\\nWorld")',
      copyright: '© 2024 Company™'
    };
    const jsonString = JSON.stringify(original);
    const parsed = JSON.parse(jsonString);
    const reStringified = JSON.stringify(parsed);
    
    expect(parsed.url).toBe('https://example.com/中文/page-😀');
    expect(parsed.sample).toBe('console.log("Hello\\nWorld")');
    expect(parsed.copyright).toBe('© 2024 Company™');
    expect(reStringified).toBe(jsonString);
  });
});
