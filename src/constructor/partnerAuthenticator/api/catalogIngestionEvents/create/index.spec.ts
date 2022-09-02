import got from "got";

import { createIngestionEvent } from ".";

describe(createIngestionEvent, () => {
  const data: Parameters<typeof createIngestionEvent>[1] = {
    success: true,
    cioTaskId: "cioTaskId",
    countOfGroups: 1,
    countOfItems: 2,
    countOfVariations: 3,
    totalIngestionTimeMs: 4,
  };

  beforeEach(() => {
    jest.spyOn(got, "post").mockResolvedValue({});
  });

  it("calls the api with correct params", async () => {
    await createIngestionEvent("connectionId", data);

    expect(got.post).toHaveBeenCalledWith({
      url: "https://partner-authenticator.cnstrc.com/catalog-ingestion-events/create/connectionId",
      body: JSON.stringify(data),
    });
  });

  describe("when the api returns an error", () => {
    beforeEach(() => {
      jest
        .spyOn(got, "post")
        .mockRejectedValue(new Error("Houston! We cannot report events! 🔮❌"));

      jest.spyOn(console, "warn").mockImplementation();
    });

    it("does not throw", async () => {
      await expect(
        createIngestionEvent("connectionId", data)
      ).resolves.not.toThrow();
    });

    it("warns", async () => {
      await createIngestionEvent("connectionId", data);

      expect(console.warn).toHaveBeenCalledWith(
        "[Ingestor] Failed to create catalog ingestion event. Are your credentials correct?"
      );
    });
  });
});
