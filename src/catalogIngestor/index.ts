import { CatalogIngestion } from "./types";

export class CatalogIngestor {
  readonly credentials: Credentials;

  constructor(
    /**
     * The credentials that will be used during the ingestion.
     */
    credentials: Credentials
  ) {
    this.credentials = credentials;
  }

  /**
   * Performs a catalog data ingestion.
   *
   * @param getData A promise that fetches the initial data to be ingested.
   * It's generally advised to execute everything you need here, since this allows
   * us to report errors and generally be more precise with each ingestion.
   */
  async ingest(_getData: () => Promise<CatalogIngestion>) {
    // TODO: Implement catalog ingestion.
  }
}

interface Credentials {
  constructorApiToken: string;
}
