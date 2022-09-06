import { Factory } from "fishery";

import { Variation } from "../../src";

export const variationFactory = Factory.define<Variation>(() => ({
  variation_id: "variation-id",
  item_id: "item-id",
  active: true,
  item_name: "variation-item-name",
  image_url: "variation-image-url",
  metadata: [
    {
      key: "metadata-1-key",
      value: "metadata-1-value",
    },
    {
      key: "metadata-2-key",
      value: "metadata-2-value",
    },
  ],
  facets: [
    {
      key: "facet-1-key",
      value: "facet-1-value",
    },
    {
      key: "facet-2-key",
      value: "facet-2-value",
    },
  ],
}));
