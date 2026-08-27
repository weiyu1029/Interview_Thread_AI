export type JsonRequestGuardFailure = {
  ok: false;
  status: 400 | 403 | 413 | 415;
  error: string;
};

export type JsonRequestGuardResult =
  | { ok: true }
  | JsonRequestGuardFailure;

export type JsonBodyResult<T> =
  | { ok: true; payload: T }
  | JsonRequestGuardFailure;

export type MultipartBodyResult =
  | { ok: true; payload: FormData }
  | JsonRequestGuardFailure;

export function hasSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function hasJsonContentType(request: Request) {
  const mediaType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();
  return mediaType === "application/json";
}

export function validateContentLength(request: Request, maximumBytes: number) {
  const value = request.headers.get("content-length");
  if (value === null) return { ok: true } as const;

  const normalized = value.trim();
  if (!/^\d+$/.test(normalized))
    return {
      ok: false,
      status: 400,
      error: "Invalid Content-Length header.",
    } as const;

  const declaredBytes = Number(normalized);
  if (!Number.isSafeInteger(declaredBytes))
    return {
      ok: false,
      status: 400,
      error: "Invalid Content-Length header.",
    } as const;
  if (declaredBytes > maximumBytes)
    return {
      ok: false,
      status: 413,
      error: "Request body is too large.",
    } as const;

  return { ok: true } as const;
}

export function validateJsonRequest(
  request: Request,
  maximumBytes: number,
): JsonRequestGuardResult {
  if (!hasSameOrigin(request))
    return { ok: false, status: 403, error: "Invalid request origin." };
  if (!hasJsonContentType(request))
    return { ok: false, status: 415, error: "JSON is required." };
  return validateContentLength(request, maximumBytes);
}

export async function readJsonBody<T = unknown>(
  request: Request,
  maximumBytes: number,
): Promise<JsonBodyResult<T>> {
  const contentLength = validateContentLength(request, maximumBytes);
  if (!contentLength.ok) return contentLength;
  if (!request.body)
    return { ok: false, status: 400, error: "Invalid JSON body." };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maximumBytes) {
        await reader.cancel().catch(() => undefined);
        return {
          ok: false,
          status: 413,
          error: "Request body is too large.",
        };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON body." };
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(body);
    return { ok: true, payload: JSON.parse(decoded) as T };
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON body." };
  }
}

/**
 * Reads multipart data through a byte-counting boundary before invoking the
 * platform parser. This prevents a missing or dishonest Content-Length header
 * from turning a small voice upload endpoint into an unbounded body read.
 */
export async function readMultipartBody(
  request: Request,
  maximumBytes: number,
): Promise<MultipartBodyResult> {
  const contentType = request.headers.get("content-type")?.trim() || "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data;"))
    return {
      ok: false,
      status: 415,
      error: "Multipart form data is required.",
    };
  const contentLength = validateContentLength(request, maximumBytes);
  if (!contentLength.ok) return contentLength;
  if (!request.body)
    return { ok: false, status: 400, error: "Invalid multipart body." };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value?.byteLength) continue;
      totalBytes += value.byteLength;
      if (totalBytes > maximumBytes) {
        await reader.cancel("multipart_body_too_large").catch(() => undefined);
        return {
          ok: false,
          status: 413,
          error: "Request body is too large.",
        };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400, error: "Invalid multipart body." };
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    const parsedRequest = new Request(request.url, {
      method: "POST",
      headers: { "content-type": contentType },
      body,
    });
    return { ok: true, payload: await parsedRequest.formData() };
  } catch {
    return { ok: false, status: 400, error: "Invalid multipart body." };
  }
}

export function jsonRequestGuardResponse(
  result: JsonRequestGuardResult,
): Response | null {
  if (result.ok) return null;
  return Response.json({ error: result.error }, { status: result.status });
}
