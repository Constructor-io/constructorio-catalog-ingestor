import { createIngestionEvent } from "../constructor/partnerAuthenticator/api/catalogIngestionEvents/create";
import { ingestCatalogCsv } from "../constructor/node/ingestCatalogCsv";
import { buildCsvPayload } from "../constructor/node/buildCsvPayload";

import { CatalogIngestionPayload } from "./types";

export class CatalogIngestor {
  readonly options: Options;

  constructor(
    /**
     * The options that will be used during the ingestion.
     */
    options: Options
  ) {
    this.options = options;
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
        notificationEmail: this.options.notificationEmail,
        force: this.options.force ?? true,
        apiToken: this.options.apiToken,
        apiKey: this.options.apiKey,
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
    if (!this.options.connectionId) {
      console.warn(
        "[Ingestor] The connection id is not provided. Skipping ingestion event creation."
      );

      return;
    }

    const totalTimeMs = new Date().getTime() - startTime.getTime();

    await createIngestionEvent(this.options.connectionId, {
      success,
      cioTaskId: taskId ?? null,
      countOfVariations: payload?.data?.variations?.length ?? 0,
      countOfGroups: payload?.data?.groups?.length ?? 0,
      countOfItems: payload?.data?.items?.length ?? 0,
      totalIngestionTimeMs: totalTimeMs,
    });
  }
}

/**
 * The options used to instantiate a CatalogIngestor.
 */
export interface Options {
  /**
   * The Constructor.io API token.
   */
  apiToken: string;

  /**
   * The Constructor.io API key.
   */
  apiKey: string;

  /**
   * The connection id to be used when creating ingestion events.
   * Provided by the partner connector.
   */
  connectionId?: string;

  /**
   * Process the catalog even if it will invalidate a large number of existing items.
   * Defaults to true, since this package assumes that the ingestion happens in
   * an automated way from a partner system.
   */
  force?: boolean;

  /**
   * An email address where you'd like to receive an email notification in case the task fails.
   */
  notificationEmail?: string;
}
