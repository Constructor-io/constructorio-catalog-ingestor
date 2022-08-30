## Description

This package is meant to help in the process of ingesting your catalog data into Constructor.io. Internally, it relies on our [public API](https://docs.constructor.io/).

Given a set data structure, it's responsible for parsing that into a CSV file and handling the whole ingestion process.

## Installation

First, install the package:

```bash
npm i @constructor/ingestor
```

## Usage

To ingest data, you simply need to call the `ingest` method:

```ts
import { Ingestor, CatalogIngestion } from '@constructor/ingestor';

const ingestor = new Ingestor('<YOUR_API_TOKEN>');

const data: CatalogIngestion = {
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

await ingestor.ingest(data);
```
