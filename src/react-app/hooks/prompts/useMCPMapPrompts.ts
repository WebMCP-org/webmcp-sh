import { useWebMCPPrompt } from "@mcp-b/react-webmcp";

/**
 * Map page MCP prompts.
 * These prompts help users explore and interact with the choropleth map visualization.
 */
export function useMCPMapPrompts() {
  // 1. "Show me different color schemes"
  useWebMCPPrompt({
    name: "explore_color_schemes",
    description: "Show me different color schemes",
    get: () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Demonstrate the different color schemes available for the US Population Map.

1. List all available color schemes:
   - Use list_color_schemes to see what's available for the current type

2. Demonstrate sequential schemes:
   - Show population with Blues (light to dark blue)
   - Switch to Greens
   - Try Oranges or Reds
   - Explain: Sequential schemes work best for continuous data

3. Demonstrate diverging schemes:
   - Switch to diverging type with RdBu (red to blue)
   - Try BrBG (brown to blue-green)
   - Explain: Diverging schemes show deviation from a midpoint

4. Demonstrate qualitative schemes:
   - Switch to qualitative type with Set2
   - Try Set1 or Accent
   - Explain: Qualitative schemes use distinct colors for categories

5. Explain the automatic scheme switching:
   - When you change the type, the scheme auto-switches to match
   - This prevents errors from mixing incompatible types and schemes

Narrate each change and explain why different schemes work for different data stories.`,
          },
        },
      ],
    }),
  });

  // 2. "Compare classification methods"
  useWebMCPPrompt({
    name: "compare_classification_methods",
    description: "Compare classification methods",
    get: () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Compare the three classification methods and show how they change the map visualization.

1. Start with population data and a sequential color scheme (e.g., Blues)

2. Equal Interval classification:
   - Set classification to "equalInterval"
   - Explain: Creates equal-sized ranges from min to max
   - Show the legend - notice evenly spaced ranges
   - Use case: When you want consistent intervals

3. Quantile classification:
   - Switch to "quantile"
   - Explain: Each class has equal number of states
   - Show the legend - notice uneven ranges but balanced distribution
   - Use case: When you want equal representation in each class

4. Natural Breaks (Jenks):
   - Switch to "naturalBreaks"
   - Explain: Finds natural groupings in the data
   - Show the legend - notice breaks at natural data clusters
   - Use case: When you want to reveal patterns in the data

5. Compare all three:
   - Explain when to use each method
   - Show how the same data tells different stories with different methods

Use 5-7 classes for clearer comparisons.`,
          },
        },
      ],
    }),
  });

  // 3. "Analyze different data fields"
  useWebMCPPrompt({
    name: "analyze_data_fields",
    description: "Analyze different data fields",
    get: () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Explore the three available data fields and visualize their patterns.

1. Get current state:
   - Use get_map_state to see current settings

2. Population analysis:
   - Set data to "population"
   - Use a sequential scheme (e.g., Blues) with natural breaks
   - Explain the patterns: Where are the most/least populated states?
   - Click states in the legend to see exact values

3. Area analysis:
   - Switch to "area_sqkm"
   - Use a different sequential scheme (e.g., Greens)
   - Explain: Which states are largest/smallest by area?
   - How does this differ from population?

4. Density analysis:
   - Switch to "density"
   - Use a diverging scheme (e.g., RdBu) with quantile classification
   - Explain: Population per square kilometer
   - Show patterns: Dense urban states vs. sparse rural states

5. Key insights:
   - Population ≠ Area (small states can be populous)
   - Density reveals urbanization patterns
   - Different data fields need different visualization approaches

Narrate what each map reveals about US geography and demographics.`,
          },
        },
      ],
    }),
  });
}
