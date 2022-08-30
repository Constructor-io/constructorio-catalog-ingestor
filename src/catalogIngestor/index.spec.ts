import { CatalogIngestor } from "catalogIngestor";

describe("CatalogIngestor", () => {
  const getData = jest.fn();

  it("should allow initializing with a new api token", () => {
    const catalogIngestor = new CatalogIngestor(
      { constructorApiToken: "api-token" },
      getData
    );

    expect(catalogIngestor.credentials.constructorApiToken).toBe("api-token");
  });

  /**
   * TODO: Add tests for ingesting catalogs.
   */
  describe("ingest", () => {
    describe("when executing the promise to obtain the data", () => {
      it.todo("should call the promise with correct params");

      describe("when the promise fails", () => {
        it.todo("should not proceed with the ingestion");
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
