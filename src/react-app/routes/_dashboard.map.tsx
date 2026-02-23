import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import * as d3 from "d3";
import { jenks } from "simple-statistics";
import { colorSchemes } from "@/lib/color-schemes";
import { MapIcon } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { useMCPMapTools } from "@/hooks/useMCPMapTools";
import { useMCPMapPrompts } from "@/hooks/prompts";
import type { Layer } from "leaflet";
import type { Feature, Geometry } from "geojson";

export const Route = createFileRoute("/_dashboard/map")({
  component: MapComponent,
});

interface StateProperties {
  name: string;
  density: number;
  population: number;
  area_sqkm: number;
}

interface StateFeature {
  type: string;
  id?: string | number;
  properties: StateProperties;
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

interface StatesData {
  type: string;
  features: StateFeature[];
}

type DataField = "population" | "area_sqkm" | "density";
type ClassificationMethod = "equalInterval" | "quantile" | "naturalBreaks";
type SchemeType = "sequential" | "diverging" | "qualitative";

// Hoisted to module scope — no component state needed (rendering-hoist-jsx)
const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

const getDataLabel = (data: DataField) => {
  if (data === "area_sqkm") return "Area (sqkm)";
  return capitalize(data);
};

function MapComponent() {
  const [statesData, setStatesData] = useState<StatesData | null>(null);
  const [selectedData, setSelectedData] = useState<DataField>("population");
  const [selectedType, setSelectedType] = useState<SchemeType>("sequential");
  const [selectedSchemeName, setSelectedSchemeName] = useState("Blues");
  const [selectedClasses, setSelectedClasses] = useState(5);
  const [selectedClassification, setSelectedClassification] =
    useState<ClassificationMethod>("equalInterval");
  const [legendCollapsed, setLegendCollapsed] = useState(false);

  useEffect(() => {
    fetch("/data/us-states.json")
      .then((res) => res.json())
      .then((data) => setStatesData(data))
      .catch((err) => console.error("Error loading states data:", err));
  }, []);

  const currentScheme = useMemo(() => {
    return colorSchemes[selectedType].schemes.find(
      (s) => s.name === selectedSchemeName
    );
  }, [selectedType, selectedSchemeName]);

  const currentColors = useMemo(() => {
    if (!currentScheme) return [];
    return currentScheme.colors[selectedClasses] || [];
  }, [currentScheme, selectedClasses]);

  const availableSchemes = useMemo(() => {
    return colorSchemes[selectedType].schemes;
  }, [selectedType]);

  const getFeatureStyle = useCallback((feature: StateFeature) => {
    if (!statesData) return {};

    const value = feature.properties[selectedData];
    const values = statesData.features.map((f) => f.properties[selectedData]);
    const numClasses = currentColors.length;

    let scale:
      | d3.ScaleQuantize<number>
      | d3.ScaleQuantile<number>
      | d3.ScaleThreshold<number, number>;

    if (selectedClassification === "equalInterval") {
      scale = d3
        .scaleQuantize<number>()
        .domain([Math.min(...values), Math.max(...values)])
        .range(d3.range(numClasses));
    } else if (selectedClassification === "quantile") {
      scale = d3
        .scaleQuantile<number>()
        .domain(values)
        .range(d3.range(numClasses));
    } else {
      const breaks = jenks(values, numClasses);
      scale = d3
        .scaleThreshold<number, number>()
        .domain(breaks.slice(1, -1))
        .range(d3.range(numClasses));
    }

    const colorIndex = scale(value);
    const fillColor = currentColors[colorIndex];

    return {
      fillColor,
      weight: 1,
      opacity: 1,
      color: "#666",
      fillOpacity: 0.7,
    };
  }, [statesData, selectedData, selectedClassification, currentColors]);

  const legendLabels = useMemo(() => {
    if (!statesData) return [];

    const values = statesData.features.map((f) => f.properties[selectedData]);
    const numClasses = currentColors.length;
    const labels: string[] = [];

    if (selectedClassification === "equalInterval") {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const step = (max - min) / numClasses;

      for (let i = 0; i < numClasses; i++) {
        const rangeStart = (min + i * step).toFixed(2);
        const rangeEnd = (min + (i + 1) * step).toFixed(2);
        labels.push(`${rangeStart} - ${rangeEnd}`);
      }
    } else if (selectedClassification === "quantile") {
      const sortedValues = [...values].sort((a, b) => a - b);
      const quantiles = d3
        .range(0, 1, 1 / numClasses)
        .map((q) => d3.quantile(sortedValues, q)!);

      for (let i = 0; i < numClasses; i++) {
        const rangeStart = quantiles[i].toFixed(2);
        const rangeEnd = quantiles[i + 1]?.toFixed(2) || "Max";
        labels.push(`${rangeStart} - ${rangeEnd}`);
      }
    } else {
      const breaks = jenks(values, numClasses);

      for (let i = 0; i < numClasses; i++) {
        const rangeStart = breaks[i].toFixed(2);
        const rangeEnd = breaks[i + 1]?.toFixed(2) || "Max";
        labels.push(`${rangeStart} - ${rangeEnd}`);
      }
    }

    return labels;
  }, [statesData, selectedData, selectedClassification, currentColors]);

  const onEachFeature = useCallback((feature: Feature<Geometry, StateProperties>, layer: Layer) => {
    if (feature.properties) {
      layer.bindPopup(`
        <div class="font-sans">
          <b class="text-base">${feature.properties.name}</b><br/>
          <span class="text-sm">Population: ${feature.properties.population.toLocaleString()}</span><br/>
          <span class="text-sm">Area (sqkm): ${feature.properties.area_sqkm.toLocaleString()}</span><br/>
          <span class="text-sm">Density: ${feature.properties.density.toFixed(
            2
          )}</span>
        </div>
      `);
    }
  }, []);

  // Register MCP tools for map control
  useMCPMapTools({
    selectedData,
    selectedType,
    selectedSchemeName,
    selectedClasses,
    selectedClassification,
    setSelectedData,
    setSelectedType,
    setSelectedSchemeName,
    setSelectedClasses,
    setSelectedClassification,
    availableSchemes,
  });

  // Register suggested prompts for map control
  useMCPMapPrompts()
  if (!statesData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading map data...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
            <MapIcon className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
            <span className="truncate">US Population Map</span>
          </h1>
          <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
            Exploratory map where you control the theming of US population data. You can choose the classification method, color scheme, and more.
          </p>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 min-h-0 z-0">
        <MapContainer
          center={[37.8, -96]}
          zoom={4}
          zoomControl={true}
          attributionControl={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <GeoJSON
            key={`${selectedData}-${selectedType}-${selectedSchemeName}-${selectedClasses}-${selectedClassification}`}
            data={statesData as any}
            style={getFeatureStyle as any}
            onEachFeature={onEachFeature}
          />
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 max-w-xs bg-card text-card-foreground rounded-lg border shadow-lg z-[1000]">
          <div
            className="px-3 py-2 cursor-pointer flex items-center justify-between border-b"
            onClick={() => setLegendCollapsed(!legendCollapsed)}
          >
            <span className="text-sm font-semibold">Legend</span>
            <button className="text-sm font-bold w-6 h-6 hover:bg-accent rounded">
              {legendCollapsed ? "+" : "−"}
            </button>
          </div>
          {!legendCollapsed && (
            <div className="px-3 py-2">
              <div className="text-sm font-semibold mb-2">
                {getDataLabel(selectedData)}
              </div>
              <div className="space-y-1.5">
                {legendLabels.map((label, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 flex-shrink-0 border border-gray-400"
                      style={{ backgroundColor: currentColors[i] }}
                    />
                    <span className="text-xs">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
