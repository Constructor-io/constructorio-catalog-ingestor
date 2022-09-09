import FormData from "form-data";
import got from "got";

import { CatalogIngestionType } from "../../../../../catalogIngestor/types";
import { config } from "../../config";

/**
 * Ingests the catalog CSV files into Constructor.
 * @param payload The data parsed into csv files.
 * @param config The api config.
 * @returns The created task id.
 */
export async function ingestCatalogCsv(
  payload: CsvPayload,
  options: ApiOptions
): Promise<string> {
  const formData = buildFormData(payload);

  console.log("[Ingestor] Sending request to ingest catalog CSV files.");

  const httpFunction =
    options.type === CatalogIngestionType.FULL ? got.put : got.patch;

  const response = await httpFunction({
    headers: config.buildHeaders(options.apiToken),
    searchParams: buildSearchParams(options),
    url: `${config.serviceUrl}/v1/catalog`,
    body: formData,
  }).json<Response>();

  console.log("[Ingestor] API response", response);

  const { task_id: taskId } = response;

  if (!taskId) {
    throw new Error("[Ingestor] Failed to ingest catalog.");
  }

  return taskId;
}

/**
 * Builds the form data for the request.
 * @param payload The data parsed into csv files.
 * @returns The form data.
 */
function buildFormData(payload: CsvPayload): FormData {
  const formData = new FormData();

  if (payload.groups) {
    formData.append("item_groups", payload.groups, {
      filename: "item_groups.csv",
    });
  }

  if (payload.items) {
    formData.append("items", payload.items, {
      filename: "items.csv",
    });
  }

  if (payload.variations) {
    formData.append("variations", payload.variations, {
      filename: "variations.csv",
    });
  }

  return formData;
}

/**
 * Builds the search params for the request.
 * @param options The api options.
 * @returns The search params.
 */
function buildSearchParams(options: ApiOptions): Record<string, string> {
  const params = {
    force: options.force ? "1" : "0",
    section: "Products",
    key: options.apiKey,
  };

  if (options.notificationEmail) {
    return {
      ...params,
      notification_email: options.notificationEmail,
    };
  }

  return params;
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

interface Response {
  task_id: string;
  task_status_path: string;
}

export interface ApiOptions {
  apiKey: string;
  apiToken: string;
  type: CatalogIngestionType;
  force: boolean;
  notificationEmail?: string;
}
