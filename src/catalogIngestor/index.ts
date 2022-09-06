import { createIngestionEvent } from "../constructor/partnerAuthenticator/api/catalogIngestionEvents/create";
import { ingestCatalogCsv } from "../constructor/backend/api/catalog/ingestCatalogCsv";
import { buildCsvPayload } from "../constructor/backend/helpers/buildCsvPayload";

import { CatalogIngestionPayload } from "./types";

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
  async ingest(getData: () => Promise<CatalogIngestionPayload>) {
    let data: CatalogIngestionPayload | null = null;
    const startTime = new Date();

    try {
      data = await getData();

      const payload = await buildCsvPayload(data);

      const taskId = await ingestCatalogCsv(
        this.credentials.constructorApiToken,
        payload
      );

      await this.createIngestionEvent(startTime, true, data, taskId);
    } catch (error) {
      await this.createIngestionEvent(startTime, false, data, null);
      throw error;
    }
  }

  private async createIngestionEvent(
    startTime: Date,
    success: boolean,
    data: CatalogIngestionPayload | null,
    taskId: string | null
  ) {
    if (!this.credentials.connectionId) {
      console.warn(
        "[Ingestor] The connection id is not provided. Skipping ingestion event creation."
      );

      return;
    }

    const totalTimeMs = new Date().getTime() - startTime.getTime();

    await createIngestionEvent(this.credentials.connectionId, {
      success,
      cioTaskId: taskId ?? null,
      countOfVariations: data?.variations?.length ?? 0,
      countOfGroups: data?.groups?.length ?? 0,
      countOfItems: data?.items?.length ?? 0,
      totalIngestionTimeMs: totalTimeMs,
    });
  }
}

interface Credentials {
  constructorApiToken: string;
  connectionId?: string;
}
