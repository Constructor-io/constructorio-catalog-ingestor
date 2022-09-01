import { Factory } from "fishery";

import { Variation } from "catalogIngestor/types";

export const variationFactory = Factory.define<Variation>(() => ({
  variation_id: "variation-id",
  item_id: "item-id",
  active: true,
  item_name: "variation-item-name",
  image_url: "variation-image-url",
  metadata: [
    {
      key: "variation-metadata-key",
      value: "variation-metadata-value",
    },
  ],
  facets: [
    {
      key: "variation-facet-key",
      value: "variation-facet-value",
    },
  ],
}));
