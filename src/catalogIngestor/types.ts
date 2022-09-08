export enum CatalogIngestionType {
  /**
   * Full ingestion. Overrides the existing catalog.
   */
  FULL = "full",

  /**
   * Incremental ingestion. Adds new products to the existing catalog.
   */
  DELTA = "delta",
}

/**
 * The base data type used to ingest data to Constructor.
 */
export interface CatalogIngestionPayload {
  type: CatalogIngestionType;
  data: {
    groups: Group[];
    items: Item[];
    variations: Variation[];
  };
}

/**
 * Defines a group.
 *
 * Note that we need to have a default group, usually called `All`:
 *
 * ```js
 * {
 *  "parent_id": null,
 *  "id": "All",
 *  "name": "All",
 * }
 * ```
 *
 * Other groups can inherit from any group, but they should inherit from `All`
 * in case they are defined in the root.
 */
export interface Group {
  parent_id: string | null;
  id: string;
  name: string;
}

/**
 * Defines a catalog item.
 */
export interface Item {
  id: string;
  item_name: string;
  description: string;
  url: string | null;
  image_url: string | null;
  active: boolean;
  keywords: string[];

  /**
   * The group ids that this item belongs to.
   * Must be present in the `groups` root property.
   */
  group_ids: string[];

  /**
   * Defines the metadata for this item.
   *
   * The minimum recommended metadata for an item is:
   * - `originalSrc` (`string`)
   * - `productType` (`string`)
   * - `vendor` (`string`)
   * - `createdAt` (`Date`)
   * - `updatedAt` (`Date`)
   * - `publishedAt` (`Date`)
   * - `totalInventory` (`number`)
   * - `isGiftCard` (`boolean`)
   * - `minPrice` (`float`)
   * - `maxPrice` (`float`)
   */
  metadata: KeyValue[];

  /**
   * Defines the facets for this item.
   *
   * The minimum recommended facets for an item are:
   * - `productType` (`string`)
   * - `vendor` (`string`)
   * - `createdAt` (`Date`)
   * - `updatedAt` (`Date`)
   * - `publishedAt` (`Date`)
   * - `minPrice` (`float`)
   * - `maxPrice` (`float`)
   */
  facets: KeyValue[];
}

/**
 * Defines a variation of an item.
 * Should always point to an item via the item_id field.
 */
export interface Variation {
  variation_id: string;
  item_name: string;
  image_url: string | null;
  item_id: string;
  active: boolean;

  /**
   * Defines the metadata for this variation.
   *
   * The minimum recommended metadata for a variation are:
   * - `displayName` (`string`)
   * - `originalSrc` (`string`)
   * - `sku` (`string`)
   * - `availableForSale` (`boolean`)
   * - `createdAt` (`Date`)
   * - `updatedAt` (`Date`)
   * - `price` (`float`)
   * - `compareAtPrice` (`float`)
   * - `position` (`number`)
   * - `inventory` (`number`)
   */
  metadata: KeyValue[];

  /**
   * Defines the facets for this variation.
   *
   * The minimum recommended facets for a variation are:
   * - `createdAt` (`Date`)
   * - `updatedAt` (`Date`)
   * - `price` (`float`)
   * - `compareAtPrice` (`float`)
   */
  facets: KeyValue[];
}

export interface KeyValue {
  key: string;
  value: string | string[] | null;
}
