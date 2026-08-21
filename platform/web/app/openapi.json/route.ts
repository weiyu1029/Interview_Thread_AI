const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://interviewthreadai.com";

const specification = {
  openapi: "3.1.0",
  info: {
    title: "InterviewThread Public API",
    version: "1.0.0",
    description:
      "Read-only public endpoints used by InterviewThread for approved job-board data and coarse regional localization. Private interview records and account activity are not exposed through this API.",
    contact: {
      name: "InterviewThread",
      email: "contact@interviewthreadai.com",
      url: `${SITE_URL}/en/contact`,
    },
    license: {
      name: "MIT",
      identifier: "MIT",
      url: "https://github.com/weiyu1029/Interview_Thread_AI/blob/main/LICENSE",
    },
  },
  servers: [{ url: SITE_URL, description: "Production" }],
  paths: {
    "/api/jobs": {
      get: {
        operationId: "listApprovedEmployerJobs",
        summary: "Load a public employer job board from an approved ATS",
        description:
          "Fetches one employer's published openings from an official Greenhouse, Lever, Lever EU, or Ashby endpoint. The reference must identify that official board; arbitrary websites are rejected.",
        parameters: [
          {
            name: "provider",
            in: "query",
            required: true,
            schema: {
              type: "string",
              enum: ["greenhouse", "lever", "lever-eu", "ashby"],
            },
          },
          {
            name: "reference",
            in: "query",
            required: true,
            description:
              "The employer board identifier or a URL hosted by the selected official ATS.",
            schema: { type: "string", minLength: 1, maxLength: 500 },
          },
        ],
        responses: {
          "200": {
            description: "Normalized public job postings and source provenance",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/JobBoardResponse" },
              },
            },
          },
          "400": {
            description: "Unsupported provider or invalid board reference",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "502": {
            description: "The official provider could not be reached safely",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/region": {
      get: {
        operationId: "getRequestRegion",
        summary: "Return the request's coarse country code when available",
        description:
          "Returns an ISO 3166-1 alpha-2 country code inferred by the hosting edge. It does not return a precise location or IP address.",
        responses: {
          "200": {
            description: "Country code or null",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["country"],
                  properties: {
                    country: {
                      anyOf: [
                        { type: "string", pattern: "^[A-Z]{2}$" },
                        { type: "null" },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Error: {
        type: "object",
        required: ["error"],
        properties: { error: { type: "string" } },
      },
      Job: {
        type: "object",
        required: ["id", "source", "title", "company", "sourceUrl"],
        properties: {
          id: { type: "string" },
          source: { type: "string" },
          title: { type: "string" },
          company: { type: "string" },
          description: { type: "string" },
          department: { type: "string" },
          country: { type: "string" },
          city: { type: "string" },
          workStyle: { type: "string" },
          sourceUrl: { type: "string", format: "uri" },
          applyUrl: { type: "string", format: "uri" },
          publishedAt: { type: "string" },
          compensation: { type: "string" },
        },
        additionalProperties: true,
      },
      JobBoardResponse: {
        type: "object",
        required: ["source", "jobs", "count"],
        properties: {
          source: {
            type: "object",
            description: "Provider, employer, retrieval time, and coverage details",
            additionalProperties: true,
          },
          jobs: {
            type: "array",
            items: { $ref: "#/components/schemas/Job" },
          },
          count: { type: "integer", minimum: 0 },
        },
      },
    },
  },
  externalDocs: {
    description: "InterviewThread agent-readable product overview",
    url: `${SITE_URL}/llms.txt`,
  },
};

export function GET() {
  return Response.json(specification, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
