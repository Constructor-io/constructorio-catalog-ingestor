import FormData from "form-data";
import got from "got";

import { CatalogIngestionType } from "../../../../../catalogIngestor/types";

import { ApiOptions, CsvPayload, ingestCatalogCsv } from ".";

describe(ingestCatalogCsv, () => {
  const options: ApiOptions = {
    type: CatalogIngestionType.FULL,
    notificationEmail: undefined,
    apiToken: "apiToken",
    apiKey: "apiKey",
    force: true,
  };

  const payload: CsvPayload = {
    variations: "variations",
    groups: "groups",
    items: "items",
  };

  beforeEach(() => {
    jest.spyOn(got, "patch").mockReturnValue({
      json: async () =>
        await Promise.resolve({
          task_status_path: "task_status_path",
          task_id: "task_id",
        }),
    } as any);

    jest.spyOn(got, "put").mockReturnValue({
      json: async () =>
        await Promise.resolve({
          task_status_path: "task_status_path",
          task_id: "task_id",
        }),
    } as any);
  });

  it("returns the task id", async () => {
    const result = await ingestCatalogCsv(payload, options);

    expect(result).toEqual("task_id");
  });

  describe("when performing full ingestion", () => {
    it("calls the PUT api with correct params", async () => {
      await ingestCatalogCsv(payload, options);

      expect(got.put).toHaveBeenCalledWith({
        url: "https://ac.cnstrc.com/v1/catalog",
        body: expect.any(FormData),
        headers: {
          Authorization: "Basic YXBpVG9rZW46",
        },
        searchParams: {
          section: "Products",
          key: "apiKey",
          force: "1",
        },
      });
    });
  });

  describe("when performing delta ingestion", () => {
    it("calls the PATCH api with correct params", async () => {
      await ingestCatalogCsv(payload, {
        ...options,
        type: CatalogIngestionType.DELTA,
      });

      expect(got.patch).toHaveBeenCalledWith({
        url: "https://ac.cnstrc.com/v1/catalog",
        body: expect.any(FormData),
        headers: {
          Authorization: "Basic YXBpVG9rZW46",
        },
        searchParams: {
          section: "Products",
          key: "apiKey",
          force: "1",
        },
      });
    });
  });

  describe("request options", () => {
    describe("when force is false", () => {
      it("sends force = 0", async () => {
        await ingestCatalogCsv(payload, {
          ...options,
          force: false,
        });

        expect(got.put).toHaveBeenCalledWith({
          url: "https://ac.cnstrc.com/v1/catalog",
          body: expect.any(FormData),
          headers: {
            Authorization: "Basic YXBpVG9rZW46",
          },
          searchParams: {
            section: "Products",
            key: "apiKey",
            force: "0",
          },
        });
      });
    });

    describe("when notificationEmail is provided", () => {
      it("sends the notification email", async () => {
        await ingestCatalogCsv(payload, {
          ...options,
          notificationEmail: "foo@email.com",
        });

        expect(got.put).toHaveBeenCalledWith({
          url: "https://ac.cnstrc.com/v1/catalog",
          body: expect.any(FormData),
          headers: {
            Authorization: "Basic YXBpVG9rZW46",
          },
          searchParams: {
            notification_email: "foo@email.com",
            section: "Products",
            key: "apiKey",
            force: "1",
          },
        });
      });
    });
  });

  describe("when the request fails", () => {
    beforeEach(() => {
      jest.spyOn(got, "put").mockReturnValue({
        json: async () =>
          await Promise.resolve({
            error: "Something went very wrong 💣",
          }),
      } as any);
    });

    it("throws an error", async () => {
      await expect(ingestCatalogCsv(payload, options)).rejects.toThrowError(
        "[Ingestor] Failed to ingest catalog."
      );
    });
  });

  describe("when building the form data", () => {
    beforeEach(() => {
      jest.spyOn(FormData.prototype, "append");
    });

    it("appends groups", async () => {
      await ingestCatalogCsv(payload, options);

      expect(FormData.prototype.append).toHaveBeenCalledWith(
        "item_groups",
        "groups",
        {
          filename: "item_groups.csv",
        }
      );
    });

    it("appends items", async () => {
      await ingestCatalogCsv(payload, options);

      expect(FormData.prototype.append).toHaveBeenCalledWith("items", "items", {
        filename: "items.csv",
      });
    });

    it("appends variations", async () => {
      await ingestCatalogCsv(payload, options);

      expect(FormData.prototype.append).toHaveBeenCalledWith(
        "variations",
        "variations",
        {
          filename: "variations.csv",
        }
      );
    });

    describe("when there are no groups", () => {
      it("does not append groups", async () => {
        await ingestCatalogCsv(
          {
            ...payload,
            groups: undefined,
          },
          options
        );

        expect(FormData.prototype.append).not.toHaveBeenCalledWith(
          "groups",
          "groups",
          {
            filename: "item_groups.csv",
          }
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

        expect(FormData.prototype.append).not.toHaveBeenCalledWith(
          "items",
          "items",
          {
            filename: "items.csv",
          }
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

        expect(FormData.prototype.append).not.toHaveBeenCalledWith(
          "variations",
          "variations",
          {
            filename: "variations.csv",
          }
        );
      });
    });
  });
});
