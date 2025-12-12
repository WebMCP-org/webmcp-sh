import { z } from "zod";
import { useWebMCP } from "@mcp-b/react-webmcp";
import { toast } from "sonner";
import { colorSchemes } from "@/lib/color-schemes";

type DataField = "population" | "area_sqkm" | "density";
type ClassificationMethod = "equalInterval" | "quantile" | "naturalBreaks";
type SchemeType = "sequential" | "diverging" | "qualitative";

interface ColorSchemeSummary {
  type: SchemeType;
  name: string;
  classes: number[];
}

interface MapState {
  data: DataField;
  type: SchemeType;
  schemeName: string;
  classes: number;
  classification: ClassificationMethod;
}

/**
 * Hook to register map classification MCP tools
 *
 * Provides AI agents with controls for the choropleth map visualization,
 * including data field selection, color schemes, and classification methods.
 *
 * Should be called in the map route component.
 */
export function useMCPMapTools(options: {
  selectedData: DataField;
  selectedType: SchemeType;
  selectedSchemeName: string;
  selectedClasses: number;
  selectedClassification: ClassificationMethod;
  setSelectedData: (d: DataField) => void;
  setSelectedType: (t: SchemeType) => void;
  setSelectedSchemeName: (n: string) => void;
  setSelectedClasses: (c: number) => void;
  setSelectedClassification: (m: ClassificationMethod) => void;
  availableSchemes: Array<{ name: string; colors: Record<number, string[]> }>;
}) {
  useWebMCP({
    name: "set_map_filters",
    description: `Set map classification filters for the choropleth map visualization.

You can update one or more filter fields. Omitted fields remain unchanged.

Data fields:
- population: Total population
- area_sqkm: Area in square kilometers
- density: Population density

Color scheme types:
- sequential: For continuous data (low to high)
- diverging: For data with a meaningful midpoint
- qualitative: For categorical data

Classification methods:
- equalInterval: Equal-sized ranges
- quantile: Equal number of features per class
- naturalBreaks: Natural groupings in the data (Jenks)

Example:
{
  "data": "population",
  "type": "sequential",
  "schemeName": "Blues",
  "classes": 5,
  "classification": "quantile"
}`,
    inputSchema: {
      data: z
        .enum(["population", "area_sqkm", "density"])
        .optional()
        .describe("Data field to visualize"),
      type: z
        .enum(["sequential", "diverging", "qualitative"])
        .optional()
        .describe("Color scheme type"),
      schemeName: z.string().optional().describe("Name of the color scheme"),
      classes: z
        .number()
        .int()
        .min(2)
        .max(9)
        .optional()
        .describe("Number of classification classes (2-9)"),
      classification: z
        .enum(["equalInterval", "quantile", "naturalBreaks"])
        .optional()
        .describe("Classification method"),
    },
    annotations: {
      title: "Set Map Filters",
      readOnlyHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async (input) => {
      try {
        if (input.data) options.setSelectedData(input.data);

        // Handle type changes with automatic scheme switching
        let finalSchemeName = input.schemeName ?? options.selectedSchemeName;
        if (input.type && input.type !== options.selectedType) {
          options.setSelectedType(input.type);

          // If no scheme was explicitly provided, auto-switch to first scheme of new type
          if (!input.schemeName) {
            const newTypeSchemes = colorSchemes[input.type].schemes;
            if (newTypeSchemes.length > 0) {
              finalSchemeName = newTypeSchemes[0].name;
              options.setSelectedSchemeName(finalSchemeName);
            }
          }
        }

        if (input.schemeName) options.setSelectedSchemeName(input.schemeName);
        if (typeof input.classes === "number")
          options.setSelectedClasses(input.classes);
        if (input.classification)
          options.setSelectedClassification(input.classification);

        const applied: MapState = {
          data: input.data ?? options.selectedData,
          type: input.type ?? options.selectedType,
          schemeName: finalSchemeName,
          classes:
            typeof input.classes === "number"
              ? input.classes
              : options.selectedClasses,
          classification:
            input.classification ?? options.selectedClassification,
        };

        toast.success("Map filters updated", {
          description: `${applied.data} | ${applied.schemeName} (${applied.classes} classes)`,
        });

        return {
          success: true,
          applied,
          message: `Map filters updated: ${Object.keys(input).join(", ")}`,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        toast.error("Failed to update map filters", {
          description: errorMessage,
        });
        throw new Error(`Failed to update map filters: ${errorMessage}`);
      }
    },
  });

  useWebMCP({
    name: "get_map_state",
    description: `Get current map classification filter state.

Returns the current settings for data field, color scheme, and classification method.`,
    inputSchema: {},
    annotations: {
      title: "Get Map State",
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async () => {
      const state: MapState = {
        data: options.selectedData,
        type: options.selectedType,
        schemeName: options.selectedSchemeName,
        classes: options.selectedClasses,
        classification: options.selectedClassification,
      };
      return state;
    },
  });

  useWebMCP({
    name: "list_color_schemes",
    description: `List available color schemes for the current type with their supported class counts.

Returns all color schemes compatible with the current scheme type (sequential, diverging, or qualitative).
Each scheme includes the supported number of classification classes.

Example response:
{
  "type": "sequential",
  "schemes": [
    { "type": "sequential", "name": "Blues", "classes": [3, 4, 5, 6, 7, 8, 9] },
    { "type": "sequential", "name": "Greens", "classes": [3, 4, 5, 6, 7, 8, 9] }
  ]
}`,
    inputSchema: {},
    annotations: {
      title: "List Color Schemes",
      readOnlyHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    handler: async () => {
      try {
        const schemes: ColorSchemeSummary[] = options.availableSchemes.map(
          (s) => ({
            type: options.selectedType,
            name: s.name,
            classes: Object.keys(s.colors)
              .map((n) => Number(n))
              .sort((a, b) => a - b),
          })
        );
        return {
          type: options.selectedType,
          schemes,
          count: schemes.length,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to list color schemes: ${errorMessage}`);
      }
    },
  });
}
