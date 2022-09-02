import { config } from "./config";

describe("config", () => {
  it("should have a baseUrl", () => {
    expect(config.baseUrl).toBe("https://partner-authenticator.cnstrc.com");
  });
});
