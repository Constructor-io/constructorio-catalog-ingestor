import FormData from "form-data";
import got from "got";

import { ingestCatalogCsv } from ".";

describe(ingestCatalogCsv, () => {
  beforeEach(() => {
    jest.spyOn(got, "put").mockReturnValue({
      json: async () =>
        await Promise.resolve({
          task_status_path: "foobar",
        }),
    } as any);
  });

  it("calls the api with correct params", async () => {
    await ingestCatalogCsv("apiToken", {
      variations: "variations",
      groups: "groups",
      items: "items",
    });

    expect(got.put).toHaveBeenCalledWith({
      url: "https://ac.cnstrc.com/v1/catalog",
      body: expect.any(FormData),
      searchParams: {
        section: "Products",
        key: "apiToken",
      },
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
      await expect(
        ingestCatalogCsv("apiToken", {
          variations: "variations",
          groups: "groups",
          items: "items",
        })
      ).rejects.toThrowError(
        "[Ingestor] Received error response while ingesting CSV files."
      );
    });
  });

  describe("when building the form data", () => {
    beforeEach(() => {
      jest.spyOn(FormData.prototype, "append");
    });

    it("appends groups", async () => {
      await ingestCatalogCsv("apiToken", {
        variations: "variations",
        groups: "groups",
        items: "items",
      });

      expect(FormData.prototype.append).toHaveBeenCalledWith(
        "groups",
        "groups",
        {
          contentType: "application/octet-stream",
          filename: "item_groups.csv",
        }
      );
    });

    it("appends items", async () => {
      await ingestCatalogCsv("apiToken", {
        variations: "variations",
        groups: "groups",
        items: "items",
      });

      expect(FormData.prototype.append).toHaveBeenCalledWith("items", "items", {
        contentType: "application/octet-stream",
        filename: "items.csv",
      });
    });

    it("appends variations", async () => {
      await ingestCatalogCsv("apiToken", {
        variations: "variations",
        groups: "groups",
        items: "items",
      });

      expect(FormData.prototype.append).toHaveBeenCalledWith(
        "variations",
        "variations",
        {
          contentType: "application/octet-stream",
          filename: "variations.csv",
        }
      );
    });

    describe("when there are no groups", () => {
      it("does not append groups", async () => {
        await ingestCatalogCsv("apiToken", {
          variations: "variations",
          groups: undefined,
          items: "items",
        });

        expect(FormData.prototype.append).not.toHaveBeenCalledWith(
          "groups",
          "groups",
          {
            contentType: "application/octet-stream",
            filename: "item_groups.csv",
          }
        );
      });
    });

    describe("when there are no items", () => {
      it("does not append items", async () => {
        await ingestCatalogCsv("apiToken", {
          variations: "variations",
          groups: "groups",
          items: undefined,
        });

        expect(FormData.prototype.append).not.toHaveBeenCalledWith(
          "items",
          "items",
          {
            contentType: "application/octet-stream",
            filename: "items.csv",
          }
        );
      });
    });

    describe("when there are no variations", () => {
      it("does not append variations", async () => {
        await ingestCatalogCsv("apiToken", {
          variations: undefined,
          groups: "groups",
          items: "items",
        });

        expect(FormData.prototype.append).not.toHaveBeenCalledWith(
          "variations",
          "variations",
          {
            contentType: "application/octet-stream",
            filename: "variations.csv",
          }
        );
      });
    });
  });
});
