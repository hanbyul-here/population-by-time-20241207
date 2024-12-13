import { useState, useEffect, useMemo, useCallback } from "react";
import DeckGL from "deck.gl";
import { MapViewState, MapView } from "@deck.gl/core";
import { GeoJsonLayer, ColumnLayer, SolidPolygonLayer } from "@deck.gl/layers";
import centroid from "@turf/centroid";
import { csv } from "d3-fetch";
import {
  generateHex,
  generateWrappingHex,
  ageColorSchemes,
  genderColorSchemes,
} from "./utils";

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: 126.97,
  latitude: 37.56,
  zoom: 13,
  pitch: 30,
  // bearing: 0,
};
function App() {
  const [dong, setDong] = useState([]);
  const [dec, setDec] = useState([]);
  const [nov, setNov] = useState([]);
  const [value, setValue] = useState("20");
  const [selectedCategory, setSelectedCategory] = useState("total");
  const [isSplitScreen, setIsSplitScreen] = useState(false);

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
  const handleToggle = () => {
    setIsSplitScreen(!isSplitScreen);
  };

  const currentData = useMemo(() => {
    return dec.filter((e) => e.time == value);
  }, [value, dec]);

  const currentNovData = useMemo(() => {
    return nov.filter((e) => e.time == value);
  }, [value, nov]);

  function getPolygonLayers(selectedCategory: string, data, prefix) {
    if (selectedCategory === "total") {
      return [
        new SolidPolygonLayer({
          id: `${prefix}-polygon-layers`,
          data,
          extruded: true,
          getPolygon: (d) => {
            const currentDong = dong.find(
              (e) => e.properties?.dong_cd == d.dong
            );
            if (currentDong) {
              const centerPoint = centroid(currentDong).geometry.coordinates;
              const hex =
                prefix == "dec"
                  ? generateHex({
                      center: { lat: centerPoint[1], lon: centerPoint[0] },
                      offset: 0,
                      num: 6,
                      radius: 100,
                    })
                  : generateWrappingHex({
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
          id: `${prefix}-polygon-layers-${genderKeyword}`,
          data,
          extruded: true,
          getPolygon: (d) => {
            const currentDong = dong.find(
              (e) => e.properties?.dong_cd == d.dong
            );
            if (currentDong) {
              const centerPoint = centroid(currentDong).geometry.coordinates;
              const hex =
                prefix == "dec"
                  ? generateHex({
                      center: { lat: centerPoint[1], lon: centerPoint[0] },
                      offset: idx * 3 + 1,
                      num: 4,
                      radius: 100,
                    })
                  : generateWrappingHex({
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
            const alpha = prefix === "dec" ? 255 : 220;
            return [...genderColorSchemes[idx], alpha];
          },
        });
      });
    } else if (selectedCategory === "agegroup") {
      return ["10", "20", "30", "40", "50", "60"].map((ageKeyword, idx) => {
        return new SolidPolygonLayer({
          id: `${prefix}-polygon-layers-${ageKeyword}`,
          data,
          extruded: true,
          getPolygon: (d) => {
            const currentDong = dong.find(
              (e) => e.properties?.dong_cd == d.dong
            );
            if (currentDong) {
              const centerPoint = centroid(currentDong).geometry.coordinates;
              const hex =
                prefix == "dec"
                  ? generateHex({
                      center: { lat: centerPoint[1], lon: centerPoint[0] },
                      offset: idx,
                      num: 2,
                      radius: 100,
                    })
                  : generateWrappingHex({
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
          getFillColor: (_) => {
            const alpha = prefix === "dec" ? 255 : 220;
            return [...ageColorSchemes[idx], alpha];
          },
        });
      });
    }
  }

  const polygonLayers = getPolygonLayers(selectedCategory, currentData, "dec");
  const novPolygonLayers = getPolygonLayers(
    selectedCategory,
    currentNovData,
    "nov"
  );

  const layers = isSplitScreen
    ? [
        new GeoJsonLayer({
          id: "all-geojson-layer",
          data: dong,
          getLineColor: [255, 255, 255, 255],
          getFillColor: [120, 120, 120, 205],
          getLineWidth: 10,
        }),
        ...polygonLayers,
        ...novPolygonLayers,
      ]
    : [
        new GeoJsonLayer({
          id: "all-geojson-layer",
          data: dong,
          getLineColor: [255, 255, 255, 255],
          getFillColor: [120, 120, 120, 205],
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
      <div style={{ width: "300px", position: "absolute", top: 120 }}>
        <label>
          <input
            type="checkbox"
            checked={isSplitScreen}
            onChange={handleToggle}
          />
          Show the previous week data
        </label>
      </div>
    </div>
  );
}

export default App;
