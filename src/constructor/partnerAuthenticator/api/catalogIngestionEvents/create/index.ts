import got from "got";

import { config } from "../../config";

/**
 * Creates a new catalog ingestion event via API.
 * @param payload The payload.
 */
export async function createIngestionEvent(
  connectionId: string,
  payload: Payload
): Promise<void> {
  await got
    .post({
      url: `${config.serviceUrl}/catalog-ingestion-events/create/${connectionId}`,
      body: JSON.stringify(payload),
    })
    .catch(() => {
      console.warn(
        "[Ingestor] Failed to create catalog ingestion event. Are your credentials correct?"
      );
    });
}

interface Payload {
  success: boolean;
  cioTaskId: string | null;
  countOfGroups: number;
  countOfItems: number;
  countOfVariations: number;
  totalIngestionTimeMs: number;
}
