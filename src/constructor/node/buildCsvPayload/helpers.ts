import { JsonKeyValue, StringKeyValue } from "../../../catalogIngestor/types";

/**
 * JsonKeyValue is a superset of the base KeyValue, so when handling
 * `string`, `string[]` and `null` values we should not treat them as JSON.
 * Otherwise all values would be handled as JSON.
 *
 * @param target KeyValue with string or JSON values
 * @param key The field key for identifying if it's in fact metadata
 * @returns If the KeyValue value should be treated as JSON
 */
export function isJSONMetadata(
  target: StringKeyValue | JsonKeyValue,
  key: string
): target is JsonKeyValue {
  if (key !== "metadata") {
    return false;
  }

  if (!target) {
    return false;
  }

  if (typeof target !== "object") {
    return false;
  }

  if (!("key" in target && "value" in target)) {
    return false;
  }

  if (target.value === null) {
    return false;
  }

  if (typeof target.value === "boolean") {
    return true;
  }

  if (typeof target.value === "object" && !Array.isArray(target.value)) {
    return true;
  }

  // only array of strings are a valid StringKeyValue
  if (Array.isArray(target.value)) {
    return target.value.some((value) => typeof value !== "string");
  }

  return false;
}
