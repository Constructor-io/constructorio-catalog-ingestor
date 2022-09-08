import { Factory } from "fishery";

import { CatalogIngestionPayload, CatalogIngestionType } from "../../src";

import { variationFactory } from "./variation.factory";
import { groupFactory } from "./group.factory";
import { itemFactory } from "./item.factory";

export const catalogIngestionPayloadFactory =
  Factory.define<CatalogIngestionPayload>(() => ({
    type: CatalogIngestionType.FULL,
    data: {
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
    },
  }));
