const COUNTRY_HEADER_NAMES = [
  "cf-ipcountry",
  "x-vercel-ip-country",
  "x-country-code",
];

export function GET(request: Request) {
  const country = COUNTRY_HEADER_NAMES.map((name) => request.headers.get(name))
    .find((value) => value && /^[A-Z]{2}$/i.test(value))
    ?.toUpperCase();

  return Response.json(
    { country: country || null },
    {
      headers: {
        "cache-control": "private, max-age=3600",
        vary: COUNTRY_HEADER_NAMES.join(", "),
      },
    },
  );
}
