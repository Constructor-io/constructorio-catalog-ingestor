import { Factory } from "fishery";

import { groupFactory } from "./group.factory";
import { itemFactory } from "./item.factory";
import { variationFactory } from "./variation.factory";

import { CatalogIngestionPayload } from "catalogIngestor/types";

export const catalogIngestionPayloadFactory =
  Factory.define<CatalogIngestionPayload>(() => ({
    groups: groupFactory.buildList(1),
    items: itemFactory.buildList(1),
    variations: variationFactory.buildList(1),
  }));
