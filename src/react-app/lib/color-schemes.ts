export interface ColorScheme {
  name: string;
  colors: {
    [key: number]: string[];
  };
}

export interface ColorSchemeCategory {
  name: string;
  schemes: ColorScheme[];
}

export const colorSchemes: Record<string, ColorSchemeCategory> = {
  sequential: {
    name: "Sequential",
    schemes: [
      {
        name: "Blues",
        colors: {
          3: ["#deebf7", "#9ecae1", "#3182bd"],
          4: ["#eff3ff", "#bdd7e7", "#6baed6", "#2171b5"],
          5: ["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"],
          6: ["#eff3ff", "#c6dbef", "#9ecae1", "#6baed6", "#3182bd", "#08519c"],
          7: ["#eff3ff", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#084594"],
          8: ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#084594"],
          9: ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"],
        },
      },
      {
        name: "Greens",
        colors: {
          3: ["#e5f5e0", "#a1d99b", "#31a354"],
          4: ["#edf8e9", "#bae4b3", "#74c476", "#238b45"],
          5: ["#edf8e9", "#bae4b3", "#74c476", "#31a354", "#006d2c"],
          6: ["#edf8e9", "#c7e9c0", "#a1d99b", "#74c476", "#31a354", "#006d2c"],
          7: ["#edf8e9", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#005a32"],
          8: ["#f7fcf5", "#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#005a32"],
          9: ["#f7fcf5", "#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#006d2c", "#00441b"],
        },
      },
      {
        name: "Oranges",
        colors: {
          3: ["#fee6ce", "#fdae6b", "#e6550d"],
          4: ["#feedde", "#fdbe85", "#fd8d3c", "#d94701"],
          5: ["#feedde", "#fdbe85", "#fd8d3c", "#e6550d", "#a63603"],
          6: ["#feedde", "#fdd0a2", "#fdae6b", "#fd8d3c", "#e6550d", "#a63603"],
          7: ["#feedde", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#8c2d04"],
          8: ["#fff5eb", "#fee6ce", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#8c2d04"],
          9: ["#fff5eb", "#fee6ce", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#a63603", "#7f2704"],
        },
      },
      {
        name: "Reds",
        colors: {
          3: ["#fee0d2", "#fc9272", "#de2d26"],
          4: ["#fee5d9", "#fcae91", "#fb6a4a", "#cb181d"],
          5: ["#fee5d9", "#fcae91", "#fb6a4a", "#de2d26", "#a50f15"],
          6: ["#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#de2d26", "#a50f15"],
          7: ["#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#99000d"],
          8: ["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#99000d"],
          9: ["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15", "#67000d"],
        },
      },
      {
        name: "Purples",
        colors: {
          3: ["#efedf5", "#bcbddc", "#756bb1"],
          4: ["#f2f0f7", "#cbc9e2", "#9e9ac8", "#6a51a3"],
          5: ["#f2f0f7", "#cbc9e2", "#9e9ac8", "#756bb1", "#54278f"],
          6: ["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"],
          7: ["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#807dba", "#6a51a3", "#4a1486"],
          8: ["#fcfbfd", "#efedf5", "#dadaeb", "#bcbddc", "#9e9ac8", "#807dba", "#6a51a3", "#4a1486"],
          9: ["#fcfbfd", "#efedf5", "#dadaeb", "#bcbddc", "#9e9ac8", "#807dba", "#6a51a3", "#54278f", "#3f007d"],
        },
      },
    ],
  },
  diverging: {
    name: "Diverging",
    schemes: [
      {
        name: "BrBG",
        colors: {
          3: ["#d8b365", "#f5f5f5", "#5ab4ac"],
          4: ["#a6611a", "#dfc27d", "#80cdc1", "#018571"],
          5: ["#a6611a", "#dfc27d", "#f5f5f5", "#80cdc1", "#018571"],
          6: ["#8c510a", "#d8b365", "#f6e8c3", "#c7eae5", "#5ab4ac", "#01665e"],
          7: ["#8c510a", "#d8b365", "#f6e8c3", "#f5f5f5", "#c7eae5", "#5ab4ac", "#01665e"],
          8: ["#8c510a", "#bf812d", "#dfc27d", "#f6e8c3", "#c7eae5", "#80cdc1", "#35978f", "#01665e"],
          9: ["#8c510a", "#bf812d", "#dfc27d", "#f6e8c3", "#f5f5f5", "#c7eae5", "#80cdc1", "#35978f", "#01665e"],
        },
      },
      {
        name: "RdBu",
        colors: {
          3: ["#ef8a62", "#f7f7f7", "#67a9cf"],
          4: ["#ca0020", "#f4a582", "#92c5de", "#0571b0"],
          5: ["#ca0020", "#f4a582", "#f7f7f7", "#92c5de", "#0571b0"],
          6: ["#b2182b", "#ef8a62", "#fddbc7", "#d1e5f0", "#67a9cf", "#2166ac"],
          7: ["#b2182b", "#ef8a62", "#fddbc7", "#f7f7f7", "#d1e5f0", "#67a9cf", "#2166ac"],
          8: ["#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac"],
          9: ["#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#f7f7f7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac"],
        },
      },
      {
        name: "RdYlBu",
        colors: {
          3: ["#fc8d59", "#ffffbf", "#91bfdb"],
          4: ["#d7191c", "#fdae61", "#abd9e9", "#2c7bb6"],
          5: ["#d7191c", "#fdae61", "#ffffbf", "#abd9e9", "#2c7bb6"],
          6: ["#d73027", "#fc8d59", "#fee090", "#e0f3f8", "#91bfdb", "#4575b4"],
          7: ["#d73027", "#fc8d59", "#fee090", "#ffffbf", "#e0f3f8", "#91bfdb", "#4575b4"],
          8: ["#d73027", "#f46d43", "#fdae61", "#fee090", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4"],
          9: ["#d73027", "#f46d43", "#fdae61", "#fee090", "#ffffbf", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4"],
        },
      },
    ],
  },
  qualitative: {
    name: "Qualitative",
    schemes: [
      {
        name: "Set1",
        colors: {
          3: ["#e41a1c", "#377eb8", "#4daf4a"],
          4: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3"],
          5: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00"],
          6: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33"],
          7: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628"],
          8: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628", "#f781bf"],
          9: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628", "#f781bf", "#999999"],
        },
      },
      {
        name: "Set2",
        colors: {
          3: ["#66c2a5", "#fc8d62", "#8da0cb"],
          4: ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3"],
          5: ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854"],
          6: ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f"],
          7: ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494"],
          8: ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494", "#b3b3b3"],
        },
      },
      {
        name: "Accent",
        colors: {
          3: ["#7fc97f", "#beaed4", "#fdc086"],
          4: ["#7fc97f", "#beaed4", "#fdc086", "#ffff99"],
          5: ["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0"],
          6: ["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0", "#f0027f"],
          7: ["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0", "#f0027f", "#bf5b17"],
          8: ["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0", "#f0027f", "#bf5b17", "#666666"],
        },
      },
    ],
  },
};
