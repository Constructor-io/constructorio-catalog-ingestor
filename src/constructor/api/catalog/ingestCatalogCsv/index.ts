import FormData from "form-data";
import got from "got";

import { config } from "constructor/api/config";

/**
 * Ingests the catalog CSV files into Constructor.
 * @param apiToken The API token.
 * @param payload The data parsed into csv files.
 */
export async function ingestCatalogCsv(
  apiToken: string,
  payload: CsvPayload
): Promise<void> {
  const formData = buildFormData(payload);

  const json = await got
    .put({
      url: `${config.baseUrl}/v1/catalog`,
      body: formData,
      searchParams: {
        section: "Products",
        key: apiToken,
      },
    })
    .json<Response>();

  const { task_status_path: taskStatusPath } = json;

  if (!taskStatusPath) {
    throw new Error(
      "[Ingestor] Received error response while ingesting CSV files."
    );
  }
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
  task_status_path: string;
}
