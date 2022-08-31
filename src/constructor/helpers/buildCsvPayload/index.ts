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
  // TODO: Implement buildCsvPayload.

  const [groups, items, variations] = await Promise.all([
    toCsv(data.groups),
    toCsv(data.items),
    toCsv(data.variations),
  ]);

  return {
    groups,
    items,
    variations,
  };
}

/**
 * Parses an array into csv.
 * @param data The data to be parsed into csv.
 * @returns The csv.
 */
async function toCsv<T>(data: T[]): Promise<string | undefined> {
  if (!data.length) return await Promise.resolve(undefined);

  const csv = Papa.unparse(data);

  return await Promise.resolve(csv);
}
