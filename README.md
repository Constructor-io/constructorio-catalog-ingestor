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
import { Ingestor, CatalogData } from '@constructor/ingestor';

const ingestor = new Ingestor({
  api_token: '<YOUR_API_TOKEN>',
});

const data: CatalogData[] = [
  {
    id: 'nike-shoes-brown',
    name: 'Nike Shoes Brown',
    data: {
      facets: {
        Color: ['Brown'],
        Size: ['M', 'L'],
      },
      image_url: 'https://images.nike.com/shoes-brown.jpg',
      url: 'https://nike.com/shoes-brown.html',
      type: 'Shoes',
    },
  },
];

await ingestor.ingest(data);
```
