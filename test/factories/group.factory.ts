import { Factory } from "fishery";

import { Group } from "../../src";

export const groupFactory = Factory.define<Group>(() => ({
  id: "group-id",
  name: "group-name",
  parent_id: null,
}));
