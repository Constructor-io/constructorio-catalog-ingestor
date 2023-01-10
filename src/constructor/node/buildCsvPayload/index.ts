import Papa from "papaparse";
import * as R from "remeda";

import {
  CatalogIngestionPayloadData,
  JsonKeyValue,
  StringKeyValue,
} from "../../../catalogIngestor/types";
import { CsvPayload } from "../ingestCatalogCsv";

import { isJSONMetadata } from "./helpers";

/**
 * Builds the csv payload for the catalog ingestion.
 * @param data The data that was inputted into the catalog ingestor.
 * @returns The csv payload.
 */
export async function buildCsvPayload(
  data: CatalogIngestionPayloadData
): Promise<CsvPayload> {
  const [groups, items, variations] = await Promise.all([
    toCsv("groups", data.groups),
    toCsv("items", data.items),
    toCsv("variations", data.variations),
  ]);

  return {
    groups,
    items,
    variations,
  };
}

/**
 * Parses an array into csv.
 * @param type The type of the array.
 * @param objects The objects to be parsed into csv.
 * @returns The csv.
 */
async function toCsv<T>(
  type: keyof CatalogIngestionPayloadData,
  objects: T[]
): Promise<string | undefined> {
  if (!objects.length) {
    return;
  }

  const proxyObjects = objects.map((object) => toCsvProxyObject(object));
  const columns = getColumnsFromProxyObjects(type, proxyObjects);

  const csv = Papa.unparse(proxyObjects, {
    newline: "\n",
    header: true,
    columns,
  });

  return await Promise.resolve(csv);
}

/**
 * Returns a proxy object to be transformed to csv.
 * @param object The object to be transformed to csv.
 * @returns The proxy object.
 */
function toCsvProxyObject<T, TOut>(object: T): TOut {
  const keys = R.keys(object as Record<string, unknown>);

  const result = R.reduce(
    keys,
    (acc, key) => {
      const value = object[key as keyof T];

      // Nested arrays should be expanded and joined as `{prefix}:key=value`.
      if (isNestedField(key)) {
        const pairs = value as unknown as StringKeyValue[];
        return pairs.length ? expandNestedArray(acc, key, pairs) : acc;
      }

      // String arrays should be joined as `x|y`.
      if (Array.isArray(value)) {
        return {
          ...acc,
          [key]: value.join("|"),
        };
      }

      return {
        ...acc,
        [key]: value,
      };
    },
    {}
  );

  return result as TOut;
}

/**
 * Expands a nested array into the current proxy object.
 * @param acc The current proxy object.
 * @param key The key of the nested array.
 * @param pairs The key,value pairs of the nested array.
 * @returns The expanded proxy object.
 */
function expandNestedArray<TOut>(
  acc: TOut,
  key: string,
  pairs: Array<StringKeyValue | JsonKeyValue>
): TOut {
  return pairs.reduce((acc, pair) => {
    if (isJSONMetadata(pair, key)) {
      // JSON metadata should be prefixed with "json:"
      return {
        ...acc,
        [getNestedFieldTransformedName(key, `json:${pair.key}`)]:
          JSON.stringify(pair.value),
      };
    }

    return {
      ...acc,
      [getNestedFieldTransformedName(key, pair.key)]: pair.value,
    };
  }, acc);
}

/**
 * Checks if a field is a nested field.
 * @param name The name of the field.
 * @returns Whether the field is a nested field.
 */
function isNestedField(name: string): boolean {
  return !!nestedColumns[name];
}

/**
 * Gets the transformed name of a nested field.
 * @param name The name of the field.
 * @param key The key of the nested field.
 * @returns The name of the transformed nested field.
 */
function getNestedFieldTransformedName(name: string, key: string): string {
  const nestedColumn = nestedColumns[name];
  return `${nestedColumn.prefix}:${key}`;
}

/**
 * Builds the ordered csv columns from the proxy objects.
 * @param type The type of the array.
 * @param proxyObjects The proxy proxyObjects to be parsed into csv.
 * @returns The csv columns.
 */
function getColumnsFromProxyObjects<T>(
  type: keyof CatalogIngestionPayloadData,
  proxyObjects: T[]
): string[] {
  const order = columnOrders[type];

  const uniqueColumns = R.pipe(
    proxyObjects,
    R.map((object) => object as Record<string, unknown>),
    R.map((object) => R.keys(object)),
    (keys) => R.flatten(keys),
    (keys) => R.uniq(keys)
  );

  const nestedColumns = getNestedColumns(uniqueColumns);

  const sortedColumns = R.pipe(
    uniqueColumns,
    R.filter((column) => !nestedColumns.includes(column)),
    R.sort((a, b) => {
      return order.indexOf(a) - order.indexOf(b);
    })
  );

  return [...sortedColumns, ...nestedColumns];
}

/**
 * Builds the sorted nested columns from the unique columns.
 * @param columns The columns to be filtered.
 * @returns The sorted nested columns.
 */
function getNestedColumns(columns: string[]): string[] {
  return R.pipe(
    R.values(nestedColumns),
    R.flatMap((nestedColumn) => {
      return R.filter(columns, (column) =>
        column.startsWith(`${nestedColumn.prefix}:`)
      );
    })
  );
}

/**
 * Defines the correct csv column order for each record type.
 */
const columnOrders: Record<keyof CatalogIngestionPayloadData, string[]> = {
  groups: ["parent_id", "id", "name"],
  items: [
    "id",
    "item_name",
    "url",
    "image_url",
    "description",
    "keywords",
    "group_ids",
    "active",
  ],
  variations: [
    "variation_id",
    "item_id",
    "item_name",
    "url",
    "image_url",
    "active",
  ],
};

/**
 * Defines nested columns that need to be handled.
 */
const nestedColumns: Record<string, NestedColumn> = {
  facets: {
    fieldName: "facets",
    prefix: "facet",
  },
  metadata: {
    fieldName: "metadata",
    prefix: "metadata",
  },
};

interface NestedColumn {
  fieldName: string;
  prefix: string;
}
