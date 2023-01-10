import { catalogIngestionPayloadFactory } from "../../../../test/factories/catalogIngestionPayload.factory";
import { itemFactory } from "../../../../test/factories/item.factory";

import { buildCsvPayload } from ".";

describe(buildCsvPayload, () => {
  const data: Parameters<typeof buildCsvPayload>[0] =
    catalogIngestionPayloadFactory.build().data;

  function buildExpectedCsv(rows: string[]) {
    return rows.join("\n");
  }

  it("should return a csv payload for groups, items & variations", async () => {
    const result = await buildCsvPayload(data);

    expect(result).toEqual({
      groups: expect.any(String),
      items: expect.any(String),
      variations: expect.any(String),
    });
  });

  describe("when parsing groups", () => {
    it("returns the csv as a string", async () => {
      const result = await buildCsvPayload(data);

      expect(result.groups).toEqual(
        buildExpectedCsv([
          "parent_id,id,name",
          ",all,All",
          "all,group-id,group-name",
        ])
      );
    });

    describe("with an empty array", () => {
      it("returns undefined", async () => {
        const result = await buildCsvPayload({
          ...data,
          groups: [],
        });

        expect(result.groups).toBeUndefined();
      });
    });
  });

  describe("when parsing items", () => {
    it("returns the csv as a string", async () => {
      const result = await buildCsvPayload(data);

      expect(result.items).toEqual(
        buildExpectedCsv([
          "id,item_name,url,image_url,description,keywords,group_ids,active,facet:facet-1-key,facet:facet-2-key,metadata:metadata-1-key,metadata:metadata-2-key",
          "item-id,item-name,item-url,item-image-url,item-description,item-keyword,all|group-id,true,facet-1-value,facet-2-value,metadata-1-value,metadata-2-value",
        ])
      );
    });

    it("correctly parses items with null values", async () => {
      const result = await buildCsvPayload({
        items: [itemFactory.build({ image_url: null })],
        variations: [],
        groups: [],
      });

      expect(result.items).toEqual(
        buildExpectedCsv([
          "id,item_name,url,image_url,description,keywords,group_ids,active,facet:facet-1-key,facet:facet-2-key,metadata:metadata-1-key,metadata:metadata-2-key",
          "item-id,item-name,item-url,,item-description,item-keyword,all|group-id,true,facet-1-value,facet-2-value,metadata-1-value,metadata-2-value",
        ])
      );
    });

    it("correctly parses items with empty arrays", async () => {
      const result = await buildCsvPayload({
        items: [itemFactory.build({ group_ids: [], metadata: [], facets: [] })],
        variations: [],
        groups: [],
      });

      expect(result.items).toEqual(
        buildExpectedCsv([
          "id,item_name,url,image_url,description,keywords,group_ids,active",
          "item-id,item-name,item-url,item-image-url,item-description,item-keyword,,true",
        ])
      );
    });

    describe("when parsing a item with json metadata", () => {
      async function buildCsvPayloadWithMetadata(metadataValue: any) {
        return await buildCsvPayload({
          items: [
            itemFactory.build({
              group_ids: [],
              facets: [],
              metadata: [
                {
                  key: "test",
                  value: metadataValue,
                },
              ],
            }),
          ],
          variations: [],
          groups: [],
        });
      }

      it("should JSON.stringify the value", async () => {
        const result = await buildCsvPayloadWithMetadata({
          json: "👌",
        });

        expect(result.items).toContain('"{""json"":""👌""}"');
      });

      it('should prefix the header name with "json:"', async () => {
        const result = await buildCsvPayloadWithMetadata({
          json: "👌",
        });

        expect(result.items).toContain("metadata:json:test");
      });

      describe("when identifying the root value type", () => {
        it("should NOT handle string as JSON", async () => {
          const result = await buildCsvPayloadWithMetadata("just a string");
          expect(result.items).not.toContain("json");
        });

        it("should NOT handle null as JSON", async () => {
          const result = await buildCsvPayloadWithMetadata(null);
          expect(result.items).not.toContain("json");
        });

        it("should NOT handle array of strings as JSON", async () => {
          const result = await buildCsvPayloadWithMetadata(["just", "strings"]);
          expect(result.items).not.toContain("json");
        });

        it("should handle array of, not strictly strings, as JSON", async () => {
          const result = await buildCsvPayloadWithMetadata([
            "just",
            "strings",
            false,
          ]);

          expect(result.items).toContain("json");
        });

        it("should handle boolean as JSON", async () => {
          const result = await buildCsvPayloadWithMetadata(true);

          expect(result.items).toContain("json");
        });

        it("should handle object as JSON", async () => {
          const result = await buildCsvPayloadWithMetadata({
            object: true,
          });

          expect(result.items).toContain("json");
        });
      });
    });

    describe("with an empty array", () => {
      it("returns undefined", async () => {
        const result = await buildCsvPayload({
          ...data,
          items: [],
        });

        expect(result.items).toBeUndefined();
      });
    });
  });

  describe("when parsing variations", () => {
    it("returns the csv as a string", async () => {
      const result = await buildCsvPayload(data);

      expect(result.variations).toEqual(
        buildExpectedCsv([
          "variation_id,item_id,item_name,url,image_url,active,facet:facet-1-key,facet:facet-2-key,metadata:metadata-1-key,metadata:metadata-2-key",
          "variation-id,item-id,variation-item-name,variation-url,variation-image-url,true,facet-1-value,facet-2-value,metadata-1-value,metadata-2-value",
        ])
      );
    });

    describe("with an empty array", () => {
      it("returns undefined", async () => {
        const result = await buildCsvPayload({
          ...data,
          variations: [],
        });

        expect(result.variations).toBeUndefined();
      });
    });
  });
});
