import { useControls, folder } from "leva";

export const useLightsControls = () => {
  return useControls("💡 LIGHTS", {
    environment: folder(
      {
        envType: {
          value: "custom",
          options: ["preset", "custom"],
          label: "Type",
        },
        envPreset: {
          value: "sunset",
          options: [
            "apartment",
            "city",
            "dawn",
            "forest",
            "lobby",
            "night",
            "park",
            "studio",
            "sunset",
            "warehouse",
          ],
          label: "Preset",
        },
        envCustomUrl: {
          value:
            "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/industrial_sunset_02_puresky_4k.hdr",
          label: "HDRI URL",
        },
        envIntensity: {
          value: 1,
          min: 0,
          max: 5,
          step: 0.1,
          label: "Intensity",
        },
        envBackground: {
          value: true,
          label: "Show as Background",
        },
        envBackgroundBlurriness: {
          value: 0,
          min: 0,
          max: 1,
          step: 0.01,
          label: "Background Blur",
        },
        envBackgroundIntensity: {
          value: 0.7,
          min: 0,
          max: 5,
          step: 0.1,
          label: "Background Intensity",
        },
      },
      { collapsed: true }
    ),
    ambient: folder(
      {
        ambientIntensity: {
          value: 0.4,
          min: 0,
          max: 2,
          step: 0.1,
          label: "Intensity",
        },
      },
      { collapsed: true }
    ),
    sun: folder(
      {
        directionalIntensity: {
          value: 3.5,
          min: 0,
          max: 5,
          step: 0.05,
          label: "Intensity",
        },
        directionalColor: {
          value: "#ffffff",
          label: "Color",
        },
        directionalPosition: {
          value: [-15, 20, 15],
          label: "Position [X, Y, Z]",
        },
        shadowMapSize: {
          value: 2048,
          options: [512, 1024, 2048, 4096, 8192],
          label: "Shadow Map Size",
        },
        shadowBias: {
          value: -0.00005,
          min: -0.001,
          max: 0.001,
          step: 0.00001,
          label: "Shadow Bias",
        },
        shadowNormalBias: {
          value: 0.0,
          min: 0,
          max: 0.1,
          step: 0.001,
          label: "Normal Bias",
        },
        shadowRadius: {
          value: 4,
          min: 0,
          max: 20,
          step: 1,
          label: "Shadow Blur Radius",
        },
        followCharacter: {
          value: true,
          label: "Follow Character",
        },
      },
      { collapsed: true }
    ),
    shadows: folder(
      {
        shadowCameraLeft: {
          value: -120,
          min: -200,
          max: 200,
          step: 1,
          label: "Left Bound",
        },
        shadowCameraRight: {
          value: 120,
          min: -200,
          max: 200,
          step: 1,
          label: "Right Bound",
        },
        shadowCameraTop: {
          value: 120,
          min: -200,
          max: 200,
          step: 1,
          label: "Top Bound",
        },
        shadowCameraBottom: {
          value: -120,
          min: -200,
          max: 200,
          step: 1,
          label: "Bottom Bound",
        },
        shadowCameraNear: {
          value: 0.1,
          min: 0.1,
          max: 1000,
          step: 1,
          label: "Near Plane",
        },
        shadowCameraFar: {
          value: 1000,
          min: 1,
          max: 5000,
          step: 10,
          label: "Far Plane",
        },
      },
      { collapsed: true }
    ),
    debug: folder(
      {
        showTestSphere: {
          value: false,
          label: "Show Test Sphere",
        },
      },
      { collapsed: true }
    ),
  });
};
