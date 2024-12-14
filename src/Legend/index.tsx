import { useEffect, useRef } from "react";
import { ageColors, genderColors, totalColor } from "../utils";
// ㅠㅠ
const LegendCanvas = ({ category, toggleOn }) => {
  const canvasRef = useRef(null);

  const size = 20; // Canvas size
  const radius = 10;
  const centerX = size / 2;
  const centerY = size / 2;
  const labelToShow =
    category === "total"
      ? ["전체"]
      : category === "gender"
      ? ["여성", "남성"]
      : ["10대", "20대", "30대", "40대", "50대", "60대"];

  const currentLabel = toggleOn
    ? [...labelToShow, "전주 (11/30) "]
    : labelToShow;
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Function to draw a hexagon
    const drawHexagon = () => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * 60 * Math.PI) / 180;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
    };

    const drawWrappingHexagon = () => {
      ctx.beginPath();
      const CY = centerY + size * labelToShow.length;
      for (let i = 0; i < 7; i++) {
        const angle = (i * 60 * Math.PI) / 180;
        const x = centerX + radius * 0.8 * Math.cos(angle);
        const y = CY + radius * 0.8 * Math.sin(angle);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      for (let i = 7; i > 0; i--) {
        const angle = (i * 60 * Math.PI) / 180;
        const x = centerX + radius * Math.cos(angle);
        const y = CY + radius * Math.sin(angle);
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    };

    // Draw hexagon segments for age groups
    const drawAgeGroupSegments = () => {
      for (let i = 0; i < 6; i++) {
        const CY = centerY + size * i - 5;
        const CX = centerX - 5;
        ctx.beginPath();
        ctx.moveTo(CX, CY);
        const angle1 = (0 * 60 * Math.PI) / 180;
        const angle2 = ((0 + 1) * 60 * Math.PI) / 180;

        ctx.lineTo(
          CX + radius * Math.cos(angle2),
          CY + radius * Math.sin(angle2)
        );
        ctx.lineTo(
          CX + radius * Math.cos(angle1),
          CY + radius * Math.sin(angle1)
        );
        ctx.closePath();

        // Fill the segment with color
        ctx.fillStyle = `rgba(${ageColors[i][0]},${ageColors[i][1]}, ${ageColors[i][2]}, 255)`;
        ctx.fill();
      }
    };

    const drawSplit = () => {
      ctx.beginPath();
      let first = true;
      for (let j = 2; j < 6; j++) {
        const i = (j + 6) % 6;
        const angle = (i * 60 * Math.PI) / 180;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        if (first) {
          ctx.moveTo(x, y);
          first = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(${genderColors[0][0]},${genderColors[0][1]}, ${genderColors[0][2]}, 255)`;
      ctx.fill();

      ctx.beginPath();
      first = true;

      for (let j = 5; j < 9; j++) {
        const i = (j + 6) % 6;
        const angle = (i * 60 * Math.PI) / 180;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + size + radius * Math.sin(angle);
        if (first) {
          ctx.moveTo(x, y);
          first = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(${genderColors[1][0]},${genderColors[1][1]}, ${genderColors[1][2]}, 255)`;
      ctx.fill();
    };

    // Draw based on the selected category

    if (category === "total") {
      drawHexagon();

      ctx.fillStyle = `rgba(${totalColor[0]},${totalColor[1]}, ${totalColor[2]}, 255)`;
      ctx.fill();
    } else if (category === "gender") {
      drawSplit();
    } else if (category === "agegroup") {
      drawAgeGroupSegments();
    }
    if (toggleOn) drawWrappingHexagon();
  }, [category, centerX, centerY, toggleOn, radius]);

  let heightScale = category === "total" ? 1 : category === "gender" ? 2 : 6;
  heightScale += !!toggleOn;

  return (
    <div>
      <div className="grid grid-cols-6">
        <div className="col-span-2">
          <canvas
            ref={canvasRef}
            width={size}
            height={size * heightScale}
            style={{ width: `${size}px`, height: `${size * heightScale}px` }}
          />
        </div>
        <div className="col-span-4">
          {currentLabel.map((label) => (
            <div key={label} style={{ height: "20px" }} className="w-100">
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LegendCanvas;
