import { format } from "d3-format";
const ageGroups = ["0", "10", "20", "30", "40", "50", "60", "70"];
export function generatePopulationTable({ data, time }) {
  let tableHTML = `
    <h2 class="font-bold text-lg">${data.name} ${time}시</h2>
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
    <p class="text-right mt-1"><strong>총합:</strong> ${format(",.0f")(
      data.pop
    )}</p>
  `;

  return tableHTML;
}
