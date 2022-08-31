import { CatalogIngestionPayload } from "catalogIngestor/types";
import { CsvPayload } from "constructor/api/catalog/ingestCatalogCsv";

/**
 * Builds the csv payload for the catalog ingestion.
 * @param data The data that was inputted into the catalog ingestor.
 * @returns The csv payload.
 */
export function buildCsvPayload(_data: CatalogIngestionPayload): CsvPayload {
  // TODO: Implement buildCsvPayload.

  return {
    groups: undefined,
    items: undefined,
    variations: undefined,
  };
}
