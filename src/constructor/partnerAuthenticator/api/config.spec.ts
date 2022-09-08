import { config } from "./config";

describe("config", () => {
  it("should have a serviceUrl", () => {
    expect(config.serviceUrl).toBe("https://partner-authenticator.cnstrc.com");
  });
});
