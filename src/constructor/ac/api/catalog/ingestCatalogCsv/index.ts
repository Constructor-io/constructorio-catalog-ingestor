// @ts-expect-error Types not defined for this package.
import ConstructorIOClient from "@constructor-io/constructorio-node";

import { CatalogIngestionType } from "../../../../../catalogIngestor/types";

/**
 * Ingests the catalog CSV files into Constructor.
 * @param payload The data parsed into csv files.
 * @param config The api config.
 * @returns The created task id.
 */
export async function ingestCatalogCsv(
  payload: CsvPayload,
  options: Options
): Promise<string> {
  const constructorio = new ConstructorIOClient({
    apiToken: options.apiToken,
    apiKey: options.apiKey,
  });

  console.log("[Ingestor] Sending request to ingest catalog CSV files.");

  const params = {
    notification_email: options.notificationEmail,
    force: options.force,
    section: "Products",
    items: payload.items,
    variations: payload.variations,
    item_groups: payload.groups,
  };

  const response =
    options.type === CatalogIngestionType.FULL
      ? await constructorio.catalog.replaceCatalog(params)
      : await constructorio.catalog.updateCatalog(params);

  console.log("[Ingestor] API response", response);

  const { task_id: taskId } = response;

  if (!taskId) {
    throw new Error("[Ingestor] Failed to ingest catalog.");
  }

  return taskId;
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

export interface Options {
  apiKey: string;
  apiToken: string;
  type: CatalogIngestionType;
  force: boolean;
  notificationEmail?: string;
}
