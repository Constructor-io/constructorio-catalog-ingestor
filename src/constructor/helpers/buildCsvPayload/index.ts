import { CatalogIngestionPayload } from "catalogIngestor/types";
import { CsvPayload } from "constructor/api/catalog/ingestCatalogCsv";

export function buildCsvPayload(_data: CatalogIngestionPayload): CsvPayload {
  // TODO: Implement buildCsvPayload.

  return {
    groups: undefined,
    items: undefined,
    variations: undefined,
  };
}
