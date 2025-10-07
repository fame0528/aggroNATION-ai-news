/**
 * OVERVIEW: Serialization helpers for safely converting Mongo/Mongoose documents
 * and arbitrary nested objects into JSON-friendly, plain data structures that can
 * be passed to Next.js Server Components or sent over the network.
 *
 * Responsibilities:
 * - Convert ObjectId, Date, and other special BSON/Mongoose types to strings
 * - Recursively process arrays and plain objects
 * - Remove internal keys like __v and any functions
 * - Prevent circular references
 * - Provide both single and bulk serialization helpers
 *
 * Design Notes:
 * - Idempotent: Re-serializing an already serialized object will return an equivalent object
 * - Immutable: Does not mutate the source input
 * - Defensive: Catches unexpected errors and falls back gracefully
 *
 * Usage Example:
 * ```ts
 * import { serializeDoc, serializeDocs } from '@/lib/serialize';
 * const raw = await Model.find().lean();
 * const items = serializeDocs(raw);
 * ```
 */
import type { Types } from 'mongoose';

type SerializablePrimitive = string | number | boolean | null;
type JSONObject = { [key: string]: JSONValue };
interface JSONArray extends Array<JSONValue> {}
type JSONValue = SerializablePrimitive | JSONArray | JSONObject;

interface SerializeOptions {
  /** When true, remove keys with undefined value (default true) */
  stripUndefined?: boolean;
  /** Additional keys to omit */
  omitKeys?: string[];
}

const DEFAULT_OPTIONS: Required<SerializeOptions> = {
  stripUndefined: true,
  omitKeys: ['__v', '$__']
};

/** Type guard for plain objects */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

/** Detect Mongo ObjectId without importing full mongoose everywhere */
function isObjectId(value: unknown): value is Types.ObjectId {
  if (!value || typeof value !== 'object') return false;
  const v: any = value;
  // Mongoose/MongoDB drivers expose either 'ObjectId' or 'ObjectID'
  if (v._bsontype === 'ObjectId' || v._bsontype === 'ObjectID') return true;
  // Duck-type common methods
  if (typeof v.toHexString === 'function') return true;
  // Some serializers wrap as {$oid: string}
  if (typeof v.$oid === 'string') return true;
  return false;
}

/** Coerce possible ObjectId representations to a hex string */
function coerceObjectIdString(value: any): string | undefined {
  try {
    // Direct string that already looks like an ObjectId
    if (typeof value === 'string') {
      return /^[a-f\d]{24}$/i.test(value) ? value : undefined;
    }
    // {$oid: "..."} shape
    if (value && typeof value === 'object' && typeof value.$oid === 'string') {
      return /^[a-f\d]{24}$/i.test(value.$oid) ? value.$oid : undefined;
    }
    // Mongoose/Mongo ObjectId instances
    if (isObjectId(value)) {
      const s = typeof value.toHexString === 'function' ? value.toHexString() : value.toString();
      return /^[a-f\d]{24}$/i.test(s) ? s : undefined;
    }
    // Fallback to string conversion
    const s = value?.toString?.();
    return typeof s === 'string' && /^[a-f\d]{24}$/i.test(s) ? s : undefined;
  } catch {
    return undefined;
  }
}

/** Core value serializer */
function serializeValue(value: any, seen: WeakSet<object>, options: Required<SerializeOptions>): JSONValue | undefined {
  if (value === null) return null;
  const t = typeof value;
  if (t === 'string' || t === 'number' || t === 'boolean') return value as SerializablePrimitive;
  if (t === 'undefined') return options.stripUndefined ? undefined : (undefined as any);
  if (t === 'function') return undefined;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : (value.toISOString() as string);
  }
  const oid = coerceObjectIdString(value);
  if (oid) return oid;
  if (Array.isArray(value)) {
    const arr: JSONValue[] = [];
    for (const item of value) {
      const serializedItem = serializeValue(item, seen, options);
      if (serializedItem !== undefined) {
        arr.push(serializedItem);
      }
    }
    return arr;
  }
  if (isPlainObject(value)) {
    if (seen.has(value)) return {}; // Circular reference
    seen.add(value);
    const obj: JSONObject = {};
    for (const [key, val] of Object.entries(value)) {
      if (options.omitKeys.includes(key)) continue;
      const serializedVal = serializeValue(val, seen, options);
      if (serializedVal !== undefined || !options.stripUndefined) {
        obj[key] = serializedVal as JSONValue;
      }
    }
    seen.delete(value);
    return obj;
  }
  return null;
}

/**
 * Serialize a single document or object.
 */
export function serializeDoc<T = any>(doc: T, options: SerializeOptions = {}): any {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const seen = new WeakSet<object>();
  return serializeValue(doc, seen, opts) ?? null;
}

/**
 * Serialize an array of documents or objects.
 */
export function serializeDocs<T = any>(docs: T[], options: SerializeOptions = {}): any[] {
  return docs.map(doc => serializeDoc(doc, options));
}

/* @created 2025-01-26T16:30:00.000Z */