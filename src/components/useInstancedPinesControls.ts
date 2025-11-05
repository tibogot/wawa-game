import { useControls, folder } from "leva";

export const useInstancedPinesControls = () => {
  return useControls("🌿 FOLIAGE", {
    instancedPines: folder(
      {
        instancedPinesEnabled: {
          value: false,
          label: "🌲 Enable Instanced Pines",
        },
        instancedPineCount: {
          value: 50,
          label: "Pine Count",
          min: 1,
          max: 1000,
          step: 5,
        },
        instancedPinePositionX: {
          value: 0,
          label: "Center X",
          min: -200,
          max: 200,
          step: 5,
        },
        instancedPinePositionY: {
          value: 0,
          label: "Center Y",
          min: -50,
          max: 50,
          step: 1,
        },
        instancedPinePositionZ: {
          value: 0,
          label: "Center Z",
          min: -200,
          max: 200,
          step: 5,
        },
        instancedPineRadius: {
          value: 500,
          label: "Forest Radius",
          min: 10,
          max: 2000,
          step: 5,
        },
        instancedPineMinRadius: {
          value: 20,
          label: "Min Radius (Inner Ring)",
          min: 0,
          max: 150,
          step: 5,
        },
        pineScaleRangeMin: {
          value: 0.8,
          label: "Min Scale",
          min: 0.5,
          max: 1.5,
          step: 0.1,
        },
        pineScaleRangeMax: {
          value: 1.2,
          label: "Max Scale",
          min: 0.5,
          max: 2.0,
          step: 0.1,
        },
        pineCastShadow: {
          value: false,
          label: "☀️ Cast Shadows",
        },
        pineReceiveShadow: {
          value: true,
          label: "☀️ Receive Shadows",
        },
        pineEnableTransparentSorting: {
          value: true,
          label: "🍃 Enable Transparent Sorting",
        },
        pineEnableBVH: {
          value: true,
          label: "🔍 Enable BVH Culling",
        },
        pineBvhMargin: {
          value: 0.1,
          label: "BVH Margin",
          min: 0,
          max: 1,
          step: 0.1,
        },
        pineEnableViewThickening: {
          value: true,
          label: "🍃 Enable View Thickening",
        },
        pineViewThickenPower: {
          value: 2.0,
          label: "📊 Thicken Curve Power",
          min: 1.0,
          max: 5.0,
          step: 0.5,
        },
        pineViewThickenStrength: {
          value: 0.3,
          label: "💪 Thicken Strength",
          min: 0.0,
          max: 1.5,
          step: 0.1,
        },
      },
      { collapsed: true }
    ),
  });
};
