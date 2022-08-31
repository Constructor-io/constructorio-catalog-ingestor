## Description

This package is meant to help in the process of ingesting your catalog data into Constructor.io. Internally, it relies on our [public API](https://docs.constructor.io/).

## Installation

First, install the package:

```bash
npm i @constructor/ingestor
```

## Usage

To ingest data, you simply need to call the `ingest` method:

```ts
import { CatalogIngestionPayload, CatalogIngestor } from "@constructorio/ingestor";

async function fetchData(): Promise<ExternalData> {
  // TODO: Implement your logic to fetch data here.

  return {};
}

function transformData(data: ExternalData): CatalogIngestionPayload {
  // TODO: Implement your logic to transform data here.
  // Here, we're just using an example dataset.

  return {
    groups: [
      {
        parent_id: null,
        name: "Shoes",
        id: "shoes",
      },
    ],
    items: [
      {
        id: "nike-shoes-brown",
        item_name: "Nike Shoes Brown",
        image_url: "https://images.nike.com/shoes-brown.jpg",
        url: "https://www.nike.com/shoes-brown",
        description: "Best shoes",
        group_ids: ["shoes"],
        active: "TRUE",
        metadata: [],
        keywords: [],
        facets: [
          {
            key: "Color",
            value: "Brown",
          },
          {
            key: "Size",
            value: ["M", "L", "XL"],
          },
        ],
      },
    ],
    variations: [],
  };
}

const catalogIngestor = new CatalogIngestor({
  constructorApiToken: "my-constructor-api-token",
});

await catalogIngestor.ingest(async () => {
  const data = await fetchData();
  return transformData(data);
});
```
