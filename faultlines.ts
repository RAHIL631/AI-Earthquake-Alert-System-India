// This data is a simplified, representative sample for visualization purposes
// and may not be geographically precise.

export const FAULT_LINES_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Himalayan Frontal Thrust" },
      geometry: {
        type: "LineString",
        coordinates: [
          [74.0, 34.5], [77.5, 32.0], [80.5, 30.0], [85.0, 27.5], [88.0, 27.0], [94.0, 27.5]
        ]
      }
    },
    {
        type: "Feature",
        properties: { name: "Indus-Tsangpo Suture Zone" },
        geometry: {
          type: "LineString",
          coordinates: [
            [76.0, 35.5], [78.0, 34.0], [82.0, 31.5], [86.0, 29.5], [92.0, 29.0]
          ]
        }
    },
    {
        type: "Feature",
        properties: { name: "Kutch Mainland Fault" },
        geometry: {
          type: "LineString",
          coordinates: [
            [69.0, 23.5], [70.0, 23.8], [70.8, 23.5]
          ]
        }
    },
    {
        type: "Feature",
        properties: { name: "Narmada-Son Lineament" },
        geometry: {
            type: "LineString",
            coordinates: [
                [73.0, 21.5], [76.0, 22.5], [80.0, 23.0], [83.0, 24.0]
            ]
        }
    },
    {
      type: "Feature",
      properties: { name: "Andaman-Sumatra Subduction Zone" },
      geometry: {
          type: "LineString",
          coordinates: [
              [92.5, 13.0], [93.0, 10.0], [94.0, 6.0]
          ]
      }
    }
  ]
};
