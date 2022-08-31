/**
 * Ingests the catalog CSV files into Constructor.
 * @param payload The data parsed into csv files.
 */
export async function ingestCatalogCsv(_payload: CsvPayload): Promise<void> {
  // TODO: Ingest catalog data into the API.
}

export interface CsvPayload {
  /**
   * The input groups converted into csv format.
   */
  groups: string | undefined;

  /**
   * The input items converted into csv format.
   */
  items: string | undefined;

  /**
   * The input variations converted into csv format.
   */
  variations: string | undefined;
}
