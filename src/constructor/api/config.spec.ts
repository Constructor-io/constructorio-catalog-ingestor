import { config } from "./config";

describe("config", () => {
  it("should have a baseUrl", () => {
    expect(config.baseUrl).toBe("https://ac.cnstrc.com");
  });

  describe(config.getHeaders, () => {
    it("should return an object with an Authorization header", () => {
      expect(config.getHeaders("foo")).toEqual({
        Authorization: "Basic Zm9v",
      });
    });
  });
});
