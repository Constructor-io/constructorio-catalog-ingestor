/**
 * Default API config.
 */
export const config = {
  baseUrl: "https://ac.cnstrc.com",

  getHeaders: function (apiToken: string) {
    return {
      Authorization: `Basic ${Buffer.from(apiToken).toString("base64")}`,
    };
  },
};
