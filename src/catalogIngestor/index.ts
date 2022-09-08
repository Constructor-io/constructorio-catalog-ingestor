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
   * Performs a catalog ingestion.
   *
   * @param getData A promise that fetches the initial data to be ingested.
   *
   * It's generally advised to execute everything you need here, since this allows
   * us to report errors and generally be more precise with each ingestion.
   */
  async ingest(getData: () => Promise<CatalogIngestionPayload>) {
    let payload: CatalogIngestionPayload | null = null;
    const startTime = new Date();

    try {
      payload = await getData();

      const csvPayload = await buildCsvPayload(payload.data);

      const taskId = await ingestCatalogCsv(csvPayload, {
        apiToken: this.credentials.apiToken,
        apiKey: this.credentials.apiKey,
        type: payload.type,
      });

      await this.createIngestionEvent(startTime, true, payload, taskId);
    } catch (error) {
      await this.createIngestionEvent(startTime, false, payload, null);
      throw error;
    }
  }

  private async createIngestionEvent(
    startTime: Date,
    success: boolean,
    payload: CatalogIngestionPayload | null,
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
      countOfVariations: payload?.data?.variations?.length ?? 0,
      countOfGroups: payload?.data?.groups?.length ?? 0,
      countOfItems: payload?.data?.items?.length ?? 0,
      totalIngestionTimeMs: totalTimeMs,
    });
  }
}

interface Credentials {
  apiToken: string;
  apiKey: string;
  connectionId?: string;
}
