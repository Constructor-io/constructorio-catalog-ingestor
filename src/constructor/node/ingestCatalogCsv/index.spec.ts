import { CatalogIngestionType } from "../../../catalogIngestor/types";

import { Options, CsvPayload, ingestCatalogCsv } from ".";

let replaceCatalog: jest.Mock;
let updateCatalog: jest.Mock;

jest.mock("@constructor-io/constructorio-node", () => {
  return function () {
    replaceCatalog = jest.fn().mockResolvedValue({
      task_status_path: "task_status_path",
      task_id: "task_id",
    });

    updateCatalog = jest.fn().mockResolvedValue({
      task_status_path: "task_status_path",
      task_id: "task_id",
    });

    return {
      catalog: {
        replaceCatalog,
        updateCatalog,
      },
    };
  };
});

describe(ingestCatalogCsv, () => {
  const options: Options = {
    type: CatalogIngestionType.FULL,
    notificationEmail: undefined,
    apiToken: "tok_9999999999999999",
    apiKey: "key_9999999999999999",
    force: true,
  };

  const payload: CsvPayload = {
    variations: "variations",
    groups: "groups",
    items: "items",
  };

  it("returns the task id", async () => {
    const result = await ingestCatalogCsv(payload, options);

    expect(result).toEqual("task_id");
  });

  describe("when performing full ingestion", () => {
    it("calls the replaceCatalog api with correct params", async () => {
      await ingestCatalogCsv(payload, options);

      expect(replaceCatalog).toHaveBeenCalledWith({
        notification_email: undefined,
        section: "Products",
        force: true,
        variations: payload.variations,
        item_groups: payload.groups,
        items: payload.items,
      });
    });
  });

  describe("when performing delta ingestion", () => {
    it("calls the updateCatalog api with correct params", async () => {
      await ingestCatalogCsv(payload, {
        ...options,
        type: CatalogIngestionType.DELTA,
      });

      expect(updateCatalog).toHaveBeenCalledWith({
        notification_email: undefined,
        section: "Products",
        force: true,
        variations: payload.variations,
        item_groups: payload.groups,
        items: payload.items,
      });
    });
  });

  describe("request options", () => {
    describe("when force is false", () => {
      it("sends force = false", async () => {
        await ingestCatalogCsv(payload, {
          ...options,
          force: false,
        });

        expect(replaceCatalog).toHaveBeenCalledWith({
          notification_email: undefined,
          section: "Products",
          force: false,
          variations: payload.variations,
          item_groups: payload.groups,
          items: payload.items,
        });
      });
    });

    describe("when notificationEmail is provided", () => {
      it("sends the notification email", async () => {
        await ingestCatalogCsv(payload, {
          ...options,
          notificationEmail: "foo@email.com",
        });

        expect(replaceCatalog).toHaveBeenCalledWith({
          notification_email: "foo@email.com",
          section: "Products",
          force: true,
          variations: payload.variations,
          item_groups: payload.groups,
          items: payload.items,
        });
      });
    });
  });

  describe("when passing the csv payload", () => {
    describe("when there are no groups", () => {
      it("does not append groups", async () => {
        await ingestCatalogCsv(
          {
            ...payload,
            groups: undefined,
          },
          options
        );

        expect(replaceCatalog).toHaveBeenCalledWith(
          expect.objectContaining({
            item_groups: undefined,
          })
        );
      });
    });

    describe("when there are no items", () => {
      it("does not append items", async () => {
        await ingestCatalogCsv(
          {
            ...payload,
            items: undefined,
          },
          options
        );

        expect(replaceCatalog).toHaveBeenCalledWith(
          expect.objectContaining({
            items: undefined,
          })
        );
      });
    });

    describe("when there are no variations", () => {
      it("does not append variations", async () => {
        await ingestCatalogCsv(
          {
            ...payload,
            variations: undefined,
          },
          options
        );

        expect(replaceCatalog).toHaveBeenCalledWith(
          expect.objectContaining({
            variations: undefined,
          })
        );
      });
    });
  });
});
