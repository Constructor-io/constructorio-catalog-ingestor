import { catalogIngestionPayloadFactory } from "../../test/factories/catalogIngestionPayload.factory";

import { CatalogIngestionPayload } from "./types";

import * as ingestCatalogCsv from "constructor/api/catalog/ingestCatalogCsv";
import * as buildCsvPayload from "constructor/helpers/buildCsvPayload";
import { CatalogIngestor } from "catalogIngestor";

describe("CatalogIngestor", () => {
  let getData: () => Promise<CatalogIngestionPayload>;
  let catalogIngestor: CatalogIngestor;
  let payload: CatalogIngestionPayload;

  beforeEach(() => {
    catalogIngestor = new CatalogIngestor({
      constructorApiToken: "api-token",
    });

    payload = catalogIngestionPayloadFactory.build();

    getData = jest.fn().mockResolvedValue(payload);

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
          getData = jest
            .fn()
            .mockRejectedValue(new Error("Houston, we have a problem! 🧨"));
        });

        it("should throw the error", async () => {
          await expect(catalogIngestor.ingest(getData)).rejects.toThrow(
            "Houston, we have a problem!"
          );
        });

        it("should not proceed with the ingestion", async () => {
          await expect(catalogIngestor.ingest(getData)).rejects.toThrow(
            "Houston, we have a problem! 🧨"
          );

          expect(buildCsvPayload.buildCsvPayload).not.toHaveBeenCalled();
          expect(ingestCatalogCsv.ingestCatalogCsv).not.toHaveBeenCalled();
        });
      });
    });

    describe("when ingesting data", () => {
      it("should convert the data to csv files", async () => {
        await catalogIngestor.ingest(getData);

        expect(buildCsvPayload.buildCsvPayload).toHaveBeenCalledTimes(1);
        expect(buildCsvPayload.buildCsvPayload).toHaveBeenCalledWith(payload);
      });

      it("should upload the csv to our api", async () => {
        await catalogIngestor.ingest(getData);

        expect(ingestCatalogCsv.ingestCatalogCsv).toHaveBeenCalledTimes(1);

        expect(ingestCatalogCsv.ingestCatalogCsv).toHaveBeenCalledWith(
          "api-token",
          {
            groups: "groups",
            items: "items",
            variations: "variations",
          }
        );
      });

      describe("when the ingestion fails", () => {
        beforeEach(() => {
          jest
            .spyOn(ingestCatalogCsv, "ingestCatalogCsv")
            .mockRejectedValue(new Error("Houston, our api exploded! 🤯"));
        });

        it("should throw the error", async () => {
          await expect(catalogIngestor.ingest(getData)).rejects.toThrow(
            "Houston, our api exploded! 🤯"
          );
        });
      });
    });
  });
});
