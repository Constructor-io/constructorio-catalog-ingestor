import Papa from "papaparse";

import { CatalogIngestionPayload } from "catalogIngestor/types";
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
 * @param type The type of data being parsed.
 * @param data The data to be parsed into csv.
 * @returns The csv.
 */
async function toCsv<T>(
  type: keyof CatalogIngestionPayload,
  data: T[]
): Promise<string | undefined> {
  if (!data.length) return await Promise.resolve(undefined);

  const csv = Papa.unparse(data, {
    columns: columnOrders[type],
  });

  return await Promise.resolve(csv);
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
    "facets",
    "metadata",
  ],
  variations: [
    "variation_id",
    "item_id",
    "item_name",
    "image_url",
    "active",
    "facets",
    "metadata",
  ],
};
