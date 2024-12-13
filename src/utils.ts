/**
 * Generate a GeoJSON object representing a hexagon centered at given coordinates.
 * @param {number} lat - Latitude of the center point.
 * @param {number} lng - Longitude of the center point.
 * @param {number} radius - Radius of the hexagon in meters.
 * @returns {object} GeoJSON Feature representing the hexagon.
 */
export function generateHex({ center, offset, num, radius }) {
  const { lat, lon } = center;
  const points = [];
  const sides = num;

  // Calculate the vertices of the hexagon
  if (num < 6) points.push([lon, lat]);
  for (let i = offset; i < offset + sides; i++) {
    const angle = i * 60 * (Math.PI / 180); // Convert degrees to radians
    const dx = radius * Math.cos(angle);
    const dy = radius * Math.sin(angle);

    // Convert meter offsets to latitude and longitude
    const newLat = lat + dy / 111111; // 1° latitude ≈ 111,111 meters
    const newLon = lon + dx / (111111 * Math.cos((lat * Math.PI) / 180)); // Adjust for longitude scaling
    points.push([newLon, newLat]);
  }
  // Close hex
  points.push(points[0]);
  return points;
}

export function generateWrappingHex({ center, offset, num, radius }) {
  const { lat, lon } = center;
  const points = [];
  const sides = num == 6 ? 7 : num;

  // Calculate the vertices of the hexagon
  // if (num < 6) points.push([lon, lat]);
  for (let i = offset; i < offset + sides; i++) {
    const angle = i * 60 * (Math.PI / 180); // Convert degrees to radians
    const dx = radius * Math.cos(angle);
    const dy = radius * Math.sin(angle);

    // Convert meter offsets to latitude and longitude
    const newLat = lat + dy / 111111; // 1° latitude ≈ 111,111 meters
    const newLon = lon + dx / (111111 * Math.cos((lat * Math.PI) / 180)); // Adjust for longitude scaling
    points.push([newLon, newLat]);
  }
  const wrappingOffset = 40;

  for (let i = offset + sides - 1; i >= offset; i--) {
    const angle = i * 60 * (Math.PI / 180); // Convert degrees to radians
    const dx = (radius + wrappingOffset) * Math.cos(angle);
    const dy = (radius + wrappingOffset) * Math.sin(angle);

    // Convert meter offsets to latitude and longitude
    const newLat = lat + dy / 111111; // 1° latitude ≈ 111,111 meters
    const newLon = lon + dx / (111111 * Math.cos((lat * Math.PI) / 180)); // Adjust for longitude scaling
    points.push([newLon, newLat]);
  }
  // Close hex
  points.push(points[0]);
  return points;
}

export const ageColorSchemes = [
  [237, 248, 251],
  [204, 236, 230],
  [153, 216, 201],
  [102, 194, 164],
  [44, 162, 95],
  [0, 109, 44],
];

export const genderColorSchemes = [
  [90, 180, 172],
  [216, 179, 101],
];
