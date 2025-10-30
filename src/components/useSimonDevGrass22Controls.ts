import { useControls, folder } from "leva";

export const useSimonDevGrass22Controls = () => {
  return useControls("🌿 FOLIAGE", {
    simonDevGrass22: folder(
      {
        simonDevGrass22Enabled: {
          value: false,
          label: "🌾 Enable Grass System v22",
        },
      },
      { collapsed: true }
    ),
  });
};


