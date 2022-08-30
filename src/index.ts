import { CatalogIngestion } from "types";

export class Ingestor {
  readonly apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  async ingestCatalog(_data: CatalogIngestion) {
    // TODO: Implement catalog ingestion.
  }
}
