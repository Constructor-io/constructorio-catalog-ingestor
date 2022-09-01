import { Factory } from "fishery";

import { Group } from "catalogIngestor/types";

export const groupFactory = Factory.define<Group>(() => ({
  id: "group-id",
  name: "group-name",
  parent_id: null,
}));
