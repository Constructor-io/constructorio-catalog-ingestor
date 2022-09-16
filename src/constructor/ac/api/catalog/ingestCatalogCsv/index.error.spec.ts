import { CatalogIngestionType } from "../../../../../catalogIngestor/types";

import { Options, CsvPayload, ingestCatalogCsv } from ".";

jest.mock("@constructor-io/constructorio-node", () => {
  return function () {
    return {
      catalog: {
        replaceCatalog: jest
          .fn()
          .mockRejectedValue(new Error("Something went very wrong 💣")),
        updateCatalog: jest
          .fn()
          .mockRejectedValue(new Error("Something went very wrong 💣")),
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

  describe.only("when the request fails", () => {
    it("throws an error", async () => {
      await expect(ingestCatalogCsv(payload, options)).rejects.toThrowError(
        "Something went very wrong 💣"
      );
    });
  });
});
