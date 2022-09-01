import { Factory } from "fishery";

import { groupFactory } from "./group.factory";
import { itemFactory } from "./item.factory";
import { variationFactory } from "./variation.factory";

import { CatalogIngestionPayload } from "catalogIngestor/types";

export const catalogIngestionPayloadFactory =
  Factory.define<CatalogIngestionPayload>(() => ({
    groups: [
      groupFactory.build({
        id: "all",
        name: "All",
        parent_id: null,
      }),
      groupFactory.build({
        id: "group-id",
        name: "group-name",
        parent_id: "all",
      }),
    ],
    items: itemFactory.buildList(1),
    variations: variationFactory.buildList(1),
  }));
