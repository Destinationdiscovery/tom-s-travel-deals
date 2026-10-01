export type GridPoint = { lat: number; lng: number };

/** Grid size grows with the search radius so large areas get full coverage. */
export function gridSizeForRadius(radiusKm: number): number {
  if (radiusKm <= 20) return 1;
  if (radiusKm <= 50) return 3;
  if (radiusKm <= 150) return 4;
  return 5;
}

export function generateGridPoints(
  centerLat: number,
  centerLng: number,
  radiusKm: number,
  gridSize: number,
): GridPoint[] {
  if (gridSize <= 1) return [{ lat: centerLat, lng: centerLng }];
  const points: GridPoint[] = [];
  const stepDeg = (radiusKm / 111) * (2 / gridSize);
  const offset = (stepDeg * (gridSize - 1)) / 2;
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      points.push({
        lat: centerLat - offset + row * stepDeg,
        lng: centerLng - offset + col * stepDeg,
      });
    }
  }
  return points;
}

/** Each grid point searches a smaller bubble so the searches overlap without gaps. */
export function pointRadiusKm(radiusKm: number, gridSize: number): number {
  if (gridSize <= 1) return radiusKm;
  return Math.max(1, Math.round((radiusKm / gridSize) * 1.2));
}

export function relativeDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}
