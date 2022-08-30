import { Ingestor } from "index";

describe("Ingestor", () => {
  it("should allow initializing with a new api token", () => {
    const ingestor = new Ingestor("api-token");
    expect(ingestor.apiToken).toBe("api-token");
  });

  describe("ingestCatalog", () => {
    // TODO: Add tests for ingesting catalogs.
    it.todo("should ingest a catalog");
  });
});
