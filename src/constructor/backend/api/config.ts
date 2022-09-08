/**
 * Default API config.
 */
export const config = {
  serviceUrl: "https://ac.cnstrc.com",
  buildHeaders(apiToken: string) {
    return {
      Authorization: `Basic ${Buffer.from(apiToken).toString("base64")}`,
    };
  },
};
