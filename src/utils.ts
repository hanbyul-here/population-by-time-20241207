import { format } from "d3-format";

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

export const ageColors = [
  [237, 248, 251],
  [204, 236, 230],
  [153, 216, 201],
  [102, 194, 164],
  [44, 162, 95],
  [0, 109, 44],
];

export const genderColors = [
  [90, 180, 172],
  [216, 179, 101],
];

export const totalColor = [200, 100, 100];

const ageGroups = ["0", "10", "20", "30", "40", "50", "60", "70"];
export function generatePopulationTable({ data, time }) {
  let tableHTML = `
    <span class="text-xxs"> 2024년 12월 7일</span>
    <h2 class="font-bold text-md">${data.name} ${time}시</h2>
    <table class="table-fixed" border="1">
      <thead>
        <tr>
          <th class="px-3 py-3">연령대</th>
          <th class="px-6 py-3">여성 </th>
          <th class="px-6 py-3">남성 </th>
        </tr>
      </thead>
      <tbody>
  `;

  ageGroups.forEach((age) => {
    tableHTML += `
      <tr>
        <td>${age}</td>
        <td class="text-right">${format(",.0f")(data[`f${age}`])}</td>
        <td class="text-right">${format(",.0f")(data[`m${age}`])}</td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
    <p class="mt-1"><strong>총생활인구*:</strong> ${format(",.0f")(
      data.pop
    )}</p>
    <span class="text-xxs">*각 값의 합은 전체합계와 일치하지 않을 수 있습니다.</span>
  `;

  return tableHTML;
}
