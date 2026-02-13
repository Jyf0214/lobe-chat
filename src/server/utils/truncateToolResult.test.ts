// @vitest-environment node
import { describe, expect, it } from 'vitest';

import {
  DEFAULT_TOOL_RESULT_MAX_LENGTH,
  truncateToolResult,
  truncateToolResultWithState,
} from './truncateToolResult';

describe('truncateToolResult', () => {
  describe('content within or at limit', () => {
    it('should return content unchanged when within limit', () => {
      const content = 'Short content';
      const result = truncateToolResult(content);
      expect(result).toBe(content);
    });

    it('should return content unchanged when exactly at default limit', () => {
      const content = 'x'.repeat(DEFAULT_TOOL_RESULT_MAX_LENGTH);
      const result = truncateToolResult(content);
      expect(result).toBe(content);
    });

    it('should return content unchanged when exactly at custom limit', () => {
      const content = 'x'.repeat(100);
      const result = truncateToolResult(content, 100);
      expect(result).toBe(content);
    });

    it('should handle empty string', () => {
      const result = truncateToolResult('');
      expect(result).toBe('');
    });

    it('should handle null/undefined by returning as-is', () => {
      const resultNull = truncateToolResult(null as any);
      expect(resultNull).toBe(null);

      const resultUndefined = truncateToolResult(undefined as any);
      expect(resultUndefined).toBe(undefined);
    });
  });

  describe('content exceeding limit', () => {
    it('should truncate content when exceeding default limit', () => {
      const content = 'x'.repeat(DEFAULT_TOOL_RESULT_MAX_LENGTH + 100);
      const result = truncateToolResult(content);

      // Should start with truncated content
      expect(result.startsWith('x'.repeat(DEFAULT_TOOL_RESULT_MAX_LENGTH))).toBe(true);
      // Should include truncation notice
      expect(result).toContain('[Content truncated:');
      expect(result).toContain('100 characters omitted');
      expect(result).toContain(`Original length: ${content.length.toLocaleString()} characters]`);
    });

    it('should truncate content when exceeding custom limit', () => {
      const customLimit = 50;
      const content = 'x'.repeat(100);
      const result = truncateToolResult(content, customLimit);

      // Should be truncated at custom limit
      expect(result.startsWith('x'.repeat(customLimit))).toBe(true);
      // Should include truncation notice with correct count
      expect(result).toContain('[Content truncated:');
      expect(result).toContain('50 characters omitted');
      expect(result).toContain('Original length: 100 characters]');
    });

    it('should format large numbers with locale string', () => {
      const content = 'x'.repeat(30_000);
      const result = truncateToolResult(content);

      // Should use toLocaleString for formatting
      expect(result).toContain('5,000 characters omitted');
      expect(result).toContain('Original length: 30,000 characters]');
    });

    it('should preserve truncated content before notice', () => {
      const content = 'ABCDEFGHIJ'.repeat(10); // 100 chars
      const result = truncateToolResult(content, 50);

      // First 50 chars should be preserved
      expect(result.slice(0, 50)).toBe('ABCDEFGHIJ'.repeat(5));
      // Followed by notice
      expect(result.slice(50)).toContain('[Content truncated:');
    });

    it('should include notice with double newlines', () => {
      const content = 'x'.repeat(100);
      const result = truncateToolResult(content, 50);

      // Notice should start with double newline
      expect(result).toContain('\n\n[Content truncated:');
    });
  });

  describe('edge cases', () => {
    it('should handle content exactly 1 character over limit', () => {
      const content = 'x'.repeat(101);
      const result = truncateToolResult(content, 100);

      expect(result.startsWith('x'.repeat(100))).toBe(true);
      expect(result).toContain('1 characters omitted');
    });

    it('should handle very small custom limits', () => {
      const content = 'Hello, World!';
      const result = truncateToolResult(content, 5);

      expect(result.startsWith('Hello')).toBe(true);
      expect(result).toContain('[Content truncated:');
      expect(result).toContain('8 characters omitted');
      expect(result).toContain('Original length: 13 characters]');
    });

    it('should handle limit of 0', () => {
      const content = 'Hello';
      const result = truncateToolResult(content, 0);

      expect(result.startsWith('')).toBe(true);
      expect(result).toContain('[Content truncated:');
      expect(result).toContain('5 characters omitted');
    });

    it('should handle negative limit by treating as default', () => {
      const content = 'Short content';
      const result = truncateToolResult(content, -100);

      // With negative limit, it would slice to 0, then add notice
      expect(result).toContain('[Content truncated:');
    });

    it('should handle unicode characters correctly', () => {
      const content = '你好世界'.repeat(5000); // Chinese characters
      const result = truncateToolResult(content, 100);

      // Should truncate at character count, not byte count
      expect(result.slice(0, 100).length).toBe(100);
      expect(result).toContain('[Content truncated:');
    });

    it('should handle multiline content', () => {
      const content = Array.from({ length: 1000 }, (_, i) => `Line ${i}`).join('\n');
      const result = truncateToolResult(content, 100);

      expect(result.slice(0, 100).length).toBe(100);
      expect(result).toContain('[Content truncated:');
    });
  });

  describe('maxLength parameter variations', () => {
    it('should use DEFAULT_TOOL_RESULT_MAX_LENGTH when maxLength is undefined', () => {
      const content = 'x'.repeat(DEFAULT_TOOL_RESULT_MAX_LENGTH + 1);
      const result = truncateToolResult(content);

      expect(result.startsWith('x'.repeat(DEFAULT_TOOL_RESULT_MAX_LENGTH))).toBe(true);
      expect(result).toContain('1 characters omitted');
    });

    it('should use DEFAULT_TOOL_RESULT_MAX_LENGTH when maxLength is null', () => {
      const content = 'x'.repeat(DEFAULT_TOOL_RESULT_MAX_LENGTH + 1);
      const result = truncateToolResult(content, null as any);

      expect(result.startsWith('x'.repeat(DEFAULT_TOOL_RESULT_MAX_LENGTH))).toBe(true);
      expect(result).toContain('1 characters omitted');
    });

    it('should accept custom maxLength of various sizes', () => {
      const testCases = [10, 100, 1000, 10_000];

      testCases.forEach((maxLength) => {
        const content = 'x'.repeat(maxLength + 50);
        const result = truncateToolResult(content, maxLength);

        expect(result.startsWith('x'.repeat(maxLength))).toBe(true);
        expect(result).toContain('50 characters omitted');
      });
    });
  });
});

describe('truncateToolResultWithState', () => {
  describe('basic functionality', () => {
    it('should truncate content while preserving state', () => {
      const result = {
        content: 'x'.repeat(100),
        state: { key: 'value', nested: { data: 123 } },
      };

      const truncated = truncateToolResultWithState(result, 50);

      expect(truncated.content.startsWith('x'.repeat(50))).toBe(true);
      expect(truncated.content).toContain('[Content truncated:');
      expect(truncated.state).toEqual({ key: 'value', nested: { data: 123 } });
    });

    it('should handle result without state property', () => {
      const result = {
        content: 'x'.repeat(100),
      };

      const truncated = truncateToolResultWithState(result, 50);

      expect(truncated.content.startsWith('x'.repeat(50))).toBe(true);
      expect(truncated.content).toContain('[Content truncated:');
      expect(truncated).not.toHaveProperty('state');
    });

    it('should preserve undefined state', () => {
      const result = {
        content: 'x'.repeat(100),
        state: undefined,
      };

      const truncated = truncateToolResultWithState(result, 50);

      expect(truncated.content.startsWith('x'.repeat(50))).toBe(true);
      expect(truncated.state).toBeUndefined();
    });

    it('should preserve null state', () => {
      const result = {
        content: 'x'.repeat(100),
        state: null,
      };

      const truncated = truncateToolResultWithState(result, 50);

      expect(truncated.content.startsWith('x'.repeat(50))).toBe(true);
      expect(truncated.state).toBeNull();
    });
  });

  describe('content handling', () => {
    it('should not truncate when content is within limit', () => {
      const result = {
        content: 'Short content',
        state: { key: 'value' },
      };

      const truncated = truncateToolResultWithState(result, 100);

      expect(truncated.content).toBe('Short content');
      expect(truncated.state).toEqual({ key: 'value' });
    });

    it('should use default limit when maxLength is undefined', () => {
      const result = {
        content: 'x'.repeat(DEFAULT_TOOL_RESULT_MAX_LENGTH + 100),
        state: { key: 'value' },
      };

      const truncated = truncateToolResultWithState(result);

      expect(truncated.content.startsWith('x'.repeat(DEFAULT_TOOL_RESULT_MAX_LENGTH))).toBe(true);
      expect(truncated.content).toContain('100 characters omitted');
      expect(truncated.state).toEqual({ key: 'value' });
    });

    it('should handle empty content', () => {
      const result = {
        content: '',
        state: { key: 'value' },
      };

      const truncated = truncateToolResultWithState(result);

      expect(truncated.content).toBe('');
      expect(truncated.state).toEqual({ key: 'value' });
    });
  });

  describe('state preservation', () => {
    it('should preserve complex nested state objects', () => {
      const result = {
        content: 'x'.repeat(100),
        state: {
          level1: {
            level2: {
              level3: {
                array: [1, 2, 3],
                boolean: true,
                null: null,
              },
            },
          },
        },
      };

      const truncated = truncateToolResultWithState(result, 50);

      expect(truncated.state).toEqual(result.state);
      // State is preserved by reference (shallow copy via spread)
      expect(truncated.state).toBe(result.state);
    });

    it('should preserve state with various data types', () => {
      const result = {
        content: 'test content',
        state: {
          string: 'text',
          number: 42,
          boolean: true,
          null: null,
          undefined: undefined,
          array: [1, 'two', { three: 3 }],
          date: new Date('2024-01-01'),
        },
      };

      const truncated = truncateToolResultWithState(result);

      expect(truncated.state).toEqual(result.state);
    });

    it('should preserve empty state object', () => {
      const result = {
        content: 'test content',
        state: {},
      };

      const truncated = truncateToolResultWithState(result);

      expect(truncated.state).toEqual({});
    });
  });

  describe('additional properties', () => {
    it('should preserve additional properties beyond content and state', () => {
      const result = {
        content: 'x'.repeat(100),
        state: { key: 'value' },
        extraProp1: 'extra1',
        extraProp2: 123,
        extraProp3: { nested: 'object' },
      };

      const truncated = truncateToolResultWithState(result, 50);

      expect(truncated.content.startsWith('x'.repeat(50))).toBe(true);
      expect(truncated.state).toEqual({ key: 'value' });
      expect(truncated.extraProp1).toBe('extra1');
      expect(truncated.extraProp2).toBe(123);
      expect(truncated.extraProp3).toEqual({ nested: 'object' });
    });

    it('should handle result with only content property', () => {
      const result = {
        content: 'x'.repeat(100),
      };

      const truncated = truncateToolResultWithState(result, 50);

      expect(truncated).toHaveProperty('content');
      expect(Object.keys(truncated)).toEqual(['content']);
    });
  });

  describe('type safety', () => {
    it('should maintain type safety for different state types', () => {
      interface CustomState {
        sessionId: number;
        userId: string;
      }

      const result: { content: string; state?: CustomState } = {
        content: 'x'.repeat(100),
        state: {
          userId: 'user-123',
          sessionId: 456,
        },
      };

      const truncated = truncateToolResultWithState(result, 50);

      expect(truncated.state?.userId).toBe('user-123');
      expect(truncated.state?.sessionId).toBe(456);
    });

    it('should handle result with state as array', () => {
      const result = {
        content: 'test content',
        state: [1, 2, 3, 4, 5],
      };

      const truncated = truncateToolResultWithState(result);

      expect(truncated.state).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle result with state as string', () => {
      const result = {
        content: 'test content',
        state: 'string state',
      };

      const truncated = truncateToolResultWithState(result);

      expect(truncated.state).toBe('string state');
    });

    it('should handle result with state as number', () => {
      const result = {
        content: 'test content',
        state: 42,
      };

      const truncated = truncateToolResultWithState(result);

      expect(truncated.state).toBe(42);
    });
  });

  describe('edge cases', () => {
    it('should handle very large state objects', () => {
      const largeState = {
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          value: `item-${i}`,
        })),
      };

      const result = {
        content: 'x'.repeat(100),
        state: largeState,
      };

      const truncated = truncateToolResultWithState(result, 50);

      expect(truncated.state).toEqual(largeState);
      expect(truncated.content).toContain('[Content truncated:');
    });

    it('should not mutate original result object', () => {
      const original = {
        content: 'x'.repeat(100),
        state: { key: 'value' },
      };

      const originalContent = original.content;
      const originalState = original.state;

      const truncated = truncateToolResultWithState(original, 50);

      // Original should remain unchanged
      expect(original.content).toBe(originalContent);
      expect(original.state).toBe(originalState);
      // Truncated should be different
      expect(truncated.content).not.toBe(original.content);
    });
  });
});

describe('DEFAULT_TOOL_RESULT_MAX_LENGTH', () => {
  it('should be set to 25000', () => {
    expect(DEFAULT_TOOL_RESULT_MAX_LENGTH).toBe(25_000);
  });

  it('should be used as default in truncateToolResult', () => {
    const content = 'x'.repeat(DEFAULT_TOOL_RESULT_MAX_LENGTH + 1);
    const result = truncateToolResult(content);

    expect(result).toContain('1 characters omitted');
    expect(result).toContain(
      `Original length: ${(DEFAULT_TOOL_RESULT_MAX_LENGTH + 1).toLocaleString()} characters]`,
    );
  });

  it('should be used as default in truncateToolResultWithState', () => {
    const result = {
      content: 'x'.repeat(DEFAULT_TOOL_RESULT_MAX_LENGTH + 1),
      state: {},
    };

    const truncated = truncateToolResultWithState(result);

    expect(truncated.content).toContain('1 characters omitted');
  });
});
