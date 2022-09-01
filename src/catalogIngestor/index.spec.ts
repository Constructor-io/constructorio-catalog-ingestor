import { catalogIngestionPayloadFactory } from "../../test/factories/catalogIngestionPayload.factory";

import { CatalogIngestionPayload } from "./types";

import * as ingestCatalogCsv from "constructor/api/catalog/ingestCatalogCsv";
import * as buildCsvPayload from "constructor/helpers/buildCsvPayload";
import { CatalogIngestor } from "catalogIngestor";

describe("CatalogIngestor", () => {
  let getData: () => Promise<CatalogIngestionPayload>;
  let catalogIngestor: CatalogIngestor;

  beforeEach(() => {
    catalogIngestor = new CatalogIngestor({
      constructorApiToken: "api-token",
    });

    getData = jest
      .fn()
      .mockResolvedValue(catalogIngestionPayloadFactory.build());

    jest.spyOn(buildCsvPayload, "buildCsvPayload").mockResolvedValue({
      groups: "groups",
      items: "items",
      variations: "variations",
    });

    jest.spyOn(ingestCatalogCsv, "ingestCatalogCsv").mockResolvedValue();
  });

  it("should allow initializing with a new api token", () => {
    expect(catalogIngestor.credentials.constructorApiToken).toBe("api-token");
  });

  describe("ingest", () => {
    describe("when executing the promise to obtain the data", () => {
      it("should call the promise with correct params", async () => {
        await catalogIngestor.ingest(getData);

        expect(getData).toHaveBeenCalledTimes(1);
      });

      describe("when the promise fails", () => {
        beforeEach(() => {
          getData = jest.fn().mockRejectedValue(new Error("foo!"));
        });

        it("should throw the error", async () => {
          await expect(catalogIngestor.ingest(getData)).rejects.toThrow("foo!");
        });

        it("should not proceed with the ingestion", async () => {
          await expect(catalogIngestor.ingest(getData)).rejects.toThrow("foo!");

          expect(buildCsvPayload.buildCsvPayload).not.toHaveBeenCalled();
          expect(ingestCatalogCsv.ingestCatalogCsv).not.toHaveBeenCalled();
        });
      });
    });

    describe("when ingesting data", () => {
      it.todo("should convert the data to csv files");
      it.todo("should upload the csv to our api");

      describe("when the ingestion fails", () => {
        it.todo("should stop the whole ingestion process");
      });
    });
  });
});
