import { config } from "./config";

describe("config", () => {
  it("should have a baseUrl", () => {
    expect(config.baseUrl).toBe("https://ac.cnstrc.com");
  });

  describe(config.buildHeaders, () => {
    it("should return an object with an Authorization header", () => {
      const apiToken = "foo";
      const headers = config.buildHeaders(apiToken);

      expect(headers).toEqual({
        Authorization: "Basic Zm9v",
      });
    });
  });
});
