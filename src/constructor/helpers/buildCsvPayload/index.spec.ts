import { catalogIngestionPayloadFactory } from "../../../../test/factories/catalogIngestionPayload.factory";
import { itemFactory } from "../../../../test/factories/item.factory";

import { buildCsvPayload } from ".";

describe(buildCsvPayload, () => {
  const data: Parameters<typeof buildCsvPayload>[0] =
    catalogIngestionPayloadFactory.build();

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
        items: [itemFactory.build({ url: null })],
        variations: [],
        groups: [],
      });

      expect(result.items).toEqual(
        buildExpectedCsv([
          "id,item_name,url,image_url,description,keywords,group_ids,active,facet:facet-1-key,facet:facet-2-key,metadata:metadata-1-key,metadata:metadata-2-key",
          "item-id,item-name,,item-image-url,item-description,item-keyword,all|group-id,true,facet-1-value,facet-2-value,metadata-1-value,metadata-2-value",
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
          "variation_id,item_id,item_name,image_url,active,facet:facet-1-key,facet:facet-2-key,metadata:metadata-1-key,metadata:metadata-2-key",
          "variation-id,item-id,variation-item-name,variation-image-url,true,facet-1-value,facet-2-value,metadata-1-value,metadata-2-value",
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
