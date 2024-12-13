import { useEffect, useRef } from "react";
import { ageColors, genderColors, totalColor } from "../utils";

const LegendCanvas = ({ category, toggleOn }) => {
  const canvasRef = useRef(null);

  const size = 130; // Canvas size
  const radius = toggleOn ? 60 : 50; // Radius of the hexagon
  const centerX = size / 2;
  const centerY = size / 2;

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

      for (let i = 0; i < 7; i++) {
        const angle = (i * 60 * Math.PI) / 180;
        const x = centerX + radius * 0.8 * Math.cos(angle);
        const y = centerY + radius * 0.8 * Math.sin(angle);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    };

    const drawIndicator = () => {
      ctx.beginPath();
      ctx.moveTo(centerX + 13, 20);
      ctx.lineTo(centerX + 50, 20);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = "#000";
      ctx.font = "12px Arial";
      ctx.fillText("2024/11/30", centerX + 50, 25);

      ctx.beginPath();
      ctx.moveTo(centerX + 13, 50);
      ctx.lineTo(centerX + 55, 50);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = "#000";
      ctx.font = "12px Arial";
      ctx.fillText("2024/12/7", centerX + 55, 55);
    };
    // Draw hexagon segments for age groups
    const drawAgeGroupSegments = () => {
      const labels = ["10대", "20대", "30대", "40대", "50대", "60대"];

      for (let i = 6; i > 0; i--) {
        console.log(i);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        const angle1 = (i * 60 * Math.PI) / 180;
        const angle2 = ((i + 1) * 60 * Math.PI) / 180;
        ctx.lineTo(
          centerX + radius * Math.cos(angle1),
          centerY + radius * Math.sin(angle1)
        );
        ctx.lineTo(
          centerX + radius * Math.cos(angle2),
          centerY + radius * Math.sin(angle2)
        );
        ctx.closePath();

        // Fill the segment with color
        ctx.fillStyle = `rgba(${ageColors[6 - i][0]},${ageColors[6 - i][1]}, ${
          ageColors[6 - i][2]
        }, 255)`;
        ctx.fill();
        // ctx.stroke();

        // Add the label
        const labelAngle = ((i * 60 + 30) * Math.PI) / 180;
        const labelX = centerX + (radius / 2) * Math.cos(labelAngle);
        const labelY = centerY + (radius / 2) * Math.sin(labelAngle);
        ctx.fillStyle = "#000";
        ctx.font = "12px Arial";
        ctx.fillText(labels[6 - i], labelX - 10, labelY);
      }
    };

    // Draw hexagon split into two halves for gender
    const drawGenderSplit = () => {
      // Left half (Female)
      ctx.beginPath();

      for (let i = 0; i < 4; i++) {
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
      ctx.fillStyle = `rgba(${genderColors[0][0]},${genderColors[0][1]}, ${genderColors[0][2]}, 255)`;
      ctx.fill();

      ctx.beginPath();

      for (let i = 3; i < 7; i++) {
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
      ctx.fillStyle = `rgba(${genderColors[1][0]},${genderColors[1][1]}, ${genderColors[1][2]}, 255)`;
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.fillText("Male", centerX + 10, centerY);
    };

    // Draw based on the selected category

    if (category === "total") {
      drawHexagon();

      ctx.fillStyle = `rgba(${totalColor[0]},${totalColor[1]}, ${totalColor[2]}, 255)`;
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.font = "12px Arial";
      ctx.fillText("전체생활인구", centerX - 30, centerY + 5);
      if (toggleOn) {
        drawWrappingHexagon();
        drawIndicator();
      }
    } else if (category === "gender") {
      drawGenderSplit();

      if (toggleOn) {
        drawWrappingHexagon();
        drawIndicator();
      }
    } else if (category === "agegroup") {
      drawAgeGroupSegments();

      if (toggleOn) {
        drawWrappingHexagon();
        drawIndicator();
      }
    }
  }, [category, centerX, centerY, toggleOn, radius]);

  return (
    <div>
      범례
      <canvas
        ref={canvasRef}
        width={size + 60}
        height={size}
        style={{ width: `${size + 40}px`, height: `${size}px` }}
      />
    </div>
  );
};

export default LegendCanvas;
