import { useControls, folder } from "leva";

export function useGrassClaude4Controls() {
  return useControls("🌿 FOLIAGE", {
    grassClaude4: folder(
      {
        // Master toggle
        grassClaude4Enabled: {
          value: false,
          label: "🌿 Enable Grass Claude 4",
        },
        grassHeight: {
          value: 1.5,
          min: 0.5,
          max: 5.0,
          step: 0.1,
          label: "📏 Grass Height",
        },
        gridSize: {
          value: 9,
          min: 1,
          max: 25,
          step: 1,
          label: "📐 Grid Size",
        },

        // Grass Colors
        colors: folder(
          {
            baseColor1: {
              value: "#051303",
              label: "Base Color 1 (Dark)",
            },
            baseColor2: {
              value: "#061a03",
              label: "Base Color 2 (Light)",
            },
            tipColor1: {
              value: "#a6cc40",
              label: "Tip Color 1 (Dark)",
            },
            tipColor2: {
              value: "#cce666",
              label: "Tip Color 2 (Light)",
            },
          },
          { collapsed: true }
        ),

        // Fog Controls
        fog: folder(
          {
            fogEnabled: {
              value: true,
              label: "Enable Fog",
            },
            fogNear: {
              value: 5.0,
              min: 0,
              max: 100,
              step: 0.5,
              label: "Fog Start",
            },
            fogFar: {
              value: 50.0,
              min: 0,
              max: 200,
              step: 1,
              label: "Fog End",
            },
            fogColor: {
              value: "#4f74af",
              label: "Fog Color",
            },
            fogIntensity: {
              value: 1.0,
              min: 0,
              max: 2,
              step: 0.1,
              label: "Fog Intensity",
            },
          },
          { collapsed: true }
        ),
      },
      { collapsed: true }
    ),
  });
}

