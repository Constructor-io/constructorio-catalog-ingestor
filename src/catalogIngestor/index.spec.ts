import { catalogIngestionPayloadFactory } from "../../test/factories/catalogIngestionPayload.factory";
import * as ingestCatalogCsv from "../constructor/node/ingestCatalogCsv";
import * as buildCsvPayload from "../constructor/node/buildCsvPayload";

import { CatalogIngestionPayload } from "./types";

import { CatalogIngestor } from ".";

describe("CatalogIngestor", () => {
  let getData: () => Promise<CatalogIngestionPayload>;
  let catalogIngestor: CatalogIngestor;
  let payload: CatalogIngestionPayload;

  beforeEach(() => {
    catalogIngestor = new CatalogIngestor({
      apiToken: "api-token",
      apiKey: "api-key",
    });

    payload = catalogIngestionPayloadFactory.build();

    getData = jest.fn().mockResolvedValue(payload);

    jest.spyOn(buildCsvPayload, "buildCsvPayload").mockResolvedValue({
      groups: "groups",
      items: "items",
      variations: "variations",
    });

    jest
      .spyOn(ingestCatalogCsv, "ingestCatalogCsv")
      .mockResolvedValue("task_id");
  });

  it("should allow initializing with new options", () => {
    expect(catalogIngestor.options).toEqual({
      apiToken: "api-token",
      apiKey: "api-key",
    });
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
        expect(buildCsvPayload.buildCsvPayload).toHaveBeenCalledWith(
          payload.data
        );
      });

      it("should upload the csv to our api", async () => {
        await catalogIngestor.ingest(getData);

        expect(ingestCatalogCsv.ingestCatalogCsv).toHaveBeenCalledTimes(1);

        expect(ingestCatalogCsv.ingestCatalogCsv).toHaveBeenCalledWith(
          {
            groups: "groups",
            items: "items",
            variations: "variations",
          },
          {
            notificationEmail: undefined,
            apiToken: "api-token",
            type: payload.type,
            apiKey: "api-key",
            force: true,
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

      describe("when initializing with custom options", () => {
        beforeEach(() => {
          catalogIngestor = new CatalogIngestor({
            notificationEmail: "foo@email.com",
            apiToken: "api-token",
            apiKey: "api-key",
            force: false,
          });
        });

        it("should pass options to ingest function", async () => {
          await catalogIngestor.ingest(getData);

          expect(ingestCatalogCsv.ingestCatalogCsv).toHaveBeenCalledWith(
            {
              groups: "groups",
              items: "items",
              variations: "variations",
            },
            {
              notificationEmail: "foo@email.com",
              apiToken: "api-token",
              type: payload.type,
              apiKey: "api-key",
              force: false,
            }
          );
        });
      });
    });
  });
});
