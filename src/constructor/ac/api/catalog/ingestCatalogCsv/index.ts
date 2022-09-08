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

  const httpFunction =
    options.type === CatalogIngestionType.FULL ? got.put : got.patch;

  const json = await httpFunction({
    headers: config.buildHeaders(options.apiToken),
    searchParams: buildSearchParams(options),
    url: `${config.serviceUrl}/v1/catalog`,
    body: formData,
  }).json<Response>();

  const { task_id: taskId } = json;

  if (!taskId) {
    throw new Error(
      "[Ingestor] Received error response while ingesting CSV files."
    );
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
    formData.append("groups", payload.groups, {
      contentType: "application/octet-stream",
      filename: "item_groups.csv",
    });
  }

  if (payload.items) {
    formData.append("items", payload.items, {
      contentType: "application/octet-stream",
      filename: "items.csv",
    });
  }

  if (payload.variations) {
    formData.append("variations", payload.variations, {
      contentType: "application/octet-stream",
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
