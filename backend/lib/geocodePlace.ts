// backend/lib/geocodePlace.ts

export interface GeocodedPlace {
  latitude?: number;
  longitude?: number;
  source?: string;
}

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function geocodePlace(
  displayPlace: string
): Promise<GeocodedPlace> {
  const query = displayPlace?.trim();

  if (!query) {
    return {};
  }

  const userAgent = process.env.GEOCODER_USER_AGENT;

  if (!userAgent) {
    console.warn("GEOCODER_USER_AGENT is not set");
    return {};
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");

  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": userAgent,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.warn(
        `Geocode failed for "${query}": ${response.status}`
      );
      await delay(1100);
      return {};
    }

    const results = await response.json();

    const first = Array.isArray(results)
      ? results[0]
      : undefined;

    if (!first?.lat || !first?.lon) {
      console.warn(`No geocode result for "${query}"`);
      await delay(1100);
      return {};
    }

    const latitude = Number(first.lat);
    const longitude = Number(first.lon);

    if (
      Number.isNaN(latitude) ||
      Number.isNaN(longitude)
    ) {
      console.warn(`Invalid geocode result for "${query}"`);
      await delay(1100);
      return {};
    }

    await delay(1100);

    return {
      latitude,
      longitude,
      source: "nominatim",
    };
  } catch (err) {
    console.error(`Geocode error for "${query}"`, err);
    await delay(1100);
    return {};
  }
}