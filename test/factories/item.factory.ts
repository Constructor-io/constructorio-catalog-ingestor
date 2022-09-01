import { Factory } from "fishery";

import { Item } from "catalogIngestor/types";

export const itemFactory = Factory.define<Item>(() => ({
  id: "item-id",
  active: true,
  description: "item-description",
  group_ids: ["all", "group-id"],
  image_url: "item-image-url",
  item_name: "item-name",
  keywords: ["item-keyword"],
  url: "item-url",
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
