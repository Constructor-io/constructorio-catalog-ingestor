import { CatalogIngestion } from "types";

export class CatalogIngestor {
  readonly credentials: Credentials;
  private readonly getData: () => Promise<CatalogIngestion>;

  constructor(
    /**
     * The credentials that will be used during the ingestion.
     */
    credentials: Credentials,
    /**
     * A promise that fetches the initial data to be ingested.
     *
     * It's generally advised to execute everything you need here, since this allows
     * us to report errors and generally be more precise with each ingestion.
     */
    getData: () => Promise<CatalogIngestion>
  ) {
    this.credentials = credentials;
    this.getData = getData;
  }

  async ingest(_data: CatalogIngestion) {
    // TODO: Implement catalog ingestion.
  }
}

interface Credentials {
  constructorApiToken: string;
}
