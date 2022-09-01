import Papa from "papaparse";
import * as R from "remeda";

import { CatalogIngestionPayload, KeyValue } from "catalogIngestor/types";
import { CsvPayload } from "constructor/api/catalog/ingestCatalogCsv";

/**
 * Builds the csv payload for the catalog ingestion.
 * @param data The data that was inputted into the catalog ingestor.
 * @returns The csv payload.
 */
export async function buildCsvPayload(
  data: CatalogIngestionPayload
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
  type: keyof CatalogIngestionPayload,
  objects: T[]
): Promise<string | undefined> {
  if (!objects.length) return await Promise.resolve(undefined);

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

      if (isNestedField(key)) {
        const pairs = value as unknown as KeyValue[];
        return pairs.length ? expandNestedArray(acc, key, pairs) : acc;
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
  pairs: KeyValue[]
): TOut {
  return pairs.reduce((acc, pair) => {
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
  return ["metadata", "facets"].includes(name);
}

/**
 * Gets the transformed name of a nested field.
 * @param name The name of the field.
 * @param key The key of the nested field.
 * @returns The name of the transformed nested field.
 */
function getNestedFieldTransformedName(name: string, key: string): string {
  const prefix = {
    metadata: "metadata",
    facets: "facet",
  }[name];

  return `${prefix}:${key}`;
}

/**
 * Builds the ordered csv columns from the proxy objects.
 * @param type The type of the array.
 * @param proxyObjects The proxy proxyObjects to be parsed into csv.
 * @returns The csv columns.
 */
function getColumnsFromProxyObjects<T>(
  type: keyof CatalogIngestionPayload,
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

  const facetColumns = R.pipe(
    uniqueColumns,
    R.filter((column) => column.startsWith("facet:"))
  );

  const metadataColumns = R.pipe(
    uniqueColumns,
    R.filter((column) => column.startsWith("metadata:"))
  );

  const commonColumns = R.pipe(
    uniqueColumns,
    R.filter(
      (column) => ![...facetColumns, ...metadataColumns].includes(column)
    )
  );

  const sortedCommonColumns = R.pipe(
    commonColumns,
    R.sort((a, b) => {
      return order.indexOf(a) - order.indexOf(b);
    })
  );

  return [...sortedCommonColumns, ...facetColumns, ...metadataColumns];
}

const columnOrders: Record<keyof CatalogIngestionPayload, string[]> = {
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
  variations: ["variation_id", "item_id", "item_name", "image_url", "active"],
};
