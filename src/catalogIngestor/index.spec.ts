import * as createIngestionEvent from "../constructor/partnerAuthenticator/api/catalogIngestionEvents/create";
import { catalogIngestionPayloadFactory } from "../../test/factories/catalogIngestionPayload.factory";
import * as ingestCatalogCsv from "../constructor/ac/api/catalog/ingestCatalogCsv";
import * as buildCsvPayload from "../constructor/ac/helpers/buildCsvPayload";

import { CatalogIngestionPayload } from "./types";

import { CatalogIngestor } from ".";

describe("CatalogIngestor", () => {
  let getData: () => Promise<CatalogIngestionPayload>;
  let catalogIngestor: CatalogIngestor;
  let payload: CatalogIngestionPayload;

  beforeEach(() => {
    catalogIngestor = new CatalogIngestor({
      connectionId: "connection-id",
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

    jest
      .spyOn(createIngestionEvent, "createIngestionEvent")
      .mockResolvedValue();
  });

  it("should allow initializing with new options", () => {
    expect(catalogIngestor.options).toEqual({
      connectionId: "connection-id",
      apiToken: "api-token",
      apiKey: "api-key",
    });
  });

  describe("when the connection id is not provided", () => {
    beforeEach(() => {
      catalogIngestor = new CatalogIngestor({
        apiToken: "api-token",
        apiKey: "api-key",
      });

      jest.spyOn(console, "warn").mockImplementation();
    });

    it("should not create an ingestion event", async () => {
      await catalogIngestor.ingest(getData);

      expect(createIngestionEvent.createIngestionEvent).not.toHaveBeenCalled();
    });

    it("warns", async () => {
      await catalogIngestor.ingest(getData);

      expect(console.warn).toHaveBeenCalledWith(
        "[Ingestor] The connection id is not provided. Skipping ingestion event creation."
      );
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

        it("should create a new failed ingestion event", async () => {
          await expect(catalogIngestor.ingest(getData)).rejects.toThrow(
            "Houston, we have a problem! 🧨"
          );

          expect(
            createIngestionEvent.createIngestionEvent
          ).toHaveBeenCalledWith("connection-id", {
            success: false,
            cioTaskId: null,
            countOfGroups: 0,
            countOfItems: 0,
            countOfVariations: 0,
            totalIngestionTimeMs: expect.any(Number),
          });
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

      it("should create a new successful ingestion event", async () => {
        await catalogIngestor.ingest(getData);

        expect(createIngestionEvent.createIngestionEvent).toHaveBeenCalledWith(
          "connection-id",
          {
            success: true,
            cioTaskId: "task_id",
            countOfGroups: 2,
            countOfItems: 1,
            countOfVariations: 1,
            totalIngestionTimeMs: expect.any(Number),
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

        it("should create a new failed ingestion event", async () => {
          await expect(catalogIngestor.ingest(getData)).rejects.toThrow(
            "Houston, our api exploded! 🤯"
          );

          expect(
            createIngestionEvent.createIngestionEvent
          ).toHaveBeenCalledWith("connection-id", {
            success: false,
            cioTaskId: null,
            countOfGroups: 2,
            countOfItems: 1,
            countOfVariations: 1,
            totalIngestionTimeMs: expect.any(Number),
          });
        });
      });

      describe("when initializing with custom options", () => {
        beforeEach(() => {
          catalogIngestor = new CatalogIngestor({
            notificationEmail: "foo@email.com",
            connectionId: "connection-id",
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
