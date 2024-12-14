import { useState, useEffect, useMemo, useCallback } from "react";
import DeckGL from "deck.gl";
import { MapViewState, PickingInfo } from "@deck.gl/core";
import { GeoJsonLayer, SolidPolygonLayer } from "@deck.gl/layers";
import centroid from "@turf/centroid";
import { csv } from "d3-fetch";
import Legend from "./Legend";
import {
  generateHex,
  generateWrappingHex,
  ageColors,
  genderColors,
  totalColor,
  generatePopulationTable,
} from "./utils";
import "./App.css";

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: 126.9592942,
  latitude: 37.5216503,
  zoom: 12,
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
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    async function loadBoundaries() {
      const boundaryCall = await fetch("./boundaries.geojson");
      const boundaryResponse = await boundaryCall.json();
      setDong(boundaryResponse.features);
      const decData = await csv("./pop_20241207.csv");
      setDec(decData);
      const novData = await csv("./pop_20241130.csv");
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
  const handleTooltipToggle = () => {
    setShowTooltip(!showTooltip);
  };

  const currentData = useMemo(() => {
    return dec.filter((e) => e.time == value);
  }, [value, dec]);

  const currentNovData = useMemo(() => {
    return nov.filter((e) => e.time == value);
  }, [value, nov]);

  // Callback to populate the default tooltip with content
  const getTooltip = useCallback(
    ({ object }: PickingInfo<DataType>) => {
      if (!showTooltip) return false;
      if (!object) return false;
      const currentStat = currentData.filter(
        (e) => e.dong === object?.properties.dong_cd
      );
      if (!currentStat.length) return false;
      return {
        html: generatePopulationTable({
          data: {
            ...currentStat[0],
            name: object.properties.ADM_NM,
          },
          time: value,
        }),
      };
    },
    [currentData, showTooltip, value]
  );

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
            const alpha = prefix === "dec" ? 255 : 200;
            return [...totalColor, alpha];
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
            const alpha = prefix === "dec" ? 255 : 200;
            return [...genderColors[idx], alpha];
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
            const alpha = prefix === "dec" ? 255 : 200;
            return [...ageColors[idx], alpha];
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

  const baseLayer = new GeoJsonLayer({
    id: "all-geojson-layer",
    data: dong,
    getLineColor: [255, 255, 255, 255],
    getFillColor: [120, 120, 120, 250],
    getLineWidth: 10,
    pickable: true,
  });

  const layers = isSplitScreen
    ? [baseLayer, ...polygonLayers, ...novPolygonLayers]
    : [baseLayer, ...polygonLayers];

  return (
    <>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        layers={layers}
        controller
        getTooltip={getTooltip}
      ></DeckGL>
      <div className="absolute bg-slate-100/80 p-3 right-2 top-2 md:w-80 w-64 rounded-sm">
        <h1 className="font-bold md:text-lg"> 2024년 12월 7일 서울 생활인구</h1>
        <div className="relative mb-8">
          <span> 시간 : {value}시</span>
          <label htmlFor="labels-range-input" className="sr-only">
            시간선택
          </label>
          <input
            id="labels-range-input"
            onChange={handleChange}
            type="range"
            value={value}
            min="0"
            max="23"
            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer "
          />
          <span className="text-sm text-gray-500 absolute start-0 -bottom-5">
            0시
          </span>
          <span className="text-sm text-gray-500 absolute end-0 -bottom-5">
            23시
          </span>
        </div>
        <div>
          <div className="row flex mb-3 w-100" role="group">
            <button
              type="button"
              onClick={() => setSelectedCategory("total")}
              className={
                "w-2/6 rounded-md rounded-r-none border border-r-0 border-slate-300 py-1 px-4 md:py-2 md:px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none text-gray-900 " +
                (selectedCategory === "total" ? "bg-slate-800 text-white" : "")
              }
            >
              전체
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("gender")}
              className={
                "w-2/6 rounded-md rounded-r-none rounded-l-none border border-slate-300 py-1 px-4  md:py-2 md:px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none text-gray-900 " +
                (selectedCategory === "gender" ? "bg-slate-800 text-white" : "")
              }
            >
              성별
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("agegroup")}
              className={
                "w-2/6 rounded-md rounded-l-none border border-l-0 border-slate-300 py-1 px-4 md:py-2 md:px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none text-gray-900 " +
                (selectedCategory === "agegroup"
                  ? "bg-slate-800 text-white"
                  : "")
              }
            >
              나이별
            </button>
          </div>
        </div>
        <div>
          <input
            id="default-checkbox"
            type="checkbox"
            checked={isSplitScreen}
            onChange={handleToggle}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="default-checkbox"
            className="ms-2 md:text-sm font-medium text-gray-900 "
          >
            전주 (11/30) 데이터와 비교하기
          </label>
        </div>
        <div>
          <input
            id="tooltip-checkbox"
            type="checkbox"
            checked={showTooltip}
            onChange={handleTooltipToggle}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="tooltip-checkbox"
            className="ms-2 md:text-sm font-medium text-gray-900 "
          >
            툴팁을 통해 자세한 내역 보기
          </label>
        </div>
        <div className="text-xs md:text-sm mt-2">
          <div>
            데이터 출처:{" "}
            <a
              className="underline"
              href="https://data.seoul.go.kr/dataVisual/seoul/seoulLivingPopulation.do"
            >
              서울열린데이터광장
            </a>
          </div>
          <div>
            배경이미지 출처:{" "}
            <a
              className="underline"
              href="https://drive.google.com/drive/folders/1Q7hmPnpY3GkK7zaB2Wo3aUOxVpTWsJY8"
            >
              FDSC 구글드라이브
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bg-slate-100/80 p-3 right-2 bottom-1 w-28 rounded-sm">
        <Legend category={selectedCategory} toggleOn={isSplitScreen} />
      </div>
    </>
  );
}

export default App;
