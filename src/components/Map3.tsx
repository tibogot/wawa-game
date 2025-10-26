import React, { forwardRef, useMemo } from "react";
import { useControls } from "leva";
import { HeightMapUnreal } from "./HeightMapUnreal";
import { HeightFog } from "./HeightFog";
import { ButterflyParticles } from "./ButterflyParticles";
import { DustParticles } from "./DustParticles";
import { RainParticles3D } from "./RainParticles3D";
import { WindFlag } from "./WindFlag";
import { Mountain } from "./Mountain";
import { ParticlesFog } from "./ParticlesFog";
import { FloatingLeaves } from "./FloatingLeaves";
import { CloudSystem } from "./CloudSystem";
import { DynamicLeaves as DynamicLeaves3 } from "./DynamicLeaves3";
import { useMountainControls } from "./useMountainControls";
import { useWindFlagControls } from "./useWindFlagControls";
import { useButterflyParticlesControls } from "./useButterflyParticlesControls";
import { useDustParticlesControls } from "./useDustParticlesControls";
import { useRainParticles3DControls } from "./useRainParticles3DControls";
import { useHeightFogControls } from "./useHeightFogControls";
import { useDynamicLeaves3Controls } from "./useDynamicLeaves3Controls";
import { useHeightMapLookup } from "../hooks/useHeightMapLookup";
import { useTerrainMeshLookup } from "../hooks/useTerrainMeshLookup";
import { TerrainHeightDebugSpheres } from "./TerrainHeightDebugSpheres";
import { useDebugSpheresControls } from "./useDebugSpheresControls";
import * as THREE from "three";

export const Map3 = forwardRef<any, any>(
  (
    {
      scale = 1,
      position = [0, 0, 0] as [number, number, number],
      characterPosition,
      characterVelocity,
      ...props
    },
    ref
  ) => {
    // Get terrain parameters from Leva (reads the SAME controls as HeightMapUnreal!)
    // These will sync with the values shown in the Leva panel
    const {
      size: terrainSize,
      heightScale: terrainHeightScale,
      centerRegionSize: terrainCenterRegion,
    } = useControls("🗻 Terrain Geometry", {
      size: { value: 4000 }, // Must match what we pass to HeightMapUnreal
      heightScale: { value: 200 }, // Must match what we pass to HeightMapUnreal
      centerRegionSize: { value: 5 },
    });

    // NEW: Use mesh-based lookup - reads actual vertices (100% accurate, same as Rapier!)
    const { getHeightAt: getMeshHeight, isReady: meshReady } =
      useTerrainMeshLookup(ref as React.RefObject<THREE.Mesh>);

    // Create a stable getTerrainHeight function for leaves
    const getTerrainHeight = useMemo(
      () => (x: number, z: number) => getMeshHeight(x, z),
      [getMeshHeight]
    );

    // Create stable fallback vectors
    const fallbackPosition = useMemo(() => new THREE.Vector3(0, 0, 0), []);
    const fallbackVelocity = useMemo(() => new THREE.Vector3(0, 0, 0), []);

    // Get butterflyParticles controls from separate hook
    const {
      butterflyEnabled,
      butterflyCount,
      butterflySpawnRange,
      butterflyMaxDistance,
      butterflySize,
      butterflyTexture,
      butterflyHeightMin,
      butterflyHeightMax,
      butterflySpreadRadius,
    } = useButterflyParticlesControls();

    // Get dustParticles controls from separate hook
    const {
      dustEnabled,
      dustCount,
      dustSpawnRange,
      dustMaxDistance,
      dustSize,
    } = useDustParticlesControls();

    // Get rainParticles controls from separate hook
    const {
      rainEnabled,
      rainDensity,
      rainAreaSize,
      rainHeight,
      rainSpeed,
      rainParticleSize,
      rainColor,
      rainOpacity,
    } = useRainParticles3DControls();

    // Get heightFog controls from separate hook
    const { heightFogEnabled, fogColor, fogHeight, fogNear, fogFar } =
      useHeightFogControls();

    // Get mountain controls from separate hook
    const {
      mountainEnabled,
      mountainPosition,
      mountainScale,
      mountainRotation,
      mountainColor,
      mountainOpacity,
      mountainRoughness,
      mountainMetalness,
      mountainEmissive,
      mountainEmissiveIntensity,
    } = useMountainControls();

    // Get windFlag controls from separate hook
    const {
      windFlagEnabled,
      windFlagPosition,
      windFlagScale,
      windFlagColor,
      windFlagPoleHeight,
      windFlagWidth,
      windFlagHeight,
      windFlagSegments,
      windFlagUseTexture,
      windFlagTexturePath,
      windFlagTextureQuality,
      windFlagWaveIntensity,
      windFlagYOffset,
    } = useWindFlagControls();

    // Get dynamicLeaves3 controls from separate hook
    const {
      dynamicLeaves3Enabled,
      dynamicLeaves3Count,
      dynamicLeaves3AreaSize,
      dynamicLeaves3InteractionRange,
      dynamicLeaves3PushStrength,
      dynamicLeaves3SwirlStrength,
    } = useDynamicLeaves3Controls();

    // Get debug spheres controls
    const { showDebugSpheres } = useDebugSpheresControls();

    // Calculate terrain height for WindFlag position
    // WindFlag positions pole center at poleHeight/2 above group position
    // So we need to place group at terrainHeight - poleHeight/2 to get pole base at terrainHeight
    // Add user-adjustable Y offset
    const windFlagTerrainHeight = windFlagEnabled
      ? getTerrainHeight(windFlagPosition[0], windFlagPosition[2]) -
        windFlagPoleHeight / 2 +
        windFlagYOffset
      : 0;

    // Debug: Log the calculated height
    if (windFlagEnabled) {
      console.log(
        `WindFlag at [${windFlagPosition[0]}, ${windFlagPosition[2]}] -> terrain height: ${windFlagTerrainHeight}`
      );
    }

    return (
      <group>
        <HeightFog
          enabled={heightFogEnabled}
          fogColor={fogColor}
          fogHeight={fogHeight}
          fogNear={fogNear}
          fogFar={fogFar}
        />
        <HeightMapUnreal
          ref={ref}
          size={4000}
          segments={200}
          heightScale={200}
          position={position}
          scale={scale}
          {...props}
        />
        <CloudSystem />
        {/* DEBUG: Terrain Height Spheres - Shows if mesh-based lookup is correct */}
        {showDebugSpheres && (
          <TerrainHeightDebugSpheres
            terrainMeshRef={ref as React.RefObject<THREE.Mesh>}
          />
        )}
        {/* Render single texture when not "both" */}
        {butterflyEnabled && butterflyTexture !== "both" && (
          <ButterflyParticles
            enabled={butterflyEnabled}
            count={butterflyCount}
            spawnRange={butterflySpawnRange}
            maxDistance={butterflyMaxDistance}
            butterflySize={butterflySize}
            texture={butterflyTexture as "butterfly" | "moth" | "both"}
            heightMin={butterflyHeightMin}
            heightMax={butterflyHeightMax}
            spreadRadius={butterflySpreadRadius}
          />
        )}
        {/* Render both butterflies AND moths when "both" is selected */}
        {butterflyEnabled && butterflyTexture === "both" && (
          <>
            <ButterflyParticles
              enabled={butterflyEnabled}
              count={Math.ceil(butterflyCount / 2)}
              spawnRange={butterflySpawnRange}
              maxDistance={butterflyMaxDistance}
              butterflySize={butterflySize}
              texture="butterfly"
              heightMin={butterflyHeightMin}
              heightMax={butterflyHeightMax}
              spreadRadius={butterflySpreadRadius}
            />
            <ButterflyParticles
              enabled={butterflyEnabled}
              count={Math.floor(butterflyCount / 2)}
              spawnRange={butterflySpawnRange}
              maxDistance={butterflyMaxDistance}
              butterflySize={butterflySize}
              texture="moth"
              heightMin={butterflyHeightMin}
              heightMax={butterflyHeightMax}
              spreadRadius={butterflySpreadRadius}
            />
          </>
        )}
        {/* Dust Particles */}
        {dustEnabled && (
          <DustParticles
            enabled={dustEnabled}
            count={dustCount}
            spawnRange={dustSpawnRange}
            maxDistance={dustMaxDistance}
            dustSize={dustSize}
          />
        )}
        {/* Rain Particles */}
        {rainEnabled && (
          <RainParticles3D
            enabled={rainEnabled}
            density={rainDensity}
            areaSize={rainAreaSize}
            rainHeight={rainHeight}
            rainSpeed={rainSpeed}
            particleSize={rainParticleSize}
            rainColor={rainColor}
            rainOpacity={rainOpacity}
          />
        )}
        {/* Particles Fog */}
        <ParticlesFog />
        {/* Floating Leaves */}
        <FloatingLeaves />
        {/* Wind Flag */}
        {windFlagEnabled && (
          <WindFlag
            position={[
              windFlagPosition[0],
              windFlagTerrainHeight,
              windFlagPosition[2],
            ]}
            scale={windFlagScale}
            flagColor={windFlagColor}
            poleHeight={windFlagPoleHeight}
            flagWidth={windFlagWidth}
            flagHeight={windFlagHeight}
            segments={windFlagSegments}
            useTexture={windFlagUseTexture}
            texturePath={windFlagTexturePath}
            textureQuality={windFlagTextureQuality}
            waveIntensity={windFlagWaveIntensity}
          />
        )}
        {/* Dynamic Leaves v3 */}
        {dynamicLeaves3Enabled && (
          <DynamicLeaves3
            count={dynamicLeaves3Count}
            areaSize={dynamicLeaves3AreaSize}
            ybotPosition={characterPosition || fallbackPosition}
            ybotVelocity={characterVelocity || fallbackVelocity}
            getGroundHeight={getTerrainHeight}
            characterInteractionRange={dynamicLeaves3InteractionRange}
            characterPushStrength={dynamicLeaves3PushStrength}
            characterSwirlStrength={dynamicLeaves3SwirlStrength}
          />
        )}
        {/* Mountain */}
        <Mountain
          mountainEnabled={mountainEnabled}
          mountainPosition={mountainPosition}
          mountainScale={mountainScale}
          mountainRotation={mountainRotation}
          mountainColor={mountainColor}
          mountainOpacity={mountainOpacity}
          mountainRoughness={mountainRoughness}
          mountainMetalness={mountainMetalness}
          mountainEmissive={mountainEmissive}
          mountainEmissiveIntensity={mountainEmissiveIntensity}
        />
      </group>
    );
  }
);
