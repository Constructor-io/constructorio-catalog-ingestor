import { config } from "./config";

describe("config", () => {
  it("should have a baseUrl", () => {
    expect(config.baseUrl).toBe("https://ac.cnstrc.com");
  });
});
