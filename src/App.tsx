import { useState, useEffect, useMemo, useCallback } from "react";
import DeckGL from "deck.gl";
import { MapViewState } from "@deck.gl/core";
import { GeoJsonLayer, ColumnLayer, SolidPolygonLayer } from "@deck.gl/layers";
import centroid from "@turf/centroid";
import { csv } from "d3-fetch";
import { Map } from "react-map-gl/maplibre";
import FragColumnLayer from "./FragColumnLayer";

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: 126.97,
  latitude: 37.56,
  zoom: 13,
  pitch: 30,
  bearing: 0,
};

/**
 * Generate a GeoJSON object representing a hexagon centered at given coordinates.
 * @param {number} lat - Latitude of the center point.
 * @param {number} lng - Longitude of the center point.
 * @param {number} radius - Radius of the hexagon in meters.
 * @returns {object} GeoJSON Feature representing the hexagon.
 */
function generateHex({ center, offset, num, radius }) {
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

function App() {
  const [dong, setDong] = useState([]);
  const [dec, setDec] = useState([]);
  const [nov, setNov] = useState([]);
  const [value, setValue] = useState("20");
  const [selectedCategory, setSelectedCategory] = useState("total");

  useEffect(() => {
    async function loadBoundaries() {
      const boundaryCall = await fetch("/boundaries.geojson");
      const boundaryResponse = await boundaryCall.json();
      setDong(boundaryResponse.features);
      const decData = await csv("/pop_20241207.csv");
      setDec(decData);
      const novData = await csv("/pop_20241130.csv");
      setNov(novData);
    }
    loadBoundaries();
  }, []);

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const currentData = useMemo(() => {
    return dec.filter((e) => e.time == value);
  }, [value, dec]);

  const currentNovData = useMemo(() => {
    return nov.filter((e) => e.time == value);
  }, [value, nov]);

  function getPolygonLayers(selectedCategory: string, data) {
    if (selectedCategory === "total") {
      return [
        new SolidPolygonLayer({
          id: "polygon-layers",
          data,
          extruded: true,
          getPolygon: (d) => {
            const currentDong = dong.find(
              (e) => e.properties?.dong_cd == d.dong
            );
            if (currentDong) {
              const centerPoint = centroid(currentDong).geometry.coordinates;
              const hex = generateHex({
                center: { lat: centerPoint[1], lon: centerPoint[0] },
                offset: 0,
                num: 6,
                radius: 100,
              });
              return hex;
            } else return [];
          },
          getElevation: (d) => {
            return d.pop / 30;
          },
          getFillColor: (d) => {
            return [200, 100, 100, 255];
          },
        }),
      ];
    } else if (selectedCategory === "gender") {
      return ["f", "m"].map((genderKeyword, idx) => {
        return new SolidPolygonLayer({
          id: `polygon-layers-${genderKeyword}`,
          data,
          extruded: true,
          getPolygon: (d) => {
            const currentDong = dong.find(
              (e) => e.properties?.dong_cd == d.dong
            );
            if (currentDong) {
              const centerPoint = centroid(currentDong).geometry.coordinates;
              const hex = generateHex({
                center: { lat: centerPoint[1], lon: centerPoint[0] },
                offset: idx * 3 + 1,
                num: 4,
                radius: 100,
              });
              return hex;
            } else return [];
          },
          getElevation: (d) => {
            const currentPop = Object.keys(d).reduce((acc, curr) => {
              if (curr.includes(genderKeyword)) acc += parseFloat(d[curr]);
              return acc;
            }, 0);
            return currentPop / 30;
          },
          getFillColor: (d) => {
            return genderKeyword === "f"
              ? [100, 200, 100, 255]
              : [100, 100, 200, 255];
          },
        });
      });
    } else if (selectedCategory === "agegroup") {
      return ["10", "20", "30", "40", "50", "60"].map((ageKeyword, idx) => {
        return new SolidPolygonLayer({
          id: `polygon-layers-${ageKeyword}`,
          data,
          extruded: true,
          getPolygon: (d) => {
            const currentDong = dong.find(
              (e) => e.properties?.dong_cd == d.dong
            );
            if (currentDong) {
              const centerPoint = centroid(currentDong).geometry.coordinates;
              const hex = generateHex({
                center: { lat: centerPoint[1], lon: centerPoint[0] },
                offset: idx,
                num: 2,
                radius: 100,
              });
              return hex;
            } else return [];
          },
          getElevation: (d) => {
            const currentPop = Object.keys(d).reduce((acc, curr) => {
              if (curr.includes(ageKeyword)) acc += parseFloat(d[curr]);
              return acc;
            }, 0);
            return currentPop / 30;
          },
          getFillColor: (d) => {
            return [30 * idx, 255 - 30 * idx, 100, 255];
          },
        });
      });
    }
  }

  const polygonLayers = getPolygonLayers(selectedCategory, currentData);
  const novPolygonLayers = getPolygonLayers(selectedCategory, currentNovData);

  const layers = [
    new GeoJsonLayer({
      id: "geojson-layer",
      data: dong,
      getLineColor: [255, 255, 255, 255],
      getFillColor: [150, 150, 150, 205],
      getLineWidth: 10,
    }),
    ...polygonLayers,
  ];
  return (
    <div>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        layers={layers}
        controller
      ></DeckGL>
      <input
        type="range"
        min="0"
        max="23"
        value={value}
        onChange={handleChange}
        style={{ width: "300px", position: "absolute", top: 0 }}
      />
      <div style={{ width: "300px", position: "absolute", top: 50 }}>
        <button onClick={() => setSelectedCategory("total")}>Total</button>
        <button onClick={() => setSelectedCategory("gender")}>Gender</button>
        <button onClick={() => setSelectedCategory("agegroup")}>
          Age Groups
        </button>
      </div>
    </div>
  );
}

export default App;
