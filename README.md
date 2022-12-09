# Constructor.io Catalog Ingestor

[![npm](https://img.shields.io/npm/v/@constructor-io/catalog-ingestor)](https://www.npmjs.com/package/@constructor-io/catalog-ingestor)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Constructor-io/constructorio-catalog-ingestor/blob/master/LICENSE)
[![Minzipped Size](https://img.shields.io/bundlephobia/minzip/@constructor-io/catalog-ingestor)](https://bundlephobia.com/result?p=@constructor-io/catalog-ingestor)

Constructor.io is an e-commerce first product discovery service that optimizes results using artificial intelligence (including natural language processing, re-ranking to optimize for business metrics, and end user personalization).

This package is a Node.js library for easily ingesting product catalogs into Constructor.io using a strict type system. **It is intended for use with partner connections** - that is, integrating other systems such as e-commerce platforms or product information management platforms with Constructor.io

> If you're looking for a package to consume our API, please use [@constructor-io/constructorio-node](https://github.com/Constructor-io/constructorio-node) instead. Alternatively, if you want a JavaScript client for client side (i.e. front end) integrations please use [@constructor-io/constructorio-client-javascript](https://github.com/Constructor-io/constructorio-client-javascript).

## Architecture overview

Here's how the `@constructor-io/catalog-ingestor` package usually fits into the overall ecosystem:

<img src="https://raw.githubusercontent.com/Constructor-io/constructorio-catalog-ingestor/master/images/diagram.png" width="1000px" height="auto" alt="Catalog Ingestor Diagram" />

## Documentation

Full API documentation is available on [Github Pages](https://constructor-io.github.io/constructorio-catalog-ingestor/index.html)

## 1. Review the Requirements

Before you begin, note that this package is intended for use with partner connections. Some credentials are provided by partner connectors
while calling this package, so ideally you should be working with a specific partner integration to use this package.

The following credentials are required to use this package:

- `apiToken` - Your Constructor.io API token.
- `apiKey` - Your Constructor.io API key.

If you need a more general solution, check out our [Node.js client](https://github.com/Constructor-io/constructorio-node).

## 2. Install

This package can be installed via npm: `npm i @constructor-io/catalog-ingestor`. Once installed, simply import or require the package into your repository.

**Important**: this library should only be used in a server-side context.

## 3. Retrieve an API key and token

You can find this in your [Constructor.io dashboard](https://constructor.io/dashboard). Contact sales if you'd like to sign up, or support if you believe your company already has an account.

## 4. Implement the ingestor

Once imported, an instance of the ingestor can be created as follows:

```ts
import { CatalogIngestor } from "@constructor-io/catalog-ingestor";

const catalogIngestor = new CatalogIngestor({
  apiToken: "YOUR API TOKEN",
  apiKey: "YOUR API KEY",
});
```

You can also provide more options to the ingestor, such as an email to notify in case the ingestion fails. For example:

```ts
import { CatalogIngestor } from "@constructor-io/catalog-ingestor";

const catalogIngestor = new CatalogIngestor({
  notificationEmail: "YOUR EMAIL",
  // ...everything else
});
```

Check out our [API docs](https://docs.constructor.io/rest_api/full_catalog/#replace-the-catalog-sync) for more information.

## 5. Ingest your catalog

### Ingestion types

We support both [full](https://docs.constructor.io/rest_api/full_catalog/#replace-the-catalog-sync) and [delta](https://docs.constructor.io/rest_api/full_catalog/#update-the-catalog-delta) ingestions.

This is handled by the `type` argument provided to the `ingest` function.

### Full ingestions

**Full ingestions** replace the entire catalog with the data provided. This is useful for initial catalog ingestion, or when you want to completely replace your catalog with new data.

```ts
import { CatalogIngestionType } from "@constructor-io/catalog-ingestor";

catalogIngestor.ingest(() => ({
  type: CatalogIngestionType.FULL,
  // ...other options
}));
```

### Delta ingestions

**Delta ingestions** update the catalog with the data provided. This is useful for updating your catalog with new or changed data.

```ts
import { CatalogIngestionType } from "@constructor-io/catalog-ingestor";

catalogIngestor.ingest(() => ({
  type: CatalogIngestionType.DELTA,
  // ...other options
}));
```

### Fetching & transforming data

This package is completely agnostic on how to fetch and transform your data. The only requirement is that you must provide a function that returns a `Promise` that resolves to the ingestion payload.

**It's recommended to fetch & transform your data inside this promise**. This way, we're able to identify and report any issues that may have occurred during ingestion.

Finally, to ingest your catalog data you simply need to call the `ingest` function and pass this promise:

```ts
import {
  CatalogIngestionPayload,
  CatalogIngestionType,
} from "@constructor-io/catalog-ingestor";

async function fetchData(): Promise<ExternalData> {
  // TODO: Implement your logic to fetch data here.

  return {};
}

function transformData(data: ExternalData): CatalogIngestionPayload {
  // TODO: Implement your logic to transform data here.
  // As an example, we're just returning static data.

  return {
    type: CatalogIngestionType.FULL,
    data: {
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
          active: true,
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
    },
  };
}


await catalogIngestor.ingest(async () => {
  const data = await fetchData();
  return transformData(data);
});
```

## Development / npm commands

```bash
npm run lint            # run lint on source code and tests
npm run test            # run tests
npm run test:cov        # run tests with coverage report
npm run generate-docs   # output documentation to `./docs` directory
```
