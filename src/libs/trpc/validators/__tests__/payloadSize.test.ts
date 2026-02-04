import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  PAYLOAD_SIZE_LIMITS,
  anyWithLimit,
  nullablePassthroughWithLimit,
  passthroughObjectWithLimit,
  passthroughPartialWithLimit,
  stringWithByteLimit,
  withPayloadSizeLimit,
} from '../payloadSize';

describe('payloadSize validators', () => {
  describe('withPayloadSizeLimit', () => {
    it('should pass for data within size limit', () => {
      const schema = withPayloadSizeLimit(z.object({ name: z.string() }), 1024, 'testField');
      const result = schema.safeParse({ name: 'hello' });
      expect(result.success).toBe(true);
    });

    it('should fail for data exceeding size limit', () => {
      const schema = withPayloadSizeLimit(z.object({ data: z.string() }), 10, 'testField');
      const result = schema.safeParse({ data: 'this is a long string that exceeds the limit' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Field 'testField'");
        expect(result.error.issues[0].message).toContain('exceeds size limit');
      }
    });

    it('should include size info in error params', () => {
      const schema = withPayloadSizeLimit(z.any(), 10, 'field');
      const result = schema.safeParse({ data: 'long content here' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues[0] as z.ZodIssue & { params?: Record<string, unknown> };
        expect(issue.params?.code).toBe('PAYLOAD_TOO_LARGE');
        expect(issue.params?.actualSize).toBeDefined();
        expect(issue.params?.maxSize).toBeDefined();
      }
    });

    it('should work without field name', () => {
      const schema = withPayloadSizeLimit(z.any(), 10);
      const result = schema.safeParse({ data: 'long content here' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Payload exceeds size limit');
      }
    });
  });

  describe('passthroughObjectWithLimit', () => {
    it('should accept passthrough objects within limit', () => {
      const schema = passthroughObjectWithLimit(1024, 'config');
      const result = schema.safeParse({ key1: 'value1', key2: 123 });
      expect(result.success).toBe(true);
    });

    it('should reject objects exceeding limit', () => {
      const schema = passthroughObjectWithLimit(20, 'config');
      const result = schema.safeParse({ longKey: 'this value is too long for the limit' });
      expect(result.success).toBe(false);
    });

    it('should allow unknown keys (passthrough)', () => {
      const schema = passthroughObjectWithLimit(1024);
      const result = schema.safeParse({ anyKey: 'anyValue', nested: { deep: true } });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ anyKey: 'anyValue', nested: { deep: true } });
      }
    });
  });

  describe('passthroughPartialWithLimit', () => {
    it('should accept partial objects within limit', () => {
      const schema = passthroughPartialWithLimit(1024, 'value');
      const result = schema.safeParse({ optionalField: 'value' });
      expect(result.success).toBe(true);
    });

    it('should accept empty objects', () => {
      const schema = passthroughPartialWithLimit(1024);
      const result = schema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject large partial objects', () => {
      const schema = passthroughPartialWithLimit(10, 'settings');
      const result = schema.safeParse({ largeField: 'content that exceeds the small limit' });
      expect(result.success).toBe(false);
    });
  });

  describe('stringWithByteLimit', () => {
    it('should pass for strings within byte limit', () => {
      const schema = stringWithByteLimit(1024, 'avatar');
      const result = schema.safeParse('short string');
      expect(result.success).toBe(true);
    });

    it('should fail for strings exceeding byte limit', () => {
      const schema = stringWithByteLimit(10, 'content');
      const result = schema.safeParse('this string is definitely longer than 10 bytes');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Field 'content'");
      }
    });

    it('should correctly count UTF-8 bytes for multibyte characters', () => {
      const schema = stringWithByteLimit(10, 'text');
      // Chinese characters are 3 bytes each in UTF-8
      // "你好世界" = 4 characters × 3 bytes = 12 bytes
      const result = schema.safeParse('你好世界');
      expect(result.success).toBe(false);

      // "你好" = 2 characters × 3 bytes = 6 bytes
      const result2 = schema.safeParse('你好');
      expect(result2.success).toBe(true);
    });

    it('should work without field name', () => {
      const schema = stringWithByteLimit(5);
      const result = schema.safeParse('too long');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('String exceeds size limit');
      }
    });
  });

  describe('nullablePassthroughWithLimit', () => {
    it('should accept null values', () => {
      const schema = nullablePassthroughWithLimit(1024, 'error');
      const result = schema.safeParse(null);
      expect(result.success).toBe(true);
    });

    it('should accept valid objects', () => {
      const schema = nullablePassthroughWithLimit(1024, 'error');
      const result = schema.safeParse({ message: 'error occurred' });
      expect(result.success).toBe(true);
    });

    it('should reject large objects', () => {
      const schema = nullablePassthroughWithLimit(10, 'error');
      const result = schema.safeParse({ message: 'this error message is too long' });
      expect(result.success).toBe(false);
    });
  });

  describe('anyWithLimit', () => {
    it('should accept any value within limit', () => {
      const schema = anyWithLimit(1024, 'manifest');
      expect(schema.safeParse('string').success).toBe(true);
      expect(schema.safeParse(123).success).toBe(true);
      expect(schema.safeParse({ key: 'value' }).success).toBe(true);
      expect(schema.safeParse([1, 2, 3]).success).toBe(true);
      expect(schema.safeParse(null).success).toBe(true);
    });

    it('should reject large values', () => {
      const schema = anyWithLimit(10, 'data');
      const result = schema.safeParse({ largeObject: 'with lots of content' });
      expect(result.success).toBe(false);
    });
  });

  describe('PAYLOAD_SIZE_LIMITS', () => {
    it('should have correct limit values', () => {
      expect(PAYLOAD_SIZE_LIMITS.DEFAULT_JSONB).toBe(100 * 1024);
      expect(PAYLOAD_SIZE_LIMITS.LARGE_JSONB).toBe(1024 * 1024);
      expect(PAYLOAD_SIZE_LIMITS.AVATAR_BASE64).toBe(5 * 1024 * 1024);
      expect(PAYLOAD_SIZE_LIMITS.IMPORT_DATA).toBe(50 * 1024 * 1024);
      expect(PAYLOAD_SIZE_LIMITS.MESSAGE_METADATA).toBe(100 * 1024);
      expect(PAYLOAD_SIZE_LIMITS.PLUGIN_MANIFEST).toBe(500 * 1024);
      expect(PAYLOAD_SIZE_LIMITS.PLUGIN_SETTINGS).toBe(100 * 1024);
      expect(PAYLOAD_SIZE_LIMITS.SESSION_CONFIG).toBe(500 * 1024);
      expect(PAYLOAD_SIZE_LIMITS.USER_SETTINGS).toBe(1024 * 1024);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle base64 avatar data', () => {
      const schema = stringWithByteLimit(PAYLOAD_SIZE_LIMITS.AVATAR_BASE64, 'avatar');
      // Simulate a small base64 image
      const smallBase64 = 'data:image/png;base64,' + 'A'.repeat(1000);
      expect(schema.safeParse(smallBase64).success).toBe(true);
    });

    it('should handle nested agent config', () => {
      const schema = passthroughPartialWithLimit(PAYLOAD_SIZE_LIMITS.LARGE_JSONB, 'agentConfig');
      const config = {
        model: 'gpt-4',
        systemPrompt: 'You are a helpful assistant.',
        temperature: 0.7,
        plugins: ['plugin1', 'plugin2'],
        nested: {
          settings: {
            enabled: true,
          },
        },
      };
      expect(schema.safeParse(config).success).toBe(true);
    });

    it('should handle import data structure', () => {
      const importSchema = z.object({
        data: z.object({
          messages: z.array(z.any()).optional(),
          sessions: z.array(z.any()).optional(),
          version: z.number(),
        }),
      });

      const limitedSchema = withPayloadSizeLimit(
        importSchema,
        PAYLOAD_SIZE_LIMITS.IMPORT_DATA,
        'importData',
      );

      const data = {
        data: {
          messages: Array.from({ length: 100 }, (_, i) => ({ id: i, content: 'message content' })),
          sessions: [{ id: 1, title: 'Session 1' }],
          version: 1,
        },
      };

      expect(limitedSchema.safeParse(data).success).toBe(true);
    });
  });
});
