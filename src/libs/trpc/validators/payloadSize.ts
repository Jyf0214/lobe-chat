import { ZodTypeAny, z } from 'zod';

/**
 * Payload size limits for various data types in the application.
 * These limits help prevent abuse and protect server resources.
 */
export const PAYLOAD_SIZE_LIMITS = {
  /** 5MB - Avatar base64 encoded images */
  AVATAR_BASE64: 5 * 1024 * 1024,
  /** 100KB - General metadata fields */
  DEFAULT_JSONB: 100 * 1024,
  /** 50MB - Bulk import operations */
  IMPORT_DATA: 50 * 1024 * 1024,
  /** 1MB - Large configuration objects like agent config */
  LARGE_JSONB: 1024 * 1024,
  /** 100KB - Message metadata */
  MESSAGE_METADATA: 100 * 1024,
  /** 500KB - Plugin manifest files */
  PLUGIN_MANIFEST: 500 * 1024,
  /** 100KB - Plugin settings */
  PLUGIN_SETTINGS: 100 * 1024,
  /** 500KB - Session configuration */
  SESSION_CONFIG: 500 * 1024,
  /** 1MB - User settings */
  USER_SETTINGS: 1024 * 1024,
};

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/**
 * Calculate the byte size of a value when JSON stringified
 */
function getByteSize(value: unknown): number {
  if (typeof value === 'string') {
    return new TextEncoder().encode(value).length;
  }
  return new TextEncoder().encode(JSON.stringify(value)).length;
}

/**
 * Add payload size limit validation to any Zod schema using superRefine.
 * This preserves the original schema's type inference while adding size validation.
 *
 * @param schema - The Zod schema to wrap with size validation
 * @param maxSize - Maximum allowed payload size in bytes
 * @param fieldName - Optional field name for error messages
 * @returns The schema with size validation added
 *
 * @example
 * ```ts
 * const schema = withPayloadSizeLimit(
 *   z.object({ data: z.any() }),
 *   PAYLOAD_SIZE_LIMITS.LARGE_JSONB,
 *   'agentConfig'
 * );
 * ```
 */
export function withPayloadSizeLimit<T extends ZodTypeAny>(
  schema: T,
  maxSize: number,
  fieldName?: string,
): z.ZodEffects<T> {
  return schema.superRefine((val, ctx) => {
    const size = getByteSize(val);
    if (size > maxSize) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${fieldName ? `Field '${fieldName}' ` : 'Payload '}exceeds size limit: ${formatBytes(size)} > ${formatBytes(maxSize)}`,
        params: {
          actualSize: formatBytes(size),
          code: 'PAYLOAD_TOO_LARGE',
          maxSize: formatBytes(maxSize),
        },
      });
    }
  });
}

/**
 * Create a passthrough object schema with size limit validation.
 * Useful for accepting arbitrary objects while limiting total payload size.
 *
 * @param maxSize - Maximum allowed payload size in bytes
 * @param fieldName - Optional field name for error messages
 * @returns A passthrough object schema with size validation
 *
 * @example
 * ```ts
 * const schema = z.object({
 *   config: passthroughObjectWithLimit(PAYLOAD_SIZE_LIMITS.SESSION_CONFIG, 'sessionConfig'),
 * });
 * ```
 */
export function passthroughObjectWithLimit(maxSize: number, fieldName?: string) {
  return withPayloadSizeLimit(z.object({}).passthrough(), maxSize, fieldName);
}

/**
 * Create a partial passthrough object schema with size limit validation.
 * Useful for accepting partial objects (updates) while limiting total payload size.
 *
 * @param maxSize - Maximum allowed payload size in bytes
 * @param fieldName - Optional field name for error messages
 * @returns A partial passthrough object schema with size validation
 *
 * @example
 * ```ts
 * const schema = z.object({
 *   value: passthroughPartialWithLimit(PAYLOAD_SIZE_LIMITS.LARGE_JSONB, 'agentConfig'),
 * });
 * ```
 */
export function passthroughPartialWithLimit(maxSize: number, fieldName?: string) {
  return withPayloadSizeLimit(z.object({}).passthrough().partial(), maxSize, fieldName);
}

/**
 * Create a string schema with byte size limit validation.
 * Useful for limiting base64 encoded data or large text content.
 *
 * @param maxBytes - Maximum allowed string size in bytes
 * @param fieldName - Optional field name for error messages
 * @returns A string schema with byte size validation
 *
 * @example
 * ```ts
 * const avatarSchema = stringWithByteLimit(PAYLOAD_SIZE_LIMITS.AVATAR_BASE64, 'avatar');
 * ```
 */
export function stringWithByteLimit(maxBytes: number, fieldName?: string) {
  return z.string().superRefine((val, ctx) => {
    const size = new TextEncoder().encode(val).length;
    if (size > maxBytes) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${fieldName ? `Field '${fieldName}' ` : 'String '}exceeds size limit: ${formatBytes(size)} > ${formatBytes(maxBytes)}`,
        params: {
          actualSize: formatBytes(size),
          code: 'PAYLOAD_TOO_LARGE',
          maxSize: formatBytes(maxBytes),
        },
      });
    }
  });
}

/**
 * Create a schema for nullable passthrough objects with size limit.
 * Useful for optional fields that can be null or an object.
 *
 * @param maxSize - Maximum allowed payload size in bytes
 * @param fieldName - Optional field name for error messages
 * @returns A nullable passthrough object schema with size validation
 */
export function nullablePassthroughWithLimit(maxSize: number, fieldName?: string) {
  return withPayloadSizeLimit(z.object({}).passthrough().nullable(), maxSize, fieldName);
}

/**
 * Create a z.any() schema with size limit validation.
 * Use sparingly - prefer more specific schemas when possible.
 *
 * @param maxSize - Maximum allowed payload size in bytes
 * @param fieldName - Optional field name for error messages
 * @returns A z.any() schema with size validation
 *
 * @example
 * ```ts
 * const schema = z.object({
 *   manifest: anyWithLimit(PAYLOAD_SIZE_LIMITS.PLUGIN_MANIFEST, 'manifest'),
 * });
 * ```
 */
export function anyWithLimit(maxSize: number, fieldName?: string) {
  return withPayloadSizeLimit(z.any(), maxSize, fieldName);
}
