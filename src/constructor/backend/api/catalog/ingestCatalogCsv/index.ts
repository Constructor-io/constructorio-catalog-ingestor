import FormData from "form-data";
import got from "got";

import { CatalogIngestionType } from "../../../../../catalogIngestor/types";
import { config } from "../../config";

/**
 * Ingests the catalog CSV files into Constructor.
 * @param apiToken The API token.
 * @param payload The data parsed into csv files.
 * @returns The created task id.
 */
export async function ingestCatalogCsv(
  apiToken: string,
  type: CatalogIngestionType,
  payload: CsvPayload
): Promise<string> {
  const formData = buildFormData(payload);

  const httpFunction = type === CatalogIngestionType.FULL ? got.put : got.patch;

  const json = await httpFunction({
    url: `${config.baseUrl}/v1/catalog`,
    body: formData,
    searchParams: {
      section: "Products",
      key: apiToken,
    },
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
