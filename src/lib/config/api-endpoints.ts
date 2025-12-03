/**
 * API Endpoint definitions for the API Explorer
 * Later, these will be loaded from OpenAPI spec
 */

export interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  sampleBody: string;
}

export interface EndpointGroup {
  group: string;
  items: ApiEndpoint[];
}

export const ENDPOINTS: EndpointGroup[] = [
  {
    group: "Ingestions",
    items: [
      {
        method: "POST",
        path: "/v1/ingestions",
        description: "Create a new ingestion (PDF).",
        sampleBody: `{
  "bankCode": "CIH",
  "file": "<base64 PDF placeholder>"
}`,
      },
      {
        method: "GET",
        path: "/v1/ingestions/{id}",
        description: "Retrieve a specific ingestion by ID.",
        sampleBody: `{}`,
      },
    ],
  },
  {
    group: "Transactions",
    items: [
      {
        method: "GET",
        path: "/v1/transactions",
        description: "List enriched transactions.",
        sampleBody: `{
  "limit": 20,
  "offset": 0
}`,
      },
    ],
  },
];

