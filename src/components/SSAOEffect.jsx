import React, { useRef, Suspense, useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import {
  EffectComposer,
  SSAO,
  SMAA,
  N8AO,
  GodRays,
  Bloom,
} from "@react-three/postprocessing";
import { BlendFunction, KernelSize, SMAAPreset } from "postprocessing";
import { useControls, folder } from "leva";
import { Sun } from "./Sun.tsx";
import { RainEffectPostprocessing } from "./RainEffectPostprocessing.tsx";
import { GodraysPass } from "three-good-godrays";
import { RenderPass } from "postprocessing";

/**
 * Post-Processing Effects for Map5
 *
 * Includes:
 * - N8AO (Advanced Ambient Occlusion)
 * - Volumetric Fog (Raymarched)
 * - God Rays (Volumetric Light)
 * - SMAA anti-aliasing
 */
export const SSAOEffect = () => {
  const sunRef = useRef();
  const godraysPassRef = useRef();
  const pointLightRef = useRef();
  const effectComposerRef = useRef();
  const renderPassRef = useRef();
  const { scene, camera } = useThree();

  const {
    enablePostProcessing,
    enableColorManagement,
    enabled,
    aoRadius,
    distanceFalloff,
    intensity,
    color,
    aoSamples,
    denoiseSamples,
    denoiseRadius,
    halfRes,
    gammaCorrection,
    godRaysEnabled,
    samples,
    density,
    decay,
    weight,
    exposure,
    clampMax,
    blur,
    enableBloom,
    bloomIntensity,
    bloomLuminanceThreshold,
    bloomLuminanceSmoothing,
    bloomMipmapBlur,
    enableRainPP,
    rainIntensityPP,
    dropletIntensityPP,
    rainSpeedPP,
    antiAliasingMode,
    smaaPreset,
    enableThreeGoodGodrays,
    godraysLightPosition,
    godraysIntensity,
    godraysColor,
    godraysDensity,
    godraysMaxDensity,
    godraysEdgeStrength,
    godraysRaymarchSteps,
    enableSunMesh,
    sunSize,
    sunColor,
    sunIntensity,
    sunX,
    sunY,
    sunZ,
  } = useControls("🎬 POST PROCESSING", {
    masterToggle: folder(
      {
        enablePostProcessing: {
          value: false,
          label: "✨ Enable Post-Processing",
        },
        enableColorManagement: {
          value: true,
          label: "🎨 Enable Color Management (THREE.ColorManagement)",
        },
      },
      { collapsed: true }
    ),
    sunMesh: folder(
      {
        enableSunMesh: {
          value: false,
          label: "☀️ Enable Sun Mesh (Required for God Rays!)",
        },
        sunSize: {
          value: 8,
          min: 0.5,
          max: 30,
          step: 0.5,
          label: "☀️ Sun Size (Bigger = More Visible)",
        },
        sunColor: {
          value: "#ffffff",
          label: "🎨 Sun Color (White = Natural Sun)",
        },
        sunIntensity: {
          value: 2.0,
          min: 0.0,
          max: 10.0,
          step: 0.5,
          label: "💡 Sun Brightness (For Bloom Glow)",
        },
        sunX: {
          value: -30,
          min: -100,
          max: 100,
          step: 1,
          label: "📍 Position X",
        },
        sunY: {
          value: 60,
          min: 10,
          max: 100,
          step: 1,
          label: "📍 Position Y",
        },
        sunZ: {
          value: 40,
          min: -100,
          max: 100,
          step: 1,
          label: "📍 Position Z",
        },
      },
      { collapsed: true }
    ),
    n8ao: folder(
      {
        enabled: {
          value: false,
          label: "✨ Enable N8AO",
        },
        aoRadius: {
          value: 2.0,
          min: 0.1,
          max: 50.0,
          step: 0.5,
          label: "📏 AO Radius (world units)",
        },
        distanceFalloff: {
          value: 1.0,
          min: 0.1,
          max: 5.0,
          step: 0.1,
          label: "📉 Distance Falloff",
        },
        intensity: {
          value: 5.0,
          min: 0.0,
          max: 20.0,
          step: 0.5,
          label: "💪 Intensity (darkness)",
        },
        color: {
          value: "#000000",
          label: "🎨 AO Color",
        },
        aoSamples: {
          value: 16,
          min: 4,
          max: 64,
          step: 1,
          label: "🎯 AO Samples (quality)",
        },
        denoiseSamples: {
          value: 4,
          min: 1,
          max: 16,
          step: 1,
          label: "🔧 Denoise Samples",
        },
        denoiseRadius: {
          value: 6,
          min: 1,
          max: 24,
          step: 1,
          label: "🔄 Denoise Radius",
        },
        halfRes: {
          value: false,
          label: "📊 Half Resolution (breaks HDRI!)",
        },
        gammaCorrection: {
          value: false,
          label: "🎨 Gamma Correction (disable to prevent artifacts)",
        },
      },
      { collapsed: true }
    ),
    threeGoodGodrays: folder(
      {
        enableThreeGoodGodrays: {
          value: false,
          label: "☀️ Enable Three-Good-Godrays (Working!)",
        },
        godraysLightPosition: {
          value: [0, 40, 0],
          label: "💡 Light Position (From Top)",
          step: 1,
        },
        godraysIntensity: {
          value: 3,
          min: 0,
          max: 10,
          step: 0.1,
          label: "💡 Light Intensity",
        },
        godraysColor: {
          value: "#ffaa00",
          label: "💡 Light Color",
        },
        godraysDensity: {
          value: 1 / 64,
          min: 1 / 128,
          max: 1 / 8,
          step: 1 / 128,
          label: "🌅 Ray Density",
        },
        godraysMaxDensity: {
          value: 1.0,
          min: 0.1,
          max: 1.0,
          step: 0.05,
          label: "🌅 Max Density",
        },
        godraysEdgeStrength: {
          value: 6,
          min: 1,
          max: 10,
          step: 0.5,
          label: "🌅 Edge Strength",
        },
        godraysRaymarchSteps: {
          value: 150,
          min: 20,
          max: 200,
          step: 10,
          label: "🌅 Raymarch Steps (Quality)",
        },
      },
      { collapsed: true }
    ),
    godRays: folder(
      {
        godRaysEnabled: {
          value: false,
          label: "✨ Enable God Rays (Volumetric Light Shafts)",
        },
        samples: {
          value: 60,
          min: 15,
          max: 100,
          step: 5,
          label: "🎯 Samples (Quality) - Higher = Better",
        },
        density: {
          value: 0.96,
          min: 0.5,
          max: 1.0,
          step: 0.01,
          label: "💨 Density (Higher = More Visible)",
        },
        decay: {
          value: 0.9,
          min: 0.5,
          max: 1.0,
          step: 0.01,
          label: "📉 Decay (Lower = Longer Rays)",
        },
        weight: {
          value: 0.4,
          min: 0.0,
          max: 1.0,
          step: 0.01,
          label: "⚖️ Weight (Strength)",
        },
        exposure: {
          value: 0.6,
          min: 0.0,
          max: 1.0,
          step: 0.01,
          label: "💡 Exposure (Brightness)",
        },
        clampMax: {
          value: 1.0,
          min: 0.1,
          max: 2.0,
          step: 0.05,
          label: "🔆 Max Brightness",
        },
        blur: {
          value: true,
          label: "🌀 Blur (Smoothing)",
        },
      },
      { collapsed: true }
    ),
    bloom: folder(
      {
        enableBloom: {
          value: false,
          label: "🌟 Enable Bloom (Sun + Bright Objects Glow)",
        },
        bloomIntensity: {
          value: 1.5,
          min: 0.0,
          max: 5.0,
          step: 0.1,
          label: "💡 Bloom Intensity (Glow Strength)",
        },
        bloomLuminanceThreshold: {
          value: 0.8,
          min: 0.0,
          max: 1.0,
          step: 0.05,
          label: "🌟 Luminance Threshold (What Glows)",
        },
        bloomLuminanceSmoothing: {
          value: 0.3,
          min: 0.0,
          max: 1.0,
          step: 0.05,
          label: "🌊 Smoothing (Glow Softness)",
        },
        bloomMipmapBlur: {
          value: true,
          label: "🌀 Mipmap Blur (Better Quality)",
        },
      },
      { collapsed: true }
    ),
    rainPP: folder(
      {
        enableRainPP: {
          value: false,
          label: "💧 Enable Rain (Post-Processing)",
        },
        rainIntensityPP: {
          value: 1.0,
          min: 0.0,
          max: 3.0,
          step: 0.1,
          label: "Rain Streaks",
        },
        dropletIntensityPP: {
          value: 1.0,
          min: 0.0,
          max: 2.0,
          step: 0.1,
          label: "Droplet Refraction",
        },
        rainSpeedPP: {
          value: 2.0,
          min: 0.5,
          max: 5.0,
          step: 0.5,
          label: "Rain Speed",
        },
      },
      { collapsed: true }
    ),
    antiAliasing: folder(
      {
        antiAliasingMode: {
          value: "msaa",
          options: {
            "None (Jagged)": "none",
            "MSAA (Default)": "msaa",
            "SMAA (Shader-based)": "smaa",
          },
          label: "AA Mode",
        },
        smaaPreset: {
          value: "high",
          options: ["low", "medium", "high", "ultra"],
          label: "SMAA Quality",
          render: (get) =>
            get("🎬 POST PROCESSING.antiAliasing.antiAliasingMode") === "smaa",
        },
      },
      { collapsed: true }
    ),
  });

  // Set up color management
  useEffect(() => {
    THREE.ColorManagement.enabled = enableColorManagement;
    console.log(`🎨 Color Management enabled: ${enableColorManagement}`);
  }, [enableColorManagement]);

  // Create godrays light and pass
  useEffect(() => {
    if (!enableThreeGoodGodrays || !enablePostProcessing) {
      if (pointLightRef.current) {
        scene.remove(pointLightRef.current);
        if (pointLightRef.current.lightSphere) {
          scene.remove(pointLightRef.current.lightSphere);
        }
        pointLightRef.current = null;
      }
      if (godraysPassRef.current && effectComposerRef.current) {
        effectComposerRef.current.removePass(godraysPassRef.current);
        godraysPassRef.current.dispose();
        godraysPassRef.current = null;
      }
      if (renderPassRef.current && effectComposerRef.current) {
        effectComposerRef.current.removePass(renderPassRef.current);
        renderPassRef.current = null;
      }
      return;
    }

    // Create point light for godrays (as per official docs)
    const lightPos = new THREE.Vector3(...godraysLightPosition);
    const pointLight = new THREE.PointLight(0xffffff, godraysIntensity, 10000);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 1024;
    pointLight.shadow.mapSize.height = 1024;
    pointLight.shadow.autoUpdate = true;
    pointLight.shadow.camera.near = 0.1;
    pointLight.shadow.camera.far = 1000;
    pointLight.shadow.camera.updateProjectionMatrix();
    pointLight.position.copy(lightPos);
    scene.add(pointLight);
    pointLightRef.current = pointLight;

    // Add a visible sphere at the light position for debugging
    const lightSphere = new THREE.Mesh(
      new THREE.SphereGeometry(2, 16, 16),
      new THREE.MeshBasicMaterial({
        color: godraysColor,
        transparent: true,
        opacity: 0.8,
      })
    );
    lightSphere.position.copy(pointLight.position);
    scene.add(lightSphere);
    pointLightRef.current.lightSphere = lightSphere;

    // Create GodraysPass with Leva control parameters
    const params = {
      density: godraysDensity,
      maxDensity: godraysMaxDensity,
      edgeStrength: godraysEdgeStrength,
      edgeRadius: 2,
      distanceAttenuation: 2,
      color: new THREE.Color(godraysColor),
      raymarchSteps: godraysRaymarchSteps,
      blur: true,
      gammaCorrection: true,
    };

    const godraysPass = new GodraysPass(pointLight, camera, params);

    godraysPassRef.current = godraysPass;

    // Add RenderPass and GodraysPass to the existing EffectComposer
    setTimeout(() => {
      if (effectComposerRef.current && godraysPassRef.current) {
        // Create and add RenderPass first (as per documentation)
        const renderPass = new RenderPass(scene, camera);
        renderPass.renderToScreen = false;
        effectComposerRef.current.addPass(renderPass);
        renderPassRef.current = renderPass;

        // Add GodraysPass last and set it to render to screen
        godraysPassRef.current.renderToScreen = true;
        effectComposerRef.current.addPass(godraysPassRef.current);

        console.log("RenderPass and GodraysPass added to EffectComposer");
        console.log("Light position:", pointLight.position);
        console.log("Light intensity:", pointLight.intensity);
        console.log("Godrays parameters:", params);
      }
    }, 100);

    return () => {
      if (pointLightRef.current) {
        scene.remove(pointLightRef.current);
        if (pointLightRef.current.lightSphere) {
          scene.remove(pointLightRef.current.lightSphere);
        }
        pointLightRef.current = null;
      }
      if (godraysPassRef.current && effectComposerRef.current) {
        effectComposerRef.current.removePass(godraysPassRef.current);
        godraysPassRef.current.dispose();
        godraysPassRef.current = null;
      }
      if (renderPassRef.current && effectComposerRef.current) {
        effectComposerRef.current.removePass(renderPassRef.current);
        renderPassRef.current = null;
      }
    };
  }, [
    enableThreeGoodGodrays,
    enablePostProcessing,
    godraysLightPosition,
    godraysIntensity,
    godraysColor,
    godraysDensity,
    godraysMaxDensity,
    godraysEdgeStrength,
    godraysRaymarchSteps,
  ]);

  // Map preset string to SMAAPreset enum
  const smaaPresetMap = {
    low: SMAAPreset.LOW,
    medium: SMAAPreset.MEDIUM,
    high: SMAAPreset.HIGH,
    ultra: SMAAPreset.ULTRA,
  };

  // Determine multisampling setting
  const multisampling =
    antiAliasingMode === "smaa" ? 0 : antiAliasingMode === "msaa" ? 8 : 0;

  // Only render post-processing if master toggle is enabled
  if (!enablePostProcessing) {
    return (
      <>
        {/* Sun mesh for GodRays origin (can still be enabled separately) */}
        <Sun
          ref={sunRef}
          enabled={enableSunMesh}
          sunSize={sunSize}
          sunColor={sunColor}
          sunIntensity={sunIntensity}
          sunX={sunX}
          sunY={sunY}
          sunZ={sunZ}
        />
      </>
    );
  }

  return (
    <>
      {/* Sun mesh for GodRays origin */}
      <Sun
        ref={sunRef}
        enabled={enableSunMesh}
        sunSize={sunSize}
        sunColor={sunColor}
        sunIntensity={sunIntensity}
        sunX={sunX}
        sunY={sunY}
        sunZ={sunZ}
      />

      <Suspense fallback={null}>
        <EffectComposer
          ref={effectComposerRef}
          multisampling={multisampling}
          frameBufferType={THREE.HalfFloatType}
        >
          {/* N8AO - Advanced ambient occlusion (works with R3F!) */}
          {enabled && (
            <N8AO
              aoRadius={aoRadius}
              distanceFalloff={distanceFalloff}
              intensity={intensity}
              color={color}
              aoSamples={aoSamples}
              denoiseSamples={denoiseSamples}
              denoiseRadius={denoiseRadius}
              halfRes={halfRes}
              gammaCorrection={gammaCorrection}
            />
          )}

          {/* Bloom - Makes bright objects glow (sun, specular highlights, etc.) */}
          {enableBloom && (
            <Bloom
              intensity={bloomIntensity}
              luminanceThreshold={bloomLuminanceThreshold}
              luminanceSmoothing={bloomLuminanceSmoothing}
              mipmapBlur={bloomMipmapBlur}
              blendFunction={BlendFunction.SCREEN}
            />
          )}

          {/* GodRays - Known issue: causes white screen */}
          {/* The white screen happens because GodRays needs depth buffer access */}
          {/* which conflicts with custom depth materials (like grass shadows) */}
          {false && godRaysEnabled && sunRef.current && (
            <GodRays
              sun={sunRef.current}
              blendFunction={BlendFunction.SCREEN}
              samples={samples}
              density={density}
              decay={decay}
              weight={weight}
              exposure={exposure}
              clampMax={clampMax}
              kernelSize={KernelSize.SMALL}
              blur={blur}
            />
          )}

          {/* Rain Effect with Refraction - Realistic water appearance */}
          {enableRainPP && (
            <RainEffectPostprocessing
              rainIntensity={rainIntensityPP}
              dropletIntensity={dropletIntensityPP}
              rainSpeed={rainSpeedPP}
            />
          )}

          {/* SMAA Anti-Aliasing - Shader-based AA */}
          {antiAliasingMode === "smaa" && (
            <SMAA preset={smaaPresetMap[smaaPreset]} outputEncoding={false} />
          )}
        </EffectComposer>
      </Suspense>
    </>
  );
};

export default SSAOEffect;
