import { Factory } from "fishery";

import { Item } from "catalogIngestor/types";

export const itemFactory = Factory.define<Item>(() => ({
  id: "item-id",
  active: true,
  description: "item-description",
  group_ids: ["group-id"],
  image_url: "item-image-url",
  item_name: "item-name",
  keywords: ["item-keyword"],
  url: "item-url",
  metadata: [
    {
      key: "item-metadata-key",
      value: "item-metadata-value",
    },
  ],
  facets: [
    {
      key: "item-facet-key",
      value: "item-facet-value",
    },
  ],
}));
