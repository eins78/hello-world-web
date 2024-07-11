/**
 * @description: JSON (JavaScript Object Notation) is a lightweight data-interchange format.
 * @see https://json.org
 */

/**
 * A JSON value can be a string in double quotes, or a number, or true or false or null, or an object or an array.
 * These structures can be nested.
 */
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;

/**
 * A JSON object is an unordered set of name/value pairs.
 */
export interface JsonObject {
  [key: string]: JsonValue;
}

/**
 * A JSON array is an ordered collection of values.
 */
export interface JsonArray extends Array<JsonValue> {}

/**
 * JSON is built on two structures: object and array.
 */
export type JSON = JsonObject | JsonArray;
