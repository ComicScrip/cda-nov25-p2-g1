export function normalizeHeightToMeters(
  height: number | null | undefined,
): number | null {
  const parsedHeight = Number(height);
  if (!Number.isFinite(parsedHeight) || parsedHeight <= 0) {
    return null;
  }

  // Historical data mixes meters (1.72) and centimeters (172).
  return parsedHeight <= 3 ? parsedHeight : parsedHeight / 100;
}

export function normalizeHeightToCentimeters(
  height: number | null | undefined,
): number | null {
  const heightInMeters = normalizeHeightToMeters(height);
  if (heightInMeters === null) {
    return null;
  }

  return Number((heightInMeters * 100).toFixed(1));
}

export function calculateBodyMassIndex(
  weight: number | null | undefined,
  height: number | null | undefined,
): number | null {
  const parsedWeight = Number(weight);
  const heightInMeters = normalizeHeightToMeters(height);

  if (
    !Number.isFinite(parsedWeight) ||
    parsedWeight <= 0 ||
    heightInMeters === null
  ) {
    return null;
  }

  return Number((parsedWeight / (heightInMeters * heightInMeters)).toFixed(1));
}
